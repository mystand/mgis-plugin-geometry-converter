import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import Modal from 'core/frontend/components/shared/modal/Modal'

class TableModal extends React.Component {
  render() {
    const { disabled } = this.props
    return (
      <Modal width='90%' height='90%' onClose={ () => {} }>
        {' back to reality '}
      </Modal>
    )
  }
}

TableModal.propTypes = {
  // onClose: PropTypes.func,
  // tableProps: PropTypes.shape(WasteTable.propTypes),
  // loaded: PropTypes.bool.isRequired,
  // fetch: PropTypes.func.isRequired
}
export default connect(
  createSelector(
    state => state.modal['geometry-converter'],
    (disabled) => ({ disable })))(TableModal)
