<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gradeCode, formatGradeResult } from '../utils/codeGrader.js'

const props = defineProps({
  code: { type: String, default: '' },
  referenceCode: { type: String, default: '' },
  project: { type: Object, default: null },
  taskCompleted: { type: Array, default: () => [] },
  allTasksComplete: { type: Boolean, default: false }
})

const emit = defineEmits(['output', 'markStepComplete'])

const outputRef = ref('')
const isRunning = ref(false)
const pyodideReady = ref(false)
const showGrading = ref(false)
const gradeResult = ref(null)
const activeReportTab = ref('overview')
const taskFeedback = ref('')

function showFeedback(msg: string) {
  taskFeedback.value = msg
  if (msg) {
    setTimeout(() => { taskFeedback.value = '' }, 8000)
  }
}

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
  showGrading.value = false
  gradeResult.value = null
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
    await pyodide.loadPackage(['pandas'])
    await pyodide.loadPackage(['numpy'])
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

    // 执行完成后进行自动评分
    performGrading(code, outputRef.value)

    emit('output', outputRef.value)
  } catch (e) {
    outputRef.value += `\n❌ 错误: ${e.message}`
    // 即使执行出错也进行评分
    performGrading(code, outputRef.value)
    emit('output', outputRef.value)
  }
}

function performGrading(userCode, output) {
  try {
    gradeResult.value = gradeCode(
      userCode,
      output,
      props.referenceCode || '',
      props.project
    )
    showGrading.value = true
  } catch (e) {
    console.error('评分失败:', e)
  }
}

function toggleGrading() {
  showGrading.value = !showGrading.value
}

function getScoreClass(score) {
  if (score >= 90) return 'score-excellent'
  if (score >= 75) return 'score-good'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

function getScoreLabel(score) {
  if (score >= 90) return '优秀'
  if (score >= 75) return '良好'
  if (score >= 60) return '及格'
  return '待改进'
}

function setReportTab(tab) {
  activeReportTab.value = tab
}

onMounted(() => {
  if (window.loadPyodide && !window.pyodideInstance) {
    ensurePyodideLoaded().catch(() => {})
  }
})

defineExpose({ runCode, showFeedback })
</script>

<template>
  <div class="preview-panel">
    <div class="preview-header">
      <span>📺 输出结果</span>
      <div class="preview-header-actions">
        <button
          v-if="outputRef && !allTasksComplete"
          class="btn btn-success btn-sm mark-done-btn"
          @click="$emit('markStepComplete')"
          title="确认当前步骤输出正确，标记为完成并跳转下一步"
        >
          ✅ 标记步骤完成
        </button>
        <button
          class="btn btn-primary btn-sm"
          @click="runCode"
          :disabled="!isValidCode || isRunning"
          :class="{ 'btn-disabled': !isValidCode || isRunning }"
        >
          {{ isRunning ? '⏳ 执行中...' : '▶ 运行' }}
        </button>
      </div>
    </div>
    <!-- Task completion feedback -->
    <div v-if="taskFeedback" class="task-feedback-banner">
      {{ taskFeedback }}
    </div>

    <div class="output-area">
      <div v-if="!outputRef" class="output-hint-box">
        <div class="hint-icon">📋</div>
        <div class="hint-title">任务指引</div>
        <div class="hint-text">将以下代码填入编辑器，点击运行。<br>输出结果将显示在此处。</div>
        <div class="hint-shortcuts">
          <span class="shortcut-key">Ctrl+Enter</span> 快速运行
        </div>
      </div>
      <pre v-else class="output-text">{{ outputRef }}</pre>
    </div>

    <!-- 自动评分面板 -->
    <div v-if="gradeResult && showGrading" class="grading-panel">
      <div class="grading-header" @click="toggleGrading">
        <div class="grading-title">
          <span>📊 代码评分报告</span>
          <span class="score-badge" :class="getScoreClass(gradeResult.score)">
            {{ gradeResult.score }}分 - {{ getScoreLabel(gradeResult.score) }}
          </span>
        </div>
        <button class="toggle-btn">{{ showGrading ? '▼' : '▶' }}</button>
      </div>

      <div class="grading-body">
        <!-- 报告标签页 -->
        <div class="report-tabs">
          <button
            class="report-tab"
            :class="{ active: activeReportTab === 'overview' }"
            @click.stop="setReportTab('overview')"
          >
            📋 总览
          </button>
          <button
            class="report-tab"
            :class="{ active: activeReportTab === 'relevance' }"
            @click.stop="setReportTab('relevance')"
          >
            🎯 项目相关性
          </button>
        </div>

        <!-- 总览标签 -->
        <div v-if="activeReportTab === 'overview'" class="report-content">
          <!-- 总分进度条 -->
          <div class="score-bar-container">
            <div class="score-bar" :style="{ width: gradeResult.score + '%', background: gradeResult.score >= 90 ? '#4ade80' : gradeResult.score >= 75 ? '#60a5fa' : gradeResult.score >= 60 ? '#fbbf24' : '#f87171' }"></div>
          </div>

          <!-- 各维度得分 -->
          <div class="dimensions">
            <div v-for="dim in gradeResult.dimensions" :key="dim.name" class="dimension-item">
              <div class="dimension-header">
                <span class="dimension-name">{{ dim.name }}</span>
                <span class="dimension-score" :class="dim.score >= dim.maxScore * 0.8 ? 'text-success' : dim.score >= dim.maxScore * 0.6 ? 'text-warning' : 'text-error'">
                  {{ dim.score }}/{{ dim.maxScore }}
                </span>
              </div>
              <div class="dimension-bar">
                <div class="dimension-bar-fill" :style="{ width: (dim.score / dim.maxScore * 100) + '%' }"></div>
              </div>
              <div class="dimension-details">
                <div v-for="(detail, idx) in dim.details" :key="idx" class="detail-item" :class="'detail-' + detail.type">
                  <span class="detail-icon">
                    {{ detail.type === 'success' ? '✓' : detail.type === 'error' ? '✗' : detail.type === 'info' ? 'ℹ' : '›' }}
                  </span>
                  <span class="detail-text">{{ detail.text }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 综合评价 -->
          <div class="summary-section">
            <div class="summary-title">💡 综合评价</div>
            <div class="summary-text">{{ gradeResult.summary }}</div>
          </div>

          <!-- 优点 -->
          <div v-if="gradeResult.feedback.length > 0" class="feedback-section">
            <div class="feedback-title">👍 优点</div>
            <ul class="feedback-list">
              <li v-for="(fb, idx) in gradeResult.feedback.slice(0, 5)" :key="idx">{{ fb }}</li>
            </ul>
          </div>

          <!-- 改进建议 -->
          <div v-if="gradeResult.suggestions.length > 0" class="suggestions-section">
            <div class="suggestions-title">🔧 改进建议</div>
            <ul class="suggestions-list">
              <li v-for="(sg, idx) in gradeResult.suggestions.slice(0, 5)" :key="idx">{{ sg }}</li>
            </ul>
          </div>
        </div>

        <!-- 项目相关性标签 -->
        <div v-else-if="activeReportTab === 'relevance'" class="report-content">
          <div v-if="gradeResult.projectRelevance" class="relevance-report">
            <!-- 项目相关性总分 -->
            <div class="relevance-score-section">
              <div class="relevance-score-header">
                <span class="relevance-score-label">项目相关性得分</span>
                <span class="relevance-score-value" :class="getScoreClass(gradeResult.projectRelevance.score)">
                  {{ gradeResult.projectRelevance.score }}/{{ gradeResult.projectRelevance.maxScore }}
                </span>
              </div>
              <div class="score-bar-container">
                <div class="score-bar" :style="{ width: (gradeResult.projectRelevance.score / gradeResult.projectRelevance.maxScore * 100) + '%', background: gradeResult.projectRelevance.score >= 12 ? '#4ade80' : gradeResult.projectRelevance.score >= 9 ? '#60a5fa' : gradeResult.projectRelevance.score >= 6 ? '#fbbf24' : '#f87171' }"></div>
              </div>
            </div>

            <!-- 项目目标对齐度 -->
            <div class="relevance-section">
              <div class="relevance-section-header">
                <span class="relevance-icon">🎯</span>
                <span class="relevance-section-title">项目目标对齐度</span>
              </div>
              <div class="relevance-section-body">
                <p class="relevance-description">
                  评估代码是否体现了项目的核心目标和关键概念。分析代码中是否使用了与项目背景、问题和意义相关的关键术语和方法。
                </p>
                <div class="relevance-items">
                  <div
                    v-for="(item, idx) in gradeResult.projectRelevance.analysis.objectiveAlignment"
                    :key="idx"
                    class="relevance-item"
                    :class="'relevance-' + item.type"
                  >
                    <span class="relevance-item-icon">
                      {{ item.type === 'success' ? '✓' : item.type === 'error' ? '✗' : '›' }}
                    </span>
                    <span class="relevance-item-text">{{ item.text }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 需求覆盖度 -->
            <div class="relevance-section">
              <div class="relevance-section-header">
                <span class="relevance-icon">📋</span>
                <span class="relevance-section-title">需求覆盖度</span>
              </div>
              <div class="relevance-section-body">
                <p class="relevance-description">
                  检查代码是否完成了项目任务清单中定义的各个核心任务，以及输出结果是否包含预期的交付物。
                </p>
                <div class="relevance-items">
                  <div
                    v-for="(item, idx) in gradeResult.projectRelevance.analysis.requirementCoverage"
                    :key="idx"
                    class="relevance-item"
                    :class="'relevance-' + item.type"
                  >
                    <span class="relevance-item-icon">
                      {{ item.type === 'success' ? '✓' : item.type === 'error' ? '✗' : '›' }}
                    </span>
                    <span class="relevance-item-text">{{ item.text }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 架构一致性 -->
            <div class="relevance-section">
              <div class="relevance-section-header">
                <span class="relevance-icon">🏗️</span>
                <span class="relevance-section-title">架构一致性</span>
              </div>
              <div class="relevance-section-body">
                <p class="relevance-description">
                  评估代码的数据处理流程是否与项目推荐的标准架构一致，以及是否采用了项目建议的技术方案。
                </p>
                <div class="relevance-items">
                  <div
                    v-for="(item, idx) in gradeResult.projectRelevance.analysis.architectureConsistency"
                    :key="idx"
                    class="relevance-item"
                    :class="'relevance-' + item.type"
                  >
                    <span class="relevance-item-icon">
                      {{ item.type === 'success' ? '✓' : item.type === 'error' ? '✗' : '›' }}
                    </span>
                    <span class="relevance-item-text">{{ item.text }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 项目影响评估 -->
            <div class="relevance-section">
              <div class="relevance-section-header">
                <span class="relevance-icon">📈</span>
                <span class="relevance-section-title">项目影响评估</span>
              </div>
              <div class="relevance-section-body">
                <p class="relevance-description">
                  分析代码对项目成功指标的贡献，包括功能完整性、输出质量和是否满足完成标准。
                </p>
                <div class="relevance-items">
                  <div
                    v-for="(item, idx) in gradeResult.projectRelevance.analysis.impactAssessment"
                    :key="idx"
                    class="relevance-item"
                    :class="'relevance-' + item.type"
                  >
                    <span class="relevance-item-icon">
                      {{ item.type === 'success' ? '✓' : item.type === 'error' ? '✗' : '›' }}
                    </span>
                    <span class="relevance-item-text">{{ item.text }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 改进建议 -->
            <div v-if="gradeResult.projectRelevance.score < 12" class="relevance-recommendations">
              <div class="relevance-section-header">
                <span class="relevance-icon">💡</span>
                <span class="relevance-section-title">提升项目相关性的建议</span>
              </div>
              <div class="relevance-section-body">
                <ul class="recommendation-list">
                  <li>仔细阅读项目背景和需求文档，确保理解项目的核心目标</li>
                  <li>对照任务清单逐一检查是否完成了所有核心功能</li>
                  <li>参考项目推荐的技术方案和数据处理流程</li>
                  <li>确保输出结果包含项目要求的交付物内容</li>
                  <li>使用项目所属领域的典型分析方法和函数</li>
                </ul>
              </div>
            </div>
          </div>

          <div v-else class="relevance-empty">
            <p>未找到项目相关性分析数据</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 评分触发按钮（当评分结果存在但面板收起时显示） -->
    <div v-else-if="gradeResult && !showGrading" class="grading-toggle-bar" @click="toggleGrading">
      <span>📊 查看评分报告</span>
      <span class="score-badge-mini" :class="getScoreClass(gradeResult.score)">
        {{ gradeResult.score }}分
      </span>
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
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: -0.1px;
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

.preview-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mark-done-btn {
  animation: pulseMark 2s infinite;
}

@keyframes pulseMark {
  0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
}

.btn-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.task-feedback-banner {
  padding: 10px 16px;
  margin: 0;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(78, 168, 222, 0.05));
  border-bottom: 1px solid rgba(74, 222, 128, 0.2);
  font-size: 13px;
  font-weight: 500;
  color: var(--accent-green);
  text-align: center;
  animation: fadeIn 0.3s ease;
  flex-shrink: 0;
}

.output-area {
  flex: 1;
  overflow: auto;
  padding: 16px 20px;
  position: relative;
  min-height: 120px;
}

.output-hint-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.hint-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.hint-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.hint-text {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
  max-width: 360px;
}

.hint-text strong {
  color: var(--accent-blue);
  font-weight: 600;
}

.hint-shortcuts {
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-muted);
}

.shortcut-key {
  display: inline-block;
  padding: 2px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent-blue);
}

.output-hint {
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  padding: 48px 20px;
  margin: 0;
  font-style: italic;
}

.output-text {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--accent-green);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  padding: 0;
}

/* 评分面板样式 */
.grading-panel {
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  max-height: 60%;
  overflow-y: auto;
  flex-shrink: 0;
}

.grading-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--bg-tertiary);
  cursor: pointer;
  user-select: none;
}

.grading-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
}

.score-badge {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
}

.score-badge-mini {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
}

.score-excellent {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.score-good {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.score-pass {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.score-fail {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

.grading-body {
  padding: 16px;
}

/* 报告标签页 */
.report-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 4px;
}

.report-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.report-tab:hover {
  color: var(--text-secondary);
}

.report-tab.active {
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 600;
}

.report-content {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.score-bar-container {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 16px;
}

.score-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.dimensions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}

.dimension-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 12px;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.dimension-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.dimension-score {
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.text-success { color: #4ade80; }
.text-warning { color: #fbbf24; }
.text-error { color: #f87171; }

.dimension-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.dimension-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
  border-radius: 2px;
  transition: width 0.5s ease;
}

.dimension-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  line-height: 1.5;
}

.detail-success { color: #4ade80; }
.detail-error { color: #f87171; }
.detail-warning { color: #fbbf24; }
.detail-info { color: #60a5fa; }

.detail-icon {
  flex-shrink: 0;
  font-size: 10px;
  margin-top: 1px;
}

.detail-text {
  color: var(--text-secondary);
}

.summary-section,
.feedback-section,
.suggestions-section {
  margin-bottom: 14px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}

.summary-title,
.feedback-title,
.suggestions-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.summary-text {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.feedback-list,
.suggestions-list {
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.feedback-list li {
  color: #4ade80;
}

.suggestions-list li {
  color: #fbbf24;
}

/* 项目相关性报告样式 */
.relevance-report {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.relevance-score-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 14px;
}

.relevance-score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.relevance-score-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.relevance-score-value {
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.relevance-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.relevance-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.relevance-icon {
  font-size: 14px;
}

.relevance-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.relevance-section-body {
  padding: 12px 14px;
}

.relevance-description {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 10px;
  margin-top: 0;
}

.relevance-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.relevance-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
}

.relevance-success {
  background: rgba(74, 222, 128, 0.08);
  color: #4ade80;
}

.relevance-warning {
  background: rgba(251, 191, 36, 0.08);
  color: #fbbf24;
}

.relevance-error {
  background: rgba(248, 113, 113, 0.08);
  color: #f87171;
}

.relevance-info {
  background: rgba(96, 165, 250, 0.08);
  color: #60a5fa;
}

.relevance-item-icon {
  flex-shrink: 0;
  font-size: 11px;
  margin-top: 1px;
}

.relevance-item-text {
  color: var(--text-secondary);
}

.relevance-recommendations {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.recommendation-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.recommendation-list li {
  margin-bottom: 4px;
}

.recommendation-list li::marker {
  color: var(--accent-blue);
}

.relevance-empty {
  padding: 32px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.grading-toggle-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.grading-toggle-bar:hover {
  background: var(--bg-secondary);
}

@media (max-width: 1024px) {
  .preview-panel {
    border-left: none;
    border-top: 1px solid var(--border-color);
  }
}
</style>
