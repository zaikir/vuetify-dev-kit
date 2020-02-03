export default (err) => {
  if (err.errors && err.errors.length) {
    return err.errors[0].message
  }

  const { graphQLErrors } = err
  if (graphQLErrors && graphQLErrors.length) {
    return graphQLErrors.map(x => x.message).join('; ')
  }

  return err.message
}
