import DataTable from './src/components/DataTable'
import EditItemDialog from './src/components/EditItemDialog'

export { default as DataTable } from './src/components/DataTable'
export { default as EditItemDialog } from './src/components/EditItemDialog'
export { default as ConfirmationDialog } from './src/components/ConfirmationDialog'

export default ({
  install: (Vue, options) => {
    Vue.component('DataTable', DataTable)
    Vue.component('EditItemDialog', EditItemDialog)
  }
})
