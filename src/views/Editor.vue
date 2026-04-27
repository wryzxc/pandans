<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectById } from '../data/projects.js'
import MonacoEditor from '../components/MonacoEditor.vue'
import PreviewPanel from '../components/PreviewPanel.vue'
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

onMounted(() => {
  // 始终从空白编辑器开始，不加载任何保存的进度或默认代码
  files.value = [{
    name: 'main.py',
    content: '',
    language: 'python',
    isModified: false
  }]
  activeFileIndex.value = 0
  code.value = ''
})

onBeforeUnmount(() => {
  files.value = []
  code.value = ''
  if (editorRef.value) {
    editorRef.value.setCode('')
  }
})

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
  if (previewRef.value) {
    output.value = '⏹ 执行已停止'
  }
}

const output = ref('')
function handleOutput(text: string) {
  output.value = text
  saveProgress(projectId.value, code.value, 100, 'completed')
}

function saveCode() {
  saveProgress(projectId.value, code.value, 50, 'save')
  showCopyFeedback('代码已保存！')
}

function showCopyFeedback(msg: string) {
  copyFeedback.value = msg
  setTimeout(() => {
    copyFeedback.value = ''
  }, 2000)
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
  saveProgress(projectId.value, code.value, 100, 'completed')
  showCopyFeedback('已加载参考答案')
  
  // 确保编辑器内容更新
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
  if (editorFontSize.value < 24) {
    editorFontSize.value += 1
  }
}

function decreaseFontSize() {
  if (editorFontSize.value > 10) {
    editorFontSize.value -= 1
  }
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
</script>

<template>
  <div class="editor-page">
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
        <button class="btn btn-secondary btn-sm" @click="requestReference" title="查看参考答案">📖 参考答案</button>
      </div>
    </div>

    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="toggleTheme" :title="`切换到${themeText}主题`">
          {{ themeIcon }} {{ themeText }}
        </button>
        <button class="toolbar-btn" @click="toggleReadOnly" :title="editorReadOnly ? '切换为可编辑' : '切换为只读'">
          {{ editorReadOnly ? '🔒' : '✏️' }} {{ editorReadOnly ? '只读' : '编辑' }}
        </button>
      </div>

      <div class="toolbar-group">
        <button class="toolbar-btn" @click="decreaseFontSize" title="缩小字体">🔍-</button>
        <span class="font-size-display">{{ editorFontSize }}px</span>
        <button class="toolbar-btn" @click="increaseFontSize" title="放大字体">🔍+</button>
      </div>

      <div class="toolbar-group">
        <button class="toolbar-btn" @click="formatCode" title="格式化代码 (Ctrl+Shift+F)">🎨 格式化</button>
        <button class="toolbar-btn" @click="copyCodeToClipboard" title="复制代码">📋 复制</button>
        <button class="toolbar-btn" @click="clearCode" title="清空代码">🗑️ 清空</button>
      </div>

      <div class="toolbar-group">
        <button class="toolbar-btn" @click="toggleMinimap" :title="minimapEnabled ? '隐藏小地图' : '显示小地图'">
          {{ minimapEnabled ? '🗺️' : '🗺️❌' }}
        </button>
        <button class="toolbar-btn" @click="toggleWordWrap" :title="wordWrap === 'on' ? '关闭自动换行' : '开启自动换行'">
          {{ wordWrap === 'on' ? '↩️ 换行' : '↩️ 不换行' }}
        </button>
      </div>

      <div v-if="copyFeedback" class="toolbar-feedback">
        {{ copyFeedback }}
      </div>
    </div>

    <div v-if="showReferenceConfirm" class="modal-overlay" @click="showReferenceConfirm = false">
      <div class="modal" @click.stop>
        <h3>确认查看参考答案</h3>
        <p>查看参考答案后，本题将标记为已完成。确定继续吗？</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showReferenceConfirm = false">取消</button>
          <button class="btn btn-primary" @click="confirmReference">确认查看</button>
        </div>
      </div>
    </div>

    <div class="editor-body">
      <div class="doc-panel">
        <div class="panel-header">
          <span>📋 项目需求文档</span>
        </div>
        <div class="doc-content">
          <div v-if="project?.background" class="doc-section section-background">
            <h3 class="section-title">📌 项目背景</h3>
            <div class="sub-section">
              <h4>📖 项目起源</h4>
              <p>{{ project.background.origin }}</p>
            </div>
            <div class="sub-section">
              <h4>👥 目标受众</h4>
              <p>{{ project.background.audience }}</p>
            </div>
            <div class="sub-section">
              <h4>🏢 市场环境</h4>
              <p>{{ project.background.environment }}</p>
            </div>
            <div class="sub-section">
              <h4>⚠️ 现有问题</h4>
              <p>{{ project.background.problem }}</p>
            </div>
            <div class="sub-section">
              <h4>💎 项目意义</h4>
              <p>{{ project.background.significance }}</p>
            </div>
            <div v-if="project.background.industryData" class="sub-section highlight-box">
              <h4>📊 行业数据与政策</h4>
              <p>{{ project.background.industryData }}</p>
            </div>
          </div>

          <div v-if="project?.tasks?.length" class="doc-section section-tasks">
            <h3 class="section-title">🎯 核心任务</h3>
            <div v-for="(task, index) in project.tasks" :key="index" class="task-item">
              <div class="task-header">
                <span class="task-number">任务 {{ index + 1 }}</span>
                <span class="task-timeline">{{ task.timeline }}</span>
              </div>
              <div class="task-body">
                <p class="task-goal"><strong>实施目标：</strong>{{ task.goal }}</p>
                <p class="task-responsible"><strong>责任主体：</strong>{{ task.responsible }}</p>
                <p class="task-deliverable"><strong>关键成果：</strong>{{ task.deliverable }}</p>
              </div>
            </div>
          </div>

          <div v-if="project?.knowledge" class="doc-section section-knowledge">
            <h3 class="section-title">📚 详细知识讲解</h3>
            <div class="sub-section">
              <h4>📖 基础理论</h4>
              <p>{{ project.knowledge.theory }}</p>
            </div>
            <div class="sub-section">
              <h4>🛠️ 实践应用</h4>
              <p>{{ project.knowledge.practice }}</p>
            </div>
            <div v-if="project.knowledge.frontier" class="sub-section">
              <h4>🔬 前沿发展</h4>
              <p>{{ project.knowledge.frontier }}</p>
            </div>
          </div>

          <div v-if="project?.concepts" class="doc-section section-concepts">
            <h3 class="section-title">🔍 概念解析</h3>
            <div v-if="project.concepts.definitions" class="concept-definitions">
              <div v-for="(definition, term) in project.concepts.definitions" :key="term" class="concept-item">
                <h4>{{ term }}</h4>
                <p>{{ definition }}</p>
              </div>
            </div>
            <div v-if="project.concepts.relationships" class="sub-section highlight-box">
              <h4>🔗 概念关联</h4>
              <p>{{ project.concepts.relationships }}</p>
            </div>
          </div>

          <div v-if="project?.techPoints" class="doc-section section-tech">
            <h3 class="section-title">💡 技术要点</h3>
            <div class="sub-section">
              <h4>📋 技术选型</h4>
              <p>{{ project.techPoints.selection }}</p>
            </div>
            <div v-if="project.techPoints.parameters" class="sub-section">
              <h4>⚙️ 关键参数</h4>
              <p>{{ project.techPoints.parameters }}</p>
            </div>
            <div v-if="project.techPoints.methods" class="sub-section">
              <h4>🔧 实现方法</h4>
              <p>{{ project.techPoints.methods }}</p>
            </div>
            <div v-if="project.techPoints.risks" class="sub-section risk-box">
              <h4>⚠️ 风险与应对</h4>
              <p>{{ project.techPoints.risks }}</p>
            </div>
          </div>

          <div v-if="project?.completionCriteria" class="doc-section section-criteria">
            <h3 class="section-title">✅ 完成标准</h3>
            <div class="criteria-grid">
              <div class="criteria-item">
                <span class="criteria-icon">⚡</span>
                <span class="criteria-label">功能完整性</span>
                <p>{{ project.completionCriteria.functional }}</p>
              </div>
              <div class="criteria-item">
                <span class="criteria-icon">🚀</span>
                <span class="criteria-label">性能指标</span>
                <p>{{ project.completionCriteria.performance }}</p>
              </div>
              <div class="criteria-item">
                <span class="criteria-icon">✨</span>
                <span class="criteria-label">质量要求</span>
                <p>{{ project.completionCriteria.quality }}</p>
              </div>
              <div class="criteria-item">
                <span class="criteria-icon">🔒</span>
                <span class="criteria-label">安全规范</span>
                <p>{{ project.completionCriteria.security }}</p>
              </div>
              <div class="criteria-item">
                <span class="criteria-icon">📝</span>
                <span class="criteria-label">文档完整性</span>
                <p>{{ project.completionCriteria.documentation }}</p>
              </div>
              <div class="criteria-item">
                <span class="criteria-icon">😊</span>
                <span class="criteria-label">用户体验</span>
                <p>{{ project.completionCriteria.experience }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-panel">
        <div class="panel-header editor-panel-header">
          <div class="header-left-section">
            <span>✏️ 代码编辑器</span>
            <span class="language-tag">{{ editorLanguage.toUpperCase() }}</span>
          </div>
          <div class="header-right-section">
            <button class="toolbar-btn btn-icon" @click="addNewFile" title="新建文件">+ 新建</button>
          </div>
        </div>

        <div class="file-tabs">
          <div
            v-for="(file, index) in files"
            :key="index"
            class="file-tab"
            :class="{ active: index === activeFileIndex }"
            @click="switchFile(index)"
          >
            <span class="tab-name">
              {{ file.name }}
              <span v-if="file.isModified" class="modified-dot">●</span>
            </span>
            <button
              v-if="files.length > 1"
              class="tab-close"
              @click.stop="closeFile(index)"
              title="关闭"
            >×</button>
          </div>
        </div>

        <MonacoEditor
          v-model="code"
          ref="editorRef"
          :language="editorLanguage"
          :theme="editorTheme"
          :font-size="editorFontSize"
          :read-only="editorReadOnly"
          :minimap="minimapEnabled"
          :word-wrap="wordWrap"
          @change="updateActiveFileContent"
          @save="saveCode"
          @run="runCode"
          @format="formatCode"
        />
      </div>

      <div class="output-panel">
        <PreviewPanel :code="code" ref="previewRef" @output="handleOutput" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  padding-top: var(--nav-height);
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 52px;
  backdrop-filter: blur(8px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn {
  padding: 6px 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

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

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: 12px;
  border-right: 1px solid var(--border-color);
}

.toolbar-group:last-of-type {
  border-right: none;
  padding-right: 0;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  font-size: 12px;
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

.toolbar-btn.btn-icon {
  padding: 5px 8px;
}

.font-size-display {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 36px;
  text-align: center;
  font-weight: 500;
  font-family: var(--font-mono);
}

.toolbar-feedback {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-green);
  padding: 4px 14px;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.15);
  border-radius: var(--radius-full);
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.doc-panel {
  width: 28%;
  min-width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.editor-panel {
  width: 42%;
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
  letter-spacing: -0.1px;
}

.editor-panel-header {
  padding: 0;
}

.header-left-section,
.header-right-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
}

.header-left-section {
  flex: 1;
}

.language-tag {
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-blue-dark), var(--accent-blue));
  color: white;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  letter-spacing: 0.5px;
}

.file-tabs {
  display: flex;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  scrollbar-width: none;
}

.file-tabs::-webkit-scrollbar {
  display: none;
}

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

.file-tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

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

.tab-name {
  display: flex;
  align-items: center;
  gap: 4px;
}

.modified-dot {
  color: var(--accent-blue);
  font-size: 10px;
}

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
  transition: var(--transition-fast);
}

.tab-close:hover {
  background: rgba(248, 113, 113, 0.15);
  color: var(--accent-red);
}

.doc-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.doc-section {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.doc-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  margin-bottom: 14px;
  color: var(--accent-blue);
  font-weight: 700;
  letter-spacing: 0.2px;
}

.sub-section {
  margin-bottom: 14px;
}

.sub-section h4 {
  font-size: 13px;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-weight: 600;
}

.sub-section p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
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

.risk-box h4 {
  color: var(--accent-red) !important;
}

.task-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
  overflow: hidden;
  transition: var(--transition-fast);
}

.task-item:hover {
  border-color: var(--border-light);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(78, 168, 222, 0.04);
  border-bottom: 1px solid var(--border-color);
}

.task-number {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-blue);
}

.task-timeline {
  font-size: 11px;
  color: var(--accent-purple);
  background: rgba(192, 132, 252, 0.1);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.task-body {
  padding: 14px;
}

.task-body p {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  line-height: 1.6;
}

.task-body p:last-child {
  margin-bottom: 0;
}

.task-goal {
  font-weight: 600;
  color: var(--text-primary);
}

.concept-definitions {
  margin-bottom: 14px;
}

.concept-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 14px;
  margin-bottom: 10px;
  transition: var(--transition-fast);
}

.concept-item:hover {
  border-color: var(--border-light);
}

.concept-item h4 {
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--accent-blue);
  font-weight: 600;
}

.concept-item p {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.criteria-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.criteria-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 12px;
  display: flex;
  flex-direction: column;
  transition: var(--transition-fast);
}

.criteria-item:hover {
  border-color: var(--border-light);
}

.criteria-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.criteria-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-blue);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.criteria-item p {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 28px;
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-card-hover);
}

.modal h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.3px;
}

.modal p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .editor-body {
    flex-direction: column;
  }
  .doc-panel, .editor-panel, .output-panel {
    width: 100%;
    min-width: 0;
    height: 33.33%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  .doc-panel {
    order: 1;
  }
  .editor-panel {
    order: 2;
  }
  .output-panel {
    order: 3;
  }
  .editor-toolbar {
    gap: 8px;
    padding: 8px 16px;
  }
  .toolbar-group {
    gap: 4px;
    padding-right: 8px;
  }
}

@media (max-width: 768px) {
  .editor-header {
    padding: 8px 16px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .header-actions {
    flex-wrap: wrap;
  }
}
</style>
