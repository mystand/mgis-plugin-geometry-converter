/* eslint no-param-reassign: ["error", { "props": false }] */

import R from 'ramda'
import turf from '@turf/turf'

import { selectFeatures, selectFeatureById } from 'core/shared/utils/utils'
import Feature from 'core/backend/models/feature'

const PICK_HANDLER = {
  point: toPoint
  // polygon: toPolygon,
  // line: toLine
}
export async function index(ctx) {
  ctx.body = await ctx.knex(TABLE_NAME)
}

export async function create(ctx) {
  const params = ctx.request.body
  const { layer, geometry_type } = params
  const layer_key = params.layer.key
  const prevGeometryType = layer.geometry_type
  await PICK_HANDLER[geometry_type](ctx, layer_key, prevGeometryType)
  // console.log(params)
  ctx.body = {}
}

async function toPoint(ctx, layer_key, prevGeometryType ) {
  const feature = await selectFeatures(ctx.knex)
  console.log(feature[0])
}
function error(ctx, message) {
  ctx.body = { success: false, message }
}
