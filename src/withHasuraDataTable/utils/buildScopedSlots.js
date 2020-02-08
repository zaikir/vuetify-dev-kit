import DeleteRowButton from '../components/DeleteRowButton'
import cells from './cells'
import deleteRowMutation from './deleteRowMutation'

export default ({ createElement, fields, source, $apollo, $scopedSlots, $attrs, context }) => {
  const defaulScopedSlots = {
    ...Object.fromEntries(
      fields
        .map(field => [
          `item.${field.value}`, ({ item }) => {
            const value = field._nestedPath ? field._textMapper(item) : item[field.value]
            const cell = field.type && cells[field.type]

            if (cell) {
              return createElement(cell, { props: {
                ...field,
                value
              } })
            } else {
              return value || '—'
            }
          }
        ])
    )
  }

  const overwrittenScopedSlots = Object.assign(
    {}, ...Object.entries($scopedSlots).map(([key, func]) => ({
      [key]: (props = {}) => func({ ...props, ...context })
    }))
  )

  const internalScopedSlots = {
    ...!$attrs.disableDelete && { 'item._remove': ({ item }) => {
      return createElement(DeleteRowButton, {
        props: {
          icon: true
        },
        on: {
          delete: () => deleteRowMutation(source, $apollo.queries.items, $apollo, item)
        }
      })
    } }
  }

  return {
    ...defaulScopedSlots,
    ...overwrittenScopedSlots,
    ...internalScopedSlots
  }
}
