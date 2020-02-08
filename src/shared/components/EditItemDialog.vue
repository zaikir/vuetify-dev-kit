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
          :guttered="formProps.guttered || true"
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
import { mapMutations } from 'vuex'
import GenericForm from 'vuetify-schema-form'
import { withApolloEditForm } from '../../hoc'

export default {
  components: {
    ApolloEditForm: withApolloEditForm(GenericForm)
  },
  props: {
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
      if (this.value && this.$refs.editForm) {
        this.$refs.editForm.reset()
      }
    },
    item () {
      console.log(this.item)
    }
  },
  methods: {
    ...mapMutations(['SET_ERROR']),
    submit () {
      this.$refs.editForm.submit()
    },
    onSubmitted (item) {
      console.log(item)
    }
  }
}
</script>
