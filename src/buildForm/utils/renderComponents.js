function buildElement (createElement, node, model, globalProps = {}) {
  const children = node.children && node.children.map(x => buildElement(createElement, x, model, globalProps))

  return createElement(node.component, {
    ...node.params,
    props: {
      ...globalProps,
      ...node.params.props,
      ...node.params.__bindToModel && { value: model[node.params.__value] }
    },
    on: {
      ...node.params.on,
      input (event) {
        if (!event.target) {
          model[node.params.__value] = event
        }
      }
    }
  }, children)
}

export default buildElement
