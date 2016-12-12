import * as convertActions from './actions'

const defaultState = {
  data: []
}

export default function (state = defaultState, action) {
  switch (action.type) {

  case convertActions.SHOW_CONVERT_WARNING: {
    return { ...state }
  }

  default:
    return state
  }
}
