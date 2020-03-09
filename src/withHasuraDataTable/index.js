import gql from 'graphql-tag'
import BaseTable from '../shared/components/BaseTable.vue'
import HasuraEditItemDialog from '../shared/components/HasuraEditItemDialog.vue'
import { wrapGraphqlError } from '../shared/utils'
import {
  buildGraphqlQuery, buildHeaders, buildPathToNestedField,
  buildSortQuery, buildScopedSlots
} from './utils'

// const wrapProp = (prop, context) => {
//   return typeof prop === 'function'
//     ? prop(context)
//     : prop
// }

export default {
  name: 'HasuraDataTable',
  props: {
    source: {
      type: String,
      required: true
    },
    fields: {
      type: Array,
      required: true
    },
    disableAdd: {
      type: Boolean,
      default: false
    },
    disableEdit: {
      type: Boolean,
      default: false
    },
    disableDelete: {
      type: Boolean,
      default: false
    },
    dialogProps: Object,
    formProps: Object,
    where: String,
    context: {
      type: Object,
      default: () => ({})
    }
  },
  apollo: {
    items: {
      query () {
        return gql(buildGraphqlQuery(this.source, this._fields, this.where))
      },
      update (data) {
        if (data[this.source]) {
          return data[this.source]
        }
      },
      result ({ data }) {
        if (data[`${this.source}_aggregate`]) {
          this.totalItems = data[`${this.source}_aggregate`].aggregate.count
        }
      },
      error (error) {
        this.$emit('error', wrapGraphqlError(error))
      },
      variables () {
        const { sortBy = [], sortDesc = [] } = this.options
        return {
          offset: this.options.itemsPerPage * (this.options.page - 1),
          limit: this.options.itemsPerPage,
          orderBy: buildSortQuery(this._fields, sortBy, sortDesc)
        }
      }
    }
  },
  data () {
    return {
      isAdd: false,
      isEditDialogOpened: false,
      options: {
        page: 1
      },
      totalItems: 0
    }
  },
  computed: {
    headers () {
      return buildHeaders(this.source, this.fields, this.props)
    },
    props () {
      return this.$props
      // Object.assign({}, ...Object.entries(this.$props).map(([key, value]) => ({
      //   [key]: wrapProp(value, this.context)
      // })))
    },
    _fields () {
      return this.fields.map((field) => {
        if (field.value.includes('*')) {
          const path = buildPathToNestedField(field)

          return {
            ...field,
            _nestedPath: path,
            _textMapper: (field) => {
              return path.reduce((acc, item) => (acc || {})[item], field)
            }
          }
        } else {
          return field
        }
      })
    }
  },
  methods: {
    addItem () {
      this.isAdd = true
      this.isEditDialogOpened = true
    },
    editItem (id) {
      this.selectedRowId = id
      this.isAdd = false
      this.isEditDialogOpened = true
    }
  },
  render (createElement) {
    const slotsArray = Object.entries(this.$scopedSlots)
    const scopedSlots = buildScopedSlots({
      createElement,
      fields: this._fields,
      source: this.source,
      $apollo: this.$apollo,
      $scopedSlots: slotsArray.filter(([key]) => !key.startsWith('dialog.')),
      $attrs: this.props,
      context: this.context,
      onAdd: this.addItem
    })
    return createElement('div', {}, [
      createElement(HasuraEditItemDialog, {
        props: {
          source: this.source,
          value: this.isEditDialogOpened,
          dialogProps: this.dialogProps,
          formProps: this.formProps,
          context: this.context,
          isAdd: this.isAdd,
          itemId: this.selectedRowId
        },
        scopedSlots: {
          ...Object.assign({}, ...slotsArray
            .filter(([key]) => key.startsWith('dialog.'))
            .map(([key, func]) => ({
              [key.replace('dialog.', '')]: func
            }))),
          ...Object.assign({}, ...slotsArray
            .filter(([key]) => key.startsWith('field.'))
            .map(([key, func]) => ({
              [key]: func
            })))
        },
        on: {
          error: (err) => {
            this.$emit('error', err)
          },
          input: (val) => {
            this.selectedRowId = null
            this.isEditDialogOpened = val
          }
        }
      }),
      createElement(BaseTable, {
        props: {
          loading: this.$apollo.loading,
          headers: this.headers,
          items: this.items,
          serverItemsLength: this.totalItems,
          options: this.options,
          ...this.$attrs
        },
        scopedSlots,
        on: {
          ...this.$listeners,
          'update:options': (options) => {
            this.options = options
          },
          'dblclick:row': (row) => {
            if (!this.disableEdit) {
              this.editItem(row.id)
            }

            this.$emit('dblclick:row', row)
          }
        }
      })
    ])
  }
}
