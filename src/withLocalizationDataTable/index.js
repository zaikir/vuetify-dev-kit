export default (Table, { locale = 'ru' } = {}) => {
  if (locale !== 'ru') {
    throw new Error('Locale is not implemented')
  }

  return {
    functional: true,
    name: 'WithLocalizationDataTable',
    render (createElement, context) {
      return createElement(Table, {
        ...context.data,
        props: {
          locale: 'ru',
          loadingText: 'Загрузка...',
          noDataText: 'Нет данных',
          noResultsText: 'Нет результатов',
          footerProps: {
            itemsPerPageOptions: [...(context.data.props && context.data.props.itemsPerPageOptions) || [10, 30, 45, 60], { text: 'Все', 'value': -1 }],
            itemsPerPageText: 'Строк на странице:'
          },
          ...context.data.props
        }
      }, context.children)
    }
  }
}
