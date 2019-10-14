<template>
  <v-autocomplete
    :value="value"
    :items="items"
    :rules="getRules()"
    :required="required"
    :label="label"
    :outlined="outlined"
    :disabled="disabled"
    :item-text="itemText"
    :item-value="itemValue"
    :loading="isLoading"
    :search-input.sync="search"
    :placeholder="placeholder"
    :prepend-icon="prependIcon"
    autocomplete="off"
    @input="handleInput"
  />
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      required: false,
      default: null
    },
    url: {
      type: Function,
      required: true
    },
    responseHandler: {
      type: Function,
      default: ({ items }) => items
    },
    label: {
      type: String,
      required: false,
      default: null
    },
    placeholder: {
      type: String,
      default: 'Введите запрос для поиска'
    },
    prependIcon: {
      type: String,
      default: 'mdi-database-search'
    },
    rules: {
      type: Array,
      required: false,
      default: () => []
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    outlined: {
      type: Boolean,
      required: false,
      default: false
    },
    itemText: {
      type: String,
      required: true
    },
    itemValue: {
      type: String,
      required: true
    },
    minLength: {
      type: Number,
      required: false,
      default: 0
    }
  },
  data () {
    return {
      items: [],
      isLoading: false,
      search: ''
    }
  },
  watch: {
    search (val = '') {
      this.updateItems()
    }
  },

  created () {
    this.updateItems()
  },
  methods: {
    updateItems (val = '') {
      if (this.minLength > 0 && (!val || val.length < this.minLength)) {
        return
      }

      this.isLoading = true

      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }

      this.timer = setTimeout(async () => {
        this.items = this.responseHandler(await this.$axios.$get(this.url(val)))
        this.isLoading = false
      }, 300)
    },
    handleInput (value) {
      this.$emit('input', value)
    },
    getRules () {
      return [...this.rules, ...this.required ? [x => !!x || 'Введите значение'] : []]
    }
  }
}
</script>
