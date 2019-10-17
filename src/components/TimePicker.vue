<template>
  <v-dialog
    ref="dialog"
    v-model="isOpened"
    persistent
    width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="time"
        :label="label"
        :rules="[...getRules(rules, required)]"
        prepend-icon="access_time"
        readonly
        v-on="on"
      />
    </template>
    <v-time-picker
      v-if="isOpened && !disabled"
      v-model="time"
      format="24hr"
    >
      <v-spacer />
      <v-btn text color="primary" @click="isOpened = false">
        Отмена
      </v-btn>
      <v-btn text color="primary" @click="selectTime">
        OK
      </v-btn>
    </v-time-picker>
  </v-dialog>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      required: false,
      default: null
    },
    label: {
      type: String,
      required: false,
      default: null
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
    }
  },
  data () {
    return {
      isOpened: false,
      time: ''
    }
  },
  mounted () {
    if (this.value) {
      this.time = this.value
    }
  },
  methods: {
    selectTime () {
      this.$refs.dialog.save(this.time)
      this.$emit('input', this.time)
    },
    getRules () {
      return [...this.rules, ...this.required ? [x => !!x || 'Введите значение'] : []]
    }
  }
}
</script>
