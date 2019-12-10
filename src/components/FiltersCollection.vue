<template>
  <v-row class="filters-collection mt-2 mb-5">
    <v-col cols="auto">
      <v-select
        v-model="selectedFiltersTexts"
        :items="filters"
        chips
        class="filter-selection"
        :height="44"
        clearable
        label="Фильтры"
        multiple
        item-text="text"
        item-value="text"
        prepend-icon="filter_list"
        solo
        style="max-width: 250px;"
      >
        <template v-slot:selection="{ item, index }">
          <template v-if="index === 0">
            <v-chip v-if="selectedFiltersTexts.length === 1" class="pointer-hover">
              <span>{{ selectedFiltersTexts.length }} фильтр</span>
            </v-chip>
            <v-chip v-else class="pointer-hover">
              <span>{{ selectedFiltersTexts.length }} фильтров</span>
            </v-chip>
          </template>
        </template>
      </v-select>
    </v-col>
    <v-col v-for="filter in selectedFilters" :key="filter.text" cols="auto" class="mb-2 mb-md-0">
      <select-filter-chip
        v-if="filter.type === 'select'"
        v-model="filtersValuesMap[filter.text].value"
        :filter="filter"
        @close="deleteFilter(filter.text)"
      />
    </v-col>
  </v-row>
</template>

<script>
import SelectFilterChip from './SelectFilterChip'
export default {
  components: {
    SelectFilterChip
  },
  props: {
    value: {
      type: Object,
      required: true
    },
    filters: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      selectedFiltersTexts: [],
      filtersValues: []
    }
  },
  computed: {
    selectedFilters () {
      return this.selectedFiltersTexts.map(filterText => this.attachHelpersToFilter(this.findFilterByText(filterText)))
    },
    filtersValuesMap () {
      // console.log(this.filtersValues)
      return this.filtersValues.reduce((acc, item) => {
        acc[item.text] = item
        return acc
      }, {})
    }
  },
  watch: {
    filters () {
      this.selectedFiltersTexts = this.filters.filter(x => x.selected).map(x => x.text)
    },
    selectedFiltersTexts () {
      if (this.selectedFiltersTexts.length < this.filtersValues.length) {
        this.filtersValues = this.filtersValues
          .filter(filter => this.selectedFiltersTexts.includes(filter.text))
      } else {
        this.filtersValues = this.selectedFiltersTexts
          .map((text) => {
            const filter = this.filters.find(f => f.text === text)
            return this.filtersValuesMap[text] || {
              ...filter,
              value: this.getFilterDefaultValue(filter)
            }
          })
      }
    },
    filtersValues: {
      handler () {
        this.$emit('input', Object.assign(
          {}, ...this.filtersValues.map(({ value, key }) => ({ [key]: value })))
        )
      },
      deep: true
    }
  },
  mounted () {
    this.selectedFiltersTexts = this.filters.filter(x => x.selected).map(x => x.text)
  },
  methods: {
    findFilterByText (text) {
      return this.filters.find(f => f.text === text)
    },
    attachHelpersToFilter (filter) {
      if (filter.type === 'select') {
        return {
          ...filter,
          optionValue: option => this.getFilterOptionValue(filter, option),
          optionText: option => this.getFilterOptionText(filter, option)
        }
      } else {
        return {
          ...filter
        }
      }
    },
    getFilterOptionText (filter, option = {}) {
      return filter.itemText ? option[filter.itemText] : option
    },
    getFilterOptionValue (filter, option = {}) {
      return filter.itemValue ? option[filter.itemValue] : option
    },
    getFilterDefaultValue (filter) {
      switch (filter.type) {
        case 'select': return filter.default ? filter.default() : this.getFilterOptionValue(filter, filter.options()[0] || {})
        case 'checkbox': return filter.default ? filter.default() : true
        default: return null
      }
    },
    deleteFilter (filterText) {
      this.selectedFiltersTexts.splice(this.selectedFiltersTexts.indexOf(filterText), 1)
    }
  }
}
</script>
<style scoped>
  .filters-collection .filter-selection {
    height: 44px !important;
  }
</style>
