<script>
import { VDataTable, VProgressLinear } from 'vuetify/lib/components'
import { withDoubleClickEventDataTable } from '../../hoc'

const Table = withDoubleClickEventDataTable(VDataTable)

export default {
  functional: true,
  render (createElement, context) {
    return createElement(Table, {
      ...context.data,
      props: {
        ...context.data.props,
        mustSort: true
      },
      class: 'base-table'
    }, [
      ...context.children || [],
      createElement(
        'div',
        { class: 'progress-area', slot: 'progress' },
        [
          createElement(VProgressLinear, {
            props: {
              height: '2px',
              indeterminate: true
            }
          })
        ]
      )
    ])
  }
}

</script>
<style>
  .base-table .v-data-table__progress .progress-area {
    position: relative;
  }

  .base-table .v-data-table__progress .progress-area .v-progress-linear {
    position: absolute;
    left: 0;
    top: -1px;
    z-index: 2;
  }
</style>
