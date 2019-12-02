<template>
  <v-autocomplete
    v-if="field.type === 'select' && (!field.mobile || !$vuetify.breakpoint[field.breakpoint || 'smAndDown'])"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
    :label="field.text"
    :items="field.options({item: editableItem, ...context})"
    :item-text="field.itemText"
    :multiple="conditionalFunction(field.multiple)"
    :item-value="field.itemValue"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-autocomplete>
  <v-row v-else-if="field.type === 'select' && field.mobile && $vuetify.breakpoint[field.breakpoint || 'smAndDown']" no-gutters>
    <v-subheader :class="field.subHeaderClass || 'subtitle-2 pl-0'" style="height: 23px;font-weight: 400;margin-bottom: 3px;margin-top: -5px;">
      {{ field.text }}
    </v-subheader>
    <v-col cols="12">
      <v-btn-toggle
        v-model="editableItem[field.value]"
        mandatory
        class="mb-2"
        style="width: 100%"
        :active-class="field.activeClass || 'select-field-toggle-btn-selected'"
        :rules="getRules(field)"
        :required="conditionalFunction(field.required)"
        :label="field.text"
        :multiple="conditionalFunction(field.multiple)"
        :disabled="readonly || conditionalFunction(field.disabled)"
        @input="onFieldValueChanged(field, $event)"
      >
        <template #label>
          <slot name="label" :item="editableItem" :context="context" />
        </template>
        <v-row no-gutters>
          <v-col
            v-for="option in field.options({item: editableItem, ...context})"
            :key="option[field.itemValue]"
            :cols="field.optionCols || 6"
            :sm="field.optionSm"
            :md="field.optionMd"
            :lg="field.optionLg"
          >
            <v-btn
              :value="option[field.itemValue || 'value']"
              text
              class="mx-2 px-2"
              :class="{dense: field.dense, dark: field.dark}"
              block
              :disabled="readonly || conditionalFunction(field.disabled)"
              :rounded="field.rounded"
            >
              {{ option[field.itemText || 'text'] }}
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
    :required="conditionalFunction(field.required)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    @input="onFieldValueChanged(field, $event)"
  >
    <v-radio
      v-for="option in field.options({item: editableItem, ...context})"
      :key="option[field.itemValue]"
      :label="option[field.itemText]"
      :value="option[field.itemValue]"
    />
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-radio-group>
  <external-data-autocomplete
    v-else-if="field.type === 'autocomplete'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
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
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </external-data-autocomplete>
  <v-switch
    v-else-if="field.type === 'switch'"
    v-model="editableItem[field.value]"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-switch>
  <v-text-field
    v-else-if="field.type === 'email'"
    v-model="editableItem[field.value]"
    :rules="[...getRules(field), emailRule]"
    :required="conditionalFunction(field.required)"
    :placeholder="field.placeholder"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-text-field>
  <v-text-field
    v-else-if="field.type === 'phone'"
    v-model="editableItem[field.value]"
    :rules="[...getRules(field), phoneRule]"
    :required="conditionalFunction(field.required)"
    :placeholder="field.placeholder"
    :label="field.text"
    prefix="+"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :suffix="conditionalFunction(field.suffix)"
    @keypress="isNumber($event)"
    @input="onFieldValueChanged(field, $event, val => (val || '').replace(/[^0-9]/g, ''))"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-text-field>
  <v-text-field v-else-if="field.type === 'number'"
      v-model.number="editableItem[field.value]"
      v-bind="field"
      type="text"
      :step="field.step || 0.01"
      :min="field.min"
      :max="field.max"
      :rules="getRules(field)"
      :required="conditionalFunction(field.required)"
      :placeholder="field.placeholder"
      :label="field.text"
      :prefix="conditionalFunction(field.prefix)"
      :suffix="conditionalFunction(field.suffix)"
      :disabled="readonly || conditionalFunction(field.disabled)"
      :outlined="field.outlined"
      @input="onFieldValueChanged(field, $event, val => (val || '').replace(/[^-0-9\,\.]/g, '').replace(/[\.\,]/g, '.'))"
    >
      <template #label>
        <slot name="label" :item="editableItem" :context="context" />
      </template>
  </v-text-field>
  <v-text-field
    v-else-if="field.type === 'integer'"
    v-model.number="editableItem[field.value]"
    type="text"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
    :placeholder="field.placeholder"
    :label="field.text"
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field, $event, val => (val || '').replace(/[^0-9]/g, ''))"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-text-field>
  <v-textarea
    v-else-if="field.type === 'textArea'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
    :placeholder="field.placeholder"
    :label="field.text"
    :counter="field.counter"
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-textarea>
  <drag-and-drop-file-container
    v-else-if="field.type === 'image' || field.type === 'file'"
    v-model="editableItem[field.value]"
    single
    :rules="getRules(field)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :url="field.uploadUrl || '/api/uploads'"
    :accepted-files="field.acceptedFiles"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </drag-and-drop-file-container>
  <drag-and-drop-files-container
    v-else-if="field.type === 'images' || field.type === 'files'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :url="field.uploadUrl || '/api/uploads'"
    :accepted-files="field.acceptedFiles"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </drag-and-drop-files-container>
  <image-area-selector
    v-else-if="field.type === 'imageArea'"
    v-model="editableItem[field.value]"
    :url="(editableItem[field.basedOn || 'image'] || {}).url"
    :rules="getRules(field)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </image-area-selector>
  <html-editor
    v-else-if="field.type === 'html'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
    :label="field.text"
    :height="field.height"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </html-editor>
  <date-picker
    v-else-if="field.type === 'date'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :short-year="field.shortYear"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </date-picker>
  <time-picker
    v-else-if="field.type === 'time'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </time-picker>
  <v-combobox
    v-else-if="field.type === 'combobox'"
    v-model="editableItem[field.value]"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
    :placeholder="field.placeholder"
    :items="field.items || []"
    :label="field.text"
    :chips="field.chips"
    :dense="field.dense"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    :multiple="conditionalFunction(field.multiple)"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-combobox>
  <v-text-field
    v-else-if="field.type === 'slug'"
    v-model="editableItem[field.value]"
    :rules="[...getRules(field), slugRule]"
    :placeholder="field.placeholder"
    :required="conditionalFunction(field.required)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    @input="onFieldValueChanged(field, $event)"
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
    :required="conditionalFunction(field.required)"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-text-field>
  <v-text-field
    v-else-if="field.computed"
    v-bind="field"
    :value="field.computed({item: editableItem, ...context})"
    :rules="getRules(field)"
    :placeholder="field.placeholder"
    :label="field.text"
    disabled
    :outlined="field.outlined"
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-text-field>
  <v-text-field
    v-else
    v-model="editableItem[field.value]"
    v-bind="field"
    :rules="getRules(field)"
    :required="conditionalFunction(field.required)"
    :placeholder="field.placeholder"
    :label="field.text"
    :disabled="readonly || conditionalFunction(field.disabled)"
    :outlined="field.outlined"
    :prefix="conditionalFunction(field.prefix)"
    :suffix="conditionalFunction(field.suffix)"
    @input="onFieldValueChanged(field, $event)"
  >
    <template #label>
      <slot name="label" :item="editableItem" :context="context" />
    </template>
  </v-text-field>
</template>

<script>
import slugify from 'slugify'
import EmailValidator from 'email-validator'
import { mask } from 'vue-the-mask'
import DatePicker from './DatePicker'
import DragAndDropFileContainer from './DragAndDropFileContainer'
import DragAndDropFilesContainer from './DragAndDropFilesContainer'
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
    DragAndDropFileContainer,
    DragAndDropFilesContainer,
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
      return [...rules, ...this.conditionalFunction(required) ? [x => !!x || 'Введите значение'] : []]
    },
    onFieldValueChanged (field, newValue, processor = x => x) {
      const processedValue = processor(newValue)
      if (processedValue !== newValue) {
        this.editableItem[field.value] = ' '
        this.$nextTick(() => {
          this.editableItem[field.value] = processedValue
        })
      }

      if (field.onChange) {
        field.onChange({ value: processedValue, item: this.editableItem, ...this.context })
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
