// import Dashboard from '../components/dashboard/Dashboard'
import Converter from '../components/fields-input/Converter'

const geometryTypes = [
  { value: 'Point', label: 'Точка' },
  { value: 'Polygon', label: 'Полигон' },
  { value: 'Line', label: 'Линия' }
]
export default {
  name: 'Конвертер',
  options: [
    {
      key: 'items',
      label: 'Конвертация',
      type: 'array',
      item: {
        fields: [
          { key: 'sourceLayerKey', label: 'Слой', type: 'select', options: 'layers' },
          { key: 'type', label: 'Тип геометрии', type: 'select', inputOptions: { options: geometryTypes } },
          { key: 'converter', label: 'Конвертер', type: Converter }
        ]
      }
    }],
  connects: {
    components: []
  }
}
