import { VForm } from 'vuetify/lib/components'
import clone from 'clone'
import { fieldCompiler, renderComponents } from './utils'

export default ({ Form, fields }) => {
  if (typeof fields !== 'object') {
    throw new TypeError('Fields should be an array or an object')
  }

  const __fields = fields.length ? { type: 'row', fields } : fields

  const componentsTree = fieldCompiler(__fields)
  return {
    name: 'GenericForm',
    props: {
      value: {
        type: Object,
        default: () => ({})
      }
    },
    data () {
      return {
        clone: {}
      }
    },
    watch: {
      value: {
        handler (val) {
          this.clone = clone(val)
        },
        immediate: true
      }
    },
    methods: {
      submit () {
        if (!this.$refs.editForm.validate()) {
          return
        }

        this.$emit('input', this.clone)
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
          lazyValidation: true
        },
        class: 'py-2',
        ref: 'editForm',
        on: {
          submit: (event) => {
            this.submit()

            event.preventDefault()
          }
        }
      }, [
        renderComponents(createElement, componentsTree, this.clone, { dense })
      ])
    }
  }
}
