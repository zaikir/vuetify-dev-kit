import DeleteRowButton from '../components/DeleteRowButton'
import FabButton from '../../shared/components/FabButton'
import cells from './cells'
import deleteRowMutation from './deleteRowMutation'

export default ({ createElement, fields, source, $apollo, $scopedSlots, $attrs, context, onAdd }) => {
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
    {}, ...$scopedSlots.map(([key, func]) => ({
      [key]: (props = {}) => func({ ...props, ...context })
    }))
  )

  const addButtonSlot = $scopedSlots.find(([key]) => key === 'add-button')

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
    } },
    ...!$attrs.disableAdd && { 'footer': ({ item }) => {
      return createElement('div', {
        style: 'position: relative; height: 0px;'
      }, [
        createElement('div', {
          style: 'height: 59px;position: absolute;display: flex;align-items: center;'
        }, [
          addButtonSlot
            ? addButtonSlot[1]({ onClick: onAdd })
            : createElement(FabButton, {
              on: {
                click: () => {
                  onAdd && onAdd()
                }
              }
            })
        ])
      ])
    } }
  }

  return {
    ...defaulScopedSlots,
    ...overwrittenScopedSlots,
    ...internalScopedSlots
  }
}
