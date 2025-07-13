<script setup>
import { ref, watch, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faUser, faLock, faEnvelope, faEye, faEyeSlash, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  initialMode: {
    type: String,
    default: 'login' // 'login' or 'register'
  }
})

const emit = defineEmits(['close', 'login', 'register'])

const mode = ref(props.initialMode)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

// 消息提示状态
const message = ref({
  show: false,
  type: '', // 'success' or 'error'
  text: ''
})

// 表单数据
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})

// 表单验证错误
const errors = ref({})

// 验证码相关
const captcha = ref({
  num1: 0,
  num2: 0,
  answer: 0
})

// 显示消息
const showMessage = (type, text) => {
  message.value = {
    show: true,
    type,
    text
  }
  
  // 3秒后自动隐藏
  setTimeout(() => {
    hideMessage()
  }, 3000)
}

// 隐藏消息
const hideMessage = () => {
  message.value.show = false
}

// 生成验证码
const generateCaptcha = () => {
  captcha.value.num1 = Math.floor(Math.random() * 10) + 1
  captcha.value.num2 = Math.floor(Math.random() * 10) + 1
  captcha.value.answer = captcha.value.num1 + captcha.value.num2
}

// 监听初始模式变化
watch(() => props.initialMode, (newMode) => {
  mode.value = newMode
  resetForm()
})

// 重置表单
const resetForm = () => {
  formData.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: ''
  }
  errors.value = {}
  showPassword.value = false
  showConfirmPassword.value = false
  hideMessage()
  // 如果是注册模式，生成新的验证码
  if (mode.value === 'register') {
    generateCaptcha()
  }
}

// 切换模式
const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  resetForm()
}

// 关闭模态框
const closeModal = () => {
  resetForm()
  emit('close')
}

// 验证表单
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.username.trim()) {
    errors.value.username = '用户名不能为空'
  } else if (formData.value.username.length < 3) {
    errors.value.username = '用户名至少3个字符'
  }

  if (mode.value === 'register' && !formData.value.email.trim()) {
    errors.value.email = '邮箱不能为空'
  } else if (mode.value === 'register' && !/\S+@\S+\.\S+/.test(formData.value.email)) {
    errors.value.email = '邮箱格式不正确'
  }

  if (!formData.value.password) {
    errors.value.password = '密码不能为空'
  } else if (formData.value.password.length < 6) {
    errors.value.password = '密码至少6个字符'
  }

  if (mode.value === 'register') {
    if (!formData.value.confirmPassword) {
      errors.value.confirmPassword = '请确认密码'
    } else if (formData.value.password !== formData.value.confirmPassword) {
      errors.value.confirmPassword = '两次密码输入不一致'
    }

    // 验证码验证
    if (!formData.value.captcha) {
      errors.value.captcha = '请输入验证码'
    } else if (parseInt(formData.value.captcha) !== captcha.value.answer) {
      errors.value.captcha = '验证码错误'
    }
  }

  return Object.keys(errors.value).length === 0
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  hideMessage()
  
  try {
    if (mode.value === 'login') {
      await emit('login', {
        username: formData.value.username,
        password: formData.value.password
      })
    } else {
      await emit('register', {
        username: formData.value.username,
        email: formData.value.email,
        password: formData.value.password
      })
    }
  } catch (error) {
    console.error('Auth error:', error)
  } finally {
    isLoading.value = false
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  generateCaptcha()
  formData.value.captcha = ''
  if (errors.value.captcha) {
    delete errors.value.captcha
  }
}

// 点击遮罩层关闭
const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

// 组件挂载时生成验证码
onMounted(() => {
  if (props.initialMode === 'register') {
    generateCaptcha()
  }
})

// 暴露方法给父组件调用
defineExpose({
  showMessage
})
</script>

<template>
  <Transition name="modal">
    <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container">
        <!-- 关闭按钮 -->
        <button class="close-btn" @click="closeModal">
          <FontAwesomeIcon :icon="faTimes" />
        </button>

        <!-- 消息提示 - 绝对定位，不占据文档流空间 -->
        <Transition name="message">
          <div v-if="message.show" class="message" :class="message.type">
            <FontAwesomeIcon 
              :icon="message.type === 'success' ? faCheckCircle : faExclamationTriangle" 
              class="message-icon" 
            />
            <span class="message-text">{{ message.text }}</span>
            <button class="message-close" @click="hideMessage">
              <FontAwesomeIcon :icon="faTimes" />
            </button>
          </div>
        </Transition>

        <!-- 模态框头部 -->
        <div class="modal-header">
          <h2 class="modal-title">
            {{ mode === 'login' ? '欢迎回来' : '加入我们' }}
          </h2>
          <p class="modal-subtitle">
            {{ mode === 'login' ? '登录到你的账户' : '创建一个新账户' }}
          </p>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit" class="auth-form">
          <!-- 用户名 -->
          <div class="form-group">
            <label class="form-label">用户名</label>
            <div class="input-wrapper">
              <FontAwesomeIcon :icon="faUser" class="input-icon" />
              <input
                v-model="formData.username"
                type="text"
                class="form-input"
                :class="{ 'error': errors.username }"
                placeholder="请输入用户名"
                autocomplete="username"
              />
            </div>
            <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
          </div>

          <!-- 邮箱 (仅注册) -->
          <div v-if="mode === 'register'" class="form-group">
            <label class="form-label">邮箱</label>
            <div class="input-wrapper">
              <FontAwesomeIcon :icon="faEnvelope" class="input-icon" />
              <input
                v-model="formData.email"
                type="email"
                class="form-input"
                :class="{ 'error': errors.email }"
                placeholder="请输入邮箱"
                autocomplete="email"
              />
            </div>
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <!-- 密码 -->
          <div class="form-group">
            <label class="form-label">密码</label>
            <div class="input-wrapper">
              <FontAwesomeIcon :icon="faLock" class="input-icon" />
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'error': errors.password }"
                placeholder="请输入密码"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                <FontAwesomeIcon :icon="showPassword ? faEyeSlash : faEye" />
              </button>
            </div>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>

          <!-- 确认密码 (仅注册) -->
          <div v-if="mode === 'register'" class="form-group">
            <label class="form-label">确认密码</label>
            <div class="input-wrapper">
              <FontAwesomeIcon :icon="faLock" class="input-icon" />
              <input
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'error': errors.confirmPassword }"
                placeholder="请再次输入密码"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <FontAwesomeIcon :icon="showConfirmPassword ? faEyeSlash : faEye" />
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
          </div>

          <!-- 验证码 (仅注册) -->
          <div v-if="mode === 'register'" class="form-group">
            <label class="form-label">验证码</label>
            <div class="captcha-wrapper">
              <div class="captcha-question">
                <span class="captcha-text">{{ captcha.num1 }} + {{ captcha.num2 }} = ?</span>
                <button type="button" class="refresh-captcha" @click="refreshCaptcha" title="刷新验证码">
                  ↻
                </button>
              </div>
              <input
                v-model="formData.captcha"
                type="number"
                class="form-input captcha-input"
                :class="{ 'error': errors.captcha }"
                placeholder="请输入计算结果"
                autocomplete="off"
              />
            </div>
            <span v-if="errors.captcha" class="error-text">{{ errors.captcha }}</span>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading"
            :class="{ 'loading': isLoading }"
          >
            <span v-if="!isLoading">
              {{ mode === 'login' ? '登录' : '注册' }}
            </span>
            <span v-else class="loading-text">
              {{ mode === 'login' ? '登录中...' : '注册中...' }}
            </span>
          </button>
        </form>

        <!-- 模式切换 -->
        <div class="mode-switch">
          <span class="switch-text">
            {{ mode === 'login' ? '还没有账户？' : '已有账户？' }}
          </span>
          <button type="button" class="switch-btn" @click="toggleMode">
            {{ mode === 'login' ? '立即注册' : '立即登录' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 滚动条 */
/* .modal-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
} */

/* 模态框过渡动画 */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  position: relative;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  transform: scale(1) translateY(0);
  transition: all 0.3s ease;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* 头部 */
.modal-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1rem; /* 为顶部消息提示预留空间 */
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

/* 表单 */
.auth-form {
  space-y: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 1);
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.8);
}

.error-text {
  display: block;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  margin-left: 0.25rem;
}

/* 验证码样式 */
.captcha-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.captcha-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.captcha-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
  user-select: none;
}

.refresh-captcha {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: bold;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-captcha:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(180deg);
}

.captcha-input {
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: rgba(59, 130, 246, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  margin-top: 1.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 1);
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-btn.loading {
  position: relative;
}

.loading-text {
  opacity: 0.8;
}

/* 模式切换 */
.mode-switch {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.switch-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin-right: 0.5rem;
}

.switch-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.switch-btn:hover {
  color: #60a5fa;
  text-decoration: underline;
}

/* 消息提示样式 */
.message-enter-active, .message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from, .message-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.message {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(15px);
  border: 1px solid;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.message.success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.message-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.message-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.message-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  flex-shrink: 0;
}

.message-close:hover {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
  
  .message {
    top: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    padding: 0.75rem;
    gap: 0.5rem;
  }
  
  .message-text {
    font-size: 0.8rem;
  }
}
</style> 