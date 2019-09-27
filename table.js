import capitalize from './capitalize'

export const mapTableData = ({ name }) => ({
  [name]: [],
  [`total${capitalize(name)}`]: -1,
  [`${name}Loading`]: false
})

export const mapTableFilters = ({ name, filters = [] }) => ({
  [`filtered${capitalize(name)}`] () {
    return this[name].filter(x => !filters.some(filter => !filter(x)))
  },
  [`${name}Filters`] () {
    return this.headers.filter(x => x.filter).map(header => ({
      text: header.text,
      key: header.value,
      ...header.filter
    }))
  }
})

export const mapTableActions = ({ name, singular, url, defaultItem = {}, headersKey = 'headers' }) => ({
  async [`update${capitalize(name)}`] ({ options, search = '', filter }) {
    this[`${name}Loading`] = true

    const { page, itemsPerPage, sortBy = '', sortDesc = '' } = options

    const query = `sortBy=${sortBy}&sortDesc=${sortDesc}&page=${page}&itemsPerPage=${itemsPerPage}&search=${search}${headersKey ? `&columns=${[...this[headersKey].map(({ value }) => value), 'isRemoved'].join(',')+}` : ''}${filter ? `&filter=${JSON.stringify(filter)}` : ''}`

    const { items, total } = await this.$axios.$get(`${url}${url.includes('?') ? '' : '?'}${query}`, { progress: false })

    this[name] = items
    this[`total${capitalize(name)}`] = total

    this[`${name}Loading`] = false
  },
  async [`update${capitalize(name)}Counts`] ({ search, filters, done }) {
    const query = `search=${search}`
    const { totals } = await this.$axios.$post(`${url}/count${url.includes('?') ? '' : '?'}${query}`, {
      filters: filters.map(({ filter }) => filter)
    }, { progress: false })

    done(totals.map((total, i) => ({
      id: filters[i].id,
      value: total
    })))
  },
  async [`get${singular ? capitalize(singular) : capitalize(name).substring(0, name.length - 1)}`] ({ row, done }) {
    if (row) {
      done(await this.$axios.$get(`${url}/${row._id}`, { progress: false }))
    } else {
      done({ ...defaultItem })
    }
  },
  async [`on${singular ? capitalize(singular) : capitalize(name).substring(0, name.length - 1)}Added`] ({ item, done }) {
    this[`${name}Loading`] = true

    done(await this.$axios.$post(`${url}`, item, { progress: false }))

    this[`${name}Loading`] = false
  },
  async [`on${singular ? capitalize(singular) : capitalize(name).substring(0, name.length - 1)}Updated`] ({ item, done }) {
    this[`${name}Loading`] = true

    done(await this.$axios.$put(`${url}`, item, { progress: false }))

    this[`${name}Loading`] = false
  },
  async [`on${singular ? capitalize(singular) : capitalize(name).substring(0, name.length - 1)}Deleted`] ({ item, done }) {
    this[`${name}Loading`] = true

    done(await this.$axios.$delete(`${url}/${item._id}`, { progress: false }))

    this[`${name}Loading`] = false
  }
})
