/* eslint no-param-reassign: ["error", { "props": false }] */

import R from 'ramda'
import turf from 'turf'

import Feature from 'core/backend/models/feature'

import { TABLE_NAME, PRIMARY_KEY, ATTRIBUTES_FLOAT, ATTRIBUTES, HAZARD_CLASSES } from '../constants'
import { buildWasteCreationCachePropertyKey } from '../utils'
import { updateMunicipalityCacheOfWaste } from '../lib/municipality-cache'

const xlsx = require('node-xlsx') // import doesn't work

const pickAttributes = R.pick(ATTRIBUTES)

function typeCast(values) {
  ATTRIBUTES_FLOAT.forEach((attributeName) => {
    const value = values[attributeName]
    if (R.is(String, value)) {
      values[attributeName] = parseFloat(value) || 0
    }
  })
  return values
}

export async function index(ctx) {
  ctx.body = await ctx.knex(TABLE_NAME)
}

export async function create(ctx) {
  const params = ctx.request.body

  const records = await ctx.knex(TABLE_NAME)
    .insert(typeCast(pickAttributes(params)))
    .returning('*')
  const record = records[0]

  await updateMunicipalityCacheOfWaste(ctx.knex, record)

  ctx.body = record
}

export async function update(ctx) {
  const params = ctx.request.body

  const records = await ctx.knex(TABLE_NAME)
    .where(PRIMARY_KEY, params[PRIMARY_KEY])
    .update(typeCast(pickAttributes(params)))
    .returning('*')
  const record = records[0]

  await updateMunicipalityCacheOfWaste(ctx.knex, record)

  ctx.body = record
}

export async function destroy(ctx) {
  const key = ctx.params[PRIMARY_KEY]

  try {
    await ctx.knex(TABLE_NAME).where(PRIMARY_KEY, key).del()
    ctx.body = { success: true, key }
  } catch (e) {
    ctx.status = 400
    ctx.body = { success: false, key }
  }
}


function companiesInMunicipality(municipality, companies) {
  return companies.filter((company) => {
    try {
      return turf.inside(company, municipality)
    } catch (e) {
      return false
    }
  })
}

// eslint-disable-next-line consistent-return
export async function xls(ctx) {
  const { knex } = ctx
  const pluginConfig = (await knex('plugin_configs').where('key', '2tp-waste'))[0]
  if (R.isNil(pluginConfig)) return error(ctx, "plugin config can't be nil")

  const { layerKey, municipalitiesLayerKey, municipalitiesPopulationPropertyKey } = pluginConfig.properties
  if (layerKey == null) return error(ctx, "pluginConfig.layerKey can't be nil")
  if (municipalitiesLayerKey == null) return error(ctx, "pluginConfig.municipalityLayerKey can't be nil")
  if (municipalitiesPopulationPropertyKey == null) {
    return error(ctx, "pluginConfig.municipalitiesPopulationPropertyKey can't be nil")
  }

  const municipalities = await Feature.fetch(knex, rel =>
    rel.whereRaw("\"properties\"->>'layer_key' = ?", [municipalitiesLayerKey]))
  const companies = await Feature.fetch(knex, rel => rel.whereRaw("\"properties\"->>'layer_key' = ?", [layerKey]))
  const waste = await knex(TABLE_NAME)

  const companiesByMunicipalityId = R.reduce((sum, municipality) => {
    return R.assoc(municipality.id, companiesInMunicipality(municipality, companies), sum)
  }, {}, municipalities)

  const wasteByCompanyId = companies.reduce((sum, company) => ({
    ...sum,
    [company.id]: R.pipe(
      R.filter(x => x.target_feature_id === company.id),
      R.reduce((wasteSum, item) => {
        const { hazard_class, waste_creation } = item
        if (R.isBlank(hazard_class)) return wasteSum
        const value = (wasteSum[hazard_class] || 0) + waste_creation
        return { ...wasteSum, [hazard_class]: value }
      }, {}),
      R.toPairs
    )(waste)
  }), {})

  const data = [
    ['Наименование кужуунов', 'Наименование предприятий', 'Класс отходов', 'Объем образования отходов, т/год']
  ]
  let regionPopulation = 0
  const regionWaste = {}

  municipalities.forEach((municipality) => {
    const municipalityPopulation = municipality.properties[municipalitiesPopulationPropertyKey]
    regionPopulation += parseInt(municipalityPopulation, 10) || 0
    data.push([
      municipality.properties.name,
      'Население',
      null,
      municipalityPopulation
    ])
    companiesByMunicipalityId[municipality.id].forEach((company) => {
      wasteByCompanyId[company.id].forEach(([hazardClass, value], wIndex) => {
        data.push([
          null,
          wIndex === 0 ? company.properties.name : '',
          hazardClass,
          value
        ])
      })
    })
    data.push([`ВСЕГО по ${municipality.properties.name}`, 'Население', null, municipalityPopulation])
    HAZARD_CLASSES.forEach((hazardClass, hIndex) => {
      const hazardClassKey = buildWasteCreationCachePropertyKey(hazardClass)
      regionWaste[hazardClassKey] = (regionWaste[hazardClassKey] || 0) + (municipality.properties[hazardClassKey] || 0)
      data.push([
        null,
        hIndex === 0 ? 'Предприятия' : null,
        hazardClass,
        municipality.properties[hazardClassKey]
      ])
    })
  })

  data.push(['ИТОГО по Республика Тыва', 'Население', null, regionPopulation])
  HAZARD_CLASSES.forEach((hazardClass, hIndex) => {
    const hazardClassKey = buildWasteCreationCachePropertyKey(hazardClass)
    data.push([null, hIndex === 0 ? 'Предприятия' : null, hazardClass, regionWaste[hazardClassKey]])
  })

  ctx.type = '.xlsx'
  ctx.body = xlsx.build([{ name: 'Отходы', data }])
}

// eslint-disable-next-line consistent-return
export async function xls_municipality(ctx) {
  const { id } = ctx.params
  const { knex } = ctx

  const pluginConfig = (await knex('plugin_configs').where('key', '2tp-waste'))[0]
  if (R.isNil(pluginConfig)) return error(ctx, "plugin config can't be nil")

  const { layerKey, municipalitiesLayerKey, municipalitiesPopulationPropertyKey } = pluginConfig.properties
  if (layerKey == null) return error(ctx, "pluginConfig.layerKey can't be nil")
  if (municipalitiesLayerKey == null) return error(ctx, "pluginConfig.municipalityLayerKey can't be nil")
  if (municipalitiesPopulationPropertyKey == null) {
    return error(ctx, "pluginConfig.municipalitiesPopulationPropertyKey can't be nil")
  }

  const municipality = await Feature.find(knex, id)
  const companies = await Feature.fetch(knex, rel => rel.whereRaw(
    `"properties"->>'layer_key' = ? AND ST_Contains(${Feature.packGeometry(municipality.geometry)}, "geometry")`, [
      layerKey
    ])) // todo доставать только id
  const waste = await knex(TABLE_NAME).whereIn('target_feature_id', companies.map(x => x.id))

  const wasteByCompanyId = companies.reduce((sum, company) => ({
    ...sum,
    [company.id]: R.pipe(
      R.filter(x => x.target_feature_id === company.id),
      R.reduce((wasteSum, item) => {
        const { hazard_class, waste_creation } = item
        if (R.isBlank(hazard_class)) return wasteSum
        const value = (wasteSum[hazard_class] || 0) + waste_creation
        return { ...wasteSum, [hazard_class]: value }
      }, {}),
      R.toPairs
    )(waste)
  }), {})

  const data = [
    ['Наименование кужуунов', 'Наименование предприятий', 'Класс отходов', 'Объем образования отходов, т/год']
  ]

  data.push([
    municipality.properties.name,
    'Население',
    null,
    municipality.properties[municipalitiesPopulationPropertyKey]
  ])
  companies.forEach((company) => {
    wasteByCompanyId[company.id].forEach(([hazardClass, value], wIndex) => {
      data.push([
        null,
        wIndex === 0 ? company.properties.name : '',
        hazardClass,
        value
      ])
    })
  })
  data.push([
    `ВСЕГО по ${municipality.properties.name}`,
    'Население',
    null,
    municipality.properties[municipalitiesPopulationPropertyKey]]
  )
  HAZARD_CLASSES.forEach((hazardClass, hIndex) => {
    const hazardClassKey = buildWasteCreationCachePropertyKey(hazardClass)
    data.push([
      null,
      hIndex === 0 ? 'Предприятия' : null,
      hazardClass,
      municipality.properties[hazardClassKey]
    ])
  })

  ctx.type = '.xlsx'
  ctx.body = xlsx.build([{ name: 'Отходы', data }])
}

function error(ctx, message) {
  ctx.body = { success: false, message }
}
