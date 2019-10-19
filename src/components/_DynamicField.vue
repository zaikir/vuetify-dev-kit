<template functional>
  <v-autocomplete
    v-if="field.type === 'select' && (!field.mobile || !$vuetify.breakpoint.smAndDown)"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="field.required"
    :label="field.text"
    :items="field.options({item: editableItem, ...context})"
    :item-text="field.itemText"
    :item-value="field.itemValue"
    :disabled="readonly || field.disabled"
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
        :disabled="readonly || field.disabled"
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
    :disabled="readonly || field.disabled"
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
    :disabled="readonly || field.disabled"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-switch
    v-else-if="field.type === 'switch'"
    v-model="editableItem[field.value]"
    :label="field.text"
    :disabled="readonly || field.disabled"
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
    :disabled="readonly || field.disabled"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <v-text-field
    v-else-if="field.type === 'phone'"
    v-model="editableItem[field.value]"
    :rules="[...getRules(field), ]"
    :required="field.required"
    :placeholder="field.placeholder"
    :label="field.text"
    prefix="+"
    :disabled="readonly || field.disabled"
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
    :disabled="readonly || field.disabled"
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
    :disabled="readonly || field.disabled"
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
    :disabled="readonly || field.disabled"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <drag-and-drop-image-container
    v-else-if="field.type === 'image'"
    v-model="editableItem[field.value]"
    single
    :rules="getRules(field)"
    :label="field.text"
    :disabled="readonly || field.disabled"
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
    :disabled="readonly || field.disabled"
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
    :disabled="readonly || field.disabled"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <date-picker
    v-else-if="field.type === 'date'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="field.required"
    :label="field.text"
    :disabled="readonly || field.disabled"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field.onChange, $event)"
  />
  <time-picker
    v-else-if="field.type === 'time'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="field.required"
    :label="field.text"
    :disabled="readonly || field.disabled"
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
    :disabled="readonly || field.disabled"
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
</template>
<script>

import EmailValidator from 'email-validator'
import slugify from 'slugify'
import { mask } from 'vue-the-mask'
import DatePicker from './DatePicker'
import DragAndDropImageContainer from './DragAndDropImageContainer'
import DragAndDropImagesContainer from './DragAndDropImagesContainer'
import ExternalDataAutocomplete from './ExternalDataAutocomplete'
import HtmlEditor from './HtmlEditor'
import TimePicker from './TimePicker'

// phoneRule: x => !x || x === x.replace(/[^0-9]*/g, '') || 'Неверный формат',
//       emailRule: x => !x || EmailValidator.validate(x) || 'Неверный формат',
//       slugRule: x => !x || x === slugify(x) || 'Неверный формат'

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
    TimePicker
  },
  props: {
    field: {
      type: Object,
      required: true
    }
  },
  methods: {
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
    }
  }
}
</script>
