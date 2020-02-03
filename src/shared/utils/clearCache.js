export default (cache, regex) => {
  Object.keys(cache.data.data).forEach((key) => {
    if (key.match(regex)) {
      cache.data.delete(key)
    }
  })
}
