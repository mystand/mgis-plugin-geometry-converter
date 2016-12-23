/* eslint no-param-reassign: ["error", { "props": false }] */

import R from 'ramda'
import turf from '@turf/turf'

import { selectFeatures, selectFeatureById } from 'core/shared/utils/utils'
import Feature from 'core/backend/models/feature'

const ACTUAL_TYPES = {
  polygon: 'Polygon',
  line: 'LineString',
  point: 'Point'
}

const MIRROR_TYPES = {
  Polygon: 'polygon',
  LineString: 'line',
  Point: 'point'
}

const PICK_HANDLER = {
  'polygon->point': feature => turf.centerOfMass(feature),
  'point->polygon': feature => turf.circle(turf.point(feature.geometry.coordinates), 10, 8, 'meters'),
  'point->line': feature => R.pipe(
    R.updatePath(['geometry', 'type'], () => 'LineString'),
    R.updatePath(['geometry', 'coordinates'], x => [x[0][1], x[0][5]])
    )(turf.circle(turf.point(feature.geometry.coordinates), 10, 8, 'meters')),
  'line->point': feature => turf.along(feature, 0, 'meters'),
  'polygon->line': feature => R.pipe(
    R.updatePath(['geometry', 'type'], () => 'LineString'),
    R.updatePath(['geometry', 'coordinates'], x => R.init(x[0]))
    )(feature),
  'line->polygon': feature => turf.envelope({
    type: 'FeatureCollection',
    features: [feature]
  })
}

export async function create(ctx) {
  const params = ctx.request.body
  const { layer, geometry_type } = params
  const layer_key = layer.key
  // console.log(params)
  ctx.body = {}
  const featuresAsData = await ctx.knex.select(ctx.knex.raw(
    'id, properties, st_asgeojson(geometry) as geometry'
  ))
  .from('features')
  .where(ctx.knex.raw(`properties->>'layer_key' = '${layer_key}'`))

  const features = featuresAsData.map(feature => ({
    type: 'Feature',
    id: feature.id,
    properties: feature.properties,
    geometry: JSON.parse(feature.geometry)
  })
  )
  const updatedFeatures = R.map(feature => R.assoc('geometry',
      PICK_HANDLER[`${MIRROR_TYPES[feature.geometry.type]}->${geometry_type}`](feature).geometry,
      feature), features)

  await Feature.updateAll(ctx.knex, updatedFeatures)
  ctx.body = { success: true }
}
