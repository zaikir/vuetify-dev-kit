
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
      v-if="value"
      :flat="flat"
      class="edit-item-dialog"
      :class="{readonly}"
    >
      <v-toolbar v-if="isMobile" dark color="primary" style="z-index: 1;">
        <v-btn icon dark @click="cancelSaving">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title v-if="title" style="width: 100%;">
          <slot name="title" :item="editableItem" :context="context">
            {{ title }}
          </slot>
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
        <slot name="title" :item="editableItem" :context="context">
          {{ title }}
        </slot>
      </v-card-title>
      <v-card-text class="pt-5" style="height: 100%;">
        <v-row justify="center" class="fill-height">
          <v-col v-if="!editableItem || !isTransitionEnded" cols="12" class="py-5 text-center align-self-center" style="">
            <v-progress-circular :size="94" width="4" indeterminate color="secondary">
              Загрузка...
            </v-progress-circular>
          </v-col>
          <v-col v-else cols="12">
            <v-form ref="editForm" lazy-validation @submit.prevent="saveItem">
              <template v-if="fieldsData.type === 'normal'">
                <v-container grid-list-md>
                  <v-row no-gutters>
                    <slot name="form.prepend" :item="editableItem" :context="context" />
                    <v-col
                      v-for="field in fieldsData.fields"
                      :key="field.value"
                      :class="field.class || 'px-1'"
                      :cols="field.cols || 12"
                      :sm="conditionalFunction(field.sm)"
                      :md="conditionalFunction(field.md)"
                      :xl="conditionalFunction(field.xl)"
                    >
                      <slot :name="`field.${field.value}`" :item="editableItem" :context="context">
                        <dynamic-field
                          :field="field"
                          :readonly="readonly"
                          :editable-item="editableItem"
                          :context="context"
                        />
                      </slot>
                    </v-col>
                    <slot name="form.append" :item="editableItem" :context="context" />
                  </v-row>
                </v-container>
              </template>
              <template v-else-if="fieldsData.type === 'tabs'">
                <v-tabs
                  background-color="white"
                  color="black"
                  class="my-2"
                  grow
                  style="width: 100%"
                  :vertical="$vuetify.breakpoint.xsOnly"
                >
                  <v-tab
                    v-for="layout in fieldsData.layouts"
                    :key="layout.name"
                    ripple
                  >
                    <v-icon v-if="layout.icon" class="mr-3">
                      {{ layout.icon }}
                    </v-icon>
                    {{ layout.name }}
                  </v-tab>
                  <v-tab-item
                    v-for="(layout, layoutId) in fieldsData.layouts"
                    :key="layout.name"
                  >
                    <v-container grid-list-md>
                      <v-row no-gutters>
                        <slot name="form.prepend" :item="editableItem" :context="context" />
                        <v-col
                          v-for="field in fieldsData.fields.filter(x => x.layoutId === layoutId)"
                          :key="field.value"
                          :class="field.class || 'px-1'"
                          :cols="field.cols || 12"
                          :sm="conditionalFunction(field.sm)"
                          :md="conditionalFunction(field.md)"
                          :xl="conditionalFunction(field.xl)"
                        >
                          <slot :name="`field.${field.value}`" :item="editableItem" :context="context">
                            <dynamic-field
                              :field="field"
                              :readonly="readonly"
                              :editable-item="editableItem"
                              :context="context"
                            />
                          </slot>
                        </v-col>
                        <slot name="form.append" :item="editableItem" :context="context" />
                      </v-row>
                    </v-container>
                  </v-tab-item>
                </v-tabs>
              </template>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions v-if="editableItem && !isMobile">
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

import { ObjectID } from 'bson'
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
      type: [Array, Object],
      required: true
    },
    source: {
      type: Object,
      default: null
    },
    sourceArgs: {
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
    alwaysFullscreen: {
      type: Boolean,
      default: false
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
      default: ({ item }) => item
    },
    postOpen: {
      type: Function,
      default: ({ item }) => item
    },
    defaultItem: {
      type: Object,
      required: false,
      default: () => ({})
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
      isTransitionEnded: false
    }
  },
  computed: {
    fieldsData () {
      const isFieldActive = field => !field.showIf || field.showIf({ item: this.editableItem, ...this.context })

      if (!this.fields.length) {
        return {
          type: this.fields.type,
          layouts: this.fields.layouts.map(({ fields, ...rest }) => rest),
          fields: this.fields.layouts.reduce((acc, layout, id) => {
            acc.push(...layout.fields.filter(isFieldActive).map(field => ({ ...field, layoutId: id })))
            return acc
          }, [])
        }
      } else {
        return {
          type: 'normal',
          fields: this.fields.filter(isFieldActive)
        }
      }
    },
    isMobile () {
      return this.fullscreen && (this.$vuetify.breakpoint.smAndDown || this.alwaysFullscreen)
    }
  },
  watch: {
    async value (isOpened) {
      this.editableItem = null

      if (isOpened) {
        this.isTransitionEnded = false
        if (this.isMobile) {
          setTimeout(() => { this.isTransitionEnded = true }, 300)
        } else {
          this.isTransitionEnded = true
        }

        if (this.$refs.editForm) {
          this.$refs.editForm.reset()
          this.$refs.editForm.resetValidation()
        }

        let item = null
        if (this.sourceArgs) {
          if (this.source.url) {
            item = await this.$axios.$get(this.source.url(this.sourceArgs), { progress: false })
          } else {
            item = JSON.parse(JSON.stringify(this.source.item(this.sourceArgs)))
          }
        } else {
          item = { _id: (new ObjectID()).toString(), ...this.defaultItem }
        }

        this.editableItem = await this.preOpen({
          item,
          ...this.context
        })

        this.fieldsData.fields.filter(field => field.default).forEach((field) => {
          if (!this.editableItem[field.value]) {
            this.editableItem[field.value] = field.default({ item: this.editableItem, ...this.context })
          }
        })

        this.editableItem = await this.postOpen({ item: this.editableItem, ...this.context })
      }
    }
  },
  methods: {
    conditionalFunction (value) {
      if (value && typeof value === 'function') {
        return value({ item: this.editableItem, ...this.context })
      } else {
        return value
      }
    },
    onValueChanged (val) {
      this.$emit('input', val)
    },
    async saveItem () {
      if (!this.$refs.editForm.validate()) {
        return
      }

      this.isSaving = true

      const isCreation = !this.sourceArgs
      const savingItem = await this.preSave({
        item: this.editableItem,
        isCreation,
        ...this.context
      })

      if (this.source && savingItem) {
        if (this.source.url) {
          if (isCreation) {
            await this.$axios.$post(this.source.url({ id: '' }), savingItem, { progress: false })
          } else {
            await this.$axios.$put(this.source.url({ id: '' }), savingItem, { progress: false })
          }
        } else if (this.source.patch) {
          await this.$axios.$patch(
            this.source.patch.url({ item: savingItem, isCreation, ...this.context }),
            this.source.patch.body({ item: savingItem, isCreation, ...this.context }), { progress: false }
          )
        }
      }

      this.$emit('onSaved', { item: savingItem, isCreation, ...this.context })

      this.isSaving = false

      this.onValueChanged(false)
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

  .edit-item-dialog .v-tabs--vertical {
    display: flex;
    flex-direction: column;
    text-align: left;
  }
</style>
