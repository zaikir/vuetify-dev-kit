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
  render (createComponent) {
    return createComponent(Form, {
      props: {
        ...this.$attrs,
        query: undefined,
        variables: undefined,
        value: this.fetchedItem
          ? this.fetchedItem
          : this.$attrs.item
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
