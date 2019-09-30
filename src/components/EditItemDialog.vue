
<template>
  <v-dialog
    :value="value"
    scrollable
    :persistent="persistent"
    :max-width="maxWidth"
    class="edit-item-dialog"
    @input="onValueChanged"
  >
    <v-card :flat="flat">
      <v-card-title v-if="title" class="pb-0">
        {{ title }}
      </v-card-title>
      <v-card-text class="pt-0">
        <v-row fill-height>
          <v-col v-if="!item" cols="12" class="text-center">
            <v-progress-circular :size="94" width="4" class="py-5" indeterminate color="secondary">
              Загрузка...
            </v-progress-circular>
          </v-col>
          <v-col v-else cols="12">
            <v-form ref="editForm" lazy-validation>
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
                        v-for="field in fields"
                        :key="field.value"
                        :class="field.class || 'px-1'"
                        :cols="field.cols || 12"
                        :sm="field.sm"
                        :md="field.md"
                        :xl="field.xl"
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
                        <v-switch
                          v-else-if="field.type === 'switch'"
                          v-model="editableItem[field.value]"
                          :label="field.text"
                          :disabled="field.disabled"
                          :rules="getRules(field)"
                          :required="field.required"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else-if="field.type === 'email'"
                          v-model="editableItem[field.value]"
                          :rules="[...getRules(field), emailRule]"
                          :required="field.required"
                          :label="field.text"
                          :disabled="field.disabled"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else-if="field.type === 'phone'"
                          v-model="editableItem[field.value]"
                          :rules="[...getRules(field)]"
                          :required="field.required"
                          :label="field.text"
                          prefix="+"
                          :disabled="field.disabled"
                          @keypress="isNumber($event)"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else-if="field.type === 'number'"
                          v-model.number="editableItem[field.value]"
                          type="number"
                          :rules="getRules(field)"
                          :required="field.required"
                          :label="field.text"
                          :disabled="field.disabled"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <date-picker
                          v-else-if="field.type === 'date'"
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :required="field.required"
                          :label="field.text"
                          :disabled="field.disabled"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else-if="field.mask && field.mask.length"
                          v-model="editableItem[field.value]"
                          v-mask="field.mask"
                          :rules="getRules(field)"
                          :required="field.required"
                          :label="field.text"
                          :disabled="field.disabled"
                          @input="onFieldValueChanged(field.onChange, $event)"
                        />
                        <v-text-field
                          v-else
                          v-model="editableItem[field.value]"
                          :rules="getRules(field)"
                          :required="field.required"
                          :label="field.text"
                          :disabled="field.disabled"
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
      <v-card-actions v-if="item">
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
import DatePicker from './DatePicker'

export default {
  directives: {
    mask
  },
  components: {
    DatePicker
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
      emailRule: x => !x || EmailValidator.validate(x) || 'Неверный формат'
    }
  },
  watch: {
    value (val) {
      if (val) {
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
