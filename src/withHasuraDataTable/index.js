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

export default ({ Table = BaseTable, source, fields } = {}) => {
  if (!fields) { throw new Error('Fields required') }
  if (!source) { throw new Error('Source required') }

  const _fields = fields.map((field) => {
    if (field.value.includes('*')) {
      const path = buildPathToNestedField(field)

      return {
        ...field,
        _nestedPath: path,
        _textMapper: (field) => {
          return path.reduce((acc, item) => acc[item], field)
        }
      }
    } else {
      return field
    }
  })

  return {
    name: 'WithGraphqlDataProviderTable',
    props: {
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
          return gql(buildGraphqlQuery(source, _fields, this.where))
        },
        update (data) {
          return data[source]
        },
        result ({ data }) {
          this.totalItems = data[`${source}_aggregate`].aggregate.count
        },
        error (error) {
          this.$emit('error', wrapGraphqlError(error))
        },
        variables () {
          const { sortBy = [], sortDesc = [] } = this.options
          return {
            offset: this.options.itemsPerPage * (this.options.page - 1),
            limit: this.options.itemsPerPage,
            orderBy: buildSortQuery(_fields, sortBy, sortDesc)
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
        return buildHeaders(source, fields, this.props)
      },
      props () {
        return this.$props
        // Object.assign({}, ...Object.entries(this.$props).map(([key, value]) => ({
        //   [key]: wrapProp(value, this.context)
        // })))
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
        fields: _fields,
        source,
        $apollo: this.$apollo,
        $scopedSlots: slotsArray.filter(([key]) => !key.startsWith('dialog.')),
        $attrs: this.props,
        context: this.context,
        onAdd: this.addItem
      })
      return createElement('div', {}, [
        createElement(HasuraEditItemDialog, {
          props: {
            source,
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
        createElement(Table, {
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
              this.editItem(row.id)
            }
          }
        })
      ])
    }
  }
}
