<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    full-width
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="dateFormatted"
        v-mask="'##.##.####'"
        :label="label"
        :rules="[...rules, isDateValid]"
        prepend-icon="event"
        v-on="on"
        @input="tryToSetDate"
      />
    </template>
    <v-date-picker
      :value="dateValue"
      no-title
      locale="ru"
      first-day-of-week="1"
      @input="handleInput"
    />
  </v-menu>
</template>

<script>
import { mask } from 'vue-the-mask'
import moment from 'moment'

export default {
  directives: {
    mask
  },
  props: {
    value: {
      type: Date,
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
    }
  },
  data () {
    return {
      dateFormatted: '',
      isDateValid: (val = '') => {
        if (!val.length || this.tryToParseDate(val)) {
          return false
        }

        return 'Неверный формат'
      },
      menu: false
    }
  },
  computed: {
    dateValue () {
      return moment(this.value || new Date()).toISOString(true).substr(0, 10)
    }
  },

  methods: {
    tryToSetDate (str) {
      const parsedDate = this.tryToParseDate(str)
      if (parsedDate) {
        this.$emit('input', parsedDate)
      }
    },
    tryToParseDate (str = '') {
      const parsedDate = moment(str.trim(), 'DD.MM.YYYY')
      if (!str.length || str.trim().length !== 10 || !parsedDate.isValid()) {
        return false
      }

      return parsedDate.toDate()
    },
    handleInput (val) {
      const date = moment(val, 'YYYY-MM-DD')
      this.dateFormatted = date.format('DD.MM.YYYY')

      this.$nextTick(() => {
        this.$emit('input', date.toDate())

        this.menu = false
      })
    }
  }
}
</script>
