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
      <h1>我的练习</h1>
      <p>查看你的学习进度，快速继续编写代码</p>
    </div>

    <div class="container">
      <div class="stats-bar">
        <div class="stat-card">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总项目</span>
        </div>
        <div class="stat-card completed">
          <span class="stat-value">{{ stats.completed }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat-card in-progress">
          <span class="stat-value">{{ stats.inProgress }}</span>
          <span class="stat-label">进行中</span>
        </div>
        <div class="stat-card not-started">
          <span class="stat-value">{{ stats.notStarted }}</span>
          <span class="stat-label">未开始</span>
        </div>
      </div>

      <div class="exercise-list">
        <div 
          v-for="item in exerciseList" 
          :key="item.id" 
          class="exercise-item"
        >
          <div class="exercise-info">
            <div class="exercise-header">
              <div class="exercise-title">
                <span class="status-icon">{{ getStatusIcon(item.status) }}</span>
                <span class="exercise-name">{{ item.name }}</span>
                <span :class="['badge', `badge-${item.difficulty}`]">{{ getBadgeText(item.difficulty) }}</span>
              </div>
              <span class="status-text" :class="`status-${item.status}`">{{ getStatusText(item.status) }}</span>
            </div>
            <p class="exercise-desc">{{ item.description }}</p>
            <div class="exercise-meta">
              <span>最后编辑: {{ formatDate(item.lastEdited) }}</span>
              <span>{{ item.category }}</span>
            </div>
            <div class="progress-bar" style="margin-top: 8px">
              <div class="progress-bar-fill" :style="{ width: item.progress + '%' }"></div>
            </div>
          </div>
          <div class="exercise-actions">
            <button class="btn btn-primary" @click="goToEditor(item.id)">
              {{ item.status === 'not_started' ? '开始练习' : '继续编写' }}
            </button>
            <button v-if="item.status !== 'not_started'" class="btn btn-danger btn-sm" @click="resetProject(item.id)">
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
  padding: 40px 24px 24px;
  text-align: center;
  background: linear-gradient(180deg, rgba(31, 111, 235, 0.06) 0%, transparent 100%);
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.page-header p {
  color: var(--text-secondary);
  font-size: 15px;
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 24px;
}

.stats-bar {
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
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.stat-card.completed .stat-value { color: var(--accent-green); }
.stat-card.in-progress .stat-value { color: var(--accent-blue); }
.stat-card.not-started .stat-value { color: var(--text-muted); }

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  transition: var(--transition);
}

.exercise-item:hover {
  border-color: var(--accent-blue);
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
}

.status-text {
  font-size: 13px;
  font-weight: 500;
}

.status-completed { color: var(--accent-green); }
.status-save { color: var(--accent-blue); }
.status-not_started { color: var(--text-muted); }

.exercise-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.exercise-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-muted);
}

.exercise-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
  .exercise-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .exercise-actions {
    width: 100%;
  }
  .exercise-actions .btn {
    flex: 1;
  }
}
</style>
