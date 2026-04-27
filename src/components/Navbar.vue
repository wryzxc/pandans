<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/projects', label: '项目广场' },
  { to: '/my-exercises', label: '我的练习' },
  { to: '/about', label: '关于' }
]
</script>

<template>
  <header class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/" class="logo">
        <span class="logo-icon">🐼</span>
        <span class="logo-text">pandas 代码实训平台</span>
      </RouterLink>
      <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav-links" :class="{ open: mobileMenuOpen }">
        <RouterLink 
          v-for="link in navLinks" 
          :key="link.to" 
          :to="link.to" 
          class="nav-link"
          :class="{ active: route.path === link.to }"
          @click="mobileMenuOpen = false"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: rgba(13, 17, 23, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
}

.navbar-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.nav-link.active {
  color: var(--accent-blue);
  background: rgba(88, 166, 255, 0.1);
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  padding: 8px;
}

.mobile-menu-btn span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
  .nav-links {
    position: fixed;
    top: var(--nav-height);
    left: 0;
    right: 0;
    background: var(--bg-secondary);
    flex-direction: column;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    transform: translateY(-100%);
    opacity: 0;
    transition: var(--transition);
    pointer-events: none;
  }
  .nav-links.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
}
</style>
