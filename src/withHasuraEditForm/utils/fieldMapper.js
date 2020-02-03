import { VCol } from 'vuetify/lib'
import FieldsMap from '../fields'
import defaultProps from '../fields/props'
import defaultClasses from '../fields/classes'
import propsAliases from '../fields/propsAliases'

const deleteKeys = (obj, ...keys) => {
  const copy = { ...obj }
  keys.forEach((key) => { delete copy[key] })
  return copy
}

const replaceAliases = (obj) => {
  return Object.assign({}, ...Object.entries(obj).map(([key, value]) => ({
    [propsAliases[key] || key]: value
  })))
}

function buildElement (createElement, field, parent = {}, globalProps = {}) {
  const type = field.type || 'text'
  // eslint-disable-next-line import/namespace
  const element = FieldsMap[type]
  if (!element) {
    throw new Error(`Element "${type}" is not implemented`)
  }

  const children = field.fields && field.fields.map(x => buildElement(createElement, x, field, globalProps))

  const buildProps = fieldType => replaceAliases(deleteKeys(
    { ...globalProps, ...defaultProps[fieldType] || {}, ...field },
    'class', 'value'
  ))

  const buildClasses = fieldType => ({ ...defaultClasses[fieldType] || {}, ...field.class || {} })

  const buildNodeParams = fieldType => ({
    props: buildProps(fieldType),
    class: buildClasses(fieldType)
  })

  const node = createElement(element, buildNodeParams(type), children)
  switch (parent.type) {
    case 'row': {
      return createElement(VCol, buildNodeParams('col'), [node])
    }
    default: {
      return node
    }
  }
}

export default buildElement
