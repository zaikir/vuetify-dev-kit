import gql from 'graphql-tag'

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
    item: {
      query () {
        return gql(this.query)
      },
      variables () {
        return {
          ...this.variables
        }
      },
      skip () {
        return !this.query
      }
    }
  },
  data () {
    return {
      item: null
    }
  },
  render (createComponent) {
    return createComponent(Form, {
      props: {
        ...this.$attrs,
        query: undefined,
        variables: undefined
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
    }
  }
})
