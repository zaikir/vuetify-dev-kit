<template>
  <v-row v-if="url" no-gutters class="drag-and-drop-editor mb-8">
    <v-col cols="12" style="margin-bottom: 0px;">
      <v-subheader :class="'subtitle-2 pl-0'">
        {{ label }}
      </v-subheader>
    </v-col>

    <v-card flat tile class="d-flex file-card">
      <v-img
        :src="url"
        aspect-ratio="1"
        width="200"
        contain
        class="white"
        @click="openEditor"
      >
        <template v-slot:placeholder>
          <v-row
            class="fill-height ma-0"
            align="center"
            justify="center"
          >
            <v-progress-circular indeterminate color="black" />
          </v-row>
        </template>
      </v-img>
    </v-card>

    <v-dialog v-model="isEditorOpened">
      <vue-cropper
        ref="cropper"
        :src="url"
        alt="Source Image"
      />
    </v-dialog>
  </v-row>
</template>
<script>
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  components: { VueCropper },
  props: {
    value: {
      type: Object,
      required: false,
      default: null
    },
    url: {
      type: String,
      required: true
    },
    height: {
      type: Number,
      required: false,
      default: 100
    },
    acceptedFiles: {
      type: String,
      required: false,
      default: '*'
    },
    label: {
      type: String,
      required: false,
      default: null
    },
    rules: {
      type: Array,
      required: false,
      default: () => []
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    outlined: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      isEditorOpened: false
    }
  },
  methods: {
    openEditor () {
      this.isEditorOpened = true
    }
  }
}
</script>
