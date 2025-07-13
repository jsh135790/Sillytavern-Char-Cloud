<script setup>
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBars, faTimes, faHome, faInfoCircle, faEnvelope, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { ref } from 'vue'
import { useUserStore } from '../stores/user.js'

const isMenuOpen = ref(false)
const userStore = useUserStore()

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// 处理登出
const handleLogout = async () => {
  try {
    // 调用后端登出API
    if (userStore.token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
          'Content-Type': 'application/json'
        }
      })
    }
  } catch (error) {
    console.error('登出请求失败:', error)
  } finally {
    // 无论API调用是否成功，都清除本地状态
    userStore.logout()
    closeMenu()
    console.log('已登出')
  }
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <div class="nav-logo">
        <RouterLink to="/" class="logo-link" @click="closeMenu">
          <span class="logo-text">Pilot</span>
          <span class="logo-accent">Garage</span>
        </RouterLink>
      </div>

      <!-- Desktop Navigation -->
      <div class="nav-links-desktop">
        <RouterLink to="/" class="nav-link">
          <FontAwesomeIcon :icon="faHome" class="nav-icon" />
          首页
        </RouterLink>
        <!-- <RouterLink to="/about" class="nav-link">
          <FontAwesomeIcon :icon="faInfoCircle" class="nav-icon" />
          角色卡
        </RouterLink> -->
        <RouterLink to="/profile" class="nav-link">
          <FontAwesomeIcon :icon="faEnvelope" class="nav-icon" />
          个人主页
        </RouterLink>
        <!-- 用户状态显示 -->
        <div class="user-section">
          <div v-if="userStore.isLoggedIn" class="user-info">
            <span class="user-name">
              <FontAwesomeIcon :icon="faUser" class="nav-icon" />
              {{ userStore.username }}
            </span>
            <button @click="handleLogout" class="logout-btn">
              <FontAwesomeIcon :icon="faSignOutAlt" class="nav-icon" />
              登出
            </button>
          </div>
          <div v-else class="nav-link nav-link-highlight">
            <FontAwesomeIcon :icon="faUser" class="nav-icon" />
            未登录
          </div>
          <!-- <RouterLink v-else to="/profile" class="nav-link nav-link-highlight">
            <FontAwesomeIcon :icon="faUser" class="nav-icon" />
            未登录
          </RouterLink> -->
        </div>
      </div>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" @click="toggleMenu">
        <FontAwesomeIcon :icon="isMenuOpen ? faTimes : faBars" />
      </button>

      <!-- Mobile Navigation -->
      <div :class="['nav-links-mobile', { 'nav-links-mobile-open': isMenuOpen }]">
        <RouterLink to="/" class="nav-link-mobile" @click="closeMenu">
          <FontAwesomeIcon :icon="faHome" class="nav-icon" />
          首页
        </RouterLink>
        <!-- <RouterLink to="/about" class="nav-link-mobile" @click="closeMenu">
          <FontAwesomeIcon :icon="faInfoCircle" class="nav-icon" />
          角色卡
        </RouterLink> -->
        <RouterLink to="/profile" class="nav-link-mobile" @click="closeMenu">
          <FontAwesomeIcon :icon="faEnvelope" class="nav-icon" />
          个人主页
        </RouterLink>
        
        <!-- 移动端用户状态 -->
        <div v-if="userStore.isLoggedIn" class="user-info-mobile">
          <div class="nav-link-mobile user-name-mobile">
            <FontAwesomeIcon :icon="faUser" class="nav-icon" />
            {{ userStore.username }}
          </div>
          <button @click="handleLogout" class="nav-link-mobile logout-btn-mobile">
            <FontAwesomeIcon :icon="faSignOutAlt" class="nav-icon" />
            登出
          </button>
        </div>
        <div v-else class="nav-link-mobile" @click="closeMenu">
          <FontAwesomeIcon :icon="faUser" class="nav-icon" />
          未登录
        </div>
        <!-- <RouterLink v-else to="/profile" class="nav-link-mobile" @click="closeMenu">
          <FontAwesomeIcon :icon="faUser" class="nav-icon" />
          未登录
        </RouterLink> -->
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(20px);
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.nav-container {
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

/* Logo */
.nav-logo {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  user-select: none;
  transition: all 0.3s ease;
}

.logo-text {
  color: #ffffff;
  margin-right: 0.25rem;
}

.logo-accent {
  color: #3b82f6;
}

/* .logo-link:hover {
  transform: translateY(-1px);
} */

/* Desktop Navigation */
.nav-links-desktop {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.nav-link-highlight {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #ffffff;
}

.nav-link-highlight:hover {
  background: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.nav-icon {
  font-size: 0.875rem;
}

/* 用户状态显示 */
.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-weight: 500;
  font-size: 0.9rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.8rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Mobile Navigation */
.nav-links-mobile {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 1rem 0;
  transform: translateY(-100%);
  opacity: 0;
  transition: all 0.3s ease;
}

.nav-links-mobile-open {
  display: block;
  transform: translateY(0);
  opacity: 1;
}

.nav-link-mobile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-link-mobile:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link-mobile.router-link-active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

/* 移动端用户状态 */
.user-info-mobile {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-name-mobile {
  color: #3b82f6 !important;
  background: rgba(59, 130, 246, 0.1) !important;
  cursor: default;
}

.user-name-mobile:hover {
  background: rgba(59, 130, 246, 0.1) !important;
}

.logout-btn-mobile {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.logout-btn-mobile:hover {
  background: rgba(239, 68, 68, 0.2) !important;
  color: #ffffff !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-links-desktop {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .nav-container {
    padding: 0 1rem;
  }
  
  .logo-link {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    height: 60px;
  }
  
  .logo-link {
    font-size: 1.125rem;
  }
}
</style> 