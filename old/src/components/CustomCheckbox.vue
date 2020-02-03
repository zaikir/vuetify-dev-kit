<template>
  <v-tooltip bottom>
    <template #activator="{on}">
      <v-btn
        icon
        :disabled="disabled"
        :color="value ? activeColor : color"
        background-color="backgroundColor"
        @click="handleInput(!value)"
        v-on="on"
      >
        <v-icon>
          {{ value ? activeIcon : disabledIcon }}
        </v-icon>
      </v-btn>
    </template>
    {{ tooltip || '' }}
  </v-tooltip>
</template>
<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'grey lighten-1'
    },
    activeColor: {
      type: String,
      default: 'orange'
    },
    backgroundColor: {
      type: String,
      default: 'grey lighten-1'
    },
    activeIcon: {
      type: String,
      default: 'star'
    },
    disabledIcon: {
      type: String,
      default: 'mdi-star-outline'
    },
    tooltip: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleInput (value) {
      this.$emit('input', value)
    }
  }
}
</script>
