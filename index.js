import DataTable from './src/components/DataTable'
import EditItemDialog from './src/components/EditItemDialog'
import DynamicFieldsLayout from './src/components/DynamicFieldsLayout'
import ConfirmationDialog from './src/components/ConfirmationDialog'

export default ({
  install: (Vue, options) => {
    Vue.component('DataTable', DataTable)
    Vue.component('EditItemDialog', EditItemDialog)
    Vue.component('DynamicFieldsLayout', DynamicFieldsLayout)
    Vue.component('ConfirmationDialog', ConfirmationDialog)
  }
})
