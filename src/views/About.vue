<script setup>
const learningPath = [
  { step: 1, phase: '入门阶段', projects: '项目1-2', desc: '掌握 Pandas 基础操作，学会数据读取、清洗和转换' },
  { step: 2, phase: '基础阶段', projects: '项目3-4, 8-9', desc: '学习关联分析、RFM模型、文本清洗和帕累托分析' },
  { step: 3, phase: '中级阶段', projects: '项目5-7', desc: '掌握聚类分析、时间序列异常检测和归因模型' },
  { step: 4, phase: '实战阶段', projects: '项目10', desc: '综合运用所有技能，完成端到端的数据分析报告' }
]

const techStack = [
  { name: 'Vue 3', desc: '前端框架' },
  { name: 'CodeMirror 6', desc: '代码编辑器' },
  { name: 'Pyodide', desc: '浏览器端 Python 运行环境' },
  { name: 'Pandas + NumPy', desc: '数据分析核心库' },
  { name: 'LocalStorage', desc: '代码进度持久化' }
]

const features = [
  { icon: '💻', title: '在线代码编辑器', desc: '内置语法高亮、行号显示、自动缩进的专业 Python 编辑器' },
  { icon: '▶️', title: '实时运行预览', desc: '点击运行即可在浏览器内直接执行 Pandas 代码，查看输出结果' },
  { icon: '📚', title: '项目任务文档', desc: '每个项目都有详细的需求说明、技术要点和完成标准' },
  { icon: '📊', title: '10个实战项目', desc: '从数据清洗到机器学习，覆盖数据分析全流程' },
  { icon: '🎯', title: '四级难度体系', desc: '入门→基础→中级→高级，循序渐进的学习路径' },
  { icon: '💾', title: '自动保存进度', desc: '代码自动保存到本地，随时可以回来继续编写' }
]
</script>

<template>
  <div class="about-page">
    <div class="page-header">
      <h1>关于平台</h1>
      <p>了解 pandas 代码实训平台的定位、技术和学习路线</p>
    </div>

    <div class="container">
      <section class="about-section">
        <h2>🎯 平台介绍</h2>
        <div class="about-content">
          <p>
            <strong>pandas 代码实训平台</strong> 是一个面向新手程序员的在线编程学习平台，
            专注于 Pandas 数据分析的实战训练。平台提供 10 个精心设计的实战项目，
            涵盖数据清洗、数据重塑、关联分析、客户分群、异常检测、归因分析等核心技能。
          </p>
          <p>
            无需安装任何软件，打开浏览器即可开始学习。所有代码在浏览器内通过 Pyodide 运行，
            安全、快速、零配置。
          </p>
        </div>
      </section>

      <section class="about-section">
        <h2>✨ 平台特色</h2>
        <div class="features-grid">
          <div v-for="f in features" :key="f.title" class="feature-card">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>🗺️ 学习路线</h2>
        <div class="learning-path">
          <div v-for="step in learningPath" :key="step.step" class="path-step">
            <div class="step-number">{{ step.step }}</div>
            <div class="step-content">
              <h3>{{ step.phase }} <span class="step-projects">{{ step.projects }}</span></h3>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>🛠️ 技术栈</h2>
        <div class="tech-list">
          <div v-for="tech in techStack" :key="tech.name" class="tech-item">
            <span class="tech-name">{{ tech.name }}</span>
            <span class="tech-desc">{{ tech.desc }}</span>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>📬 反馈与联系</h2>
        <div class="about-content">
          <p>如果你有任何问题、建议或发现了 Bug，欢迎通过以下方式联系我们：</p>
          <ul class="contact-list">
            <li>📧 Email: contact@pandaslab.com</li>
            <li>🐙 GitHub: github.com/pandaslab</li>
          </ul>
        </div>
      </section>

      <footer class="about-footer">
        <p>pandas 代码实训平台 © 2024 - 让数据分析学习变得简单</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.about-page {
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

.about-section {
  margin-bottom: 48px;
}

.about-section h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.about-content {
  color: var(--text-secondary);
  line-height: 1.8;
}

.about-content p {
  margin-bottom: 12px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 24px;
  transition: var(--transition);
}

.feature-card:hover {
  border-color: var(--accent-blue);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.feature-card h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.learning-path {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.path-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
}

.step-number {
  width: 40px;
  height: 40px;
  background: var(--accent-blue-dark);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 16px;
  margin-bottom: 6px;
}

.step-projects {
  font-size: 13px;
  color: var(--accent-blue);
  font-weight: 400;
}

.step-content p {
  color: var(--text-secondary);
  font-size: 14px;
}

.tech-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.tech-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tech-name {
  font-weight: 600;
  color: var(--accent-blue);
}

.tech-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.contact-list {
  list-style: none;
  padding: 0;
}

.contact-list li {
  padding: 6px 0;
  color: var(--text-secondary);
}

.about-footer {
  text-align: center;
  padding: 32px 0;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 14px;
}
</style>
