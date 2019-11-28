<template>
  <v-container grid-list-md>
    <slot name="title" />
    <v-row no-gutters>
      <v-col
        v-for="field in fields"
        :key="field.value"
        :class="field.class || 'px-1'"
        :cols="field.cols || 12"
        :sm="conditionalFunction(field.sm)"
        :md="conditionalFunction(field.md)"
        :lg="conditionalFunction(field.lg)"
        :xl="conditionalFunction(field.xl)"
      >
        <slot :name="`field.${field.value}`" :item="editableItem" :context="context">
          <dynamic-field
            :field="field"
            :readonly="readonly"
            :editable-item="editableItem"
            :context="context"
          >
            <template #label>
              <slot :name="`label.${field.value}`" :item="editableItem" :context="context" />
            </template>
          </dynamic-field>
        </slot>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import DynamicField from './DynamicField'
export default {
  components: {
    DynamicField
  },
  props: {
    editableItem: {
      type: Object,
      required: true
    },
    fields: {
      type: Array,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    context: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  methods: {
    conditionalFunction (value) {
      if (value && typeof value === 'function') {
        return value({ item: this.editableItem, ...this.context })
      } else {
        return value
      }
    }
  }
}
</script>
