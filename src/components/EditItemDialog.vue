
<template>
  <v-dialog
    :value="value"
    scrollable
    :persistent="persistent"
    :max-width="maxWidth"
    class="edit-item-dialog"
    :fullscreen="isMobile"
    :hide-overlay="isMobile"
    :transition="isMobile ? 'dialog-bottom-transition' : ''"
    @input="onValueChanged"
  >
    <v-card :flat="flat">
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
      <v-card-text class="pt-0" style="height: 100%;">
        <v-row justify="center" class="fill-height">
          <v-col v-if="!item || !isTransitionEnded" cols="12" class="text-center align-self-center" style="">
            <v-progress-circular :size="94" width="4" class="py-5" indeterminate color="secondary">
              Загрузка...
            </v-progress-circular>
          </v-col>
          <v-col v-else cols="12">
            <v-form ref="editForm" lazy-validation @submit.prevent="saveItem">
              <v-container grid-list-md>
                <v-row no-gutters>
                  <slot name="body.prepend" :item="editableItem" :context="context" />
                  <v-col
                    :cols="breakpoints.cols"
                    :sm="breakpoints.sm"
                    :md="breakpoints.md"
                    :xl="breakpoints.xl"
                  >
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
                        <v-autocomplete
                          v-if="field.type === 'select' && (!field.mobile || !$vuetify.breakpoint.smAndDown)"
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :required="field.required"
                          :label="field.text"
                          :items="field.options({item: editableItem, ...context})"
                          :item-text="field.itemText"
                          :item-value="field.itemValue"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-row v-else-if="field.type === 'select' && field.mobile && $vuetify.breakpoint.smAndDown" no-gutters>
                          <v-col cols="12" style="margin-bottom: -10px;">
                            <v-subheader :class="field.subHeaderClass || 'subtitle-2 pl-0'">
                              {{ field.text }}
                            </v-subheader>
                          </v-col>
                          <v-col cols="12">
                            <v-btn-toggle
                              v-model="editableItem[field.value]"
                              mandatory
                              class="mb-2"
                              style="width: 100%"
                              :active-class="field.activeClass || 'select-field-toggle-btn-selected'"
                              :rules="getRules(field)"
                              :required="field.required"
                              :label="field.text"
                              :disabled="field.disabled"
                              @input="onFieldValueChanged(field.onChange, $event)"
                            >
                              <v-row no-gutters>
                                <v-col
                                  v-for="option in field.options({item: editableItem, ...context})"
                                  :key="option[field.itemValue]"
                                  :cols="field.optionCols || 6"
                                  :sm="field.optionSm || 4"
                                >
                                  <v-btn
                                    :value="option[field.itemValue]"
                                    text
                                    block
                                  >
                                    {{ option[field.itemText] }}
                                  </v-btn>
                                </v-col>
                              </v-row>
                            </v-btn-toggle>
                          </v-col>
                        </v-row>
                        <v-radio-group
                          v-else-if="field.type === 'radio'"
                          v-model="editableItem[field.value]"
                          mandatory
                          class="mb-2"
                          style="width: 100%"
                          :active-class="field.activeClass"
                          :rules="getRules(field)"
                          :row="field.row"
                          :required="field.required"
                          :label="field.text"
                          :disabled="field.disabled"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        >
                          <v-radio
                            v-for="option in field.options({item: editableItem, ...context})"
                            :key="option[field.itemValue]"
                            :label="option[field.itemText]"
                            :value="option[field.itemValue]"
                          />
                        </v-radio-group>
                        <external-data-autocomplete
                          v-else-if="field.type === 'autocomplete'"
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :required="field.required"
                          :filter="field.filter"
                          :placeholder="field.placeholder"
                          :prepend-icon="field.prependIcon"
                          :response-handler="field.responseHandler"
                          :min-length="field.minLength"
                          :url="field.url"
                          :label="field.text"
                          :item-text="field.itemText"
                          :item-value="field.itemValue"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-switch
                          v-else-if="field.type === 'switch'"
                          v-model="editableItem[field.value]"
                          :label="field.text"
                          :disabled="field.disabled"
                          :rules="getRules(field)"
                          :required="field.required"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else-if="field.type === 'email'"
                          v-model="editableItem[field.value]"
                          :rules="[...getRules(field), emailRule]"
                          :required="field.required"
                          :placeholder="field.placeholder"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else-if="field.type === 'phone'"
                          v-model="editableItem[field.value]"
                          :rules="[...getRules(field)]"
                          :required="field.required"
                          :placeholder="field.placeholder"
                          :label="field.text"
                          prefix="+"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @keypress="isNumber($event)"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else-if="field.type === 'number'"
                          v-model.number="editableItem[field.value]"
                          type="number"
                          :rules="getRules(field)"
                          :required="field.required"
                          :placeholder="field.placeholder"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-textarea
                          v-else-if="field.type === 'textArea'"
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :required="field.required"
                          :placeholder="field.placeholder"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-textarea
                          v-else-if="field.type === 'radio'"
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :required="field.required"
                          :placeholder="field.placeholder"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <drag-and-drop-image-container
                          v-else-if="field.type === 'image'"
                          v-model="editableItem[field.value]"
                          single
                          :rules="getRules(field)"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          :url="field.uploadUrl || '/api/uploads'"
                          :accepted-files="field.acceptedFiles"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <drag-and-drop-images-container
                          v-else-if="field.type === 'images'"
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          :url="field.uploadUrl || '/api/uploads'"
                          :accepted-files="field.acceptedFiles"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <html-editor
                          v-else-if="field.type === 'html'"
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :required="field.required"
                          :label="field.text"
                          :height="field.height"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <date-picker
                          v-else-if="field.type === 'date'"
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :required="field.required"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else-if="field.type === 'slug'"
                          v-model="editableItem[field.value]"
                          :rules="[...getRules(field), slugRule]"
                          :placeholder="field.placeholder"
                          :required="field.required"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        >
                          <template #append>
                            <v-tooltip bottom>
                              <template #activator="{on}">
                                <v-btn icon @click="setSlug(editableItem, field.value, field.basedOn || 'name')" v-on="on">
                                  <v-icon>mdi-reply-outline</v-icon>
                                </v-btn>
                              </template>
                              Сгенерировать
                            </v-tooltip>
                          </template>
                        </v-text-field>
                        <v-text-field
                          v-else-if="field.mask && field.mask.length"
                          v-model="editableItem[field.value]"
                          v-mask="field.mask"
                          :placeholder="field.placeholder"
                          :rules="getRules(field)"
                          :required="field.required"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :required="field.required"
                          :placeholder="field.placeholder"
                          :label="field.text"
                          :disabled="field.disabled"
                          :outlined="field.outlined"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                      </v-col>
                      <slot name="form.append" :item="editableItem" :context="context" />
                    </v-row>
                  </v-col>
                  <slot name="body.append" :item="editableItem" :context="context" />
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
          Отмена
        </v-btn>
        <v-btn
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

import { mask } from 'vue-the-mask'
import EmailValidator from 'email-validator'
import slugify from 'slugify'
import DatePicker from './DatePicker'
import DragAndDropImageContainer from './DragAndDropImageContainer'
import DragAndDropImagesContainer from './DragAndDropImagesContainer'
import ExternalDataAutocomplete from './ExternalDataAutocomplete'
import HtmlEditor from './HtmlEditor'

export default {
  directives: {
    mask
  },
  components: {
    DatePicker,
    DragAndDropImageContainer,
    DragAndDropImagesContainer,
    HtmlEditor,
    ExternalDataAutocomplete
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
      isTransitionEnded: false,
      emailRule: x => !x || EmailValidator.validate(x) || 'Неверный формат',
      slugRule: x => !x || x === slugify(x) || 'Неверный формат'
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
        }
      }
    }
  },
  methods: {
    setSlug (item, fieldName, basedOnField) {
      this.$set(item, fieldName, slugify(item[basedOnField]).toLowerCase())
    },
    conditionalFunction (value, item) {
      if (value && typeof value === 'function') {
        return value({ item: this.editableItem, ...this.context })
      } else {
        return value
      }
    },
    onFieldValueChanged (func, newValue) {
      if (func) {
        func({ value: newValue, item: this.editableItem, ...this.context })
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
    getRules ({ rules = [], required }) {
      return [...rules, ...required ? [x => !!x || 'Введите значение'] : []]
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
</style>
