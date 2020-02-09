import gql from 'graphql-tag'
import { VProgressCircular } from 'vuetify/lib/components'
export default Form => ({
  props: {
    query: {
      type: String,
      default: null
    },
    variables: {
      type: Object,
      default: () => ({})
    }
  },
  apollo: {
    fetchedItem: {
      query () {
        return this.queryTag
      },
      variables () {
        return this.variables
      },
      update (data) {
        const result = data[this.queryTag.definitions[0].selectionSet.selections[0].name.value]
        return result && result.length && {
          ...result[0],
          __typename: undefined
        }
      },
      skip () {
        return !this.query
      }
    }
  },
  data () {
    return {
      fetchedItem: null
    }
  },
  computed: {
    queryTag () {
      return this.query && gql(this.query)
    }
  },
  render (createElement) {
    // <div class="fill-height d-flex align-center justify-center body-2 flex-column">
    //   <v-progress-circular color="primary" size="70" indeterminate />
    //   <div class="text-center mt-3">
    //     Инициализация...<br>
    //     Подождите, пожалуйста.
    //   </div>
    // </div>
    return this.$apollo.loading
      ? createElement('div', {
        class: 'fill-height d-flex align-center justify-center body-2 flex-column'
      }, [
        createElement(VProgressCircular, {
          props: {
            color: 'primary',
            size: '70',
            indeterminate: true
          }
        }),
        createElement('div', {
          class: 'text-center mt-3',
          domProps: { innerHTML: 'Загрузка...<br> Подождите, пожалуйста.' }
        })
      ])
      : createElement(Form, {
        props: {
          ...this.$attrs,
          query: undefined,
          variables: undefined,
          value: this.fetchedItem
            ? this.fetchedItem
            : this.$attrs.value
        },
        ref: 'editForm',
        scopedSlots: {
          ...this.$scopedSlots
        },
        on: {
          submit: (event) => {
            this.$emit('submit', event)
          }
        }
      })
  },
  methods: {
    submit () {
      this.$refs.editForm && this.$refs.editForm.submit()
    },
    reset () {
      this.$refs.editForm && this.$refs.editForm.reset()
      this.fetchedItem = null
    }
  }
})
