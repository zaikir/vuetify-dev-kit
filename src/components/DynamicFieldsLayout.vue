<template>
  <div v-if="fieldsData.type === 'normal'">
    <dynamimc-fields-collection
      :editable-item="editableItem"
      :context="context"
      :fields="fieldsData.fields"
      :readonly="readonly"
    >
      <template
        v-for="field in fieldsData.fields"
        v-slot:[`label.${field.value}`]="{item}"
      >
        <slot :name="`label.${field.value}`" :item="item" :context="context" />
      </template>
      <template
        v-for="field in fieldsData.fields"
        v-slot:[`field.${field.value}`]="{item}"
      >
        <slot :name="`field.${field.value}`" :item="editableItem" :context="context" />
      </template>
    </dynamimc-fields-collection>
  </div>
  <div v-else-if="fieldsData.type === 'tabs'">
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
          v-for="layout in fieldsData.layouts"
          :key="layout.name"
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
        :key="layout.name"
      >
        <dynamic-fields-layout
          :editable-item="editableItem"
          :context="context"
          :fields-data="layout"
          :readonly="readonly"
        >
          <!-- <template #title>
            <h2 v-if="isMobile" class="mb-3">
              {{ layout.name }}
            </h2>
          </template> -->
          <template
            v-for="field in flattenFields[layout].filter(x => x.layoutId === layoutId)"
            v-slot:[`label.${field.value}`]="{item}"
          >
            <slot :name="`label.${field.value}`" :item="item" :context="context" />
          </template>
          <template
            v-for="field in flattenFields[layout].filter(x => x.layoutId === layoutId)"
            v-slot:[`field.${field.value}`]="{item}"
          >
            <slot :name="`field.${field.value}`" :item="editableItem" :context="context" />
          </template>
        </dynamic-fields-layout>
        <!-- <dynamimc-fields-collection
          :editable-item="editableItem"
          :context="context"
          :fields="fieldsData.fields.filter(x => x.layoutId === layoutId)"
          :readonly="readonly"
        >
          <template #title>
            <h2 v-if="isMobile" class="mb-3">
              {{ layout.name }}
            </h2>
          </template>
          <template
            v-for="field in fieldsData.fields.filter(x => x.layoutId === layoutId)"
            v-slot:[`label.${field.value}`]="{item}"
          >
            <slot :name="`label.${field.value}`" :item="item" :context="context" />
          </template>
          <template
            v-for="field in fieldsData.fields.filter(x => x.layoutId === layoutId)"
            v-slot:[`field.${field.value}`]="{item}"
          >
            <slot :name="`field.${field.value}`" :item="editableItem" :context="context" />
          </template>
        </dynamimc-fields-collection> -->
      </v-tab-item>
    </v-tabs>
  </div>
  <div v-else-if="fieldsData.type === 'columns'">
    <v-row no-gutters>
      <v-col v-for="(layout,layoutId) in fieldsData.layouts" :key="layout.name" v-bind="layout.breakpoints || { cols: 12 }" :class="layout.class || {}" :style="layout.style || ''">
        <dynamic-fields-layout
          :editable-item="editableItem"
          :context="context"
          :fields-data="layout"
          :readonly="readonly"
        >
          <!-- <template #title>
            <h2 v-if="isMobile" class="mb-3">
              {{ layout.name }}
            </h2>
          </template> -->
          <template
            v-for="field in flattenFields[layout].filter(x => x.layoutId === layoutId)"
            v-slot:[`label.${field.value}`]="{item}"
          >
            <slot :name="`label.${field.value}`" :item="item" :context="context" />
          </template>
          <template
            v-for="field in flattenFields[layout].filter(x => x.layoutId === layoutId)"
            v-slot:[`field.${field.value}`]="{item}"
          >
            <slot :name="`field.${field.value}`" :item="editableItem" :context="context" />
          </template>
        </dynamic-fields-layout>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import DynamimcFieldsCollection from './DynamimcFieldsCollection'

export default {
  name: 'DynamicFieldsLayout',
  components: {
    DynamimcFieldsCollection
  },
  props: {
    editableItem: {
      type: Object,
      required: true
    },
    fieldsData: {
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
  computed: {
    flattenFields () {
      function getFields (layout) {
        if (layout.type !== 'normal') {
          return layout.layouts.reduce((acc, nestedLayout, id) => {
            acc.push(...getFields(nestedLayout.fields))
            return acc
          }, [])
        } else {
          return layout.fields
        }
      }

      if (this.fieldsData.type !== 'normal') {
        return this.fieldsData.layouts.reduce((acc, layout) => {
          acc[layout] = getFields(layout)
          return acc
        }, {})
      }

      return {}
    }
  }
}
</script>
