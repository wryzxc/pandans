<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { projects } from '../data/projects.js'
import { getAllProgress } from '../utils/storage.js'

const router = useRouter()
const allProgress = ref(getAllProgress())

const exerciseList = computed(() => {
  return projects.map(p => {
    const progress = allProgress.value[p.id]
    return {
      ...p,
      status: progress?.status || 'not_started',
      progress: progress?.progress || 0,
      lastEdited: progress?.lastEdited || null
    }
  })
})

const stats = computed(() => {
  const total = projects.length
  const completed = exerciseList.value.filter(e => e.status === 'completed').length
  const inProgress = exerciseList.value.filter(e => e.status === 'save' || (e.status !== 'completed' && e.progress > 0)).length
  const notStarted = total - completed - inProgress
  return { total, completed, inProgress, notStarted }
})

function getBadgeText(difficulty) {
  return { beginner: '入门', basic: '基础', intermediate: '中级', advanced: '高级' }[difficulty]
}

function getStatusText(status) {
  return {
    completed: '已完成',
    save: '进行中',
    not_started: '未开始'
  }[status] || '未开始'
}

function getStatusIcon(status) {
  return {
    completed: '✅',
    save: '📝',
    not_started: '○'
  }[status] || '○'
}

function goToEditor(id) {
  router.push(`/editor/${id}`)
}

function resetProject(id) {
  if (confirm('确定要重置此项目的进度吗？')) {
    const data = JSON.parse(localStorage.getItem('pandaslab_progress') || '{}')
    delete data[id]
    localStorage.setItem('pandaslab_progress', JSON.stringify(data))
    allProgress.value = data
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '从未'
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="exercises-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">我的练习</h1>
        <p class="page-subtitle">查看你的学习进度，快速继续编写代码</p>
      </div>
    </div>

    <div class="container">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper total">
            <span class="stat-icon"></span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">总项目</span>
          </div>
        </div>
        <div class="stat-card completed">
          <div class="stat-icon-wrapper completed">
            <span class="stat-icon">✅</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.completed }}</span>
            <span class="stat-label">已完成</span>
          </div>
        </div>
        <div class="stat-card in-progress">
          <div class="stat-icon-wrapper in-progress">
            <span class="stat-icon"></span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.inProgress }}</span>
            <span class="stat-label">进行中</span>
          </div>
        </div>
        <div class="stat-card not-started">
          <div class="stat-icon-wrapper not-started">
            <span class="stat-icon">○</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.notStarted }}</span>
            <span class="stat-label">未开始</span>
          </div>
        </div>
      </div>

      <div class="exercise-list">
        <div 
          v-for="item in exerciseList" 
          :key="item.id" 
          class="exercise-item"
          :class="`status-${item.status}`"
        >
          <div class="exercise-info">
            <div class="exercise-header">
              <div class="exercise-title">
                <span class="status-icon">{{ getStatusIcon(item.status) }}</span>
                <span class="exercise-name">{{ item.name }}</span>
                <span :class="['badge', `badge-${item.difficulty}`]">{{ getBadgeText(item.difficulty) }}</span>
              </div>
              <span class="exercise-category">{{ item.category }}</span>
            </div>
            <p class="exercise-desc">{{ item.description }}</p>
            <div class="exercise-meta">
              <span class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                </svg>
                {{ formatDate(item.lastEdited) }}
              </span>
            </div>
            <div class="exercise-progress">
              <div class="progress-bar">
                <div class="progress-bar-fill" :class="`progress-${item.status}`" :style="{ width: item.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ item.progress }}%</span>
            </div>
          </div>
          <div class="exercise-actions">
            <button class="btn btn-primary" @click="goToEditor(item.id)">
              {{ item.status === 'not_started' ? '开始练习' : '继续编写' }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button v-if="item.status !== 'not_started'" class="btn btn-secondary btn-sm" @click="resetProject(item.id)">
              重置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercises-page {
  min-height: 100vh;
  padding-top: var(--nav-height);
}

.page-header {
  padding: 48px 24px 36px;
  text-align: center;
  background: linear-gradient(180deg, rgba(78, 168, 222, 0.06) 0%, transparent 100%);
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 15px;
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: var(--transition);
}

.stat-card:hover {
  border-color: var(--border-light);
  transform: translateY(-2px);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 20px;
  flex-shrink: 0;
}

.stat-icon-wrapper.total {
  background: rgba(78, 168, 222, 0.1);
  color: var(--accent-blue);
}

.stat-icon-wrapper.completed {
  background: rgba(74, 222, 128, 0.1);
  color: var(--accent-green);
}

.stat-icon-wrapper.in-progress {
  background: rgba(251, 191, 36, 0.1);
  color: var(--accent-orange);
}

.stat-icon-wrapper.not-started {
  background: rgba(90, 106, 122, 0.1);
  color: var(--text-muted);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  transition: var(--transition);
}

.exercise-item:hover {
  border-color: var(--border-light);
  box-shadow: var(--shadow-card);
}

.exercise-item.status-completed {
  border-left: 3px solid var(--accent-green);
}

.exercise-item.status-save {
  border-left: 3px solid var(--accent-blue);
}

.exercise-item.status-not_started {
  border-left: 3px solid transparent;
}

.exercise-info {
  flex: 1;
  min-width: 0;
}

.exercise-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.exercise-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-icon {
  font-size: 16px;
}

.exercise-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.exercise-category {
  font-size: 12px;
  color: var(--accent-purple);
  font-weight: 500;
}

.exercise-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 12px;
  line-height: 1.6;
}

.exercise-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.exercise-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exercise-progress .progress-bar {
  flex: 1;
  max-width: 300px;
}

.progress-bar-fill.progress-completed {
  background: linear-gradient(90deg, var(--accent-green-dark), var(--accent-green));
}

.progress-bar-fill.progress-save {
  background: linear-gradient(90deg, var(--accent-blue-dark), var(--accent-blue));
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 32px;
  text-align: right;
  font-family: var(--font-mono);
}

.exercise-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 13px;
}

.btn-primary svg {
  transition: var(--transition-fast);
}

.btn-primary:hover svg {
  transform: translateX(3px);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .exercise-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .exercise-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .exercise-actions {
    width: 100%;
  }
  .exercise-actions .btn {
    flex: 1;
  }
  .container {
    padding: 16px;
  }
  .page-header {
    padding: 32px 16px 24px;
  }
  .page-title {
    font-size: 26px;
  }
}
</style>
