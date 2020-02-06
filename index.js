import buildGenericForm from './src/buildForm'
// import EditItemDialog from './src/components/EditItemDialog'
// import ConfirmationDialog from './src/components/ConfirmationDialog'
export { default as withDoubleClickEventDataTable } from './src/withDoubleClickEventDataTable'
export { default as withHasuraDataTable } from './src/withHasuraDataTable'

// export { default as buildForm } from './src/buildForm'

export const buildForm = buildGenericForm
export const GenericForm = buildGenericForm()
