<template>
  <v-autocomplete
    v-if="field.type === 'select' && (!field.mobile || !$vuetify.breakpoint.smAndDown)"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="field.required"
    :label="field.text"
    :items="field.options({item: editableItem, ...context})"
    :item-text="field.itemText"
    :multiple="field.multiple"
    :item-value="field.itemValue"
    :disabled="readonly || conditionalFunction(field.disabled)"
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
        :disabled="readonly || conditionalFunction(field.disabled)"
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
    :disabled="readonly || conditionalFunction(field.disabled)"
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
    :context="{ item: editableItem, ...context }"
    :label="field.text"
    :item-text="field.itemText"
    :item-value="field.itemValue"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-switch
    v-else-if="field.type === 'switch'"
    v-model="editableItem[field.value]"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
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
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-text-field
    v-else-if="field.type === 'phone'"
    v-model="editableItem[field.value]"
    :rules="[...getRules(field), phoneRule]"
    :required="field.required"
    :placeholder="field.placeholder"
    :label="field.text"
    prefix="+"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @keypress="isNumber($event)"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-text-field
    v-else-if="field.type === 'number'"
    v-model.number="editableItem[field.value]"
    v-bind="field"
    type="number"
    :rules="getRules(field)"
    :required="field.required"
    :placeholder="field.placeholder"
    :label="field.text"
    :min="field.min"
    :max="field.max"
    :step="field.step"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-text-field
    v-else-if="field.type === 'integer'"
    v-model.number="editableItem[field.value]"
    type="number"
    step="1"
    :min="field.min"
    :max="field.max"
    :rules="getRules(field)"
    :required="field.required"
    :placeholder="field.placeholder"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
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
    :counter="field.counter"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <drag-and-drop-image-container
    v-else-if="field.type === 'image'"
    v-model="editableItem[field.value]"
    single
    :rules="getRules(field)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
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
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :url="field.uploadUrl || '/api/uploads'"
    :accepted-files="field.acceptedFiles"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <image-area-selector
    v-else-if="field.type === 'imageArea'"
    v-model="editableItem[field.value]"
    :url="(editableItem[field.basedOn || 'image'] || {}).url"
    :rules="getRules(field)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <html-editor
    v-else-if="field.type === 'html'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="field.required"
    :label="field.text"
    :height="field.height"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <date-picker
    v-else-if="field.type === 'date'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="field.required"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <time-picker
    v-else-if="field.type === 'time'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="field.required"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-combobox
    v-else-if="field.type === 'combobox'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="field.required"
    :placeholder="field.placeholder"
    :items="field.items || []"
    :label="field.text"
    :chips="field.chips"
    :dense="field.dense"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :multiple="field.multiple || true"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-text-field
    v-else-if="field.type === 'slug'"
    v-model="editableItem[field.value]"
    :rules="[...getRules(field), slugRule]"
    :placeholder="field.placeholder"
    :required="field.required"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
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
    v-bind="field"
    :placeholder="field.placeholder"
    :rules="getRules(field)"
    :required="field.required"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-text-field
    v-else-if="field.computed"
    v-bind="field"
    :value="field.computed({item: editableItem, ...context})"
    :rules="getRules(field)"
    :placeholder="field.placeholder"
    :label="field.text"
    disabled
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-text-field
    v-else
    v-model="editableItem[field.value]"
    v-bind="field"
    :rules="getRules(field)"
    :required="field.required"
    :placeholder="field.placeholder"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
</template>

<script>
import slugify from 'slugify'
import EmailValidator from 'email-validator'
import { mask } from 'vue-the-mask'
import DatePicker from './DatePicker'
import DragAndDropImageContainer from './DragAndDropImageContainer'
import DragAndDropImagesContainer from './DragAndDropImagesContainer'
import ExternalDataAutocomplete from './ExternalDataAutocomplete'
import HtmlEditor from './HtmlEditor'
import TimePicker from './TimePicker'
import ImageAreaSelector from './ImageAreaSelector'

export default {
  directives: {
    mask
  },
  components: {
    DatePicker,
    DragAndDropImageContainer,
    DragAndDropImagesContainer,
    HtmlEditor,
    ExternalDataAutocomplete,
    TimePicker,
    ImageAreaSelector
  },
  props: {
    editableItem: {
      type: Object,
      required: true
    },
    field: {
      type: Object,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    context: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data () {
    return {
      phoneRule: x => !x || x === x.replace(/[^0-9]*/g, '') || 'Неверный формат',
      emailRule: x => !x || EmailValidator.validate(x) || 'Неверный формат',
      slugRule: x => !x || x === slugify(x) || 'Неверный формат'
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
    setSlug (item, fieldName, basedOnField) {
      this.$set(item, fieldName, slugify(item[basedOnField]).toLowerCase())
    },
    getRules ({ rules = [], required }) {
      return [...rules, ...required ? [x => !!x || 'Введите значение'] : []]
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
    }
  }
}
</script>
