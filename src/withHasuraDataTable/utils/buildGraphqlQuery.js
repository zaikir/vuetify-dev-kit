const getFieldSelections = (field) => {
  switch (typeof field) {
    case 'object': {
      return field.value.replace(/\*/g, '')
    }
    default: {
      throw new Error('Field type should be object')
    }
  }
}
export default (type, fields, where = '') => {
  const selections = fields.reduce((acc, item) => `${acc} ` + getFieldSelections(item), '')

  return `query ${type} ($limit: Int, $offset: Int, $orderBy: [${type}_order_by!]) { 
    ${type} (limit: $limit, offset: $offset, order_by: $orderBy, where: { ${where} isRemoved: {_neq: true}}) {
      id
      ${selections}
    } 
    
    ${type}_aggregate (where: { ${where} isRemoved: {_neq: true}}){
      aggregate {
        count
      }
    }
  }`
}
