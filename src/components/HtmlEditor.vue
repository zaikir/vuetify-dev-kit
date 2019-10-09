
<template>
  <div class="html-editor">
    <v-subheader :class="'subtitle-2 pl-0'" style="height: 30px;">
      {{ label }}
    </v-subheader>

    <editor-menu-bar v-slot="{ commands, isActive }" :editor="editor" class="html-editor-menu">
      <v-row no-gutters justify="space-between">
        <v-col v-for="(button, i) in buttons" :key="i" cols="auto">
          <v-tooltip top :open-delay="300">
            <template v-slot:activator="{ on }">
              <v-btn
                :class="{
                  'is-active': button.isActive(isActive),
                  'elevation-2': button.isActive(isActive)
                }"
                outlined
                style="padding: 4px 0px;"
                @click="button.onClick(commands)"
                v-on="on"
              >
                <v-icon v-if="button.icon" color="black">
                  {{ button.icon }}
                </v-icon>
                <span v-else>
                  {{ button.text }}
                </span>
              </v-btn>
            </template>
            <span>{{ button.name }}</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </editor-menu-bar>
    <!-- <editor-menu-bubble v-slot="{ commands, isActive, menu }" :editor="editor" keep-in-bounds>
      <div
        class="menububble"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <v-row no-gutters justify="space-between">
          <v-col v-for="(button, i) in menuButtons" :key="i" cols="auto">
            <v-btn
              icon
              :class="{ 'is-active': button.isActive(isActive) }"
              style="padding: 4px 0px;"
              dark
              @click="button.onClick(commands)"
              v-on="on"
            >
              <v-icon v-if="button.icon">
                {{ button.icon }}
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div> -->

      <!-- <div
        class="menububble"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.bold() }"
          @click="commands.bold"
        >
          <icon name="bold" />
        </button>

        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic"
        >
          <icon name="italic" />
        </button>

        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.code() }"
          @click="commands.code"
        >
          <icon name="code" />
        </button>
      </div> -->
    </editor-menu-bubble>
    <editor-content ref="htmlEditor" class="editor__content" :editor="editor" :style="`height: ${height}px`" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar, EditorMenuBubble } from 'tiptap'
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
  Image
} from 'tiptap-extensions'
import {
  Alignment
} from './commands'

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    EditorMenuBubble
  },
  props: {
    value: {
      type: String,
      required: false,
      default: ''
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
    height: {
      type: Number,
      required: false,
      default: 600
    }
  },
  data () {
    return {
      editor: new Editor({
        height: 600,
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
          new Image(),
          new Alignment()
        ],
        content: '',
        onUpdate: ({ getHTML }) => {
          const newContent = getHTML()
          this.$emit('input', newContent)
        }
      }),
      menuButtons: [{
        name: 'Выделить жирным',
        icon: 'mdi-format-bold',
        onClick: commands => commands.bold(),
        isActive: isActive => false
      }, {
        name: 'Выделить курсивом',
        icon: 'mdi-format-italic',
        onClick: commands => commands.italic(),
        isActive: isActive => false
      }, {
        name: 'Перечеркнуть',
        icon: 'mdi-format-strikethrough-variant',
        onClick: commands => commands.strike(),
        isActive: isActive => false
      }],
      buttons: [{
        name: 'Выделить жирным',
        icon: 'mdi-format-bold',
        onClick: commands => commands.bold(),
        isActive: isActive => isActive.bold()
      }, {
        name: 'Выделить курсивом',
        icon: 'mdi-format-italic',
        onClick: commands => commands.italic(),
        isActive: isActive => isActive.italic()
      }, {
        name: 'Перечеркнуть',
        icon: 'mdi-format-strikethrough-variant',
        onClick: commands => commands.strike(),
        isActive: isActive => isActive.strike()
      }, {
        name: 'Подчеркнуть',
        icon: 'mdi-format-underline',
        onClick: commands => commands.underline(),
        isActive: isActive => isActive.underline()
      },
      // {
      //   name: 'Код',
      //   icon: 'mdi-code-braces',
      //   onClick: commands => commands.code(),
      //   isActive: isActive => isActive.code()
      // },
      {
        name: 'Параграф',
        icon: 'mdi-format-paragraph',
        onClick: commands => commands.paragraph(),
        isActive: isActive => isActive.paragraph()
      }, {
        name: 'Выравнивание по левому краю',
        icon: 'mdi-format-align-left',
        onClick: commands => commands.alignment({ textAlign: 'left' }),
        isActive: isActive => false
      }, {
        name: 'Выравнивание по центру',
        icon: 'mdi-format-align-center',
        onClick: commands => commands.alignment({ textAlign: 'center' }),
        isActive: isActive => false
      }, {
        name: 'Выравнивание по правому краю',
        icon: 'mdi-format-align-right',
        onClick: commands => commands.alignment({ textAlign: 'right' }),
        isActive: isActive => false
      }, {
        name: 'h1',
        text: 'h1',
        onClick: commands => commands.heading({ level: 1 }),
        isActive: isActive => isActive.heading({ level: 1 })
      }, {
        name: 'h2',
        text: 'h2',
        onClick: commands => commands.heading({ level: 2 }),
        isActive: isActive => isActive.heading({ level: 2 })
      }, {
        name: 'h3',
        text: 'h3',
        onClick: commands => commands.heading({ level: 3 }),
        isActive: isActive => isActive.heading({ level: 3 })
      }, {
        name: 'Список',
        icon: 'mdi-format-list-bulleted',
        onClick: commands => commands.bullet_list(),
        isActive: isActive => isActive.bullet_list()
      }, {
        name: 'Упорядоченный список',
        icon: 'mdi-format-list-numbered',
        onClick: commands => commands.ordered_list(),
        isActive: isActive => isActive.ordered_list()
      },
      // {
      //   name: 'Кавычки',
      //   icon: 'mdi-format-quote-close',
      //   onClick: commands => commands.blockquote(),
      //   isActive: isActive => isActive.blockquote()
      // },
      {
        name: 'Горизонтальная линия',
        text: 'hr',
        onClick: commands => commands.horizontal_rule(),
        isActive: () => false
      }, {
        name: 'Отменить',
        icon: 'mdi-undo',
        onClick: commands => commands.undo(),
        isActive: () => false
      }, {
        name: 'Повторить',
        icon: 'mdi-redo',
        onClick: commands => commands.redo(),
        isActive: () => false
      }]
    }
  },
  // watch: {
  //   // value () {
  //   //   this.editor.setContent(this.value)
  //   // }
  // },
  mounted () {
    this.editor.setContent(this.value)
  },
  beforeDestroy () {
    this.editor.destroy()
  }
}
</script>
<style>
.ProseMirror {
  height: 100%;
  color: initial;
  font-size: initial;
  line-height: initial;
  letter-spacing: initial;
  pointer-events: initial;
  font-family: initial !important;
  border: thin solid rgb(117, 117, 117);
  border-radius: 4px;
  outline: none;
  padding: 4px;
  margin-top: 4px;
}
.ProseMirror:hover {
  outline: none;
  border: thin solid black;
}

.html-editor-menu .v-btn {
  width: 50px !important;
  min-width: 50px !important;
}

.html-editor-menu {
  margin-left: -3px;
  margin-right: -3px;
}

.html-editor-menu .col .v-btn {
  margin: 3px 3px;
}

.html-editor-menu .col .v-btn {
  margin: 3px 3px;
}

.html-editor .menububble {
  position: absolute;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  z-index: 20;
  background: #000;
  border-radius: 5px;
  padding: .3rem;
  margin-bottom: .5rem;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  visibility: hidden;
  opacity: 0;
  -webkit-transition: opacity .2s,visibility .2s;
  transition: opacity .2s,visibility
}

.html-editor .menububble.is-active {
  opacity: 0.8;
  visibility: visible;
}

.html-editor .v-btn.is-active {
  background-color: #87c9ff;
}

</style>
