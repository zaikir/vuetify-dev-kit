function buildElement (createElement, node, globalProps = {}) {
  const children = node.children && node.children.map(x => buildElement(createElement, x, globalProps))

  return createElement(node.component, {
    ...node.params,
    props: {
      ...globalProps,
      ...node.params.props
    }
  }, children)
}

export default buildElement
