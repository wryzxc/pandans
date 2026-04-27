<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPopularProjects, getProjectsByCategory, categories } from '../data/projects.js'

const router = useRouter()
const popularProjects = ref(getPopularProjects())

const featureCategories = ref([
  { id: 'beginner', icon: '📊', title: '数据清洗基础', desc: '学习 Pandas 核心操作，从脏数据清洗到类型转换', count: 2 },
  { id: 'basic', icon: '🔧', title: '数据重塑与关联', desc: '掌握透视表、关联规则、文本分词等进阶技能', count: 4 },
  { id: 'intermediate', icon: '📈', title: '分析与检测', desc: '时间序列分析、客户价值分层、归因模型实战', count: 3 },
])

function goToProject(id) {
  router.push(`/editor/${id}`)
}

function goToProjects(cat) {
  router.push({ path: '/projects', query: { category: cat } })
}
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          零基础通过<span class="highlight">实战项目</span>学习编程
        </h1>
        <p class="hero-subtitle">
          在线写代码、实时运行预览，从数据清洗到机器学习，一站式掌握 Pandas 数据分析
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" @click="goToProjects('beginner')">
            🚀 开始学习
          </button>
          <button class="btn btn-secondary btn-lg" @click="goToProjects('all')">
            📦 浏览全部项目
          </button>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-num">10</span>
            <span class="stat-label">实战项目</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">4</span>
            <span class="stat-label">难度等级</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">0</span>
            <span class="stat-label">元费用</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">项目分类</h2>
        <div class="category-cards">
          <div 
            v-for="cat in featureCategories" 
            :key="cat.id" 
            class="category-card"
            @click="goToProjects(cat.id)"
          >
            <div class="card-icon">{{ cat.icon }}</div>
            <h3>{{ cat.title }}</h3>
            <p>{{ cat.desc }}</p>
            <span class="card-count">{{ cat.count }} 个项目</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">热门项目推荐</h2>
        <div class="project-grid">
          <div 
            v-for="project in popularProjects" 
            :key="project.id" 
            class="project-card"
          >
            <div class="card-header">
              <span class="project-id">#{{ project.id }}</span>
              <span :class="['badge', `badge-${project.difficulty}`]">
                {{ { beginner: '入门', basic: '基础', intermediate: '中级', advanced: '高级' }[project.difficulty] }}
              </span>
            </div>
            <h3>{{ project.name }}</h3>
            <p class="card-desc">{{ project.description }}</p>
            <div class="card-tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <button class="btn btn-primary card-btn" @click="goToProject(project.id)">
              进入练习 →
            </button>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <p>pandas 代码实训平台 - 让数据分析学习变得简单</p>
        <p class="footer-note">基于 Vue 3 + CodeMirror + Pyodide 构建，开源免费</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-top: var(--nav-height);
}

.hero {
  padding: 80px 24px 60px;
  text-align: center;
  background: linear-gradient(180deg, rgba(31, 111, 235, 0.08) 0%, transparent 100%);
}

.hero-title {
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
}

.hero-title .highlight {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.btn-lg {
  padding: 12px 28px;
  font-size: 16px;
}

.hero-stats {
  display: flex;
  gap: 48px;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-blue);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.section {
  padding: 60px 0;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
}

.category-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
}

.category-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 24px;
  cursor: pointer;
  transition: var(--transition);
}

.category-card:hover {
  border-color: var(--accent-blue);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.category-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.category-card p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 12px;
}

.card-count {
  color: var(--accent-blue);
  font-size: 13px;
  font-weight: 500;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
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

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-id {
  color: var(--text-muted);
  font-size: 13px;
}

.project-card h3 {
  font-size: 16px;
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

.card-btn {
  width: 100%;
}

.footer {
  border-top: 1px solid var(--border-color);
  padding: 32px 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.footer-note {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
