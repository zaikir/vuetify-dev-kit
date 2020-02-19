<template>
  <v-menu v-model="showMenu" right offset-y offset-overflow :close-on-content-click="false">
    <template v-slot:activator="{ on }">
      <v-chip
        style="margin-top: 8px;"
        v-on="on"
      >
        <strong>{{ filter.text }}</strong>&nbsp;
        <span>: {{ search }}</span>
        <v-avatar right>
          <v-icon>{{showMenu ? 'mdi-chevron-up' : 'mdi-chevron-down'}}</v-icon>
        </v-avatar>
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
          dense
          outlined
          style="margin-bottom:-20px;"
          label="Значение"
          @focus="$event.target.select()"
          @input="handleChange"
          @keydown.enter="showMenu = false"
        />
      </v-card-title>
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
  },
  watch: {
    showMenu (val) {
      if (val) {
        setTimeout(() => {
          this.$refs['search-input'].focus()
        }, 100)
      }
    }
  },
  mounted () {
    this.search = ''
    this.$nextTick(() => {
      this.showMenu = true
    })
  },
  methods: {
    handleChange (val) {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }

      this.refreshTimer = setTimeout(() => {
        if (val && val.length) {
          this.$emit('input', val)
        }
      }, 400)
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
