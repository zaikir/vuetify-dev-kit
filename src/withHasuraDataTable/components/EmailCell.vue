<script>
export default {
  functional: true,
  props: {
    value: String
  },
  render (createElement, context) {
    if (!context.props.value) { return '—' }

    return createElement('a', {
      attrs: {
        href: `mailto://${context.props.value}`,
        itemprop: 'email'
      }
    }, context.props.value)
  }
}
</script>
