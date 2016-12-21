import * as controller from '../controllers/conversion'
// import { exportFeatures, exportLayers } from '../export'

export default {
  routes: [
    { method: 'post', path: '/api/conversion', action: controller.create }
  ],
  exports: []
}
