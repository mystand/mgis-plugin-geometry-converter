import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import * as modalActions from 'core/frontend/actions/modal-actions'
import * as layerActions from 'core/frontend/layers/layers-actions'
import * as actions from './actions'
import Api from './api'

function* conversionRequest(payload) {
  try {
    yield call(Api.conversion.create, payload)
    yield put(actions.convertSuccess())
  } catch (e) {
    yield put(actions.convertFailure(e))
  }
}

export default function* saga() {
  yield [
    takeEvery(actions.CONVERT_REQUEST, conversionRequest)
  ]
}
