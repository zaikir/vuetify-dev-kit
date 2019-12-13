
<template>
  <v-dialog
    dense
    :value="value"
    scrollable
    :persistent="persistent"
    :max-width="maxWidth"
    :fullscreen="isMobile"
    :hide-overlay="isMobile"
    :transition="isMobile ? 'dialog-bottom-transition' : ''"
    :retain-focus="false"
    @input="onValueChanged"
  >
    <v-card
      v-if="value"
      :flat="flat"
      :class="'edit-item-dialog ' + (readonly ? 'readonly' : '') + ' ' + classes"
    >
      <v-toolbar v-if="isMobile" dark color="primary" style="z-index: 1;">
        <v-btn icon dark @click="cancelSaving">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title v-if="title" style="width: 100%;">
          <slot name="title" :item="editableItem" :context="context" :saveItem="saveItem">
            {{ conditionalFunction(title) }}
          </slot>
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            v-if="!readonly && closeOnSave"
            dark
            icon
            :loading="isSaving"
            @click="saveItem(true)"
          >
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
          <v-speed-dial
            v-if="!readonly && !closeOnSave"
            v-model="saveButtonFab"
            direction="bottom"
          >
            <template v-slot:activator>
              <v-btn
                v-model="saveButtonFab"
                dark
                icon
                :loading="isSaving"
              >
                <v-icon v-if="saveButtonFab">
                  mdi-close
                </v-icon>
                <v-icon v-else>
                  mdi-content-save
                </v-icon>
              </v-btn>
            </template>
            <v-btn
              fab
              dark
              small
              color="green"
              @click="saveItem(true)"
            >
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
            <v-btn
              fab
              dark
              small
              color="indigo"
              @click="saveItem(false)"
            >
              <v-icon>mdi-exit-to-app</v-icon>
            </v-btn>
          </v-speed-dial>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-title v-else-if="title" class="pb-0">
        <slot name="title" :item="editableItem" :context="context" :saveItem="saveItem">
          {{ conditionalFunction(title) }}
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
            <v-form ref="editForm" lazy-validation @submit.prevent="saveItem(true)">
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
                      :lg="conditionalFunction(field.lg)"
                      :xl="conditionalFunction(field.xl)"
                    >
                      <slot :name="`field.${field.value}`" :item="editableItem" :context="context">
                        <dynamic-field
                          :field="field"
                          :readonly="readonly"
                          :editable-item="editableItem"
                          :context="context"
                        >
                          <template #label>
                            <slot :name="`label.${field.value}`" :item="editableItem" :context="context" />
                          </template>
                        </dynamic-field>
                      </slot>
                    </v-col>
                    <slot name="form.append" :item="editableItem" :context="context" />
                  </v-row>
                </v-container>
              </template>
              <template v-else-if="fieldsData.type === 'tabs'">
                <v-tabs
                  v-model="selectedTab"
                  background-color="white"
                  color="black"
                  class="my-2"
                  grow
                  style="width: 100%"
                  :vertical="$vuetify.breakpoint.xsOnly"
                >
                  <template v-if="!isMobile">
                    <v-tab
                      v-for="(layout, index) in fieldsData.layouts"
                      :key="index"
                      ripple
                    >
                      <v-icon v-if="layout.icon" class="mr-3">
                        {{ layout.icon }}
                      </v-icon>
                      {{ layout.name }}
                    </v-tab>
                  </template>
                  <v-tab-item
                    v-for="(layout, layoutId) in fieldsData.layouts"
                    :key="layoutId"
                    :value="layoutId"
                  >
                    <v-container grid-list-md>
                      <h2 v-if="isMobile" class="mb-3">
                        {{ layout.name }}
                      </h2>
                      <v-row no-gutters>
                        <slot name="form.prepend" :item="editableItem" :context="context" />
                        <v-col
                          v-for="field in fieldsData.fields.filter(x => x.layoutId === layoutId)"
                          :key="field.value"
                          :class="field.class || 'px-1'"
                          :cols="field.cols || 12"
                          :sm="conditionalFunction(field.sm)"
                          :md="conditionalFunction(field.md)"
                          :lg="conditionalFunction(field.lg)"
                          :xl="conditionalFunction(field.xl)"
                        >
                          <slot :name="`field.${field.value}`" :item="editableItem" :context="context">
                            <dynamic-field
                              :field="field"
                              :readonly="readonly"
                              :editable-item="editableItem"
                              :context="context"
                            >
                              <template #label>
                                <slot :name="`label.${field.value}`" :item="editableItem" :context="context" />
                              </template>
                            </dynamic-field>
                          </slot>
                        </v-col>
                        <slot name="form.append" :item="editableItem" :context="context" />
                      </v-row>
                    </v-container>
                  </v-tab-item>
                </v-tabs>
              </template>
              <template v-else-if="fieldsData.type === 'columns'">
                <v-row no-gutters>
                  <v-col v-for="(layout,layoutId) in fieldsData.layouts" :key="layout.name" v-bind="layout.breakpoints || { cols: 12 }" :class="layout.class || {}" :style="layout.style || ''">
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
                          :lg="conditionalFunction(field.lg)"
                          :xl="conditionalFunction(field.xl)"
                        >
                          <slot :name="`field.${field.value}`" :item="editableItem" :context="context">
                            <dynamic-field
                              :field="field"
                              :readonly="readonly"
                              :editable-item="editableItem"
                              :context="context"
                            >
                              <template #label>
                                <slot :name="`label.${field.value}`" :item="editableItem" :context="context" />
                              </template>
                            </dynamic-field>
                          </slot>
                        </v-col>
                        <slot name="form.append" :item="editableItem" :context="context" />
                      </v-row>
                    </v-container>
                  </v-col>
                </v-row>
              </template>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions v-if="isMobile && fieldsData.layouts && fieldsData.layouts.length" class="pa-0">
        <v-toolbar
          dark
          color="transparent"
          style="z-index: 1;"
        >
          <v-toolbar-items style="width: 100%">
            <div class="d-flex justify-space-around align-center" style="width: 100%">
              <v-btn
                v-for="(layout, index) in fieldsData.layouts"
                :key="index"
                :color="selectedTab === index ? 'primary' : 'secondary'"
                dark
                icon
                class="ml-0"
                @click="selectedTab = index"
              >
                <div class="d-flex flex-column justify-center align-center">
                  <v-icon>
                    {{ layout.icon }}
                  </v-icon>
                </div>
              </v-btn>
            </div>
          </v-toolbar-items>
        </v-toolbar>
      </v-card-actions>
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
          v-model="saveButtonFab"
          color="primary"
          :loading="isSaving"
          @click="saveItem(true)"
        >
          Сохранить
        </v-btn>
        <v-btn
          v-if="!readonly && !closeOnSave"
          color="primary"
          :loading="isSaving"
          @click="saveItem(false)"
        >
          Сохранить и выйти
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
      type: [String, Function],
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
    classes: {
      type: String,
      default: ''
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
    closeOnSave: {
      type: Boolean,
      default: true
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
      isMobile: false,
      saveButtonFab: false,
      editableItem: {},
      isSaving: false,
      isTransitionEnded: false,
      isSaved: false,
      selectedTab: 0
    }
  },
  computed: {
    fieldsData () {
      const isFieldActive = field => !field.showIf || field.showIf({ item: this.editableItem || {}, ...this.context })

      if (!this.fields.length) {
        const layouts = this.fields.layouts.filter(isFieldActive)

        return {
          type: this.fields.type,
          layouts: layouts.map(({ fields, ...rest }) => rest),
          fields: layouts.reduce((acc, layout, id) => {
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
    }
  },
  watch: {
    async value (isOpened) {
      this.editableItem = null
      this.isSaved = false
      this.selectedTab = 0

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
        try {
          if (this.sourceArgs) {
            if (this.source.url) {
              item = await this.$axios.$get(this.source.url(this.sourceArgs), { progress: false })
            } else {
              item = JSON.parse(JSON.stringify(this.source.item(this.sourceArgs)))
            }
          } else {
            item = { _id: (new ObjectID()).toString(), _isNew: true, ...this.defaultItem }
          }
        } catch (err) {
          this.onValueChanged(false)
          return
        }

        this.editableItem = await this.preOpen({
          item,
          ...this.context
        })

        this.fieldsData.fields.filter(field => field.default).forEach((field) => {
          if (!this.editableItem[field.value]) {
            this.$set(this.editableItem, field.value, field.default({ item: this.editableItem, ...this.context }))
          }
        })

        this.editableItem = await this.postOpen({ item: this.editableItem, ...this.context })

        if (this.$refs.editForm) {
          this.$refs.editForm.resetValidation()
        }
      }
    }
  },
  mounted () {
    this.isMobile = this.fullscreen && (this.$vuetify.breakpoint.smAndDown || this.alwaysFullscreen)
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
    async saveItem (preventExit) {
      if (!this.$refs.editForm.validate()) {
        if (this.fieldsData.type === 'tabs') {
          const error = this.$refs.editForm.inputs.filter(x => x.hasError)[0] || {}
          const tabIndex = this.fieldsData.layouts.findIndex((x, id) =>
            this.fieldsData.fields.filter(x => x.layoutId === id).find(field => field.text === error.label)
          )

          this.selectedTab = tabIndex || 0
        }
        return false
      }

      this.isSaving = true

      const isCreation = !this.sourceArgs && !this.isSaved
      const savingItem = await this.preSave({
        item: this.editableItem,
        isCreation,
        ...this.context
      })

      try {
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
      } catch (err) {
        this.isSaving = false
        return false
      }

      this.$emit('onSaved', { item: savingItem, isCreation, ...this.context, isClose: this.closeOnSave || !preventExit })

      this.isSaving = false
      this.isSaved = true

      if (this.closeOnSave || !preventExit) {
        this.onValueChanged(false)
      }

      return true
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

  .edit-item-dialog .v-speed-dial {
    display: flex;
    align-items: center;
  }

  .edit-item-dialog .v-btn.dense {
    height: auto !important;
    padding: 7px  !important;
  }
</style>
