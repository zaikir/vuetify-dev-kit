<template>
  <v-card :flat="flat">
    <v-card-title v-if="title || canSearch">
      <slot name="title">
        <h3>{{ title }}</h3>
      </slot>
      <v-spacer v-if="title" />
      <v-text-field
        v-if="canSearch"
        v-model="search"
        append-icon="search"
        label="Поиск"
        single-line
        hide-details
      />
      <v-spacer v-if="!title" />
    </v-card-title>
    <v-data-table
      :class="['universal-table', fontSize]"
      :headers="tableHeaders"
      :options.sync="options"
      :items="items"
      :loading="loading"
      :search="search"
      :footer-props="footerProps"
      :mobile-breakpoint="mobileBreakpoint"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      :dense="dense"
      :server-items-length="totalItemsLength"
      locale="ru"
      must-sort
      :hide-default-header="hideHeader"
      loading-text="Загрузка..."
      no-data-text="Нет данных"
      no-results-text="Нет результатов"
      @update:sort-by="$emit('update:sort-by', $event)"
      @update:sort-desc="$emit('update:sort-desc', $event)"
      @click:row="selectRow"
    >
      <template v-slot:top>
        <filters-collection
          v-if="filters && filters.length"
          v-model="filterValues"
          :filters="filters"
          @input="updateSource"
        />
        <v-tabs
          v-if="tabs.length"
          v-model="selectedTab"
          background-color="white"
          color="black"
          class="tabs my-2"
          grow
          style="width: 100%"
          :vertical="$vuetify.breakpoint.xsOnly"
        >
          <v-tab
            v-for="tab in tabs"
            :key="tab.text"
            ripple
          >
            {{ tab.text }}
            <template v-if="!totalCounts[tab.text] && totalCounts[tab.text] !== 0">
              (
              <v-progress-circular
                indeterminate
                :size="9"
                :width="1"
              />
              )
            </template>
            <template v-else>
              ({{ totalCounts[tab.text] }})
            </template>
          </v-tab>
        </v-tabs>
      </template>

      <template v-for="header in headers" :slot="`item.${header.value}`" slot-scope="{item}">
        <slot :name="`item.${header.value}`" :item="item">
          <template v-if="header.display === 'phone'">
            {{ item[header.value] ? formatPhoneNumber(item[header.value], header.countryCode) : '&mdash;' }}
          </template>
          <template v-else-if="header.display === 'switch'">
            <v-switch :input-value="item[header.value]" flat disabled />
          </template>
          <template v-else-if="header.display === 'checkbox'">
            <v-checkbox class="checkbox" :input-value="item[header.value]" value disabled />
          </template>
          <template v-else-if="header.display === 'image'">
            <v-img
              v-if="item[header.value]"
              :src="item[header.value].url"
              aspect-ratio="1"
              max-width="60px"
              contain
              eager
              class="image"
              @click="openLink(item[header.value].url)"
            >
              <template v-slot:placeholder>
                <v-row
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular width="2" indeterminate color="black" />
                </v-row>
              </template>
            </v-img>
          </template>
          <template v-else-if="header.display === 'images'">
            <v-row no-gutters>
              <v-col
                v-for="(image, i) in item[header.value]"
                :key="i"
                cols="auto"
              >
                <v-img
                  :src="image.url"
                  aspect-ratio="1"
                  width="60px"
                  contain
                  eager
                  :class="`image ${header.padding}`"
                  @click="openLink(image.url)"
                >
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular width="2" indeterminate color="black" />
                    </v-row>
                  </template>
                </v-img>
              </v-col>
            </v-row>
          </template>
          <template v-else>
            {{ item[header.value] || '&mdash;' }}
          </template>
        </slot>
      </template>
      <template v-if="canDelete" :slot="`item.${deleteButtonProps.value}`" slot-scope="{item}">
        <slot :name="`button.${deleteButtonProps.value}`" :item="item">
          <v-btn icon @click="removeRow(item)">
            <v-icon>
              {{ deleteButtonProps.icon }}
            </v-icon>
          </v-btn>
        </slot>
      </template>
      <template v-if="canAdd && addButtonProps.type === 'append'" v-slot:body.append="{ headers }">
        <tr>
          <td :colspan="headers.length">
            <slot name="button.add">
              <v-row no-gutters>
                <v-col cols="12" class="d-flex">
                  <slot name="button.add.prepend" />
                  <v-tooltip bottom>
                    <template #activator="{on}">
                      <v-btn
                        fab
                        color="primary"
                        x-small
                        class="elevation-0"
                        @click="addItem"
                        v-on="on"
                      >
                        <v-icon>
                          {{ addButtonProps.icon }}
                        </v-icon>
                      </v-btn>
                    </template>
                    {{ addButtonProps.tooltip || 'Создать' }}
                  </v-tooltip>
                  <slot name="button.add.append" />
                </v-col>
              </v-row>
            </slot>
          </td>
        </tr>
      </template>
      <template #progress>
        <div class="progress-area">
          <v-progress-linear height="2px" indeterminate />
        </div>
      </template>
    </v-data-table>
    <div v-if="canAdd && addButtonProps.type === 'fixed'" style="height:50px" />
    <slot v-if="canAdd && addButtonProps.type === 'fixed'" name="button.add">
      <v-btn
        fab
        dark
        bottom
        :color="addButtonProps.color"
        right
        fixed
        @click="addItem"
      >
        <v-icon>{{ addButtonProps.icon }}</v-icon>
      </v-btn>
    </slot>

    <edit-item-dialog
      v-if="canEdit || canAdd"
      v-model="editItemDialog"
      :item="processedItem"
      :persistent="editDialogProps.persistent"
      :max-width="editDialogProps.maxWidth"
      :fields="editDialogProps.fields"
      :title="editDialogProps.title"
      :fullscreen="editDialogProps.fullscreen"
      :flat="editDialogProps.flat"
      :context="context"
      :pre-save="editDialogProps.preSave"
      :pre-open="editDialogProps.preOpen"
      :breakpoints="editDialogProps.breakpoints"
      @onSaved="saveItem"
    >
      <template #body.prepend="{item, context}">
        <slot name="editForm.body.prepend" :item="item" :context="context" />
      </template>
      <template #body.append="{item, context}">
        <slot name="editForm.body.append" :item="item" :context="context" />
      </template>
      <template #form.append="{item, context}">
        <slot name="editForm.form.append" :item="item" :context="context" />
      </template>
      <template #form.prepend="{item, context}">
        <slot name="editForm.form.prepend" :item="item" :context="context" />
      </template>
    </edit-item-dialog>
    <confirmation-dialog
      v-model="isConfirmationDialogOpened"
      @confirm="deleteItem"
      @decline="isConfirmationDialogOpened = false"
    />
  </v-card>
</template>

<script>

import { parsePhoneNumberFromString } from 'libphonenumber-js'
import EditItemDialog from './EditItemDialog'
import ConfirmationDialog from './ConfirmationDialog'
import FiltersCollection from './FiltersCollection'

export default {
  components: {
    EditItemDialog,
    ConfirmationDialog,
    FiltersCollection
  },
  props: {
    headers: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: false,
      default: () => []
    },
    filters: {
      type: Array,
      required: false,
      default: () => []
    },
    tabs: {
      type: Array,
      required: false,
      default: () => []
    },
    totalItemsLength: {
      type: Number,
      default: -1
    },
    title: {
      type: String,
      default: null
    },
    flat: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    canDelete: {
      type: Boolean,
      default: false
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canAdd: {
      type: Boolean,
      default: false
    },
    canSearch: {
      type: Boolean,
      default: false
    },
    refresh: {
      type: Boolean,
      default: false
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    addButtonProps: {
      type: Object,
      default: () => ({ type: 'fixed', icon: 'add', color: 'pink', tooltip: 'Создать' })
    },
    deleteButtonProps: {
      type: Object,
      default: () => ({ text: '', value: 'delete', align: 'right', icon: 'delete' })
    },
    footerProps: {
      type: Object,
      default: () => ({
        itemsPerPageOptions: [10, 30, 45, 60, { text: 'Все', 'value': -1 }],
        itemsPerPageText: 'Строк на странице:'
      })
    },
    editDialogProps: {
      type: Object,
      default: () => ({
        maxWidth: '500px',
        fields: [],
        persistent: true,
        preSave: () => {},
        preOpen: () => {}
      })
    },
    fontSize: {
      type: String,
      default: 'normal'
    },
    mobileBreakpoint: {
      type: Number,
      default: 500
    },
    sortBy: {
      type: [String, Array],
      default: null
    },
    sortDesc: {
      type: Boolean
    },
    context: {
      type: Object,

      default: () => ({})
    },
    preFilter: {
      type: Function,

      default: ({ filter }) => filter
    }
  },
  data () {
    return {
      editItemDialog: false,
      isAdded: false,
      isRowLoading: false,
      search: '',
      options: {},
      isConfirmationDialogOpened: false,
      processedItem: null,
      selectedTab: null,
      totalCounts: {},
      filterValues: {}
    }
  },
  computed: {
    tableHeaders () {
      return [
        ...this.headers,
        ...this.canDelete ? [this.deleteButtonProps] : []
      ]
    }
  },
  watch: {
    refresh (val) {
      if (val) {
        this.updateSource()
      }

      this.$emit('update:refresh', false)
    },
    selectedTab () {
      if (this.isInitialized) {
        this.updateSource(false)
      }
    },
    search () {
      if (this.isInitialized) {
        this.debouncedUpdateSource()
      }
    },
    options: {
      handler () {
        if (this.isInitialized) {
          this.updateSource()
        }
      },
      deep: true
    }
  },
  mounted () {
    this.$vuetify.lang.locales.en.dataTable.sortBy = 'Сортировать по'
    this.updateSource()
    setTimeout(() => {
      this.isInitialized = true
    }, 300)
  },
  methods: {
    openLink (url) {
      window.open(url, '_blank')
    },
    debouncedUpdateSource () {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = null
      }

      this.searchTimeout = setTimeout(() => {
        this.updateSource()
      }, 300)
    },
    saveItem ({ item, done }) {
      if (this.isAdded) {
        this.$emit('itemAdded', {
          item,
          ...this.context,
          done: () => {
            this.updateSource()
            done()
          }
        })
      } else {
        this.$emit('itemUpdated', {
          item,
          ...this.context,
          done: () => {
            this.updateSource()
            done()
          }
        })
      }
    },
    updateSource (updateCounts = true) {
      const getFilterData = tab => ({
        id: tab.text,
        filter: {
          ...this.filterValues,
          ...tab.filter || {}
        }
      })

      this.$emit('updateSource', {
        options: this.options,
        search: this.search,
        filter: this.preFilter({
          filter: getFilterData(this.selectedTab !== null ? this.tabs[this.selectedTab] : {}).filter,
          ...this.context
        })
      })

      if (this.tabs && this.tabs.length && updateCounts) {
        this.totalCounts = {}

        this.$emit('updateCounts', {
          options: this.options,
          search: this.search,
          filters: this.tabs.map(
            tab => ({
              filter: this.preFilter({ filter: getFilterData(tab).filter, ...this.context }),
              id: getFilterData(tab).id
            })
          ),
          done: (counts) => {
            this.totalCounts = counts.reduce((acc, item) => {
              acc[item.id] = item.value
              return acc
            }, {})
          }
        })
      }
    },
    addItem () {
      this.processedItem = null

      this.$emit('getItem', {
        ...this.context,
        done: (item) => {
          this.$nextTick(() => { this.processedItem = item })
        }
      })

      this.isAdded = true
      this.editItemDialog = true
    },
    editItem (row) {
      this.processedItem = null

      this.$emit('getItem', {
        row,
        ...this.context,
        done: (item) => {
          this.$nextTick(() => { this.processedItem = item })
        }
      })

      this.isAdded = false
      this.editItemDialog = true
    },
    onDoubleClick (item) {
      if (this.canEdit) {
        this.editItem(item)
      }
    },
    removeRow (row) {
      this.processedItem = null

      this.$nextTick(() => {
        this.processedItem = row
        this.isConfirmationDialogOpened = true
      })
    },
    deleteItem () {
      this.isConfirmationDialogOpened = false

      this.$emit('itemDeleted', {
        item: this.processedItem,
        ...this.context,
        done: () => {
          this.updateSource()
        }
      })
    },
    selectRow ($event) {
      if (this.lastClickedElement && Object.is(this.lastClickedElement, $event)) {
        this.onDoubleClick($event)
        this.lastClickedElement = null
      } else {
        if (this.doubleClickTimeout) {
          clearTimeout(this.doubleClickTimeout)
        }

        this.lastClickedElement = $event
        this.doubleClickTimeout = setTimeout(() => {
          this.lastClickedElement = null
        }, 500)
      }
    },
    formatPhoneNumber (phone = '', countryCode = '') {
      const phoneNumber = parsePhoneNumberFromString('+' + countryCode + phone)
      if (!phoneNumber) {
        return phone.length ? '+' + phone : null
      } else {
        return phoneNumber.formatInternational()
      }
    },
    setRowLoading (value) {
      this.isRowLoading = value
    }
  }
}
</script>
<style>
  .universal-table.small.v-data-table thead th {
      font-size: 12px !important;
  }
  .universal-table.small.v-data-table tbody td {
      font-size: 12px !important;
  }
  .universal-table.large.v-data-table thead th {
      font-size: 16px !important;
  }
  .universal-table.large.v-data-table tbody td {
      font-size: 16px !important;
  }

  .universal-table .checkbox.v-input--selection-controls,
  .universal-table .checkbox.v-input--selection-controls .v-input__slot {
    margin: 0px;
    padding: 0px;
  }

  .universal-table .checkbox .v-messages {
    display: none;
  }

  .universal-table .v-data-table__progress .progress-area {
    position: relative;
  }

  .universal-table .v-data-table__progress .progress-area .v-progress-linear {
    position: absolute;
    left: 0;
    top: -1px;
    z-index: 2;
  }

  .universal-table th.nowrap {
    white-space: nowrap;
  }

  .universal-table th.nowrap {
    white-space: nowrap;
  }

  .universal-table .v-image {
    border: thin solid rgba(0, 0, 0, 0.322);
    border-radius: 6px;
    margin: 4px;
    cursor: pointer;
  }

  .universal-table .v-image:hover {
    border: thin solid rgba(0, 0, 0, 1.0);
  }

  .universal-table .tabs .v-tab {
    margin-left: 0px !important;
  }

  .universal-table .tabs .v-tabs-bar {
    width: 100%;
  }

  .universal-table .v-data-table__mobile-row__cell .v-image {
    width: 48px !important;
    height: 48px !important;
    margin: 0px;
    margin-top: -8px;
  }

  .universal-table .v-data-table__mobile-row,
  .universal-table .v-data-table__mobile-row__wrapper{
    min-height: 48px;
    height: auto !important;
  }

  .universal-table .v-data-table__mobile-row__cell {
    padding-left: 5px;
  }

</style>
