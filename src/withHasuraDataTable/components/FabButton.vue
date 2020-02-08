<template>
  <v-fab-transition>
    <v-btn
      v-show="isShown"
      small
      fab
      elevation="3"
      :color="color"
      @click="$emit('click')"
    >
      <v-icon>{{ icon }}</v-icon>
    </v-btn>
  </v-fab-transition>
</template>
<script>
export default {
  props: {
    timeout: {
      type: Number,
      default: 200
    },
    icon: {
      type: String,
      default: 'add'
    },
    color: {
      type: String,
      default: 'primary'
    },
    tooltip: {
      type: String,
      default: 'Добавить'
    }
  },
  data () {
    return {
      isShown: false
    }
  },
  mounted () {
    setTimeout(() => { this.isShown = true }, this.timeout)
  }
}
</script>
</template>
