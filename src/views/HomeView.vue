<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faRocket, faShield, faGlobe } from '@fortawesome/free-solid-svg-icons'
import AuthModal from '../components/AuthModal.vue'
import { useUserStore } from '../stores/user.js'

const features = ref([
  { icon: faRocket, text: '长期维护' },
  { icon: faShield, text: '隐私加密' },
  { icon: faGlobe, text: '操作友好' }
])

// 用户状态管理
const userStore = useUserStore()

// 模态框状态
const showAuthModal = ref(false)
const authMode = ref('login') // 'login' or 'register'
const authModalRef = ref(null) // AuthModal组件引用

// 打开登录模态框
const openLoginModal = () => {
  authMode.value = 'login'
  showAuthModal.value = true
}

// 打开注册模态框
const openRegisterModal = () => {
  authMode.value = 'register'
  showAuthModal.value = true
}

// 关闭模态框
const closeAuthModal = () => {
  showAuthModal.value = false
}

// 处理登录
const handleLogin = async (loginData) => {
  try {
    console.log('登录数据:', loginData)
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('登录成功:', data)
      
      // 使用store管理用户状态
      userStore.login(data)
      
      // 显示成功消息
      authModalRef.value?.showMessage('success', `欢迎回来，${data.user.username}！`)
      
      // 延迟关闭模态框，让用户看到成功消息
      setTimeout(() => {
        closeAuthModal()
      }, 1500)
    } else {
      const error = await response.json()
      console.error('登录失败:', error)
      
      // 显示错误消息
      let errorMessage = '登录失败，请重试'
      if (error.error) {
        if (error.error.includes('用户不存在') || error.error.includes('user not found')) {
          errorMessage = '用户不存在，请检查用户名'
        } else if (error.error.includes('密码错误') || error.error.includes('password')) {
          errorMessage = '密码错误，请重新输入'
        } else {
          errorMessage = error.error
        }
      }
      authModalRef.value?.showMessage('error', errorMessage)
    }
  } catch (error) {
    console.error('登录请求失败:', error)
    authModalRef.value?.showMessage('error', '网络连接失败，请检查网络后重试')
  }
}

// 处理注册
const handleRegister = async (registerData) => {
  try {
    console.log('注册数据:', registerData)
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('注册成功:', data)
      
      // 注册成功后自动登录
      userStore.login(data)
      
      // 显示成功消息
      authModalRef.value?.showMessage('success', `注册成功，欢迎加入，${data.user.username}！`)
      
      // 延迟关闭模态框，让用户看到成功消息
      setTimeout(() => {
        closeAuthModal()
      }, 1500)
    } else {
      const error = await response.json()
      console.error('注册失败:', error)
      
      // 显示错误消息
      let errorMessage = '注册失败，请重试'
      if (error.error) {
        if (error.error.includes('已存在') || error.error.includes('exists')) {
          errorMessage = '用户名或邮箱已存在，请更换后重试'
        } else if (error.error.includes('邮箱') || error.error.includes('email')) {
          errorMessage = '邮箱格式不正确或已被使用'
        } else if (error.error.includes('用户名') || error.error.includes('username')) {
          errorMessage = '用户名不符合要求或已被使用'
        } else {
          errorMessage = error.error
        }
      }
      authModalRef.value?.showMessage('error', errorMessage)
    }
  } catch (error) {
    console.error('注册请求失败:', error)
    authModalRef.value?.showMessage('error', '网络连接失败，请检查网络后重试')
  }
}
</script>

<template>
  <div class="home-container">
    <!-- 动效背景 -->
    <div class="animated-background">
      <div class="floating-elements">
        <div class="element element-1"></div>
        <div class="element element-2"></div>
        <div class="element element-3"></div>
        <div class="element element-4"></div>
        <div class="element element-5"></div>
      </div>
      <!-- <div class="grid-pattern"></div> -->
    </div>

    <!-- 主要内容 -->
    <div class="hero-section">
      <div class="hero-content">
        <!-- 大号Logo -->
        <h1 class="hero-logo">
          Pilot
          <span class="logo-accent">Garage</span>
        </h1>
        
        <!-- 描述文字 -->
        <p class="hero-description">
          并不是很高级的角色卡云载入管理平台<br>
          提供世界书与正则更新服务<br>
          您正在游玩的角色卡完全免费！<br>
          如果您付费购买了角色卡，请举报贩子到正规社区Discord！
        </p>

        <!-- 特性标签 -->
        <div class="features-tags">
          <div 
            v-for="feature in features" 
            :key="feature.text"
            class="feature-tag"
          >
            <FontAwesomeIcon :icon="feature.icon" class="feature-icon" />
            <span>{{ feature.text }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="!userStore.isLoggedIn">
          <div class="action-buttons">
            <button class="btn btn-primary" @click="openLoginModal">
              <FontAwesomeIcon :icon="faUser" class="btn-icon" />
              立即登录
            </button>
            <button class="btn btn-secondary" @click="openRegisterModal">
              免费注册
            </button>
          </div>
        </div>
        <div v-else>
          <p>欢迎回来，{{ userStore.username }}</p>
        </div>
        <!-- 底部提示 -->
        <div v-if="!userStore.isLoggedIn" class="bottom-hint">
          <p class="hint-text">
            注册后可使用更多功能
          </p>
        </div>
      </div>
    </div>

    <!-- 认证模态框 -->
    <AuthModal 
      ref="authModalRef"
      :is-visible="showAuthModal"
      :initial-mode="authMode"
      @close="closeAuthModal"
      @login="handleLogin"
      @register="handleRegister"
    />
  </div>
</template>

<style scoped>
.home-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 动效背景 */
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 20% 70%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.element {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(1px);
  animation: float 20s infinite linear;
}

.element-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.element-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: -5s;
}

.element-3 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 30%;
  animation-delay: -10s;
}

.element-4 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: -15s;
}

.element-5 {
  width: 120px;
  height: 120px;
  top: 80%;
  left: 60%;
  animation-delay: -7s;
}

@keyframes float {
  0% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.6;
  }
  100% {
    transform: translateY(0px) rotate(360deg);
    opacity: 0.3;
  }
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-slide 30s linear infinite;
}

@keyframes grid-slide {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

/* 主要内容 */
.hero-section {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 2rem;
  max-width: 800px;
}

.hero-content {
  backdrop-filter: blur(10px);
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 4rem 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.hero-logo {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
  line-height: 1.1;
  user-select: none;
}

.logo-accent {
  color: #3b82f6;
  -webkit-text-fill-color: #3b82f6;
}

.hero-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  line-height: 1.6;
  font-weight: 300;
}

.features-tags {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
}

.feature-icon {
  color: #3b82f6;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 140px;
  justify-content: center;
}

.btn-primary {
  background: rgba(59, 130, 246, 0.8);
  color: white;
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.btn-primary:hover {
  background: rgba(59, 130, 246, 1);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 255, 255, 0.1);
}

.btn-icon {
  font-size: 0.875rem;
}

.bottom-hint {
  margin-top: 1rem;
}

.hint-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-weight: 300;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-logo {
    font-size: 3rem;
  }
  
  .hero-content {
    padding: 2.5rem 1.5rem;
  }
  
  .hero-description {
    font-size: 0.75rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 200px;
    padding: 0.65rem 1rem;
    font-size: 0.75rem;
  }
  
  .features-tags {
    gap: 0.5rem;
  }
  
  .feature-tag {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .hero-logo {
    font-size: 2.5rem;
  }
  
  /* .hero-content {
    padding: 2rem 1rem;
  } */
}
</style> 