import R from 'ramda'

export function getGTypeFromBuildOptions(options) {
  console.log(options)
  const { values, directories: { layers } } = options
  const layerKey = values.sourceLayerKey
  // const { values, fieldPath, directories: { layers } } = options
  // const sourceLayerKeyFieldPath = [fieldPath[0], fieldPath[1], 'sourceLayerKey']
  // const sourceLayerKeyValue = R.path(sourceLayerKeyFieldPath, values)
  // const typeFieldPath = [fieldPath[0], fieldPath[1], 'type']
  // const typeValue = R.path(typeFieldPath, values)

  if (R.isNil(layerKey)) return []
  return { layer: R.find(x => x.key === layerKey, layers), geometry_type: values.type }
}
