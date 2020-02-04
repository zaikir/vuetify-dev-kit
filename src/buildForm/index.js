import { VForm } from 'vuetify/lib/components'
import { fieldCompiler, renderComponents } from './utils'

export default ({ Form, fields }) => {
  if (typeof fields !== 'object') {
    throw new TypeError('Fields should be an array or an object')
  }

  const __fields = fields.length ? { type: 'row', fields } : fields

  const componentsTree = fieldCompiler(__fields)
  return {
    name: 'GenericForm',
    methods: {
      submit () {
        if (!this.$refs.editForm.validate()) {
          return
        }

        this.$emit('submit')
      },
      reset () {
        if (this.$refs.editForm) {
          this.$refs.editForm.reset()
          this.$refs.editForm.resetValidation()
        }
      }
    },
    render (createElement) {
      const dense = this.$attrs.dense === undefined ? true : this.$attrs.dense

      return createElement(Form || VForm, {
        props: {
          lazyValidation: true,
          ...this.$attrs
        },
        scopedSlots: {
          ...this.$scopedSlots
        },
        class: 'py-2',
        ref: 'editForm',
        on: {
          ...this.$listeners,
          submit: (event) => {
            this.submit()

            event.preventDefault()
          }
        }
      }, [
        renderComponents(createElement, componentsTree, { dense })
      ])
    }
  }
}
