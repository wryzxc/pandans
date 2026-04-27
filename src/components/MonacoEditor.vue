<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'python' },
  height: { type: String, default: '100%' },
  readOnly: { type: Boolean, default: false },
  theme: { type: String, default: 'vs-dark' },
  fontSize: { type: Number, default: 14 },
  minimap: { type: Boolean, default: true },
  wordWrap: { type: String, default: 'off' }
})

const emit = defineEmits(['update:modelValue', 'change', 'save', 'run', 'format'])

const containerRef = ref(null)
let editorInstance = null
let debounceTimer = null
const DEBOUNCE_DELAY = 300

const isEmpty = ref(true)

function updateEmptyState() {
  if (editorInstance) {
    const value = editorInstance.getValue()
    isEmpty.value = !value || value.trim().length === 0
  }
}

const editorOptions = computed(() => ({
  value: props.modelValue,
  language: props.language,
  theme: props.theme,
  readOnly: props.readOnly,
  fontSize: props.fontSize,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace",
  lineNumbers: 'on',
  minimap: { enabled: props.minimap },
  wordWrap: props.wordWrap,
  automaticLayout: true,
  scrollBeyondLastLine: true,
  scrollBeyondLastColumn: 5,
  smoothScrolling: true,
  cursorSmoothCaretAnimation: 'on',
  cursorBlinking: 'smooth',
  renderWhitespace: 'selection',
  renderControlCharacters: false,
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true,
    highlightActiveIndentation: true
  },
  folding: true,
  foldingStrategy: 'indentation',
  showFoldingControls: 'mouseover',
  matchBrackets: 'always',
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  autoSurround: 'languageDefined',
  autoIndent: 'full',
  formatOnPaste: true,
  formatOnType: true,
  tabSize: 4,
  insertSpaces: true,
  detectIndentation: true,
  suggestOnTriggerCharacters: true,
  quickSuggestions: { other: 'on', comments: 'off', strings: 'off' },
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: 'on',
  snippetSuggestions: 'top',
  wordBasedSuggestions: 'currentDocument',
  parameterHints: { enabled: true },
  hover: { enabled: true },
  definitionLinkOpensInPeek: true,
  contextmenu: true,
  mouseWheelZoom: true,
  padding: { top: 16, bottom: 16 },
  overviewRulerLanes: 3,
  hideCursorInOverviewRuler: false,
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    useShadows: false,
    verticalHasArrows: false,
    horizontalHasArrows: false
  },
  unicodeHighlight: {
    ambiguousCharacters: false,
    invisibleCharacters: false
  }
}))

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose()
    editorInstance = null
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
})

async function initEditor() {
  if (!containerRef.value) return

  monaco.editor.defineTheme('pandas-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'FF7B72' },
      { token: 'string', foreground: 'A5D6FF' },
      { token: 'number', foreground: '79C0FF' },
      { token: 'type', foreground: 'FFA657' },
      { token: 'function', foreground: 'D2A8FF' },
      { token: 'variable', foreground: 'FFA657' },
      { token: 'operator', foreground: 'FF7B72' }
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editor.lineHighlightBackground': '#161b22',
      'editorLineNumber.foreground': '#484f58',
      'editorLineNumber.activeForeground': '#c9d1d9',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#264f7855',
      'editorCursor.foreground': '#58a6ff',
      'editorBracketMatch.background': '#58a6ff22',
      'editorBracketMatch.border': '#58a6ff',
      'editorIndentGuide.background': '#21262d',
      'editorIndentGuide.activeBackground': '#484f58',
      'editor.foldBackground': '#161b2288',
      'minimap.background': '#0d1117'
    }
  })

  monaco.editor.defineTheme('pandas-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'D73A49' },
      { token: 'string', foreground: '032F62' },
      { token: 'number', foreground: '005CC5' },
      { token: 'type', foreground: 'E36209' },
      { token: 'function', foreground: '6F42C1' },
      { token: 'variable', foreground: 'E36209' },
      { token: 'operator', foreground: 'D73A49' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292e',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editorLineNumber.foreground': '#6e7781',
      'editorLineNumber.activeForeground': '#24292e',
      'editor.selectionBackground': '#0366d622',
      'editor.inactiveSelectionBackground': '#0366d611',
      'editorCursor.foreground': '#0366d6',
      'editorBracketMatch.background': '#0366d622',
      'editorBracketMatch.border': '#0366d6',
      'editorIndentGuide.background': '#e1e4e8',
      'editorIndentGuide.activeBackground': '#6e7781',
      'editor.foldBackground': '#f6f8fa88',
      'minimap.background': '#ffffff'
    }
  })

  editorInstance = monaco.editor.create(containerRef.value, {
    ...editorOptions.value,
    theme: props.theme === 'vs-dark' || props.theme === 'pandas-dark' ? 'pandas-dark' : 'pandas-light'
  })

  editorInstance.onDidChangeModelContent(() => {
    const value = editorInstance.getValue()
    updateEmptyState()
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      emit('update:modelValue', value)
      emit('change', value)
    }, DEBOUNCE_DELAY)
  })

  updateEmptyState()

  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    emit('save')
  })

  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
    formatCode()
  })

  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    emit('run')
  })

  watch(() => props.modelValue, (newVal) => {
    if (editorInstance) {
      const current = editorInstance.getValue()
      if (current !== newVal) {
        editorInstance.setValue(newVal || '')
      }
    }
    updateEmptyState()
  })

  watch(() => props.theme, (newTheme) => {
    if (editorInstance) {
      const themeName = newTheme === 'vs-dark' || newTheme === 'pandas-dark' ? 'pandas-dark' : 'pandas-light'
      monaco.editor.setTheme(themeName)
    }
  })

  watch(() => props.fontSize, (newSize) => {
    if (editorInstance) {
      editorInstance.updateOptions({ fontSize: newSize })
    }
  })

  watch(() => props.readOnly, (newVal) => {
    if (editorInstance) {
      editorInstance.updateOptions({ readOnly: newVal })
    }
  })

  watch(() => props.language, (newLang) => {
    if (editorInstance) {
      const model = editorInstance.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, newLang)
      }
    }
  })
}

function formatCode() {
  if (!editorInstance) return
  editorInstance.getAction('editor.action.formatDocument').run()
  emit('format')
}

function clearCode() {
  if (!editorInstance || props.readOnly) return
  editorInstance.setValue('')
  editorInstance.setSelection(new monaco.Selection(1, 1, 1, 1))
  editorInstance.focus()
  emit('update:modelValue', '')
  emit('change', '')
  updateEmptyState()
}

function copyCode() {
  if (editorInstance) {
    const code = editorInstance.getValue()
    navigator.clipboard.writeText(code).then(() => {
      const originalText = document.querySelector('.copy-feedback')
      if (originalText) {
        originalText.textContent = '已复制!'
        setTimeout(() => {
          originalText.textContent = '复制'
        }, 1500)
      }
    })
  }
}

function getCode() {
  return editorInstance ? editorInstance.getValue() : ''
}

function setCode(code) {
  if (editorInstance) {
    editorInstance.setValue(code)
  }
}

function focus() {
  if (editorInstance) {
    editorInstance.focus()
  }
}

function undo() {
  if (editorInstance) {
    editorInstance.trigger('keyboard', 'undo', null)
  }
}

function redo() {
  if (editorInstance) {
    editorInstance.trigger('keyboard', 'redo', null)
  }
}

function getLineCount() {
  return editorInstance ? editorInstance.getModel().getLineCount() : 0
}

defineExpose({
  getCode,
  setCode,
  formatCode,
  clearCode,
  copyCode,
  focus,
  undo,
  redo,
  getLineCount,
  getInstance: () => editorInstance
})
</script>

<template>
  <div class="monaco-editor-wrapper" :class="{ 'is-readonly': readOnly }">
    <div class="editor-status-bar">
      <div class="status-left">
        <span class="status-item">
          <span class="status-icon">📄</span>
          {{ language.toUpperCase() }}
        </span>
        <span v-if="readOnly" class="status-item read-only-badge">
          <span class="status-icon">🔒</span>
          只读模式
        </span>
        <span v-else class="status-item">
          <span class="status-icon">✏️</span>
          可编辑
        </span>
        <span class="status-item">
          <span class="status-icon">📏</span>
          {{ fontSize }}px
        </span>
      </div>
      <div class="status-right">
        <span class="status-item feedback-item copy-feedback" @click="copyCode">复制</span>
        <span class="status-item feedback-item" @click="clearCode" v-if="!readOnly">清空</span>
      </div>
    </div>
    <div ref="containerRef" class="monaco-container"></div>
    <div v-if="isEmpty && !readOnly" class="placeholder-overlay" @click="focus">
      <div class="placeholder-content">
        <div class="placeholder-icon">📝</div>
        <p class="placeholder-text">请在此输入代码并点击运行</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monaco-editor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid var(--border-color, #30363d);
  border-radius: 8px;
  overflow: hidden;
}

.monaco-editor-wrapper.is-readonly {
  border-color: var(--accent-blue, #4e8bfc);
}

.editor-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 12px;
  background: var(--bg-tertiary, #161b22);
  border-bottom: 1px solid var(--border-color, #30363d);
  font-size: 12px;
  color: var(--text-secondary, #8b949e);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-icon {
  font-size: 10px;
}

.read-only-badge {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  padding: 2px 8px;
  border-radius: 4px;
}

.feedback-item {
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.feedback-item:hover {
  background: rgba(78, 139, 252, 0.15);
  color: var(--accent-blue, #4e8bfc);
}

.monaco-container {
  flex: 1;
  min-height: 0;
}

:deep(.monaco-editor) {
  outline: none !important;
}

:deep(.monaco-editor .decorationsOverviewRuler) {
  background: transparent !important;
}

.placeholder-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  z-index: 10;
}

.placeholder-content {
  text-align: center;
  padding: 40px 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.placeholder-content:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
}

.placeholder-icon {
  font-size: 36px;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

.placeholder-text {
  font-size: 14px;
  color: var(--text-muted, #6e7781);
  font-style: italic;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.5px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}
</style>
