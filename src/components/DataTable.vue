<template>
  <v-card :flat="flat || isMobileView" :class="{ mobile: isMobileView }" :color="isMobileView ? 'transparent' : ''">
    <v-card-title v-if="title || canSearch">
      <slot name="title">
        <h3 style="word-break: break-word;">
          {{ title }}
        </h3>
      </slot>
      <v-tooltip v-if="canAdd && addButtonProps.type === 'title'" bottom>
        <template #activator="{on}">
          <v-btn
            fab
            color="primary"
            x-small
            class="elevation-0 ml-3"
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
      :class="{'universal-table': true, [fontSize]: true, 'can-sort': canSort}"
      :headers="tableHeaders"
      :options.sync="options"
      :items="preShow(items.filter(x => !x.isRemoved))"
      :search="search"
      :loading="isLoading"
      :hide-default-footer="isMobileView || hideFooter"
      :footer-props="footerProps"
      :mobile-breakpoint="mobileBreakpoint"
      :disable-sort="!canSort"
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
      @page-count="pageCount = $event"
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
      <template v-if="isMobileView" #item="{ item, isSelected }">
        <v-card class="my-4 mx-1 pa-2" @click="onDoubleClick(item)">
          <slot name="mobile-item" :item="item" :context="context" />
        </v-card>
      </template>
      <template v-for="header in filteredHeaders" v-slot:[`item.${header.value}`]="{item}">
        <slot :name="`item.${header.value}`" :item="item">
          <template v-if="header.display === 'phone'">
            <template v-if="item[header.value]">
              <a :key="`value-${header.value}`" itemprop="telephone" :href="`tel:${header.countryCode || ''}${item[header.value]}`">
                {{ formatPhoneNumber(item[header.value], header.countryCode, header.sign) }}
              </a>
            </template>
            <template v-else>
              &mdash;
            </template>
          </template>
          <template v-else-if="header.display === 'email'">
            <template v-if="item[header.value]">
              <a :key="`value-${header.value}`" itemprop="email" :href="`mailto:${item[header.value]}`">
                {{ item[header.value] }}
              </a>
            </template>
            <template v-else>
              &mdash;
            </template>
          </template>
          <template v-else-if="header.display === 'switch'">
            <div v-if="header.type === 'action'" :key="`action-${header.value}`" @click.prevent.stop="() => {}">
              <v-switch :input-value="item[header.value]" flat @change="header.onClick" />
            </div>
            <v-switch v-else :input-value="item[header.value]" flat disabled />
          </template>
          <template v-else-if="header.display === 'custom'">
            <div v-if="header.type === 'action'" :key="`action-${header.value}`" @click.prevent.stop="() => {}">
              <custom-checkbox
                v-model="item[header.value]"
                :tooltip="conditionalFunction(header.tooltip, item)"
                v-bind="header"
                :disabled="header.disabled"
                :color="header.color"
                :background-color="header.backgroundColor"
                @input="onCustomActionClicked(header, item)"
              />
            </div>
            <custom-checkbox
              v-else
              v-model="item[header.value]"
              v-bind="header"
              :tooltip="conditionalFunction(header.tooltip)"
              flat
              disabled
              :color="header.color"
            />
          </template>
          <template v-else-if="header.display === 'checkbox'">
            <v-checkbox class="checkbox" :input-value="item[header.value]" value disabled />
          </template>
          <template v-else-if="header.display === 'combobox'">
            {{ item[header.value] && item[header.value].length ? item[header.value].join(', ') :'&mdash;' }}
          </template>
          <template v-else-if="header.display === 'date'">
            {{ item[header.value] ? moment(item[header.value]).format(header.format || 'DD.MM.YYYY') :'&mdash;' }}
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
                v-for="(image, i) in item[header.value].filter(x => !x.isRemoved)"
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
    <div v-if="isMobileView" class="text-center pt-2">
      <v-pagination v-model="options.page" :length="pageCount" />
    </div>
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

    <slot
      v-if="canEdit || canAdd || canView"
      name="editDialog"
      :props="{...editDialogProps, value: editItemDialog, source: dialogSource, 'source-args': dialogSourceArgs, context, readonly: canView, preSave: preSaveItem}"
      :on="{onSaved: saveItem, input: $event => editItemDialog = $event}"
    >
      <edit-item-dialog
        v-model="editItemDialog"
        :source="dialogSource"
        :source-args="dialogSourceArgs"
        v-bind="{ preSave: preSaveItem, ...editDialogProps }"
        :context="context"
        :readonly="canView"
        @onSaved="saveItem"
      >
        <template #title="{item, context, saveItem}">
          <slot name="editForm.title" :item="item" :context="context" :saveItem="saveItem" />
        </template>
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
        <template
          v-for="field in flattenFields(editDialogProps.fields)"
          v-slot:[`field.${field.value}`]="{item}"
        >
          <slot :name="`field.${field.value}`" :item="item" :context="context" />
        </template>
        <template
          v-for="field in flattenFields(editDialogProps.fields)"
          v-slot:[`label.${field.value}`]="{item}"
        >
          <slot :name="`label.${field.value}`" :item="item" :context="context" />
        </template>
      </edit-item-dialog>
    </slot>
    <confirmation-dialog
      v-model="isConfirmationDialogOpened"
      @confirm="deleteRow"
      @decline="isConfirmationDialogOpened = false"
    />
  </v-card>
</template>

<script>

import { parsePhoneNumberFromString } from 'libphonenumber-js'
import moment from 'moment'
import EditItemDialog from './EditItemDialog'
import ConfirmationDialog from './ConfirmationDialog'
import FiltersCollection from './FiltersCollection'
import CustomCheckbox from './CustomCheckbox'

export default {
  components: {
    EditItemDialog,
    ConfirmationDialog,
    FiltersCollection,
    CustomCheckbox
  },
  props: {
    headers: {
      type: Array,
      required: true
    },
    source: {
      type: Object,
      required: true
    },
    tabs: {
      type: Array,
      required: false,
      default: () => []
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
    canView: {
      type: Boolean,
      default: false
    },
    canSort: {
      type: Boolean,
      default: true
    },
    mobileView: {
      type: Boolean,
      default: false
    },
    preShow: {
      type: Function,
      default: items => items
    },
    preFilter: {
      type: Function,
      default: ({ filter }) => filter
    },
    preSaveItem: {
      type: Function,
      default: ({ item }) => item
    },
    preDeleteItem: {
      type: Function,
      default: ({ item }) => item
    },
    refresh: {
      type: Boolean,
      default: false
    },
    addItemTrigger: {
      type: Boolean,
      default: false
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    hideFooter: {
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
        persistent: true
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
    }
  },
  data () {
    return {
      editItemDialog: false,
      isAdded: false,
      isLoading: false,
      search: '',
      options: {},
      isConfirmationDialogOpened: false,
      processedItem: null,
      selectedTab: null,
      totalCounts: {},
      filterValues: {},
      items: [],
      totalItemsLength: -1,
      dialogSourceArgs: null,
      pageCount: 0
    }
  },
  computed: {
    filteredHeaders () {
      return this.headers.filter(header => !header.showIf || header.showIf({ tab: this.selectedTab, ...this.context }))
    },
    tableHeaders () {
      return [
        ...this.filteredHeaders,
        ...this.canDelete ? [this.deleteButtonProps] : []
      ]
    },
    filters () {
      return this.headers.filter(x => x.filter).map(header => ({
        text: header.text,
        key: header.value,
        ...header.filter
      }))
    },
    isMobileView () {
      return this.$vuetify.breakpoint.xsOnly && this.mobileView
    },
    dialogSource () {
      return this.source.url
        ? { url: ({ id }) => `${this.source.url}/${id}` }
        : {
          item: ({ id }) => this.items.find(({ _id }) => _id === id),
          patch: {
            url: ({ parent }) => `${this.source.patch.url}/${parent._id}`,
            body: ({ item, isCreation }) => {
              const index = this.items.findIndex(x => x._id === item._id)
              if (index === -1) {
                return { op: 'replace', path: `${this.source.patch.path}`, value: [...this.items, item] }
              } else {
                const updatedItems = [...this.items]
                updatedItems.splice(index, 1, { ...item })

                return { op: 'replace', path: `${this.source.patch.path}`, value: updatedItems }
              }
            }
          }
        }
    }
  },
  watch: {
    preFilter () {
      if (this.isInitialized) {
        this.updateSource(false)
      }
    },
    refresh (val) {
      if (val) {
        this.updateSource()
      }

      this.$emit('update:refresh', false)
    },
    addItemTrigger (val) {
      if (val) {
        this.addItem()
      }

      this.$emit('update:addItemTrigger', false)
    },
    selectedTab () {
      if (this.isInitialized) {
        this.options.page = 1
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
    async onCustomActionClicked (header, item) {
      const result = await header.onClick({ item, ...this.context })
      if ((result || {}).action === 'reload') {
        this.updateSource()
      }
    },
    conditionalFunction (value, item) {
      if (value && typeof value === 'function') {
        return value({ item, ...this.context })
      } else {
        return value
      }
    },
    moment (date) {
      return moment(date)
    },
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
    async saveItem ({ item, isCreation, isClose }) {
      if (!this.source.url) {
        if (!isCreation) {
          const index = this.items.findIndex(x => x._id === item._id)
          this.items.splice(index, 1, { ...item })
        } else {
          this.items.push({ ...item })
        }
      }

      if (this.dialogSourceArgs && this.dialogSourceArgs.id) {
        this.$emit('onItemUpdated', { item, ...this.context })
      } else {
        this.$emit('onItemCreated', { item, ...this.context })
      }

      if (isClose) {
        this.dialogSourceArgs = null
      }

      await this.updateSource()
    },
    async updateSource (updateCounts = true) {
      const getFilterData = tab => ({
        id: tab.text,
        filter: {
          ...this.filterValues,
          ...tab.filter || {}
        }
      })

      const filter = this.preFilter({
        filter: getFilterData(this.selectedTab !== null ? this.tabs[this.selectedTab] : {}).filter,
        ...this.context
      })

      try {
        this.isLoading = true
        if (this.source.url) {
          const { page, itemsPerPage, sortBy = '', sortDesc = '' } = this.options

          const query = `sortBy=${sortBy}&sortDesc=${sortDesc}&page=${page}&itemsPerPage=${itemsPerPage}&search=${this.search || ''}&columns=${[...this.headers.map(({ value }) => value), 'isRemoved'].join(',')}${filter ? `&filter=${JSON.stringify(filter)}` : ''}`

          const { items, total } = await this.$axios.$get(`${this.source.url}${this.source.url.includes('?') ? '' : '?'}${query}`, { progress: false })

          this.items = items
          this.totalItemsLength = total
        } else {
          this.items = this.source.items
        }
      } finally {
        this.isLoading = false
      }

      if (this.tabs && this.tabs.length && updateCounts) {
        this.totalCounts = {}

        const filters = this.tabs.map(
          tab => ({
            filter: this.preFilter({ filter: getFilterData(tab).filter, ...this.context }),
            id: getFilterData(tab).id
          })
        )

        try {
          if (this.source.url) {
            const { totals } = await this.$axios.$post(`${this.source.url}/count${this.source.url.includes('?') ? '' : '?'}search=${this.search}`, {
              filters: filters.map(({ filter }) => filter)
            }, { progress: false })

            const counts = totals.map((total, i) => ({
              id: filters[i].id,
              value: total
            }))

            this.totalCounts = counts.reduce((acc, item) => {
              acc[item.id] = item.value
              return acc
            }, {})
          } else {
            throw new Error('Not implemented')
          }
        } catch (err) {
          console.error(err)
        }
      }
    },
    addItem () {
      this.dialogSourceArgs = null
      this.editItemDialog = true
    },
    editItem (row) {
      this.dialogSourceArgs = { id: row._id }
      this.editItemDialog = true
    },
    onDoubleClick (item) {
      if (this.canEdit || this.canView) {
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
    async deleteRow () {
      this.isConfirmationDialogOpened = false

      this.isLoading = true

      const item = await this.preDeleteItem({ item: this.processedItem, ...this.context })

      try {
        if (item) {
          if (this.source.url) {
            await this.$axios.$delete(`${this.source.url}/${item._id}`, { progress: false })
          } else {
            const index = this.items.findIndex(({ _id }) => item._id === _id)

            if (this.source.patch) {
              const getBody = () => {
                const updatedItems = [...this.items]
                updatedItems.splice(index, 1, { ...item, isRemoved: true })

                return { op: 'replace', path: `${this.source.patch.path}`, value: updatedItems }
              }

              await this.$axios.$patch(`${this.source.patch.url}/${this.context.parent._id}`, getBody(), { progress: false })
            }

            this.$set(this.items, index, { ...item, isRemoved: true })
          }
        }
      } catch (err) {
        this.isLoading = false
        return
      }

      this.$emit('onItemDeleted', { item: this.processedItem, ...this.context })

      await this.updateSource()

      this.isLoading = false
    },
    selectRow ($event = {}) {
      if (this.$vuetify.breakpoint.xsOnly || (this.lastClickedElement && Object.is(this.lastClickedElement, $event))) {
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
    formatPhoneNumber (phone = '', countryCode = '', sign = '+') {
      const phoneNumber = parsePhoneNumberFromString(sign + countryCode + phone)
      if (!phoneNumber) {
        return phone.length ? sign + phone : null
      } else {
        return phoneNumber.formatInternational()
      }
    },
    flattenFields (fields) {
      if (!fields.length && fields.length !== 0) {
        return fields.layouts.reduce((acc, layout, id) => {
          acc.push(...layout.fields)
          return acc
        }, [])
      } else {
        return fields
      }
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

  .universal-table .v-card.mobile {
    background-color: transparent !important;
  }

  .v-card.mobile .universal-table {
    background-color: transparent !important;
  }

  .v-card.mobile .universal-table:not(.can-sort) .v-data-table-header-mobile {
    display: none;
  }

</style>
