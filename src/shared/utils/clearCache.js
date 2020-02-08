export default (cache, regex, $apollo) => {
  if (!$apollo) {
    throw new Error('Appollo is required to refresh queries')
  }

  Object.keys(cache.data.data).forEach((key) => {
    if (key.match(regex)) {
      cache.data.delete(key)
    }
  })

  $apollo.provider.defaultClient.reFetchObservableQueries()
}
