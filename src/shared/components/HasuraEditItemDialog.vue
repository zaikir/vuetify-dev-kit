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
          {{ dialogProps.title || 'Редактирование' }}
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
          @click="$emit('input', false)"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
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
    }
  },
  data () {
    return {
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
        console.log(this.item)
      }
    }
  },
  methods: {
    submit () {
      this.$refs.editForm.submit()
    },
    onSubmitted (item) {
      this.$apollo.mutate({
        mutation: gql`mutation {
          update_${this.source} (where: {id: {_eq: ${JSON.stringify(item.id)} } }, _set: {isRemoved: true}) { affected_rows }
        }`,
        update: (cache) => {
          clearCache(cache, new RegExp(`^${this.source}`))
        }
      })
      console.log(item)
    }
  }
}
</script>
