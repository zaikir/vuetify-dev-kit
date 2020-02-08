import gql from 'graphql-tag'
import BaseTable from '../shared/components/BaseTable.vue'
import { wrapGraphqlError } from '../shared/utils'
import {
  buildGraphqlQuery, buildHeaders, buildPathToNestedField,
  buildSortQuery, buildScopedSlots
} from './utils'

const wrapProp = (prop, context) => {
  return typeof prop === 'function'
    ? prop(context)
    : prop
}

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

  const query = gql(buildGraphqlQuery(source, _fields))

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
      context: {
        type: Object,
        default: () => ({})
      }
    },
    apollo: {
      items: {
        query,
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
    render (createElement) {
      const scopedSlots = buildScopedSlots({
        createElement,
        fields: _fields,
        source,
        $apollo: this.$apollo,
        $scopedSlots: this.$scopedSlots,
        $attrs: this.props,
        context: this.context
      })

      return createElement(Table, {
        props: {
          loading: this.$apollo.queries.items.loading,
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
          }
        }
      })
    }
  }
}
