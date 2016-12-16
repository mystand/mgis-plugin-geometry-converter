import * as controller from '../controllers/conversion'
// import { exportFeatures, exportLayers } from '../export'

export default {
  routes: [
    // { method: 'get', path: '/api/conversion', action: controller.point },
    // { method: 'post', path: '/api/conversion', action: controller.create },
    // { method: 'put', path: '/api/conversion/point', action: controller.point }
    { method: 'post', path: '/api/conversion', action: controller.update },
    // { method: 'delete', path: '/api/conversion/:id', action: controller.destroy }
  ],
  exports: []
}
