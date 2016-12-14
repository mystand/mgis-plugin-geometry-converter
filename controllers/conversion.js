/* eslint no-param-reassign: ["error", { "props": false }] */

import R from 'ramda'
import turf from '@turf/turf'

import { selectFeatures, selectFeatureById } from 'core/shared/utils/utils'
import Feature from 'core/backend/models/feature'

const PICK_HANDLER = {
  point: toPoint,
  polygon: toPolygon
  // line: toLine
}
export async function index(ctx) {
  ctx.body = await ctx.knex(TABLE_NAME)
}

export async function create(ctx) {
  const params = ctx.request.body
  const { layer, geometry_type } = params
  const layer_key = layer.key
  const prevGeometryType = layer.geometry_type
  await PICK_HANDLER[geometry_type](ctx, layer_key, prevGeometryType)
  // console.log(params)
  ctx.body = {}
}

async function toPoint(ctx, layer_key, prevGeometryType) {
  const featuresAsData = await ctx.knex.select(ctx.knex.raw(
    'id, properties, st_asgeojson(geometry) as geometry'
  ))
  .from('features')
  .where(ctx.knex.raw(`properties->>'layer_key' = '${layer_key}'`))

  const features = featuresAsData.map((feature) => {
    return {
      type: 'Feature',
      id: feature.id,
      properties: feature.properties,
      geometry: JSON.parse(feature.geometry)
    }
  })
  const updatedFeatures = R.pipe(
    R.filter(x => x.geometry.type === 'Polygon'),
    R.map(feature => R.pipe(
      R.assoc('properties', feature.properties),
      R.assoc('id', feature.id)
    )(turf.centerOfMass(feature)))
    )(features)
  await Feature.updateAll(ctx.knex, updatedFeatures)
  ctx.body = { success: true }
}

async function toPolygon(ctx, layer_key, prevGeometryType) {
  const featuresAsData = await ctx.knex.select(ctx.knex.raw(
    'id, properties, st_asgeojson(geometry) as geometry'
  ))
  .from('features')
  .where(ctx.knex.raw(`properties->>'layer_key' = '${layer_key}'`))

  const features = featuresAsData.map((feature) => {
    return {
      type: 'Feature',
      id: feature.id,
      properties: feature.properties,
      geometry: JSON.parse(feature.geometry)
    }
  })
  const updatedFeatures = R.pipe(
    R.filter(x => x.geometry.type === 'Point'),
    R.map(feature => R.pipe(
      R.assoc('id', feature.id),
      R.assoc('properties', feature.properties)
      )(turf.circle(turf.point(feature.geometry.coordinates), 10, 8, 'meters')))
    )(features)
    // console.log(updatedFeatures[0])
    // console.log(updatedFeatures[0].geometry.coordinates)
  await Feature.updateAll(ctx.knex, updatedFeatures)
  ctx.body = { success: true }
}

function error(ctx, message) {
  ctx.body = { success: false, message }
}
