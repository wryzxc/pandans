<script setup>
import { ref, watch, onMounted } from 'vue'

const code = defineModel()
const editorRef = ref(null)
let cmInstance = null

const props = defineProps({
  language: { type: String, default: 'python' },
  height: { type: String, default: '100%' }
})

async function initEditor() {
  const { EditorView, keymap } = await import('@codemirror/view')
  const { EditorState } = await import('@codemirror/state')
  const { python } = await import('@codemirror/lang-python')
  const { oneDark } = await import('@codemirror/theme-one-dark')
  const { indentWithTab } = await import('@codemirror/commands')
  const { defaultKeymap, history, historyKeymap } = await import('@codemirror/commands')
  const { syntaxHighlighting, defaultHighlightStyle, bracketMatching } = await import('@codemirror/language')
  const { lineNumbers, highlightActiveLineGutter } = await import('@codemirror/view')
  const { closeBrackets, closeBracketsKeymap } = await import('@codemirror/autocomplete')

  const startState = EditorState.create({
    doc: code.value || '',
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      history(),
      bracketMatching(),
      closeBrackets(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      python(),
      oneDark,
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...closeBracketsKeymap,
        indentWithTab
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          code.value = update.state.doc.toString()
        }
      }),
      EditorView.theme({
        '&': { height: props.height },
        '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace", fontSize: '14px' },
        '.cm-content': { padding: '16px 0' },
        '.cm-gutters': { backgroundColor: '#161b22', borderRight: '1px solid #30363d' },
      })
    ]
  })

  if (editorRef.value) {
    cmInstance = new EditorView({
      state: startState,
      parent: editorRef.value
    })
  }
}

watch(() => code.value, (val) => {
  if (cmInstance && cmInstance.state.doc.toString() !== val) {
    const current = cmInstance.state.doc.toString()
    if (current !== val) {
      cmInstance.dispatch({
        changes: { from: 0, to: cmInstance.state.doc.length, insert: val || '' }
      })
    }
  }
})

onMounted(() => {
  initEditor()
})

defineExpose({
  getValue: () => cmInstance?.state.doc.toString() || '',
  setValue: (val) => {
    if (cmInstance) {
      cmInstance.dispatch({
        changes: { from: 0, to: cmInstance.state.doc.length, insert: val }
      })
    }
  }
})
</script>

<template>
  <div class="editor-container" ref="editorRef"></div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
