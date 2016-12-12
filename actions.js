export const CONVERT_REQUEST = 'CONVERT_REQUEST'
export const CONVERT_SUCCESS = 'CONVERT_SUCCESS'
export const CONVERT_FAILURE = 'CONVERT_FAILURE'
export const SHOW_CONVERT_WARNING = 'SHOW_CONVERT_WARNING'
export const HIDE_CONVERT_WARNING = 'HIDE_CONVERT_WARNING'

export const showConvertWarning = () => ({
  type: SHOW_CONVERT_WARNING
})

export const hideConvertWarning = () => ({
  type: HIDE_CONVERT_WARNING
})

export const convertRequest = layer => ({
  type: CONVERT_REQUEST,
  layer
})

export const convertSuccess = object => ({
  type: CONVERT_SUCCESS,
  object
})
