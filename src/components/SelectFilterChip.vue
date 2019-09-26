<template>
  <v-menu v-model="showMenu" right offset-y offset-overflow :close-on-content-click="false">
    <template v-slot:activator="{ on }">
      <v-chip
        close
        style="margin-top: 8px;"
        v-on="on"
        @click:close="close"
      >
        <strong>{{ filter.text }}</strong>&nbsp;
        <span>: {{ filter.optionText(selectedOption) }}</span>
      </v-chip>
    </template>
    <v-card flat>
      <v-card-title>
        <v-text-field
          ref="search-input"
          v-model="search"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          class="pr-2"
          autofocus
          label="Поиск"
          style="margin-bottom:-30px;"
          @focus="$event.target.select()"
          @input="tryToSelectOption"
        />
        <!-- @keydown.enter="selectFirstOption" -->
      </v-card-title>
      <v-card-text style="overflow-y: auto" class="pa-0">
        <v-list style="max-height: 300px;over">
          <v-list-item-group :value="value" @change="handleChange">
            <v-list-item
              v-for="(option, index) in filteredOptions"
              :key="index"
              :value="filter.optionValue(option)"
            >
              <v-list-item-title>{{ filter.optionText(option) }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      required: false,
      default: null
    },
    filter: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showMenu: false,
      search: ''
    }
  },
  computed: {
    selectedOption () {
      return this.filter.options().find(option => this.filter.optionValue(option) === this.value)
    },
    filteredOptions () {
      return [
        ...this.filter.options()
          .filter(option => this.filter.optionText(option).toLowerCase().includes(this.search.toLowerCase())),
        ...this.filter.options()
          .filter(option => !this.filter.optionText(option).toLowerCase().includes(this.search.toLowerCase()))
      ]
    }
  },
  watch: {
    showMenu (val) {
      if (val) {
        this.search = this.filter.optionText(this.selectedOption)

        setTimeout(() => {
          this.$refs['search-input'].focus()
        }, 100)
      }
    }
  },
  mounted () {
    this.search = this.filter.optionText(this.selectedOption)
  },
  methods: {
    selectFirstOption () {
      const option = this.filteredOptions[0]
      if (option) {
        this.handleChange(this.filter.optionValue(option))
      }
    },
    tryToSelectOption (text = '') {
      const loweredText = text.toLowerCase()
      const option = this.filter.options().find(option => loweredText === this.filter.optionText(option).toLowerCase())

      if (option) {
        // eslint-disable-next-line no-console
        console.log(option, loweredText)

        this.handleChange(this.filter.optionValue(option))
      }
    },
    handleChange (val) {
      if (this.filter.options().find(o => this.filter.optionValue(o) === val)) {
        this.$emit('input', val)

        this.showMenu = false
      }
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
