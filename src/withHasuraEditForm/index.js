import { fieldMapper } from './utils'

export default (Form, { fields }) => {
  if (typeof fields !== 'object') {
    throw new TypeError('Fields should be an array or an object')
  }

  const __fields = fields.length ? { type: 'row', fields } : fields

  return {
    name: 'WithHasuraEditForm',
    render (createElement) {
      const dense = this.$attrs.dense === undefined ? true : this.$attrs.dense
      const children = fieldMapper(createElement, __fields, undefined, { dense })

      return createElement(Form, {
        props: {
          ...this.$attrs
        },
        scopedSlots: {
          ...this.$scopedSlots
        },
        on: {
          ...this.$listeners
        }
      }, [children])
    }
  }
}
