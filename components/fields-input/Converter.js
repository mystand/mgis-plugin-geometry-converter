import React, { PropTypes } from 'react'
import R from 'ramda'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import styles from './converter.styl'
import * as actions from '../../actions'
import { getGTypeFromBuildOptions } from '../../utils'

const Converter = (props) => {
  const { convertRequest, buildOptions } = props
  const { layer, geometry_type } = getGTypeFromBuildOptions(buildOptions)
  const onClick = R.partial(convertRequest, [layer, geometry_type])
console.log(layer, geometry_type, onClick)
  return (
    <div>
      <div className={ styles.container }>
        <div
          className={ styles.button }
          onClick={ onClick }
        >
          {' Конвертировать '}
        </div>
      </div>
    </div>
  )
}

Converter.propTypes = {
  buildOptions: PropTypes.shape({
    fieldPath: PropTypes.array.isRequired
  }).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired
}
export default connect(
  state => state.plugins['geometry-converter'],
  dispatch => ({
    convertRequest: (layer, geometry_type) => dispatch(actions.convertRequest(layer, geometry_type))
  })
)(Converter)
