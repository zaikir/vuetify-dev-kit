<template>
  <v-dialog
    v-bind="dialogProps"
    :scrollable="dialogProps.scrollable || true"
    :max-width="dialogProps.maxWidth || 800"
    :persistent="dialogProps.persistent || true"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        <slot name="title" v-bind="slotContext">
          {{ item.id ? 'Редактирование': 'Создание' }}
        </slot>
      </v-card-title>
      <v-card-text>
        <apollo-edit-form
          ref="editForm"
          :value="item"
          v-bind="formProps"
          :gapped="formProps.gapped || true"
          @submit="onSubmitted"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          :disabled="loading"
          @click="$emit('input', false)"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          @click="submit"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import gql from 'graphql-tag'
import GenericForm from '../../../../vuetify-schema-form'
import { clearCache } from '../../shared/utils'
import { withApolloEditForm } from '../../hoc'

export default {
  components: {
    ApolloEditForm: withApolloEditForm(GenericForm)
  },
  props: {
    source: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      required: true
    },
    dialogProps: {
      type: Object,
      default: () => ({})
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
    slotContext () {
      return {
        ...this.context,
        item: this.item
      }
    }
  },
  watch: {
    value () {
      if (this.value) {
        this.$refs.editForm && this.$refs.editForm.reset()
        this.item = this.formProps.default
          ? this.formProps.default(this.slotContext)
          : {}
      }
    }
  },
  methods: {
    submit () {
      this.$refs.editForm.submit()
    },
    async onSubmitted (item) {
      const fields = Object.assign(item, ...this.formProps.fields.map(field => ({
        [field.value]: item[field.value]
      })))

      this.loading = true

      try {
        if (!this.isAdd) {
          await this.$apollo.mutate({
            mutation: gql`mutation {
          update_${this.source} (where: {id: {_eq: ${JSON.stringify(item.id)} } }, _set: {isRemoved: true}) { affected_rows }
        }`,
            update: (cache) => {
              clearCache(cache, new RegExp(`^${this.source}`), this.$apollo)
            }
          })
        } else {
          await this.$apollo.mutate({
            mutation: gql`mutation Insert($objects: [${this.source}_insert_input!]!) {
            insert_${this.source} (objects:$objects) { affected_rows }
          }`,
            variables: {
              objects: [fields]
            },
            update: (cache) => {
              clearCache(cache, new RegExp(`^${this.source}`), this.$apollo)
            }
          })
        }
      } catch (err) {
        this.$emit('error', err)
      } finally {
        this.loading = false
        this.$emit('input', false)
      }
    }
  }
}
</script>