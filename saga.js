import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import * as modalActions from 'core/frontend/actions/modal-actions'
import * as layerActions from 'core/frontend/layers/layers-actions'
import * as actions from './actions'
import Api from './api'

function* conversionRequest(payload) {
  const { layer, geometry_type } = payload
  console.log(layer, geometry_type)
  yield call(Api.conversion.point, layer)
  yield put(actions.conversionSuccess())
}

export default function* saga() {
  yield [
    takeEvery(actions.CONVERT_REQUEST, conversionRequest)
  ]
}
