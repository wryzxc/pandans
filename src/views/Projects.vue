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
      <h1>项目广场</h1>
      <p>选择你的学习路径，从入门到高级，逐步提升 Pandas 技能</p>
    </div>
    
    <div class="projects-layout">
      <aside class="sidebar">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="🔍 搜索项目..." 
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
          <span class="result-count">共 {{ filteredProjects.length }} 个项目</span>
        </div>
        <div class="projects-grid">
          <div 
            v-for="project in filteredProjects" 
            :key="project.id" 
            class="project-card"
          >
            <div class="card-header">
              <span class="project-id">项目 {{ project.id }}</span>
              <span :class="getBadgeClass(project.difficulty)">{{ getBadgeText(project.difficulty) }}</span>
            </div>
            <h3>{{ project.name }}</h3>
            <span class="project-category">{{ project.category }}</span>
            <p class="card-desc">{{ project.description }}</p>
            <div class="card-tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary" @click="goToEditor(project.id)">
                进入练习
              </button>
            </div>
          </div>
          
          <div v-if="filteredProjects.length === 0" class="empty-state">
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

.projects-layout {
  display: flex;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 24px;
  gap: 24px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: calc(var(--nav-height) + 24px);
  height: fit-content;
}

.search-box {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 14px;
}

.search-input:focus {
  border-color: var(--accent-blue);
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
  padding: 10px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  text-align: left;
  transition: var(--transition);
}

.category-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.category-btn.active {
  background: rgba(88, 166, 255, 0.1);
  color: var(--accent-blue);
  border-color: rgba(88, 166, 255, 0.2);
}

.cat-icon {
  font-size: 16px;
}

.cat-name {
  flex: 1;
}

.cat-count {
  font-size: 12px;
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 10px;
  color: var(--text-muted);
}

.projects-main {
  flex: 1;
  min-width: 0;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-count {
  color: var(--text-secondary);
  font-size: 14px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  transition: var(--transition);
}

.project-card:hover {
  border-color: var(--accent-blue);
  box-shadow: var(--shadow-hover);
}

.project-card h3 {
  font-size: 16px;
  margin: 10px 0 6px;
}

.project-category {
  display: inline-block;
  font-size: 12px;
  color: var(--accent-purple);
  margin-bottom: 8px;
}

.card-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.card-tags {
  margin-bottom: 16px;
}

.card-footer {
  display: flex;
  gap: 8px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state p {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .projects-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    position: static;
  }
  .category-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 8px;
  }
  .category-btn {
    white-space: nowrap;
  }
  .cat-count {
    display: none;
  }
}
</style>
