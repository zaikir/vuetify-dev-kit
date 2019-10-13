<template>
  <v-row no-gutters class="drag-and-drop-editor">
    <v-col cols="12" style="margin-bottom: -5px;">
      <v-subheader :class="'subtitle-2 pl-0'">
        {{ label }}
      </v-subheader>
    </v-col>
    <v-col v-if="!disabled" cols="12">
      <vue-dropzone
        id="drop-zone"
        :options="dropzoneOptions"
        :use-custom-slot="true"
        :include-styling="false"
        :accepted-files="acceptedFiles"
        @vdropzone-file-added="startUploading"
        @vdropzone-success="successfullyUploaded"
      >
        <div class="dropzone-custom-content" :style="`height: ${height}px;`">
          <template v-if="!isLoading">
            <div style="display:flex;">
              <v-icon class="icon mr-3" style="margin-top:-2px;">
                mdi-cloud-upload-outline
              </v-icon>
              <h3 class="dropzone-custom-title">
                Перетащите сюда файл
              </h3>
            </div>
          </template>
          <template v-else>
            <v-progress-circular
              :size="30"
              :width="3"
              color="primary"
              indeterminate
            />
          </template>
        </div>
      </vue-dropzone>
    </v-col>
    <v-col cols="12">
      <v-row>
        <v-col v-for="(file, i) in value.filter(x => !x.isRemoved)" :key="i" cols="auto">
          <v-hover v-slot:default="{ hover }">
            <v-card flat tile class="d-flex file-card">
              <v-img
                v-if="isImage(file.type)"
                :src="file.url"
                aspect-ratio="1"
                width="100"
                contain
                class="white"
                @click="openLink(file.url)"
              >
                <div
                  v-if="hover && !disabled"
                  class="d-flex justify-end"
                  style="height: 100%;"
                >
                  <v-btn icon @click.prevent.stop="processedItem=file; isConfirmationDialogOpened = true;">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
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
          </v-hover>
        </v-col>
      </v-row>
    </v-col>
    <confirmation-dialog
      v-model="isConfirmationDialogOpened"
      @confirm="removeFile"
      @decline="isConfirmationDialogOpened = false"
    />
  </v-row>
</template>
<script>

import VueDropzone from 'nuxt-dropzone'
import ConfirmationDialog from './ConfirmationDialog'

export default {
  components: {
    VueDropzone,
    ConfirmationDialog
  },
  props: {
    value: {
      type: Array,
      required: false,
      default: () => []
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
      isLoading: false,
      isConfirmationDialogOpened: false,
      processedItem: null
    }
  },
  computed: {
    dropzoneOptions () {
      return {
        dictDefaultMessage: 'Перетащите сюда файл',
        url: this.url,
        thumbnailWidth: 200
      }
    }
  },
  methods: {
    removeFile () {
      this.processedItem.isRemoved = true
      this.isConfirmationDialogOpened = false

      this.$emit('input', [...this.value])
    },
    openLink (url) {
      window.open(url, '_blank')
    },
    isImage (type) {
      return type === '.png' || type === '.jpg' || type === '.jpeg' || type === '.gif'
    },
    startUploading (file, response) {
      this.isLoading = true
    },
    successfullyUploaded (file, response) {
      this.isLoading = false

      this.$emit('input', [...this.value, response])
    }
  }
}
</script>
<style>
  .dropzone-custom-content {
    cursor: pointer;
    border: thin dashed rgb(168, 167, 167);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dropzone-custom-content:hover {
    background: rgb(245, 245, 245);
    border: thin solid rgb(155, 155, 155);
    /* border: thin dashed #1976d2; */
  }

  .dropzone-custom-content .dropzone-custom-title {
    font-weight: normal;
  }

  .dropzone-custom-content:hover .icon {
    color: #1976d2;
  }

  .drag-and-drop-editor .v-sheet {
    border: thin solid rgba(165, 165, 165, 0.671);
    border-radius: 6px !important;
  }

 .drag-and-drop-editor .dz-preview,
 .drag-and-drop-editor .dz-processing,
 .drag-and-drop-editor .dz-image-preview,
 .drag-and-drop-editor .dz-success,
 .drag-and-drop-editor .dz-success {
   display: none;
 }

  .v-card--reveal {
    /* align-items: center;
    bottom: 0;
    justify-content: center;
    opacity: .2;
    position: absolute; */
    width: 100%;
  }

  .file-card {
    cursor: pointer;
  }
</style>
