import DataTable from './src/components/DataTable'
import EditItemDialog from './src/components/EditItemDialog'
import ConfirmationDialog from './src/components/ConfirmationDialog'

export default ({
  install: (Vue, options) => {
    Vue.component('DataTable', DataTable)
    Vue.component('EditItemDialog', EditItemDialog)
    Vue.component('ConfirmationDialog', ConfirmationDialog)

    if (window) {
      window.addEventListener('dragover', function (e) {
        e = e || event
        e.preventDefault()
      }, false)
      window.addEventListener('drop', function (e) {
        e = e || event
        e.preventDefault()
      }, false)
    }
  }
})
