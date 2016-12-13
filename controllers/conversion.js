/* eslint no-param-reassign: ["error", { "props": false }] */

import R from 'ramda'

import Feature from 'core/backend/models/feature'

export async function index(ctx) {
  ctx.body = await ctx.knex(TABLE_NAME)
}

export async function point(ctx) {
  const params = ctx.request.body
  console.log(params)


  ctx.body = {}
}

function error(ctx, message) {
  ctx.body = { success: false, message }
}
