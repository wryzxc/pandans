<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  code: { type: String, default: '' }
})

const emit = defineEmits(['output'])

const iframeRef = ref(null)
const outputRef = ref('')
const isRunning = ref(false)
const pyodideReady = ref(false)

const isValidCode = computed(() => {
  if (!props.code || typeof props.code !== 'string') return false
  const trimmed = props.code.trim()
  if (trimmed.length === 0) return false
  const noComments = trimmed.replace(/#.*$/gm, '').trim()
  return noComments.length > 0
})

async function runCode() {
  if (!isValidCode.value || isRunning.value) return
  
  isRunning.value = true
  outputRef.value = '⏳ 正在执行...\n'
  
  try {
    await ensurePyodideLoaded()
    await executeWithPyodide(props.code)
  } catch (e) {
    outputRef.value += `\n❌ 执行错误: ${e.message}`
    emit('output', outputRef.value)
  } finally {
    isRunning.value = false
  }
}

async function ensurePyodideLoaded() {
  if (window.pyodideInstance) {
    pyodideReady.value = true
    return
  }
  
  if (!window.loadPyodide) {
    await loadPyodideScript()
  }
  
  if (window.loadPyodide && !window.pyodideInstance) {
    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/'
    })
    window.pyodideInstance = pyodide
    await pyodide.loadPackage('pandas')
    await pyodide.loadPackage('numpy')
    pyodideReady.value = true
  }
}

function loadPyodideScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js'
    script.onload = resolve
    script.onerror = () => reject(new Error('Pyodide 加载失败'))
    document.head.appendChild(script)
  })
}

async function executeWithPyodide(code) {
  outputRef.value = ''
  
  try {
    const pyodide = window.pyodideInstance
    if (!pyodide) {
      outputRef.value = '❌ Python 运行环境未就绪，请稍后重试'
      emit('output', outputRef.value)
      return
    }
    
    pyodide.setStdout({
      batched: (msg) => {
        outputRef.value += msg + '\n'
      }
    })
    
    pyodide.setStderr({
      batched: (msg) => {
        outputRef.value += msg + '\n'
      }
    })
    
    await pyodide.runPythonAsync(code)
    emit('output', outputRef.value)
  } catch (e) {
    outputRef.value += `\n❌ 错误: ${e.message}`
    emit('output', outputRef.value)
  }
}

onMounted(() => {
  if (window.loadPyodide && !window.pyodideInstance) {
    ensurePyodideLoaded().catch(() => {})
  }
})

defineExpose({ runCode })
</script>

<template>
  <div class="preview-panel">
    <div class="preview-header">
      <span>📺 输出结果</span>
      <button 
        class="btn btn-primary btn-sm" 
        @click="runCode"
        :disabled="!isValidCode || isRunning"
        :class="{ 'btn-disabled': !isValidCode || isRunning }"
      >
        {{ isRunning ? '⏳ 执行中...' : '▶ 运行' }}
      </button>
    </div>
    <div class="output-area">
      <pre v-if="!isValidCode && !outputRef" class="output-hint">请输入有效的 Python 代码后点击"运行"</pre>
      <pre class="output-text">{{ outputRef }}</pre>
    </div>
  </div>
</template>

<style scoped>
.preview-panel {
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.output-area {
  flex: 1;
  overflow: auto;
  padding: 16px;
  position: relative;
}

.output-hint {
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  padding: 40px 20px;
  margin: 0;
}

.output-text {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: var(--accent-green);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
