import React, { PropTypes } from 'react'
import R from 'ramda'

import { getGTypeFromBuildOptions } from '../../utils'

const FieldsInput = (props) => {
  const { onChange, buildOptions } = props
  const value = props.value === '' ? [] : props.value
  const geometry_type = getGTypeFromBuildOptions(buildOptions)

  function onCheckboxChange(key) {
    onChange(R.toggle(key, value))
  }

console.log(geometry_type)
  return (
    <div>
      <div>Отображаемые поля</div>
      <div style={ { marginLeft: '20px', marginBottom: '20px' } }>
        {'luuul'
        }
      </div>
    </div>
  )
}

FieldsInput.propTypes = {
  buildOptions: PropTypes.shape({
    fieldPath: PropTypes.array.isRequired
  }).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired
}

export default FieldsInput