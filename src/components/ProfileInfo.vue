<template>
  <div class="profile-info">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <FontAwesomeIcon :icon="faSpinner" class="loading-icon" spin />
      <p>加载用户信息中...</p>
    </div>

    <!-- 用户信息 -->
    <div v-else-if="userInfo" class="user-info-grid">
      <!-- 用户头像和基本信息 -->
      <div class="user-header">
        <div class="avatar-container">
          <div class="user-avatar">
            <FontAwesomeIcon :icon="faUser" class="avatar-icon" />
          </div>
          <div class="avatar-status" :class="statusClass">
            <FontAwesomeIcon :icon="statusIcon" class="status-icon" />
          </div>
        </div>
        <div class="user-details">
          <h2 class="user-name">{{ userInfo.username }}</h2>
          <p class="user-email">{{ userInfo.email }}</p>
          <div class="user-role-badge" :class="roleClass">
            <FontAwesomeIcon :icon="roleIcon" class="role-icon" />
            {{ roleText }}
          </div>
        </div>
      </div>

      <!-- 账户信息 -->
      <div class="info-section">
        <h3 class="section-title">
          <FontAwesomeIcon :icon="faInfoCircle" class="section-icon" />
          账户信息
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">用户ID</label>
            <span class="info-value">{{ userInfo.id }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">用户名</label>
            <span class="info-value">{{ userInfo.username }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">邮箱地址</label>
            <span class="info-value">{{ userInfo.email }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">账户角色</label>
            <span class="info-value role-value" :class="roleClass">{{ roleText }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">账户状态</label>
            <span class="info-value status-value" :class="statusClass">
              <FontAwesomeIcon :icon="statusIcon" class="status-mini-icon" />
              {{ statusText }}
            </span>
          </div>
          <div class="info-item">
            <label class="info-label">注册时间</label>
            <span class="info-value">{{ formatDate(userInfo.created_at) }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">最后登录</label>
            <span class="info-value">{{ formatDate(userInfo.last_login) || '从未登录' }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">更新时间</label>
            <span class="info-value">{{ formatDate(userInfo.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <h3 class="section-title">
          <FontAwesomeIcon :icon="faCogs" class="section-icon" />
          账户操作
        </h3>
        <div class="action-buttons">
          <button @click="refreshUserInfo" class="action-btn refresh-btn" :disabled="loading">
            <FontAwesomeIcon :icon="faRefresh" class="btn-icon" :class="{ 'fa-spin': refreshing }" />
            刷新信息
          </button>
          <button @click="changePassword" class="action-btn password-btn">
            <FontAwesomeIcon :icon="faKey" class="btn-icon" />
            修改密码
          </button>
          <button @click="editProfile" class="action-btn edit-btn">
            <FontAwesomeIcon :icon="faEdit" class="btn-icon" />
            编辑资料
          </button>
        </div>
      </div>

      <!-- 统计信息（仅管理员可见） -->
      <div v-if="userInfo.role === 'admin'" class="stats-section">
        <h3 class="section-title">
          <FontAwesomeIcon :icon="faChartBar" class="section-icon" />
          创作统计
        </h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ stats.characters || 0 }}</div>
            <div class="stat-label">角色卡</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.lorebook || 0 }}</div>
            <div class="stat-label">世界书</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.regex || 0 }}</div>
            <div class="stat-label">正则表达式</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <FontAwesomeIcon :icon="faExclamationTriangle" class="error-icon" />
      <h3>加载失败</h3>
      <p>无法获取用户信息，请稍后重试</p>
      <button @click="refreshUserInfo" class="retry-btn">
        <FontAwesomeIcon :icon="faRefresh" class="btn-icon" />
        重试
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faUser,
  faInfoCircle,
  faCogs,
  faChartBar,
  faSpinner,
  faRefresh,
  faKey,
  faEdit,
  faExclamationTriangle,
  faUserShield,
  faUserCheck,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'

const userStore = useUserStore()
const loading = ref(false)
const refreshing = ref(false)
const userInfo = ref(null)
const stats = ref({
  characters: 0,
  lorebook: 0,
  regex: 0
})

// 用户角色相关计算属性
const roleClass = computed(() => {
  return userInfo.value?.role === 'admin' ? 'role-admin' : 'role-user'
})

const roleIcon = computed(() => {
  return userInfo.value?.role === 'admin' ? faUserShield : faUserCheck
})

const roleText = computed(() => {
  return userInfo.value?.role === 'admin' ? '创作者' : '普通用户'
})

// 账户状态相关计算属性
const statusClass = computed(() => {
  return userInfo.value?.is_active ? 'status-active' : 'status-inactive'
})

const statusIcon = computed(() => {
  return userInfo.value?.is_active ? faCheckCircle : faTimesCircle
})

const statusText = computed(() => {
  return userInfo.value?.is_active ? '活跃' : '已停用'
})

// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const success = await userStore.fetchUserInfo()
    if (success) {
      userInfo.value = userStore.userInfo
      
      // 如果是管理员，获取统计信息
      if (userInfo.value?.role === 'admin') {
        await fetchStats()
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取统计信息（管理员）
const fetchStats = async () => {
  if (!userStore.token) return
  
  try {
    const response = await fetch('/api/admin/characters', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      stats.value.characters = data.total || 0
      
      // 这里可以添加更多统计信息的获取
      // TODO: 添加世界书和正则的统计API
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 刷新用户信息
const refreshUserInfo = async () => {
  refreshing.value = true
  try {
    await fetchUserInfo()
  } finally {
    refreshing.value = false
  }
}

// 修改密码
const changePassword = () => {
  // TODO: 实现修改密码功能
  alert('修改密码功能即将上线')
}

// 编辑资料
const editProfile = () => {
  // TODO: 实现编辑资料功能
  alert('编辑资料功能即将上线')
}

// 页面初始化
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-info {
  height: 100%;
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.loading-icon,
.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.error-icon {
  color: #ef4444;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  color: #ffffff;
}

/* 用户信息网格 */
.user-info-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 用户头部信息 */
.user-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.avatar-icon {
  font-size: 2rem;
  color: #ffffff;
}

.avatar-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(15, 23, 42, 0.8);
}

.status-active {
  background: #22c55e;
  color: #ffffff;
}

.status-inactive {
  background: #ef4444;
  color: #ffffff;
}

.status-icon {
  font-size: 0.75rem;
}

.user-details {
  flex: 1;
}

.user-name {
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.user-email {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-bottom: 1rem;
}

.user-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* 信息区块 */
.info-section,
.action-section,
.stats-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.section-icon {
  color: #3b82f6;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-value.role-admin {
  color: #3b82f6;
}

.role-value.role-user {
  color: #22c55e;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.status-value.status-active {
  color: #22c55e;
}

.status-value.status-inactive {
  color: #ef4444;
}

.status-mini-icon {
  font-size: 0.75rem;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.refresh-btn {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
  color: #ffffff;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.password-btn {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  border-color: rgba(168, 85, 247, 0.3);
}

.password-btn:hover {
  background: rgba(168, 85, 247, 0.3);
  color: #ffffff;
}

.edit-btn {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.edit-btn:hover {
  background: rgba(34, 197, 94, 0.3);
  color: #ffffff;
}

.btn-icon {
  font-size: 0.875rem;
}

/* 统计信息 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-number {
  color: #3b82f6;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

/* 角色样式复用 */
.role-admin {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.role-user {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.role-icon {
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .user-avatar {
    width: 60px;
    height: 60px;
  }
  
  .avatar-icon {
    font-size: 1.5rem;
  }
  
  .user-name {
    font-size: 1.5rem;
  }
}
</style> 