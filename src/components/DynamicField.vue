<script>

import { VTextField, VBtn, VTooltip, VIcon } from 'vuetify/lib/components'
import slugify from 'slugify'
import { MaskedInput } from './fields'

export default {
  functional: true,
  props: {
    value: {
      type: null,
      default: undefined
    },
    readonly: {
      type: Boolean,
      default: false
    },
    field: {
      type: Object,
      required: true
    },
    item: {
      type: Object,
      required: true
    },
    context: {
      type: Object,
      default: () => {}
    }
  },
  render (h, { props, data, parent }) {
    const { field, readonly, context, item } = props
    const { value, text, type, ...otherProps } = {
      ...field,
      disabled: readonly || field.disabled,
      rules: [
        ...field.rules || [],
        ...field.required ? [x => !!x || 'Введите значение'] : []
      ]
    }

    // <v-text-field
    //     v-else-if="field.type === 'slug'"
    //     v-model="editableItem[field.value]"
    //     :rules="[...getRules(field), slugRule]"
    //     :placeholder="field.placeholder"
    //     :required="field.required"
    //     :label="field.text"
    //     :disabled="readonly || field.disabled"
    //     :outlined="field.outlined"
    //     @input="onFieldValueChanged(field.onChange, $event)"
    //   >
    //     <template #append>
    //       <v-tooltip bottom>
    //         <template #activator="{on}">
    //           <v-btn icon @click="setSlug(editableItem, field.value, field.basedOn || 'name')" v-on="on">
    //             <v-icon>mdi-reply-outline</v-icon>
    //           </v-btn>
    //         </template>
    //         Сгенерировать
    //       </v-tooltip>
    //     </template>
    //   </v-text-field>

    const onInput = (event) => {
      data.on.input(event)
      if (field.onChange) {
        field.onChange({
          value: event, context: { item, ...context }
        })
      }
    }

    console.log(type)
    switch (type) {
      case 'slug': {
        return h(VTextField, {
          props: {
            value: props.value,
            rules: [ ...otherProps.rules, x => !x || x === slugify(x) || 'Неверный формат' ],
            ...otherProps
          },
          scopedSlots: {
            append () {
              return h(VTooltip, {
                props: { bottom: true },
                scopedSlots: {
                  activator ({ on }) {
                    return h(VBtn, {
                      props: { icon: true },
                      on: {
                        click: () => {
                          parent.$set(item, field.value, slugify(item[field.basedOn || 'name']).toLowerCase())
                        },
                        ...on
                      }
                    },
                    h(VIcon, 'mdi-reply-outline'))
                  }
                }
              },
              'Сгенерировать'
              )
            }
          },
          on: { input: onInput }
        })
      }
      default: {
        return h(field.mask ? MaskedInput : VTextField, {
          props: { value: props.value, ...otherProps },
          on: { input: onInput }
        })
      }
    }
  }
}
</script>
