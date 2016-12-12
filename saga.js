import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import * as modalActions from 'core/frontend/actions/modal-actions'
import * as layerActions from 'core/frontend/layers/layers-actions'
// import * as actions from './actions'
// import Api from './api'

function* method(payload) {
  // const data = yield call(Api.waste.fetch)
  console.log(payload)
  yield put(modalActions.toggle('geometry-converter', true, payload))
}

export default function* saga() {
  yield [
    takeEvery(layerActions.UPDATE_LAYER_REQUEST, method)
  ]
}
