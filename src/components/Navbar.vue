<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navLinks = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/projects', label: '项目广场', icon: '📦' },
  { to: '/my-exercises', label: '我的练习', icon: '📝' },
  { to: '/about', label: '关于', icon: 'ℹ️' }
]
</script>

<template>
  <header class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/" class="logo">
        <div class="logo-icon-wrapper">
          <span class="logo-icon">🐼</span>
        </div>
        <span class="logo-text">pandas<span class="logo-accent">Lab</span></span>
      </RouterLink>

      <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen" :class="{ active: mobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
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
          <span class="nav-link-icon">{{ link.icon }}</span>
          {{ link.label }}
          <span v-if="route.path === link.to" class="nav-link-indicator"></span>
        </RouterLink>
      </nav>

      <div class="nav-actions">
        <RouterLink to="/projects" class="nav-cta">
          <span>开始练习</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </RouterLink>
      </div>
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
  background: rgba(10, 14, 23, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-blue-glow), rgba(192, 132, 252, 0.15));
  border-radius: var(--radius-sm);
  border: 1px solid rgba(78, 168, 222, 0.2);
}

.logo-icon {
  font-size: 20px;
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.logo-accent {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition-fast);
  white-space: nowrap;
}

.nav-link-icon {
  font-size: 14px;
  opacity: 0.7;
  transition: var(--transition-fast);
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link:hover .nav-link-icon {
  opacity: 1;
}

.nav-link.active {
  color: var(--accent-blue);
  background: rgba(78, 168, 222, 0.1);
}

.nav-link.active .nav-link-icon {
  opacity: 1;
}

.nav-link-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: var(--accent-blue);
  border-radius: 1px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--accent-blue-dark), var(--accent-blue));
  color: white;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(78, 168, 222, 0.25);
  transition: var(--transition);
  white-space: nowrap;
}

.nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(78, 168, 222, 0.35);
  color: white;
}

.nav-cta svg {
  transition: var(--transition-fast);
}

.nav-cta:hover svg {
  transform: translateX(2px);
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  background: none;
  padding: 8px;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mobile-menu-btn span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--text-secondary);
  border-radius: 2px;
  transition: var(--transition);
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

@media (max-width: 768px) {
  .navbar-inner {
    padding: 0 16px;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: var(--nav-height);
    left: 0;
    right: 0;
    background: rgba(17, 24, 39, 0.98);
    backdrop-filter: blur(20px);
    flex-direction: column;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    transform: translateY(-100%);
    opacity: 0;
    transition: var(--transition);
    pointer-events: none;
    gap: 4px;
  }

  .nav-links.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  .nav-link {
    width: 100%;
    padding: 12px 14px;
  }

  .nav-link-indicator {
    display: none;
  }

  .nav-actions {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 15px;
  }

  .nav-link {
    font-size: 13px;
  }
}
</style>
