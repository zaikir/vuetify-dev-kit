const buildSortValue = (field, value) => {
  if (field._nestedPath) {
    const pathes = field._nestedPath.filter((x, i) => i > 0 && x !== 'aggregate')
    return pathes.reduce((acc, item, i) => {
      if (!acc.current) {
        acc.current = acc.total
      }

      if (i === pathes.length - 1) {
        acc.current[item] = value
      } else {
        acc.current[item] = {}
      }

      acc.current = acc.current[item]

      return acc
    }, {
      current: null,
      total: {}
    }).total
  } else {
    return value
  }
}
export default (fields, sortBy = [], sortDesc = []) => ({
  ...Object.fromEntries(sortBy.map((sort, i) => {
    const field = fields.find(x => x.value === sort)
    return [
      field._nestedPath ? field._nestedPath[0] : field.value,
      buildSortValue(field, sortDesc[i] ? 'desc' : 'asc')
    ]
  }))
})
