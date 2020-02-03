<script>
export default {
  functional: true,
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  render (h, ctx) {
    const children = ctx.children.filter(vnode => vnode.tag) // remove unnecessary text nodes
    if (children.length !== 1) {
      throw new Error('this component accepts only one root node in its slot')
    }
    if (ctx.props.show) {
      return children[0]
    } else {
      return children[0].children
    }
  }
}
</script>
