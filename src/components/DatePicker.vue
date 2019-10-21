<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="dateFormatted"
        v-mask="'##.##.####'"
        :label="label"
        :rules="[...getRules(rules, required), isDateValid]"
        prepend-icon="event"
        :required="required"
        :outlined="outlined"
        :disabled="disabled"
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

  watch: {
    value: {
      handler (val) {
        if (val) {
          this.dateFormatted = moment(this.value).format('DD.MM.YYYY')
        }
      },
      immediate: true
    }
  },

  methods: {
    tryToSetDate (str) {
      if (!str || !str.length) {
        this.$emit('input', null)
      }

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

      return parsedDate.startOf('day').toISOString()
    },
    handleInput (val) {
      const date = moment(val, 'YYYY-MM-DD')
      this.dateFormatted = date.format('DD.MM.YYYY')

      this.$nextTick(() => {
        this.$emit('input', date.startOf('day').toISOString())

        this.menu = false
      })
    },
    getRules () {
      return [...this.rules, ...this.required ? [x => !!x || 'Введите значение'] : []]
    }
  }
}
</script>
