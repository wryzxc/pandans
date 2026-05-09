<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectById } from '../data/projects.js'
import MonacoEditor from '../components/MonacoEditor.vue'
import PreviewPanel from '../components/PreviewPanel.vue'
import ChapterLearning from '../components/ChapterLearning.vue'
import { saveProgress, getProgress } from '../utils/storage.js'

const route = useRoute()
const router = useRouter()
const projectId = computed(() => parseInt(route.params.id as string))
const project = computed(() => getProjectById(projectId.value))

const code = ref('')
const showReferenceConfirm = ref(false)
const previewRef = ref<InstanceType<typeof PreviewPanel> | null>(null)
const editorRef = ref<InstanceType<typeof MonacoEditor> | null>(null)

const editorTheme = ref('vs-dark')
const editorFontSize = ref(14)
const editorLanguage = ref('python')
const editorReadOnly = ref(false)
const minimapEnabled = ref(true)
const wordWrap = ref('off')

interface EditorFile {
  name: string
  content: string
  language: string
  isModified: boolean
}

const files = ref<EditorFile[]>([])
const activeFileIndex = ref(0)
const activeFile = computed(() => files.value[activeFileIndex.value] || null)

const defaultCode = computed(() => project.value?.initialCode || '')
const referenceCode = computed(() => project.value?.referenceCode || '')

const copyFeedback = ref('')

// Section collapse state — core tasks expanded by default, others collapsed
const sectionCollapsed = ref<Record<string, boolean>>({
  background: true,
  tasks: false,
  knowledge: true,
  concepts: true,
  techPoints: true,
  criteria: true
})

function toggleSection(section: string) {
  sectionCollapsed.value[section] = !sectionCollapsed.value[section]
}

// Task completion state
const taskCompleted = ref<boolean[]>([])
const criteriaCompleted = ref<Record<string, boolean>>({})
const expandedTaskIndex = ref<number | null>(null) // which task detail is expanded (click on step bar)

// Reference file view count
const referenceViewCount = ref(0)
const maxReferenceViews = 3

// Data preview state
const showDataPreview = ref(false)
const dataPreviewContent = ref('')

// Completion feedback
const completionFeedback = ref('')

function initTaskState() {
  if (project.value?.tasks) {
    const saved = getProgress(projectId.value)
    if (saved?.taskCompleted) {
      taskCompleted.value = saved.taskCompleted
    } else {
      taskCompleted.value = new Array(project.value.tasks.length).fill(false)
    }
  }
  if (project.value?.completionCriteria) {
    const saved = getProgress(projectId.value)
    if (saved?.criteriaCompleted) {
      criteriaCompleted.value = saved.criteriaCompleted
    } else {
      criteriaCompleted.value = {}
    }
  }
  // Load reference view count
  const saved = getProgress(projectId.value)
  referenceViewCount.value = saved?.referenceViewCount || 0
}

function toggleTaskComplete(index: number) {
  taskCompleted.value[index] = !taskCompleted.value[index]
  saveTaskState()
  updateCompletionFeedback()
}

// Expand a task's details when clicking the step flow bar
function expandTask(index: number) {
  expandedTaskIndex.value = expandedTaskIndex.value === index ? null : index
}

// Mark current step complete (called from output area button)
function markStepComplete() {
  const currentIdx = taskCompleted.value.findIndex(t => !t)
  if (currentIdx === -1) return // all done

  taskCompleted.value[currentIdx] = true
  saveTaskState()
  updateCompletionFeedback()

  // Auto-advance to next step
  const nextIdx = currentIdx + 1
  if (nextIdx < taskCompleted.value.length && project.value?.tasks) {
    // Load next step's example code
    const nextTask = project.value.tasks[nextIdx]
    if (nextTask.exampleCode) {
      loadTaskCode(nextTask.exampleCode)
    }
    // Expand the next task's details
    expandedTaskIndex.value = nextIdx
  } else {
    expandedTaskIndex.value = null
  }

  // Trigger celebration check
  checkAllCriteriaDone()
}

function toggleCriteriaComplete(key: string) {
  criteriaCompleted.value[key] = !criteriaCompleted.value[key]
  saveTaskState()
}

function saveTaskState() {
  const existing = getProgress(projectId.value) || {}
  saveProgress(projectId.value, code.value, allTasksComplete.value ? 100 : calcProgress(), 'in_progress', {
    taskCompleted: taskCompleted.value,
    criteriaCompleted: criteriaCompleted.value,
    referenceViewCount: referenceViewCount.value
  })
}

function updateCompletionFeedback() {
  const done = taskCompleted.value.filter(Boolean).length
  const total = taskCompleted.value.length
  if (done === total && total > 0) {
    completionFeedback.value = `🎉 全部任务完成！所有 ${total} 个任务均已标记为完成。结论报告已解锁，快去下载吧！`
  } else if (done > 0) {
    completionFeedback.value = `✅ 已完成 ${done}/${total} 个任务，继续加油！`
  } else {
    completionFeedback.value = ''
  }
  if (previewRef.value) {
    previewRef.value.showFeedback(completionFeedback.value)
  }
}

// Progress calculation
const allTasksComplete = computed(() => {
  return taskCompleted.value.length > 0 && taskCompleted.value.every(Boolean)
})

const completedTaskCount = computed(() => taskCompleted.value.filter(Boolean).length)
const totalTaskCount = computed(() => taskCompleted.value.length)

const overallProgress = computed(() => {
  let progress = 0
  if (totalTaskCount.value > 0) {
    progress += (completedTaskCount.value / totalTaskCount.value) * 70
  }
  const criteriaKeys = Object.keys(criteriaCompleted.value)
  const criteriaDone = criteriaKeys.filter(k => criteriaCompleted.value[k]).length
  if (criteriaKeys.length > 0) {
    progress += (criteriaDone / criteriaKeys.length) * 30
  } else {
    progress += allTasksComplete.value ? 30 : 0
  }
  return Math.min(100, Math.round(progress))
})

function calcProgress() {
  return overallProgress.value
}

const estimatedRemaining = computed(() => {
  const remaining = totalTaskCount.value - completedTaskCount.value
  if (remaining === 0) return '全部完成'
  const avgMinutes = 20
  return `约${remaining * avgMinutes}分钟`
})

const currentTaskIndex = computed(() => {
  const idx = taskCompleted.value.findIndex(t => !t)
  return idx === -1 ? totalTaskCount.value : idx + 1
})

// Collapse state for background sub-sections
const bgSectionCollapsed = ref<Record<string, boolean>>({
  origin: true,
  audience: true,
  environment: true,
  problem: true,
  significance: true,
  industryData: true
})

onMounted(() => {
  files.value = [{
    name: 'main.py',
    content: '',
    language: 'python',
    isModified: false
  }]
  activeFileIndex.value = 0
  code.value = ''
  initTaskState()
})

onBeforeUnmount(() => {
  files.value = []
  code.value = ''
  if (editorRef.value) {
    editorRef.value.setCode('')
  }
})

// Watch task completion to save state
watch([taskCompleted, criteriaCompleted], () => {
  saveTaskState()
}, { deep: true })

function updateActiveFileContent(content: string) {
  code.value = content
  if (activeFile.value) {
    activeFile.value.content = content
    activeFile.value.isModified = true
  }
}

function addNewFile() {
  const fileCount = files.value.length + 1
  const newFile: EditorFile = {
    name: `untitled-${fileCount}.py`,
    content: '',
    language: 'python',
    isModified: false
  }
  files.value.push(newFile)
  activeFileIndex.value = files.value.length - 1
  code.value = ''
}

function switchFile(index: number) {
  activeFileIndex.value = index
  code.value = files.value[index].content
}

function closeFile(index: number) {
  if (files.value.length <= 1) return
  files.value.splice(index, 1)
  if (activeFileIndex.value >= files.value.length) {
    activeFileIndex.value = files.value.length - 1
  }
  code.value = files.value[activeFileIndex.value].content
}

function resetCode() {
  if (confirm('确定要重置代码吗？当前进度将丢失。')) {
    code.value = ''
    if (activeFile.value) {
      activeFile.value.content = ''
      activeFile.value.isModified = false
    }
    if (editorRef.value) {
      editorRef.value.setCode('')
      editorRef.value.focus()
    }
    taskCompleted.value = new Array(project.value?.tasks?.length || 0).fill(false)
    criteriaCompleted.value = {}
    saveProgress(projectId.value, '', 0, '')
  }
}

function clearCode() {
  if (confirm('确定要清空编辑器内容吗？')) {
    code.value = ''
    if (activeFile.value) {
      activeFile.value.content = ''
      activeFile.value.isModified = true
    }
    if (editorRef.value) {
      editorRef.value.clearCode()
    }
  }
}

function runCode() {
  if (previewRef.value) {
    previewRef.value.runCode()
  }
}

function stopCode() {
  output.value = '⏹ 执行已停止'
}

const output = ref('')
function handleOutput(text: string) {
  output.value = text
  saveProgress(projectId.value, code.value, overallProgress.value, 'completed')
  autoDetectCriteria(text)
}

function saveCode() {
  saveProgress(projectId.value, code.value, overallProgress.value, 'save')
  showCopyFeedback('代码已保存！')
}

function showCopyFeedback(msg: string) {
  copyFeedback.value = msg
  setTimeout(() => { copyFeedback.value = '' }, 2000)
}

async function copyCodeToClipboard() {
  try {
    await navigator.clipboard.writeText(code.value)
    showCopyFeedback('已复制到剪贴板！')
  } catch {
    showCopyFeedback('复制失败，请手动选择复制')
  }
}

function formatCode() {
  if (editorRef.value) {
    editorRef.value.formatCode()
    showCopyFeedback('代码已格式化')
  }
}

function requestReference() {
  showReferenceConfirm.value = true
}

function confirmReference() {
  code.value = referenceCode.value
  if (activeFile.value) {
    activeFile.value.content = referenceCode.value
    activeFile.value.isModified = false
  }
  showReferenceConfirm.value = false
  referenceViewCount.value++
  saveTaskState()
  showCopyFeedback('已加载参考答案')
  if (editorRef.value) {
    editorRef.value.setCode(referenceCode.value)
  }
}

function getBadgeClass(difficulty: string | undefined) {
  return `badge badge-${difficulty}`
}

function getBadgeText(difficulty: string | undefined) {
  return { beginner: '入门', basic: '基础', intermediate: '中级', advanced: '高级' }[difficulty || 'beginner']
}

function backToProjects() {
  router.push('/projects')
}

function increaseFontSize() {
  if (editorFontSize.value < 24) editorFontSize.value += 1
}

function decreaseFontSize() {
  if (editorFontSize.value > 10) editorFontSize.value -= 1
}

function toggleTheme() {
  editorTheme.value = editorTheme.value === 'vs-dark' ? 'vs' : 'vs-dark'
}

function toggleReadOnly() {
  editorReadOnly.value = !editorReadOnly.value
}

function toggleMinimap() {
  minimapEnabled.value = !minimapEnabled.value
}

function toggleWordWrap() {
  wordWrap.value = wordWrap.value === 'off' ? 'on' : 'off'
}

const themeIcon = computed(() => editorTheme.value === 'vs-dark' ? '☀️' : '🌙')
const themeText = computed(() => editorTheme.value === 'vs-dark' ? '亮色' : '暗色')

const activeDocTab = ref('requirements')

function setDocTab(tab: string) {
  activeDocTab.value = tab
}

function handleRunDemo(demoCode: string) {
  code.value = demoCode
  if (activeFile.value) {
    activeFile.value.content = demoCode
    activeFile.value.isModified = true
  }
  if (editorRef.value) { editorRef.value.setCode(demoCode) }
  setTimeout(() => { runCode() }, 100)
}

function handleLoadCode(demoCode: string) {
  code.value = demoCode
  if (activeFile.value) {
    activeFile.value.content = demoCode
    activeFile.value.isModified = true
  }
  if (editorRef.value) { editorRef.value.setCode(demoCode) }
  showCopyFeedback('示例代码已加载到编辑器')
}

// Download dataset
function downloadDataset() {
  const initialCode = project.value?.initialCode || ''
  const blob = new Blob([initialCode], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dataset_${project.value?.name || 'data'}.py`
  a.click()
  URL.revokeObjectURL(url)
  showCopyFeedback('数据集代码已下载！')
}

// Data preview — run initial code in output area
function previewDataset() {
  if (!project.value?.initialCode) {
    showCopyFeedback('暂无数据预览代码')
    return
  }
  // Load the initial code into editor and run it
  const previewCode = project.value.initialCode
  code.value = previewCode
  if (activeFile.value) {
    activeFile.value.content = previewCode
    activeFile.value.isModified = true
  }
  if (editorRef.value) { editorRef.value.setCode(previewCode) }
  showCopyFeedback('正在加载数据预览...')
  setTimeout(() => { runCode() }, 200)
}

// Reference file download with view count
function downloadReference() {
  if (referenceViewCount.value >= maxReferenceViews) {
    showCopyFeedback(`参考文件查看次数已用完 (${maxReferenceViews}/${maxReferenceViews})`)
    return
  }
  const refCode = referenceCode.value || ''
  const blob = new Blob([refCode], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reference_${projectId.value}.py`
  a.click()
  URL.revokeObjectURL(url)
  referenceViewCount.value++
  saveTaskState()
  showCopyFeedback(`参考文件已下载 (剩余次数: ${maxReferenceViews - referenceViewCount.value})`)
}

// Report download (only when all tasks complete)
const canDownloadReport = computed(() => allTasksComplete.value)

function downloadReport() {
  if (!canDownloadReport.value) return
  const report = generateReport()
  const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report_${project.value?.name || 'analysis'}.md`
  a.click()
  URL.revokeObjectURL(url)
  showCopyFeedback('分析报告已下载！')
}

function generateReport(): string {
  const p = project.value
  let report = `# ${p?.name || '数据分析'} - 分析报告\n\n`
  report += `**难度等级**: ${getBadgeText(p?.difficulty)}\n`
  report += `**分类**: ${p?.category || ''}\n\n`
  report += `## 任务完成情况\n\n`
  p?.tasks?.forEach((t: any, i: number) => {
    report += `- [${taskCompleted.value[i] ? 'x' : ' '}] 任务${i + 1}: ${t.goal}\n`
  })
  report += `\n## 代码方案\n\n`
  report += '```python\n' + (code.value || '(未编写代码)') + '\n```\n'
  report += `\n## 完成标准\n\n`
  Object.entries(criteriaCompleted.value).forEach(([key, done]) => {
    report += `- [${done ? 'x' : ' '}] ${key}\n`
  })
  return report
}

// Copy task code
async function copyTaskCode(codeStr: string) {
  try {
    await navigator.clipboard.writeText(codeStr)
    showCopyFeedback('代码已复制！')
  } catch {
    showCopyFeedback('复制失败')
  }
}

// Load task code to editor
function loadTaskCode(codeStr: string) {
  code.value = codeStr
  if (activeFile.value) {
    activeFile.value.content = codeStr
    activeFile.value.isModified = true
  }
  if (editorRef.value) { editorRef.value.setCode(codeStr) }
  showCopyFeedback('代码已加载到编辑器')
}

// Simplified criteria descriptions
const criteriaSimpified: Record<string, { label: string; icon: string }> = {
  functional: { label: '功能完整性', icon: '⚡' },
  performance: { label: '性能指标', icon: '🚀' },
  quality: { label: '质量要求', icon: '✨' },
  security: { label: '安全规范', icon: '🔒' },
  documentation: { label: '文档完整性', icon: '📝' },
  experience: { label: '用户体验', icon: '😊' }
}

// Background section labels
const bgSections: Record<string, string> = {
  origin: '📖 项目起源',
  audience: '👥 目标受众',
  environment: '🏢 市场环境',
  problem: '⚠️ 现有问题',
  significance: '💎 项目意义',
  industryData: '📊 行业数据与政策'
}

// Concept accordion state
const expandedConcept = ref<string | null>(null)

function toggleConcept(term: string) {
  expandedConcept.value = expandedConcept.value === term ? null : term
}

function getConciseDef(def: string): string {
  const sentences = def.split(/[。；]/)
  return sentences[0] || def.slice(0, 100)
}

function getConceptFormula(term: string, def: string): string {
  const lower = def.toLowerCase()
  if (lower.includes('=') && lower.includes('/')) {
    const match = def.match(/([^。；]*=[^。；]*)/)
    if (match) return match[1].trim()
  }
  if (lower.includes('公式')) {
    const match = def.match(/公式[：:]\s*([^。；]+)/)
    if (match) return match[1].trim()
  }
  return ''
}

function getConceptFullDef(def: string): string {
  const stripped = def.replace(/^[^：:]*[：:]\s*/, '')
  return stripped || def
}

// Template code loading
function loadTemplateCode() {
  const p = project.value
  const templateLines: string[] = [
    '# 导入基础库',
    'import pandas as pd',
    'import numpy as np',
  ]

  if (p?.tags?.some((t: string) => t.includes('正则') || t.includes('str'))) {
    templateLines.push('import re')
  }
  if (p?.tags?.some((t: string) => t.includes('随机') || t.includes('K-Means'))) {
    templateLines.push('from numpy.linalg import norm')
  }
  if (p?.tags?.some((t: string) => t.includes('datetime'))) {
    templateLines.push('from datetime import datetime')
  }
  if (p?.tags?.some((t: string) => t.includes('购物篮') || t.includes('Apriori'))) {
    templateLines.push('from itertools import combinations')
  }

  templateLines.push('')
  templateLines.push(`# ${p?.name || '数据分析项目'}`)
  templateLines.push('# 请在下方编写您的代码')
  templateLines.push('')
  templateLines.push('# 1. 加载数据')
  templateLines.push('# df = pd.read_csv("data.csv")')
  templateLines.push('')
  templateLines.push('# 2. 数据预处理与清洗')
  templateLines.push('# print(df.info())')
  templateLines.push('# print(df.describe())')
  templateLines.push('')
  templateLines.push('# 3. 执行分析与建模')
  templateLines.push('')
  templateLines.push('# 4. 输出结果')
  templateLines.push('# print("分析完成!")')
  templateLines.push('')

  const template = templateLines.join('\n')
  code.value = template
  if (activeFile.value) {
    activeFile.value.content = template
    activeFile.value.isModified = true
  }
  if (editorRef.value) { editorRef.value.setCode(template) }
  showCopyFeedback('✅ 示例代码模板已加载到编辑器')
}

// Celebration state
const showCelebration = ref(false)

function checkAllCriteriaDone() {
  const keys = project.value?.completionCriteria ? Object.keys(project.value.completionCriteria) : []
  const allDone = keys.length > 0 && keys.every(k => criteriaCompleted.value[k])
  if (allDone && allTasksComplete.value && !showCelebration.value) {
    showCelebration.value = true
    setTimeout(() => { showCelebration.value = false }, 5000)
  }
}

// Watch criteria completion to trigger celebration
watch(criteriaCompleted, () => {
  checkAllCriteriaDone()
}, { deep: true })

watch(allTasksComplete, () => {
  checkAllCriteriaDone()
})

// Auto-detect criteria based on code output
function autoDetectCriteria(outputText: string) {
  const p = project.value
  if (!p?.completionCriteria || !outputText) return

  // Simple keyword-based auto-detection
  const hasNoNaN = outputText.includes('False') || outputText.includes('0') && !outputText.includes('NaN')
  const hasCompletion = outputText.includes('完成') || outputText.includes('✅')

  if (hasCompletion) {
    // Mark functional as done if output shows completion
    if (!criteriaCompleted.value['functional']) {
      criteriaCompleted.value['functional'] = true
    }
  }
  saveTaskState()
}
</script>

<template>
  <div class="editor-page">
    <!-- Top Progress Status Bar -->
    <div class="progress-status-bar">
      <div class="progress-status-inner">
        <div class="status-left">
          <span class="status-current">📌 当前任务：{{ currentTaskIndex }}/{{ totalTaskCount }}</span>
          <span class="status-divider">|</span>
          <span class="status-time">⏱ 预计剩余：{{ estimatedRemaining }}</span>
        </div>
        <div class="status-right">
          <div class="status-progress-bar">
            <div class="status-progress-fill" :style="{ width: overallProgress + '%' }"></div>
          </div>
          <span class="status-percent">{{ overallProgress }}%</span>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="editor-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm back-btn" @click="backToProjects">← 返回</button>
        <div class="project-info">
          <h2>{{ project?.name }}</h2>
          <span :class="getBadgeClass(project?.difficulty)">{{ getBadgeText(project?.difficulty) }}</span>
          <span class="project-category-tag">{{ project?.category }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary btn-sm" @click="resetCode" title="重置代码">🔄 重置</button>
        <button class="btn btn-primary btn-sm" @click="runCode" title="运行代码 (Ctrl+Enter)">▶ 运行</button>
        <button class="btn btn-success btn-sm" @click="saveCode" title="保存代码 (Ctrl+S)">💾 保存</button>
      </div>
    </div>

    <!-- Download Actions Bar -->
    <div class="download-bar">
      <button class="btn btn-primary btn-sm" @click="downloadDataset" title="下载数据集代码">
        📥 下载数据集
      </button>
      <button class="btn btn-secondary btn-sm" @click="previewDataset" title="查看数据前5行预览">
        👁️ 数据预览
      </button>
      <button
        class="btn btn-secondary btn-sm"
        @click="downloadReference"
        :title="referenceViewCount >= maxReferenceViews ? '查看次数已用完' : '下载参考文件'"
      >
        📄 参考文件
        <span class="ref-count">({{ maxReferenceViews - referenceViewCount }}/{{ maxReferenceViews }})</span>
      </button>
      <button
        class="btn btn-sm"
        :class="canDownloadReport ? 'btn-success' : 'btn-disabled'"
        @click="downloadReport"
        :title="canDownloadReport ? '下载分析报告' : '请先完成所有任务'"
      >
        📊 结论报告
        <span v-if="!canDownloadReport" class="lock-icon">🔒</span>
      </button>
    </div>

    <!-- Toolbar -->
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="toggleTheme" :title="`切换到${themeText}主题`">
          {{ themeIcon }} {{ themeText }}
        </button>
        <button class="toolbar-btn" @click="toggleReadOnly" :title="editorReadOnly ? '切换为可编辑' : '切换为只读'">
          {{ editorReadOnly ? '🔒 只读' : '✏️ 编辑' }}
        </button>
      </div>
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="decreaseFontSize" title="缩小字体">🔍-</button>
        <span class="font-size-display">{{ editorFontSize }}px</span>
        <button class="toolbar-btn" @click="increaseFontSize" title="放大字体">🔍+</button>
      </div>
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="formatCode" title="格式化代码">🎨 格式化</button>
        <button class="toolbar-btn" @click="copyCodeToClipboard" title="复制代码">📋 复制</button>
        <button class="toolbar-btn" @click="clearCode" title="清空代码">🗑️ 清空</button>
      </div>
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="toggleMinimap" title="切换小地图">🗺️</button>
        <button class="toolbar-btn" @click="toggleWordWrap" title="切换自动换行">{{ wordWrap === 'on' ? '↩️' : '↩️' }}</button>
      </div>
      <div v-if="copyFeedback" class="toolbar-feedback">{{ copyFeedback }}</div>
    </div>

    <!-- Reference Confirm Modal -->
    <div v-if="showReferenceConfirm" class="modal-overlay" @click="showReferenceConfirm = false">
      <div class="modal" @click.stop>
        <h3>确认查看参考答案</h3>
        <p>查看参考答案后，剩余查看次数将减少（剩余：{{ maxReferenceViews - referenceViewCount }}次）。确定继续吗？</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showReferenceConfirm = false">取消</button>
          <button class="btn btn-primary" @click="confirmReference">确认查看</button>
        </div>
      </div>
    </div>

    <!-- Data Preview Modal -->
    <div v-if="showDataPreview" class="modal-overlay" @click="showDataPreview = false">
      <div class="modal preview-modal" @click.stop>
        <h3>📊 数据预览</h3>
        <p class="preview-hint">以下是数据集代码的前30行预览，可帮助您确认数据格式：</p>
        <pre class="preview-content"><code>{{ dataPreviewContent }}</code></pre>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDataPreview = false">关闭</button>
          <button class="btn btn-primary" @click="downloadDataset(); showDataPreview = false">📥 下载数据</button>
        </div>
      </div>
    </div>

    <!-- Main Body -->
    <div class="editor-body">
      <!-- Left Document Panel -->
      <div class="doc-panel">
        <div class="panel-header doc-panel-tabs">
          <button
            class="doc-tab" :class="{ active: activeDocTab === 'requirements' }"
            @click="setDocTab('requirements')"
          >📋 项目需求</button>
          <button
            v-if="project?.chapterLearning?.length"
            class="doc-tab" :class="{ active: activeDocTab === 'learning' }"
            @click="setDocTab('learning')"
          >📖 章节学习<span class="tab-badge">{{ project.chapterLearning.length }}</span></button>
        </div>

        <!-- Requirements Content -->
        <div v-if="activeDocTab === 'requirements'" class="doc-content">
          <!-- 1. Background (default collapsed) -->
          <div v-if="project?.background" class="doc-section">
            <div class="section-collapse-header" :class="{ collapsed: sectionCollapsed.background }" @click="toggleSection('background')">
              <span class="collapse-arrow">{{ sectionCollapsed.background ? '▶' : '▼' }}</span>
              <span class="section-label">📌 项目背景</span>
              <span class="section-badge">背景信息</span>
            </div>
            <div v-if="!sectionCollapsed.background" class="section-body">
              <p class="bg-desc">{{ project.background.description }}</p>
              <div v-for="(label, key) in bgSections" :key="key" class="bg-sub-section">
                <div class="bg-sub-header" @click="bgSectionCollapsed[key] = !bgSectionCollapsed[key]">
                  <span class="collapse-arrow small">{{ bgSectionCollapsed[key] ? '▶' : '▼' }}</span>
                  <span>{{ label }}</span>
                </div>
                <p v-if="!bgSectionCollapsed[key]" class="bg-sub-text">{{ project.background[key as keyof typeof project.background] }}</p>
              </div>
            </div>
          </div>

          <!-- 2. Core Tasks (compact overview mode) -->
          <div v-if="project?.tasks?.length" class="doc-section section-tasks-expanded">
            <div class="section-collapse-header tasks-header" @click="toggleSection('tasks')">
              <span class="collapse-arrow">{{ sectionCollapsed.tasks ? '▶' : '▼' }}</span>
              <span class="section-label">🎯 核心任务</span>
              <span class="section-badge active">{{ completedTaskCount }}/{{ totalTaskCount }}</span>
            </div>

            <!-- Step Flow Bar (always visible as compact overview) -->
            <div class="step-flow-bar">
              <div
                v-for="(task, index) in project.tasks"
                :key="'step-' + index"
                class="step-bar-node"
                :class="{
                  'bar-done': taskCompleted[index],
                  'bar-active': !taskCompleted[index] && (index === 0 || taskCompleted[index - 1]),
                  'bar-pending': !taskCompleted[index] && !(index === 0 || taskCompleted[index - 1]),
                  'bar-selected': expandedTaskIndex === index
                }"
                @click="expandTask(index)"
              >
                <div class="bar-indicator">
                  <span v-if="taskCompleted[index]" class="bar-check">✓</span>
                  <span v-else class="bar-num">{{ index + 1 }}</span>
                </div>
                <div v-if="index < project.tasks.length - 1" class="bar-connector" :class="{ 'bar-conn-done': taskCompleted[index] }"></div>
              </div>
            </div>

            <!-- Expanded Task Detail (shown when user clicks a step) -->
            <div v-if="expandedTaskIndex !== null && project.tasks[expandedTaskIndex]" class="task-detail-toast">
              <div class="toast-header">
                <span class="toast-step">步骤 {{ expandedTaskIndex + 1 }}</span>
                <span class="task-status-tag" :class="{
                  'tag-done': taskCompleted[expandedTaskIndex],
                  'tag-active': !taskCompleted[expandedTaskIndex] && (expandedTaskIndex === 0 || taskCompleted[expandedTaskIndex - 1]),
                  'tag-pending': !taskCompleted[expandedTaskIndex] && !(expandedTaskIndex === 0 || taskCompleted[expandedTaskIndex - 1])
                }">
                  {{ taskCompleted[expandedTaskIndex] ? '已完成' : (!taskCompleted[expandedTaskIndex] && (expandedTaskIndex === 0 || taskCompleted[expandedTaskIndex - 1]) ? '进行中' : '未开始') }}
                </span>
                <span class="toast-timeline">{{ project.tasks[expandedTaskIndex].timeline }}</span>
                <button class="toast-close" @click="expandedTaskIndex = null">×</button>
              </div>
              <div class="toast-body">
                <p class="task-goal"><strong>目标：</strong>{{ project.tasks[expandedTaskIndex].goal }}</p>
                <p class="task-meta"><strong>负责人：</strong>{{ project.tasks[expandedTaskIndex].responsible }} &nbsp;|&nbsp; <strong>成果：</strong>{{ project.tasks[expandedTaskIndex].deliverable }}</p>
                <div class="toast-actions">
                  <label class="task-checkbox" @click.stop="toggleTaskComplete(expandedTaskIndex)">
                    <input type="checkbox" :checked="taskCompleted[expandedTaskIndex]" @change="toggleTaskComplete(expandedTaskIndex)" />
                    <span class="checkmark" :class="{ checked: taskCompleted[expandedTaskIndex] }">{{ taskCompleted[expandedTaskIndex] ? '✓' : '' }}</span>
                    <span class="check-label">{{ taskCompleted[expandedTaskIndex] ? '已标记完成' : '标记为完成' }}</span>
                  </label>
                </div>
                <div class="task-code-block" v-if="project.tasks[expandedTaskIndex].exampleCode">
                  <div class="task-code-header">
                    <span>💡 关键代码</span>
                    <div class="task-code-actions">
                      <button class="mini-btn" @click="copyTaskCode(project.tasks[expandedTaskIndex].exampleCode)" title="复制代码">📋</button>
                      <button class="mini-btn" @click="loadTaskCode(project.tasks[expandedTaskIndex].exampleCode)" title="加载到编辑器">✏️</button>
                    </div>
                  </div>
                  <pre class="task-code-content"><code>{{ project.tasks[expandedTaskIndex].exampleCode }}</code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Knowledge (default collapsed) -->
          <div v-if="project?.knowledge" class="doc-section">
            <div class="section-collapse-header" :class="{ collapsed: sectionCollapsed.knowledge }" @click="toggleSection('knowledge')">
              <span class="collapse-arrow">{{ sectionCollapsed.knowledge ? '▶' : '▼' }}</span>
              <span class="section-label">📚 知识讲解</span>
            </div>
            <div v-if="!sectionCollapsed.knowledge" class="section-body">
              <div class="sub-section">
                <h4>📖 基础理论</h4>
                <p>{{ project.knowledge.theory }}</p>
              </div>
              <div class="sub-section">
                <h4>🛠️ 实践应用</h4>
                <p>{{ project.knowledge.practice }}</p>
              </div>
            </div>
          </div>

          <!-- 4. Concepts - Individual accordion dropdowns -->
          <div v-if="project?.concepts" class="doc-section">
            <div class="section-collapse-header" :class="{ collapsed: sectionCollapsed.concepts }" @click="toggleSection('concepts')">
              <span class="collapse-arrow">{{ sectionCollapsed.concepts ? '▶' : '▼' }}</span>
              <span class="section-label">🔍 概念解析</span>
              <span class="section-badge">{{ Object.keys(project.concepts.definitions).length }} 个概念</span>
            </div>
            <div v-if="!sectionCollapsed.concepts" class="section-body">
              <div
                v-for="(definition, term) in project.concepts.definitions"
                :key="term"
                class="concept-item"
                :class="{ 'concept-open': expandedConcept === term }"
              >
                <div class="concept-item-header" @click="toggleConcept((term as string))">
                  <span class="concept-toggle-icon">{{ expandedConcept === term ? '▾' : '▸' }}</span>
                  <h4>{{ term }}</h4>
                  <span class="concept-badge">点击查看详情</span>
                </div>
                <div v-if="expandedConcept === term" class="concept-item-body">
                  <div class="concept-full-def">{{ getConceptFullDef(project.concepts.definitions[term]) }}</div>
                  <div v-if="getConceptFormula((term as string), project.concepts.definitions[term])" class="concept-formula">
                    <span class="formula-label">📐 公式</span>
                    <code>{{ getConceptFormula((term as string), project.concepts.definitions[term]) }}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Tech Points (default collapsed) -->
          <div v-if="project?.techPoints" class="doc-section">
            <div class="section-collapse-header" :class="{ collapsed: sectionCollapsed.techPoints }" @click="toggleSection('techPoints')">
              <span class="collapse-arrow">{{ sectionCollapsed.techPoints ? '▶' : '▼' }}</span>
              <span class="section-label">💡 技术要点</span>
            </div>
            <div v-if="!sectionCollapsed.techPoints" class="section-body">
              <div class="sub-section">
                <h4>📋 技术选型</h4>
                <p>{{ project.techPoints.selection }}</p>
              </div>
            </div>
          </div>

          <!-- 6. Completion Criteria (interactive checkboxes) -->
          <div v-if="project?.completionCriteria" class="doc-section">
            <div class="section-collapse-header" :class="{ collapsed: sectionCollapsed.criteria }" @click="toggleSection('criteria')">
              <span class="collapse-arrow">{{ sectionCollapsed.criteria ? '▶' : '▼' }}</span>
              <span class="section-label">✅ 完成标准</span>
              <span class="section-badge">{{ Object.values(criteriaCompleted).filter(Boolean).length }}/{{ Object.keys(project.completionCriteria).length }}</span>
            </div>
            <div v-if="!sectionCollapsed.criteria" class="section-body">
              <div v-for="(desc, key) in project.completionCriteria" :key="key" class="criteria-check-item" @click="toggleCriteriaComplete(key as string)">
                <span class="criteria-checkbox" :class="{ checked: criteriaCompleted[key as string] }">
                  {{ criteriaCompleted[key as string] ? '✓' : '' }}
                </span>
                <span class="criteria-icon">{{ criteriaSimpified[key as string]?.icon || '📌' }}</span>
                <div class="criteria-info">
                  <span class="criteria-label">{{ criteriaSimpified[key as string]?.label || key }}</span>
                  <span class="criteria-desc">{{ (desc as string) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapter Learning Content -->
        <div v-else-if="activeDocTab === 'learning'" class="doc-content">
          <ChapterLearning
            :chapters="project?.chapterLearning || []"
            @run-demo="handleRunDemo"
            @load-code="handleLoadCode"
          />
        </div>
      </div>

      <!-- Editor Panel -->
      <div class="editor-panel">
        <div class="panel-header editor-panel-header">
          <div class="header-left-section">
            <span>✏️ 代码编辑器</span>
            <span class="language-tag">{{ editorLanguage.toUpperCase() }}</span>
          </div>
          <div class="header-right-section">
            <button class="btn btn-template" @click="loadTemplateCode" title="加载包含基础库导入和代码框架的模板">
              📋 载入示例代码
            </button>
            <button class="toolbar-btn btn-icon" @click="addNewFile" title="新建文件">+ 新建</button>
          </div>
        </div>

        <div class="file-tabs">
          <div
            v-for="(file, index) in files" :key="index"
            class="file-tab" :class="{ active: index === activeFileIndex }"
            @click="switchFile(index)"
          >
            <span class="tab-name">
              {{ file.name }}
              <span v-if="file.isModified" class="modified-dot">●</span>
            </span>
            <button v-if="files.length > 1" class="tab-close" @click.stop="closeFile(index)" title="关闭">×</button>
          </div>
        </div>

        <MonacoEditor
          v-model="code" ref="editorRef"
          :language="editorLanguage" :theme="editorTheme"
          :font-size="editorFontSize" :read-only="editorReadOnly"
          :minimap="minimapEnabled" :word-wrap="wordWrap"
          @change="updateActiveFileContent" @save="saveCode" @run="runCode" @format="formatCode"
        />
      </div>

      <!-- Output Panel -->
      <div class="output-panel">
        <PreviewPanel
          :code="code" :reference-code="referenceCode" :project="project"
          :task-completed="taskCompleted" :all-tasks-complete="allTasksComplete"
          ref="previewRef" @output="handleOutput" @mark-step-complete="markStepComplete"
        />
      </div>
    </div>

    <!-- Celebration Overlay -->
    <Teleport to="body">
      <div v-if="showCelebration" class="celebration-overlay" @click="showCelebration = false">
        <div class="celebration-card">
          <div class="celebration-emoji">🎉</div>
          <h2>恭喜完成全部任务！</h2>
          <p>所有任务和完成标准均已通过验证</p>
          <div class="celebration-stats">
            <div class="celebration-stat">
              <span class="stat-value">{{ totalTaskCount }}/{{ totalTaskCount }}</span>
              <span class="stat-label">核心任务</span>
            </div>
            <div class="celebration-stat">
              <span class="stat-value">100%</span>
              <span class="stat-label">完成度</span>
            </div>
            <div class="celebration-stat">
              <span class="stat-value">🏆</span>
              <span class="stat-label">成就达成</span>
            </div>
          </div>
          <button class="btn btn-primary" @click="showCelebration = false">👍 继续学习</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  padding-top: var(--nav-height);
  overflow: hidden;
}

/* === Progress Status Bar === */
.progress-status-bar {
  background: linear-gradient(135deg, rgba(78, 168, 222, 0.08), rgba(192, 132, 252, 0.06));
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  height: 36px;
  flex-shrink: 0;
}

.progress-status-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 100%;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 500;
}

.status-current { color: var(--accent-blue); }
.status-divider { color: var(--border-light); }
.status-time { color: var(--text-secondary); }

.status-right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
}

.status-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.status-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue-dark), var(--accent-blue));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.status-percent {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-blue);
  font-family: var(--font-mono);
  min-width: 36px;
  text-align: right;
}

/* === Header === */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 44px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn { padding: 5px 10px; font-size: 12px; }

.project-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.project-info h2 {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.project-category-tag {
  font-size: 12px;
  color: var(--accent-purple);
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-sm { padding: 5px 12px; font-size: 12px; font-weight: 500; }

/* === Download Bar === */
.download-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.download-bar .btn {
  flex-shrink: 0;
}

.btn-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.ref-count {
  font-size: 10px;
  opacity: 0.7;
}

.lock-icon { font-size: 11px; margin-left: 4px; }

/* === Toolbar === */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 20px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 8px;
  border-right: 1px solid var(--border-color);
}

.toolbar-group:last-of-type { border-right: none; padding-right: 0; }

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: rgba(78, 168, 222, 0.08);
  color: var(--accent-blue);
}

.toolbar-btn.btn-icon { padding: 4px 6px; }

.font-size-display {
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 32px;
  text-align: center;
  font-weight: 500;
  font-family: var(--font-mono);
}

.toolbar-feedback {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-green);
  padding: 3px 12px;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.15);
  border-radius: var(--radius-full);
  animation: fadeIn 0.25s ease;
}

/* === Editor Body === */
.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.doc-panel {
  width: 30%;
  min-width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.editor-panel {
  width: 40%;
  min-width: 380px;
  display: flex;
  flex-direction: column;
}

.output-panel {
  flex: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

.editor-panel-header { padding: 0; }

.header-left-section,
.header-right-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
}

.header-left-section { flex: 1; }

.language-tag {
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-blue-dark), var(--accent-blue));
  color: white;
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

/* === File Tabs === */
.file-tabs {
  display: flex;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}

.file-tabs::-webkit-scrollbar { display: none; }

.file-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
  position: relative;
}

.file-tab:hover { background: var(--bg-tertiary); color: var(--text-secondary); }

.file-tab.active {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.file-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: var(--accent-blue);
  border-radius: 1px 1px 0 0;
}

.tab-name { display: flex; align-items: center; gap: 4px; }
.modified-dot { color: var(--accent-blue); font-size: 10px; }

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 14px;
  line-height: 1;
  background: transparent;
  border: none;
  border-radius: 3px;
  color: var(--text-muted);
  cursor: pointer;
}

.tab-close:hover { background: rgba(248, 113, 113, 0.15); color: var(--accent-red); }

/* === Doc Content === */
.doc-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.doc-section {
  margin-bottom: 8px;
}

/* Section Collapse Header */
.section-collapse-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.section-collapse-header:hover {
  border-color: var(--border-light);
  background: var(--bg-card-hover);
}

.section-collapse-header.collapsed {
  opacity: 0.7;
}

.collapse-arrow {
  font-size: 10px;
  color: var(--text-muted);
  width: 14px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.section-badge {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: rgba(139, 148, 158, 0.15);
  color: var(--text-muted);
  font-weight: 500;
}

.section-badge.active {
  background: rgba(74, 222, 128, 0.15);
  color: var(--accent-green);
}

/* Tasks header highlight */
.tasks-header {
  background: linear-gradient(135deg, rgba(78, 168, 222, 0.1), rgba(192, 132, 252, 0.06));
  border-color: rgba(78, 168, 222, 0.2);
}

.tasks-header .section-label {
  font-weight: 700;
  color: var(--accent-blue);
}

/* Section body */
.section-body {
  padding: 12px 0 12px 24px;
  animation: slideDown 0.25s ease;
}

.section-body p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 8px;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Background sub-sections */
.bg-desc {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.bg-desc h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.bg-desc p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.bg-sub-section {
  margin-bottom: 4px;
}

.bg-sub-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  border-radius: 4px;
  transition: background 0.15s;
}

.bg-sub-header:hover { background: var(--bg-tertiary); }

.bg-sub-text {
  padding: 6px 10px 6px 26px;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
}

.collapse-arrow.small {
  font-size: 8px;
  width: 10px;
}

/* Task Cards */
.task-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
  overflow: hidden;
  transition: var(--transition-fast);
}

.task-card:hover { border-color: var(--border-light); }

.task-card.task-done {
  opacity: 0.5;
}

.task-card.task-done .task-checkbox .checkmark {
  background: var(--accent-green);
  border-color: var(--accent-green);
}

.task-card.task-current {
  border-color: var(--accent-blue);
  box-shadow: 0 0 12px rgba(78, 168, 222, 0.1);
}

.task-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(78, 168, 222, 0.04);
  border-bottom: 1px solid var(--border-color);
}

.task-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.task-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-light);
  border-radius: 4px;
  font-size: 12px;
  color: white;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.checkmark.checked {
  background: var(--accent-green);
  border-color: var(--accent-green);
}

.task-checkbox:hover .checkmark {
  border-color: var(--accent-blue);
}

.task-number {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-blue);
  flex: 1;
}

.task-estimate {
  font-size: 11px;
  color: var(--accent-purple);
  background: rgba(192, 132, 252, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.task-card-body {
  padding: 10px 12px;
}

.task-card-body p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.6;
}

.task-goal { font-weight: 600; color: var(--text-primary); }

.task-meta {
  font-size: 11px;
  color: var(--text-muted);
}

/* Task inline code */
.task-code-block {
  margin-top: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.task-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px;
  background: var(--bg-tertiary);
  font-size: 11px;
  color: var(--text-muted);
}

.task-code-actions {
  display: flex;
  gap: 2px;
}

.mini-btn {
  padding: 2px 6px;
  font-size: 11px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.mini-btn:hover {
  background: rgba(78, 168, 222, 0.1);
  color: var(--accent-blue);
}

.task-code-content {
  margin: 0;
  padding: 10px 12px;
  background: var(--bg-primary);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

/* Criteria Checklist */
.criteria-check-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.criteria-check-item:hover { border-color: var(--border-light); background: var(--bg-card-hover); }

.criteria-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-light);
  border-radius: 5px;
  flex-shrink: 0;
  font-size: 13px;
  color: white;
  transition: var(--transition-fast);
  margin-top: 1px;
}

.criteria-checkbox.checked {
  background: var(--accent-green);
  border-color: var(--accent-green);
}

.criteria-icon {
  font-size: 14px;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.criteria-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.criteria-info .criteria-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.3px;
}

.criteria-info .criteria-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Concept items - Accordion dropdown style */
.concept-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.concept-item:hover {
  border-color: rgba(78, 168, 222, 0.3);
}

.concept-item.concept-open {
  border-color: var(--accent-blue);
  box-shadow: 0 0 12px rgba(78, 168, 222, 0.08);
}

.concept-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.concept-item-header:hover {
  background: var(--bg-tertiary);
}

.concept-item-header h4 {
  font-size: 14px;
  color: var(--accent-blue);
  font-weight: 600;
  flex: 1;
  margin: 0;
}

.concept-toggle-icon {
  font-size: 12px;
  color: var(--text-muted);
  width: 16px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.concept-badge {
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0;
  transform: translateX(4px);
  transition: all 0.2s ease;
}

.concept-item-header:hover .concept-badge {
  opacity: 1;
  transform: translateX(0);
}

.concept-item-body {
  padding: 0 14px 14px 38px;
  animation: conceptSlideIn 0.3s ease;
}

@keyframes conceptSlideIn {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 600px;
    transform: translateY(0);
  }
}

.concept-full-def {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 10px;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--accent-blue);
}

.concept-formula {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(74, 222, 128, 0.06);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: var(--radius-sm);
  margin-bottom: 4px;
}

.formula-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-green);
  flex-shrink: 0;
}

.concept-formula code {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent-green);
  background: transparent;
  padding: 0;
}

/* Doc tabs */
.doc-panel-tabs {
  display: flex;
  padding: 0;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.doc-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}

.doc-tab:hover { color: var(--text-secondary); background: var(--bg-secondary); }

.doc-tab.active { color: var(--text-primary); background: var(--bg-secondary); }

.doc-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: var(--accent-blue);
  border-radius: 1px 1px 0 0;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--accent-blue);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: var(--radius-full);
}

/* === Modal === */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 28px;
  max-width: 440px;
  width: 90%;
  box-shadow: var(--shadow-card-hover);
}

.modal h3 { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.modal p { color: var(--text-secondary); font-size: 14px; margin-bottom: 20px; line-height: 1.6; }

.modal-actions { display: flex; gap: 12px; justify-content: flex-end; }

.preview-modal { max-width: 640px; }
.preview-hint { font-size: 13px; margin-bottom: 12px; }

.preview-content {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.highlight-box {
  background: rgba(78, 168, 222, 0.06);
  border: 1px solid rgba(78, 168, 222, 0.15);
  border-radius: var(--radius-sm);
  padding: 14px;
}

.risk-box {
  background: rgba(248, 113, 113, 0.06);
  border: 1px solid rgba(248, 113, 113, 0.15);
  border-radius: var(--radius-sm);
  padding: 14px;
}

.risk-box h4 { color: var(--accent-red) !important; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(78, 168, 222, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(78, 168, 222, 0); }
}

@keyframes celebrationIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* Sub section */
.sub-section {
  margin-bottom: 12px;
}

.sub-section h4 {
  font-size: 13px;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-weight: 600;
}

/* Doc tabs */
/* === Compact Step Flow Bar === */
.step-flow-bar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  gap: 0;
}

.step-bar-node {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
  cursor: pointer;
}

.bar-indicator {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.25s ease;
  z-index: 1;
  flex-shrink: 0;
}

.bar-check {
  font-size: 14px;
}

.bar-num {
  font-size: 13px;
}

.bar-done .bar-indicator {
  background: var(--accent-green);
  color: white;
  box-shadow: 0 2px 8px rgba(74, 222, 128, 0.3);
}

.bar-active .bar-indicator {
  background: var(--accent-blue);
  color: white;
  animation: pulse 2s infinite;
  box-shadow: 0 2px 12px rgba(78, 168, 222, 0.4);
}

.bar-pending .bar-indicator {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 2px solid var(--border-color);
}

.bar-selected .bar-indicator {
  transform: scale(1.15);
  box-shadow: 0 0 16px rgba(78, 168, 222, 0.5);
}

.bar-connector {
  flex: 1;
  height: 2px;
  background: var(--border-color);
  margin: 0 2px;
}

.bar-conn-done {
  background: var(--accent-green);
}

/* === Task Detail Toast === */
.task-detail-toast {
  margin: 4px 12px 12px;
  background: var(--bg-card);
  border: 1px solid rgba(78, 168, 222, 0.25);
  border-radius: var(--radius-md);
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

.toast-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(78, 168, 222, 0.06);
  border-bottom: 1px solid var(--border-color);
}

.toast-step {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-blue);
}

.toast-timeline {
  font-size: 11px;
  color: var(--accent-purple);
  background: rgba(192, 132, 252, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
  margin-left: auto;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: var(--transition-fast);
}

.toast-close:hover { background: rgba(248, 113, 113, 0.1); color: var(--accent-red); }

.toast-body {
  padding: 12px 14px;
}

.toast-body .task-goal {
  font-size: 12px;
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.5;
}

.toast-body .task-meta {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.toast-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 10px;
}

.check-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* === Template Button === */
.btn-template {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(192, 132, 252, 0.15), rgba(78, 168, 222, 0.1));
  border: 1px solid rgba(192, 132, 252, 0.3);
  color: var(--accent-purple);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-template:hover {
  background: linear-gradient(135deg, rgba(192, 132, 252, 0.25), rgba(78, 168, 222, 0.15));
  border-color: var(--accent-purple);
  color: #c084fc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(192, 132, 252, 0.2);
}

/* === Task Status Tags === */
.task-status-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.tag-done {
  background: rgba(74, 222, 128, 0.15);
  color: var(--accent-green);
}

.tag-active {
  background: rgba(78, 168, 222, 0.15);
  color: var(--accent-blue);
  animation: pulse 2s infinite;
}

.tag-pending {
  background: rgba(139, 148, 158, 0.1);
  color: var(--text-muted);
}

/* === Celebration Overlay === */
.celebration-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
  animation: fadeIn 0.3s ease;
}

.celebration-card {
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: var(--radius-xl);
  padding: 40px 48px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 222, 128, 0.15);
  animation: celebrationIn 0.5s ease;
  max-width: 440px;
}

.celebration-emoji {
  font-size: 64px;
  animation: bounceIn 0.6s ease 0.1s both;
  margin-bottom: 16px;
}

.celebration-card h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.celebration-card > p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.celebration-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 28px;
}

.celebration-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--accent-green);
  font-family: var(--font-mono);
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* === Responsive === */
@media (max-width: 1024px) {
  .editor-body { flex-direction: column; }
  .doc-panel, .editor-panel, .output-panel {
    width: 100%;
    min-width: 0;
    height: 33.33%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  .download-bar { flex-wrap: wrap; }
  .concept-item-body {
    padding: 0 10px 12px 28px;
  }
  .concept-item-header {
    padding: 8px 10px;
  }
  .concept-item-header h4 {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .editor-header { padding: 8px 16px; flex-wrap: wrap; gap: 10px; }
  .header-actions { flex-wrap: wrap; }
  .progress-status-bar { padding: 0 12px; }
  .download-bar { padding: 8px 12px; }
  .concept-badge { display: none; }
  .concept-item-header { padding: 8px 10px; }
  .concept-item-header h4 { font-size: 13px; }
  .concept-item-body { padding: 0 10px 10px 24px; }
  .concept-full-def { font-size: 12px; line-height: 1.7; }
}
</style>
