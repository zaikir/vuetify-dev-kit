const getHeaderInfo = (field) => {
  switch (typeof field.header) {
    case 'string': {
      return { text: field.header }
    }
    case 'object': {
      return field.header
    }
    default: {
      throw new Error('Field header type should be object or string')
    }
  }
}

export default (source, fields, { canDelete = true }) => {
  return [...fields.map((field, i) => ({
    ...getHeaderInfo(field),
    value: field.value
  })),
  ...canDelete
    ? [{ value: '_remove', sortable: false, width: 1 }]
    : []
  ]
}
