
<template>
  <v-dialog
    :value="value"
    scrollable
    :persistent="persistent"
    :max-width="maxWidth"
    :fullscreen="isMobile"
    :hide-overlay="isMobile"
    :transition="isMobile ? 'dialog-bottom-transition' : ''"
    @input="onValueChanged"
  >
    <v-card
      :flat="flat"
      class="edit-item-dialog"
      :class="{readonly}"
    >
      <v-toolbar v-if="isMobile" dark color="primary" style="z-index: 1;">
        <v-btn icon dark @click="cancelSaving">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title v-if="title">
          {{ title }}
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            v-if="!readonly"
            dark
            icon
            :loading="isSaving"
            @click="saveItem"
          >
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-title v-else-if="title" class="pb-0">
        {{ title }}
      </v-card-title>
      <v-card-text class="pt-5" style="height: 100%;">
        <v-row justify="center" class="fill-height">
          <v-col v-if="!item || !isTransitionEnded" cols="12" class="py-5 text-center align-self-center" style="">
            <v-progress-circular :size="94" width="4" indeterminate color="secondary">
              Загрузка...
            </v-progress-circular>
          </v-col>
          <v-col v-else cols="12">
            <v-form ref="editForm" lazy-validation @submit.prevent="saveItem">
              <v-container grid-list-md>
                <v-row no-gutters>
                  <slot name="form.prepend" :item="editableItem" :context="context" />
                  <v-col
                    v-for="field in filteredFields"
                    :key="field.value"
                    :class="field.class || 'px-1'"
                    :cols="field.cols || 12"
                    :sm="conditionalFunction(field.sm)"
                    :md="conditionalFunction(field.md)"
                    :xl="conditionalFunction(field.xl)"
                  >
                    <slot :name="`field.${field.value}`" :item="editableItem" :context="context">
                      <dynamic-field
                        v-model="editableItem[field.value]"
                        :field="field"
                        :item="item"
                        :context="context "
                      />
                    </slot>
                  </v-col>
                  <slot name="form.append" :item="editableItem" :context="context" />
                </v-row>
              </v-container>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions v-if="item && !isMobile">
        <v-spacer />
        <v-btn
          :disabled="isSaving"
          color="primary"
          @click="cancelSaving"
        >
          {{ readonly ? 'Закрыть' : 'Отмена' }}
        </v-btn>
        <v-btn
          v-if="!readonly"
          color="primary"
          :loading="isSaving"
          @click="saveItem"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import DynamicField from './DynamicField'

export default {
  components: {
    DynamicField
  },
  props: {
    title: {
      type: String,
      default: null
    },
    value: {
      type: Boolean,
      required: true
    },
    fields: {
      type: Array,
      required: true
    },
    item: {
      type: Object,
      default: null
    },
    maxWidth: {
      type: String,
      default: '500px'
    },
    persistent: {
      type: Boolean,
      default: true
    },
    flat: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    breakpoints: {
      type: Object,
      default: () => ({
        cols: 12
      })
    },
    preSave: {
      type: Function,
      default: ({ item }) => item
    },
    preOpen: {
      type: Function,
      default: ({ item }) => {}
    },
    postOpen: {
      type: Function,
      default: ({ item }) => {}
    },
    context: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data () {
    return {
      editableItem: {},
      isSaving: false,
      isAdded: false,
      isTransitionEnded: false
    }
  },
  computed: {
    filteredFields () {
      return this.fields.filter(field => !field.showIf || field.showIf({ item: this.editableItem, ...this.context }))
    },
    isMobile () {
      return this.fullscreen && this.$vuetify.breakpoint.smAndDown
    }
  },
  watch: {
    value (val) {
      if (val) {
        this.isTransitionEnded = false
        if (this.isMobile) {
          setTimeout(() => { this.isTransitionEnded = true }, 300)
        } else {
          this.isTransitionEnded = true
        }
        this.preOpen({ item: this.editableItem, ...this.context })
      }
    },
    item: {
      immediate: true,
      handler (value) {
        if (this.$refs.editForm) {
          this.$refs.editForm.reset()
          this.$refs.editForm.resetValidation()
        }

        this.editableItem = JSON.parse(JSON.stringify(value))
        if (this.editableItem) {
          this.fields.filter(field => field.default).forEach((field) => {
            if (!this.editableItem[field.value]) {
              this.editableItem[field.value] = field.default({ item: this.editableItem, ...this.context })
            }
          })

          this.postOpen({ item: this.editableItem, ...this.context })
        }
      }
    }
  },
  methods: {
    conditionalFunction (value, item) {
      if (value && typeof value === 'function') {
        return value({ item: this.editableItem, ...this.context })
      } else {
        return value
      }
    },
    isNumber (evt) {
      evt = (evt) || window.event
      const charCode = (evt.which) ? evt.which : evt.keyCode
      if ((charCode > 31 && (charCode < 48 || charCode > 57))) {
        evt.preventDefault()
      } else {
        return true
      }
    },
    onValueChanged (val) {
      this.$emit('input', val)
    },
    saveItem () {
      if (!this.$refs.editForm.validate()) {
        return
      }

      this.isSaving = true

      this.$emit('onSaved', {
        item: this.preSave({ item: this.editableItem, ...this.context }),
        done: () => {
          this.onValueChanged(false)
          this.isSaving = false
        }
      })
    },
    cancelSaving () {
      this.$emit('onCanceled')

      this.onValueChanged(false)
    }
  }
}
</script>
<style>
  .select-field-toggle-btn-selected {
    background-color: rgb(181, 255, 121);
  }

  .edit-item-dialog.readonly .theme--light.v-input--is-disabled .v-label,
  .edit-item-dialog.readonly .theme--light.v-input--is-disabled input,
  .edit-item-dialog.readonly .theme--light.v-input--is-disabled textarea {
    color: rgba(0, 0, 0, 0.5) !important;
  }
</style>
