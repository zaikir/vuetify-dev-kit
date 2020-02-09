export default async (cache, regex, $apollo) => {
  if (!$apollo) {
    throw new Error('Appollo is required to refresh queries')
  }

  Object.keys(cache.data.data).forEach((key) => {
    if (key.includes(regex)) {
      cache.data.delete(key)
    }
  })

  await $apollo.provider.defaultClient.reFetchObservableQueries()
}
