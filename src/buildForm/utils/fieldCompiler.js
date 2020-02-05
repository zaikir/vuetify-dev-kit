import { VCol, VTextField } from 'vuetify/lib'
import FieldsMap from '../fields'
import defaultProps from '../fields/props'
import defaultClasses from '../fields/classes'
import propsAliases from '../fields/propsAliases'

const deleteKeys = (obj, ...keys) => {
  const copy = { ...obj }
  keys.forEach((key) => { delete copy[key] })
  return copy
}

const replaceAliases = (props) => {
  const aliases = Object.keys(propsAliases)
  aliases.forEach((alias) => {
    if (props[alias] !== undefined) {
      propsAliases[alias](props, props[alias])
    }
  })

  return props
}

function buildElement (field, merger, parent = {}, globalProps = {}) {
  const __merger = merger || ((component, params, children) => ({
    component,
    params,
    children
  }))

  const type = field.type || 'text'

  // eslint-disable-next-line import/namespace
  const element = FieldsMap[type] || VTextField

  const children = field.fields && field.fields.map(x => buildElement(x, __merger, field, globalProps))

  const isContainerType = fieldType => ['row', 'col'].includes(fieldType)
  const buildProps = fieldType => replaceAliases(
    deleteKeys(
      {
        ...globalProps,
        ...defaultProps[fieldType] || {},
        ...field
      },
      'class', 'value'
    )
  )

  const buildClasses = fieldType => ({ ...defaultClasses[fieldType] || {}, ...field.class || {} })

  const buildNodeParams = fieldType => ({
    props: buildProps(fieldType),
    class: buildClasses(fieldType),
    ...!isContainerType(fieldType) ? { __bindToModel: true } : {},
    __value: field.value
  })

  const node = __merger(element, buildNodeParams(type), children)
  switch (parent.type) {
    case 'row': {
      return __merger(VCol, buildNodeParams('col'), [node])
    }
    default: {
      return node
    }
  }
}

export default buildElement
