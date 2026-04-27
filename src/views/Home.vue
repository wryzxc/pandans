<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getPopularProjects, getProjectsByCategory, categories } from '../data/projects.js'

const router = useRouter()
const popularProjects = ref(getPopularProjects())

const featureCategories = ref([
  { id: 'beginner', icon: '📊', title: '数据清洗基础', desc: '学习 Pandas 核心操作，从脏数据清洗到类型转换', count: 2, gradient: 'from-green-500/20 to-emerald-500/5' },
  { id: 'basic', icon: '🔧', title: '数据重塑与关联', desc: '掌握透视表、关联规则、文本分词等进阶技能', count: 4, gradient: 'from-blue-500/20 to-cyan-500/5' },
  { id: 'intermediate', icon: '', title: '分析与检测', desc: '时间序列分析、客户价值分层、归因模型实战', count: 3, gradient: 'from-purple-500/20 to-pink-500/5' },
])

const totalProjects = computed(() => popularProjects.value.length)

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
      <div class="hero-bg">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
        <div class="hero-orb orb-3"></div>
      </div>
      <div class="container">
        <div class="hero-content animate-fade-in">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>开源免费 · 在线运行 · 无需安装</span>
          </div>
          <h1 class="hero-title">
            零基础通过<span class="highlight">实战项目</span><br>学习数据分析
          </h1>
          <p class="hero-subtitle">
            在线写代码、实时运行预览，从数据清洗到机器学习<br>一站式掌握 Pandas 数据分析技能
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" @click="goToProjects('beginner')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              开始学习
            </button>
            <button class="btn btn-secondary btn-lg" @click="goToProjects('all')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              浏览全部项目
            </button>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-num">{{ totalProjects }}</span>
              <span class="stat-label">实战项目</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">4</span>
              <span class="stat-label">难度等级</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">0</span>
              <span class="stat-label">元费用</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">100%</span>
              <span class="stat-label">在线运行</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">学习路径</h2>
          <p class="section-subtitle">循序渐进，从入门到实战，系统化掌握数据分析技能</p>
        </div>
        <div class="category-cards">
          <div 
            v-for="(cat, index) in featureCategories" 
            :key="cat.id" 
            class="category-card animate-slide-up"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="goToProjects(cat.id)"
          >
            <div class="category-card-bg"></div>
            <div class="category-card-content">
              <div class="card-icon-wrapper">
                <span class="card-icon">{{ cat.icon }}</span>
              </div>
              <div class="card-info">
                <h3>{{ cat.title }}</h3>
                <p>{{ cat.desc }}</p>
              </div>
              <div class="card-footer">
                <span class="card-count">{{ cat.count }} 个项目</span>
                <svg class="card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section projects-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门项目推荐</h2>
          <p class="section-subtitle">精选实战项目，覆盖数据分析核心场景</p>
        </div>
        <div class="project-grid">
          <div 
            v-for="(project, index) in popularProjects" 
            :key="project.id" 
            class="project-card animate-slide-up"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div class="project-card-top">
              <span class="project-category">{{ project.category }}</span>
              <span :class="['badge', `badge-${project.difficulty}`]">
                {{ { beginner: '入门', basic: '基础', intermediate: '中级', advanced: '高级' }[project.difficulty] }}
              </span>
            </div>
            <div class="project-card-body">
              <div class="project-number">{{ String(project.id).padStart(2, '0') }}</div>
              <h3>{{ project.name }}</h3>
              <p class="card-desc">{{ project.description }}</p>
            </div>
            <div class="project-card-footer">
              <div class="card-tags">
                <span v-for="tag in project.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <button class="card-btn" @click="goToProject(project.id)">
                <span>进入练习</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <h2>准备好开始了吗？</h2>
            <p>选择一个适合你当前水平的项目，立即开始实战练习</p>
          </div>
          <button class="btn btn-primary btn-lg" @click="goToProjects('all')">
            探索所有项目
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <span class="footer-logo"> pandasLab</span>
            <p>让数据分析学习变得简单有趣</p>
          </div>
          <div class="footer-tech">
            <span class="tech-label">技术栈：</span>
            <span class="tech-tags">
              <span class="tech-tag">Vue 3</span>
              <span class="tech-tag">Monaco Editor</span>
              <span class="tech-tag">Pyodide</span>
            </span>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2024 pandasLab · 开源免费 · 构建于 GitHub</p>
        </div>
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
  position: relative;
  padding: 100px 24px 80px;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--accent-blue) 0%, transparent 70%);
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--accent-purple) 0%, transparent 70%);
  bottom: -50px;
  left: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, var(--accent-green) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(78, 168, 222, 0.08);
  border: 1px solid rgba(78, 168, 222, 0.15);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--accent-blue);
  margin-bottom: 24px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-green);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.hero-title {
  font-size: clamp(32px, 6vw, 56px);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 20px;
  letter-spacing: -1px;
}

.hero-title .highlight {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 17px;
  color: var(--text-secondary);
  max-width: 550px;
  margin: 0 auto 36px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 56px;
}

.btn-lg {
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.section {
  padding: 80px 0;
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 48px;
}

.features-section {
  background: linear-gradient(180deg, transparent 0%, rgba(26, 35, 50, 0.3) 50%, transparent 100%);
}

.category-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.category-card {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid var(--border-color);
}

.category-card:hover {
  border-color: var(--accent-blue);
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.category-card-content {
  position: relative;
  z-index: 1;
  padding: 24px;
  background: var(--bg-card);
}

.card-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(78, 168, 222, 0.1);
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
}

.card-icon {
  font-size: 24px;
}

.card-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}

.card-info p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-count {
  color: var(--accent-blue);
  font-size: 13px;
  font-weight: 600;
}

.card-arrow {
  color: var(--text-muted);
  transition: var(--transition-fast);
}

.category-card:hover .card-arrow {
  color: var(--accent-blue);
  transform: translateX(4px);
}

.projects-section {
  padding-top: 60px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  border-color: var(--border-light);
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.project-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
}

.project-category {
  font-size: 12px;
  color: var(--accent-purple);
  font-weight: 500;
}

.project-card-body {
  padding: 0 20px 16px;
  display: flex;
  gap: 16px;
}

.project-number {
  font-size: 32px;
  font-weight: 800;
  color: var(--border-light);
  line-height: 1;
  min-width: 40px;
  flex-shrink: 0;
}

.project-card-body h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: -0.2px;
}

.card-desc {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.project-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 16px;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.card-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  color: var(--accent-blue);
  border: 1px solid rgba(78, 168, 222, 0.3);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.card-btn:hover {
  background: rgba(78, 168, 222, 0.1);
  border-color: var(--accent-blue);
}

.card-btn svg {
  transition: var(--transition-fast);
}

.card-btn:hover svg {
  transform: translateX(3px);
}

.cta-section {
  padding: 60px 0;
}

.cta-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 48px;
  background: linear-gradient(135deg, rgba(78, 168, 222, 0.08) 0%, rgba(192, 132, 252, 0.08) 100%);
  border: 1px solid rgba(78, 168, 222, 0.15);
  border-radius: var(--radius-lg);
}

.cta-content h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.cta-content p {
  color: var(--text-secondary);
  font-size: 15px;
}

.footer {
  border-top: 1px solid var(--border-color);
  padding: 40px 0 32px;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-logo {
  font-size: 18px;
  font-weight: 700;
}

.footer-brand p {
  color: var(--text-muted);
  font-size: 14px;
}

.footer-tech {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tech-label {
  color: var(--text-muted);
  font-size: 13px;
}

.tech-tags {
  display: flex;
  gap: 6px;
}

.tech-tag {
  padding: 4px 10px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.footer-bottom {
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

@media (max-width: 768px) {
  .hero {
    padding: 60px 16px 50px;
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: 20px;
  }

  .stat-divider {
    display: none;
  }

  .stat-item {
    min-width: 60px;
  }

  .category-cards {
    grid-template-columns: 1fr;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }

  .cta-card {
    flex-direction: column;
    text-align: center;
    padding: 32px 24px;
    gap: 24px;
  }

  .footer-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .section {
    padding: 60px 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-lg {
    width: 100%;
    max-width: 280px;
  }
}
</style>
