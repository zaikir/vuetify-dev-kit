import gql from 'graphql-tag'
import { VDataTable } from 'vuetify/lib/components'
import { wrapGraphqlError } from '../shared/utils'
import {
  buildGraphqlQuery, buildHeaders, buildPathToNestedField,
  buildSortQuery, deleteRowMutation
} from './utils'
import DeleteRowButton from './components/DeleteRowButton'

export default (Table, { source, fields, ...params } = {}) => {
  if (!fields) { throw new Error('Fields required') }
  if (!source) { throw new Error('Source required') }

  const _fields = fields.map((field) => {
    if (field.value.includes('*')) {
      const path = buildPathToNestedField(field)

      return {
        ...field,
        __nestedPath: path,
        __textMapper: (field) => {
          return path.reduce((acc, item) => acc[item], field)
        }
      }
    } else {
      return field
    }
  })

  const headers = buildHeaders(source, fields, params)
  const nestedFieldsScopedSlots = {
    ...Object.fromEntries(
      _fields
        .filter(x => x.__nestedPath)
        .map(field => [
          `item.${field.value}`, ({ item }) => field.__textMapper(item)
        ]))
  }

  const query = gql(buildGraphqlQuery(source, _fields))

  return {
    name: 'WithGraphqlDataProviderTable',
    components: {
      VDataTable
    },
    props: {
      onError: {
        type: Function
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
        headers,
        options: {
          page: 1,
          itemsPerPage: 3
        },
        totalItems: 0
      }
    },
    render (createElement) {
      return createElement(Table || VDataTable, {
        props: {
          loading: this.$apollo.queries.items.loading,
          headers: this.headers,
          items: this.items,
          serverItemsLength: this.totalItems,
          options: this.options,
          ...this.$attrs
        },
        scopedSlots: {
          ...nestedFieldsScopedSlots,
          'item.__remove': ({ item }) => {
            return createElement(DeleteRowButton, {
              props: {
                icon: true
              },
              on: {
                delete: () => deleteRowMutation(source, this.$apollo.queries.items, this.$apollo, item)
              }
            })
          },
          ...this.$scopedSlots
        },
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
