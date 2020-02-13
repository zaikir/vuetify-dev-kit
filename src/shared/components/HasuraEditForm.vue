<template>
  <apollo-edit-form
    ref="editForm"
    :value="item"
    :query="query"
    :variables="queryVariables"
    v-bind="formProps"
    :fields="formFields"
    :gapped="formProps.gapped || true"
    @submit="onSubmitted"
  />
</template>
<script>
import GenericForm from 'vuetify-schema-form'
import { withApolloEditForm } from '../../hoc'
import { clearCache, wrapGraphqlError } from '../../shared/utils'

export default {
  components: {
    ApolloEditForm: withApolloEditForm(GenericForm)
  },
  props: {
    source: {
      type: String,
      required: true
    },
    itemId: {
      type: null
    },
    formProps: {
      type: Object,
      default: () => ({})
    },
    context: {
      type: Object,
      default: () => ({})
    },
    isAdd: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      item: {}
    }
  },
  computed: {
    formFields () {
      const fields = this.formProps.fields || []
      return fields.map(field => Object.assign({}, ...Object.entries(field).map(([key, value]) => ({
        [key]: key.startsWith('@') ? value : (
          typeof value === 'function' ? value(this.slotContext) : value
        )
      }))))
    },
    query () {
      if (!this.itemId) {
        return null
      }

      const selections = this.formFields
        .filter(x => !x.secure)
        .map(x => x.value)
        .join(' ')

      return `query GetItem ($where: ${this.source}_bool_exp!){ ${this.source} (where: $where) { ${selections} } }`
    },
    queryVariables () {
      return this.itemId
        ? { where: { id: { _eq: this.itemId } } }
        : {}
    },
    slotContext () {
      return {
        ...this.context,
        isAdd: this.isAdd,
        item: this.item
      }
    }
  },
  methods: {
    submit () {
      this.$refs.editForm && this.$refs.editForm.submit()
    },
    reset () {
      this.$refs.editForm && this.$refs.editForm.reset()
      this.item = this.formProps.default
        ? this.formProps.default(this.slotContext)
        : {}
    },
    async onSubmitted (item) {
      this.loading = true

      const onMutation = this.formProps.onMutation || (str => str)
      try {
        if (!this.isAdd) {
          const fields = Object.assign({}, ...this.formProps.fields.map(field => ({
            [field.value]: item[field.value]
          })))

          const mutation = `mutation Update($where: ${this.source}_bool_exp!, $set: ${this.source}_set_input){
            update_${this.source} (where: $where, _set: $set) { affected_rows }
          }`

          await this.$apollo.mutate({
            mutation: gql(onMutation(mutation)),
            variables: {
              where: { id: { _eq: this.itemId } },
              set: fields
            },
            update: async (cache) => {
              await clearCache(cache, this.source, this.$apollo)
            }
          })
        } else {
          const fields = Object.assign(item, ...this.formProps.fields.map(field => ({
            [field.value]: item[field.value]
          })))

          const mutation = `mutation Insert($objects: [${this.source}_insert_input!]!) {
            insert_${this.source} (objects:$objects) { affected_rows }
          }`

          await this.$apollo.mutate({
            mutation: gql(onMutation(mutation)),
            variables: {
              objects: [fields]
            },
            update: (cache) => {
              clearCache(cache, this.source, this.$apollo)
            }
          })
        }
      } catch (err) {
        this.$emit('error', wrapGraphqlError(err))
      } finally {
        this.loading = false

        this.$emit('input', false)
      }
    }
  }
}
</script>
