function buildElement (createElement, node, model, globalProps = {}, globalClasses = {}) {
  const children = node.children && node.children.map(x => buildElement(createElement, x, model, globalProps, globalClasses))

  return createElement(node.component, {
    ...node.params,
    props: {
      ...globalProps,
      ...node.params.props,
      ...node.params.__bindToModel && { value: model[node.params.__value] }
    },
    class: globalClasses,
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
