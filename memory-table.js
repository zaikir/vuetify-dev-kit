import capitalize from './capitalize'

export const mapTableData = ({ name }) => ({
  [name]: []
})

export const mapTableFilters = ({ name, filters = [] }) => ({
  [`filtered${capitalize(name)}`] () {
    return this[name].filter(x => !filters.some(filter => !filter(x)))
  }
})

export const mapTableActions = ({ name, singular, defaultItem = {}, patch, removedKey = 'isRemoved' }) => ({
  [`get${singular ? capitalize(singular) : capitalize(name).substring(0, name.length - 1)}`] ({ row, done, items }) {
    const filteredItems = items.filter(x => !x[removedKey])

    if (row) {
      done(filteredItems.find(({ _id }) => _id === row._id))
    } else {
      done({ ...defaultItem })
    }
  },
  async [`on${singular ? capitalize(singular) : capitalize(name).substring(0, name.length - 1)}Added`] ({ item, done, items, ...context }) {
    const newItems = [...items, item]
    if (patch) {
      await this.$axios.$patch(patch.url({ items: newItems, ...context }), patch.body({ items: newItems, ...context }), { progress: false })
    }

    items.push({ ...item })

    done()
  },
  async [`on${singular ? capitalize(singular) : capitalize(name).substring(0, name.length - 1)}Updated`] ({ item, done, items, ...context }) {
    const index = items.findIndex(({ _id }) => item._id === _id)
    if (index === -1) { throw new Error('Item not found') }

    const newItems = [...items]
    newItems.splice(index, 1, { ...item })
    if (patch) {
      await this.$axios.$patch(patch.url({ items: newItems, ...context }), patch.body({ items: newItems, ...context }), { progress: false })
    }

    items.splice(index, 1, { ...item })
    done()
  },
  async [`on${singular ? capitalize(singular) : capitalize(name).substring(0, name.length - 1)}Deleted`] ({ item, done, items, ...context }) {
    const index = items.findIndex(({ _id }) => item._id === _id)
    if (index === -1) { throw new Error('Item not found') }

    const newItems = [...items]
    newItems.splice(index, 1, { ...item, [removedKey]: true })

    if (patch) {
      await this.$axios.$patch(patch.url({ items: newItems, ...context }), patch.body({ items: newItems, ...context }), { progress: false })
    }

    items.splice(index, 1, { ...item, [removedKey]: true })

    done()
  }
})
