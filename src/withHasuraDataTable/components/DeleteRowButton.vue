<template>
  <v-tooltip left>
    <template #activator="{on}">
      <v-hover left>
        <template #default="{hover}">
          <v-btn icon :color="hover ? 'error': ''" v-on="on" @click="removeRow">
            <v-icon>{{ hover ? 'mdi-delete-forever' : 'delete' }}</v-icon>
          </v-btn>
        </template>
      </v-hover>
    </template>
    Удалить
    <confirmation-dialog
      v-model="isDeleteDialogOpened"
      @confirm="confirm"
      @decline="isDeleteDialogOpened = false"
    />
  </v-tooltip>
</template>
<script>
import ConfirmationDialog from '../../shared/components/ConfirmationDialog'
export default {
  components: {
    ConfirmationDialog
  },
  data () {
    return {
      isDeleteDialogOpened: false
    }
  },
  methods: {
    removeRow (row) {
      this.isDeleteDialogOpened = true
    },
    confirm () {
      this.$emit('delete')
      this.isDeleteDialogOpened = false
    }
  }
}
</script>
