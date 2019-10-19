<template>
  <v-text-field
    v-mask="mask"
    :value="value"
    :placeholder="placeholder"
    :rules="rules"
    :required="required"
    :label="label"
    :disabled="disabled"
    :outlined="outlined"
    @input="handleInput"
  />
</template>

<script>
import { mask } from 'vue-the-mask'

export default {
  directives: {
    mask
  },
  props: {
    value: {
      type: String,
      default: null
    },
    mask: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    outlined: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array,
      default: () => []
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleInput ($event) {
      this.$emit('input', $event)
    }
  }
}
</script>
