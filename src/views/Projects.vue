<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { projects, categories } from '../data/projects.js'

const router = useRouter()
const route = useRoute()

const activeCategory = ref(route.query.category || 'all')
const searchQuery = ref('')

const filteredProjects = computed(() => {
  let result = projects
  if (activeCategory.value !== 'all') {
    result = result.filter(p => p.difficulty === activeCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  return result
})

function goToEditor(id) {
  router.push(`/editor/${id}`)
}

function getBadgeClass(difficulty) {
  return `badge badge-${difficulty}`
}

function getBadgeText(difficulty) {
  return { beginner: '入门', basic: '基础', intermediate: '中级', advanced: '高级' }[difficulty]
}
</script>

<template>
  <div class="projects-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">项目广场</h1>
        <p class="page-subtitle">选择你的学习路径，从入门到高级，逐步提升 Pandas 技能</p>
      </div>
    </div>
    
    <div class="projects-layout container">
      <aside class="sidebar">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索项目名称或关键词..." 
            class="search-input"
          />
        </div>
        <nav class="category-nav">
          <button 
            v-for="cat in categories" 
            :key="cat.id" 
            class="category-btn"
            :class="{ active: activeCategory === cat.id }"
            @click="activeCategory = cat.id"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-count">
              {{ cat.id === 'all' ? projects.length : projects.filter(p => p.difficulty === cat.id).length }}
            </span>
          </button>
        </nav>
      </aside>

      <main class="projects-main">
        <div class="projects-header">
          <span class="result-count">
            <span class="result-dot"></span>
            共 {{ filteredProjects.length }} 个项目
          </span>
        </div>
        <div class="projects-grid">
          <div 
            v-for="project in filteredProjects" 
            :key="project.id" 
            class="project-card"
          >
            <div class="card-header">
              <span class="project-id">#{{ String(project.id).padStart(2, '0') }}</span>
              <span :class="getBadgeClass(project.difficulty)">{{ getBadgeText(project.difficulty) }}</span>
            </div>
            <h3>{{ project.name }}</h3>
            <span class="project-category-tag">{{ project.category }}</span>
            <p class="card-desc">{{ project.description }}</p>
            <div class="card-tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div class="card-footer">
              <button class="card-btn" @click="goToEditor(project.id)">
                <span>进入练习</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="filteredProjects.length === 0" class="empty-state">
            <div class="empty-icon"></div>
            <p>没有找到匹配的项目</p>
            <button class="btn btn-secondary" @click="activeCategory = 'all'; searchQuery = ''">查看全部项目</button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
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

.projects-layout {
  display: flex;
  padding: 32px 24px 48px;
  gap: 32px;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: calc(var(--nav-height) + 32px);
  height: fit-content;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 14px;
  transition: var(--transition-fast);
}

.search-input:focus {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px var(--accent-blue-glow);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.category-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  text-align: left;
  transition: var(--transition-fast);
}

.category-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.category-btn.active {
  background: rgba(78, 168, 222, 0.08);
  color: var(--accent-blue);
  border-color: rgba(78, 168, 222, 0.15);
}

.cat-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.cat-name {
  flex: 1;
}

.cat-count {
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-tertiary);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  color: var(--text-muted);
}

.category-btn.active .cat-count {
  background: rgba(78, 168, 222, 0.15);
  color: var(--accent-blue);
}

.projects-main {
  flex: 1;
  min-width: 0;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.result-count {
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-green);
  border-radius: 50%;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  border-color: var(--border-light);
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-id {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.project-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: -0.2px;
}

.project-category-tag {
  display: inline-block;
  font-size: 12px;
  color: var(--accent-purple);
  font-weight: 500;
  margin-bottom: 10px;
}

.card-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 14px;
  line-height: 1.6;
  flex: 1;
}

.card-tags {
  margin-bottom: 16px;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.card-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(135deg, var(--accent-blue-dark) 0%, var(--accent-blue) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  width: 100%;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(78, 168, 222, 0.2);
}

.card-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(78, 168, 222, 0.3);
}

.card-btn svg {
  transition: var(--transition-fast);
}

.card-btn:hover svg {
  transform: translateX(3px);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 15px;
}

@media (max-width: 768px) {
  .projects-layout {
    flex-direction: column;
    padding: 24px 16px 40px;
  }

  .sidebar {
    width: 100%;
    position: static;
  }

  .category-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 6px;
    padding-bottom: 4px;
  }

  .category-btn {
    white-space: nowrap;
    padding: 10px 14px;
  }

  .cat-count {
    display: none;
  }

  .page-header {
    padding: 32px 16px 24px;
  }

  .page-title {
    font-size: 26px;
  }
}
</style>
