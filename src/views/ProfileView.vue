<template>
  <div class="profile-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">控制面板</h2>
        <p class="user-welcome">欢迎, {{ userStore.username }}</p>
        <!-- <div class="user-role-badge" :class="roleClass">
          <FontAwesomeIcon :icon="roleIcon" class="role-icon" />
          {{ roleText }}
        </div> -->
      </div>
      
      <nav class="sidebar-nav">
        <!-- 个人信息 - 所有用户都能看到 -->
        <button 
          @click="setActivePanel('profile')" 
          :class="['nav-item', { active: activePanel === 'profile' }]"
        >
          <FontAwesomeIcon :icon="faUser" class="nav-icon" />
          <span>个人信息</span>
        </button>

        <!-- 常见问题 - 所有用户都能看到 -->
        <button 
          @click="setActivePanel('faq')" 
          :class="['nav-item', { active: activePanel === 'faq' }]"
        >
          <FontAwesomeIcon :icon="faQuestionCircle" class="nav-icon" />
          <span>常见问题</span>
        </button>

        <!-- 管理员功能 - 只有admin能看到 -->
        <template v-if="userStore.userRole === 'admin'">
          <div class="nav-section">
            <h3 class="nav-section-title">创作者工具</h3>
            
            <button 
              @click="setActivePanel('characters')" 
              :class="['nav-item', { active: activePanel === 'characters' }]"
            >
              <FontAwesomeIcon :icon="faAddressCard" class="nav-icon" />
              <span>角色卡管理</span>
            </button>
            
            <button 
              @click="setActivePanel('create-lorebook')" 
              :class="['nav-item', { active: activePanel === 'create-lorebook' }]"
            >
              <FontAwesomeIcon :icon="faPlus" class="nav-icon" />
              <span>创建世界书</span>
            </button>
            
            <button 
              @click="setActivePanel('edit-lorebook')" 
              :class="['nav-item', { active: activePanel === 'edit-lorebook' }]"
            >
              <FontAwesomeIcon :icon="faEdit" class="nav-icon" />
              <span>修改世界书</span>
            </button>
            
            <button 
              @click="setActivePanel('create-regex')" 
              :class="['nav-item', { active: activePanel === 'create-regex' }]"
            >
              <FontAwesomeIcon :icon="faCode" class="nav-icon" />
              <span>创建正则</span>
            </button>
            
            <button 
              @click="setActivePanel('edit-regex')" 
              :class="['nav-item', { active: activePanel === 'edit-regex' }]"
            >
              <FontAwesomeIcon :icon="faCogs" class="nav-icon" />
              <span>修改正则</span>
            </button>
          </div>
        </template>
      </nav>
    </aside>

    <!-- 右侧内容区域 -->
    <main class="main-content">
      <div class="content-header">
        <h1 class="content-title">{{ panelTitle }}</h1>
        <p class="content-description">{{ panelDescription }}</p>
      </div>
      
      <div class="content-body">
        <!-- 个人信息面板 -->
        <ProfileInfo v-if="activePanel === 'profile'" />
        
        <!-- 常见问题面板 -->
        <FAQ v-else-if="activePanel === 'faq'" />
        
        <!-- 角色卡管理面板 -->
        <CharacterManagement v-else-if="activePanel === 'characters' && userStore.userRole === 'admin'" />
        
        <!-- 创建世界书面板 -->
        <CreateLorebookEntry v-else-if="activePanel === 'create-lorebook' && userStore.userRole === 'admin'" />
        
        <!-- 修改世界书面板 -->
        <EditLorebookEntry v-else-if="activePanel === 'edit-lorebook' && userStore.userRole === 'admin'" />
        
        <!-- 创建正则面板 -->
        <CreateRegex v-else-if="activePanel === 'create-regex' && userStore.userRole === 'admin'" />
        
        <!-- 修改正则面板 -->
        <EditRegex v-else-if="activePanel === 'edit-regex' && userStore.userRole === 'admin'" />
        
        <!-- 其他管理员面板占位符 -->
        <div v-else-if="userStore.userRole === 'admin'" class="panel-placeholder">
          <!-- <FontAwesomeIcon :icon="faConstruction" class="placeholder-icon" /> -->
          <h3>{{ panelTitle }}</h3>
          <p>此功能正在开发中...</p>
        </div>
        
        <!-- 无权限提示 -->
        <div v-else class="no-permission">
          <FontAwesomeIcon :icon="faLock" class="no-permission-icon" />
          <h3>访问受限</h3>
          <p>您没有权限访问此功能</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faUser,
  faAddressCard,
  faPlus,
  faEdit,
  faCode,
  faCogs,
  faLock,
  faUserShield,
  faUserCheck,
  faUserCog,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons'
import ProfileInfo from '@/components/ProfileInfo.vue'
import CharacterManagement from '@/components/CharacterManagement.vue'
import CreateLorebookEntry from '@/components/CreateLorebookEntry.vue'
import EditLorebookEntry from '@/components/EditLorebookEntry.vue'
import CreateRegex from '@/components/CreateRegex.vue'
import EditRegex from '@/components/EditRegex.vue'
import FAQ from '@/components/FAQ.vue'

const userStore = useUserStore()

// 当前激活的面板
const activePanel = ref('profile')

// 设置激活面板
const setActivePanel = (panel) => {
  activePanel.value = panel
}

// 用户角色相关计算属性
const roleClass = computed(() => {
  return userStore.userRole === 'admin' ? 'role-admin' : 'role-user'
})

const roleIcon = computed(() => {
  return userStore.userRole === 'admin' ? faUserShield : faUserCheck
})

const roleText = computed(() => {
  return userStore.userRole === 'admin' ? '创作者' : '普通用户'
})

// 面板标题和描述
const panelInfo = {
  'profile': {
    title: '个人信息',
    description: '查看和管理您的账户信息'
  },
  'faq': {
    title: '常见问题',
    description: '查看平台使用相关的常见问题和解答'
  },
  'characters': {
    title: '角色卡管理',
    description: '管理您创建的所有角色卡'
  },
  'create-lorebook': {
    title: '创建世界书',
    description: '为角色卡添加新的世界书条目'
  },
  'edit-lorebook': {
    title: '修改世界书',
    description: '编辑现有的世界书条目'
  },
  'create-regex': {
    title: '创建正则',
    description: '为角色卡添加新的正则表达式'
  },
  'edit-regex': {
    title: '修改正则',
    description: '编辑现有的正则表达式'
  }
}

const panelTitle = computed(() => panelInfo[activePanel.value]?.title || '未知面板')
const panelDescription = computed(() => panelInfo[activePanel.value]?.description || '')

// 页面初始化
onMounted(async () => {
  // 获取最新的用户信息
  if (userStore.isLoggedIn) {
    await userStore.fetchUserInfo()
  }
})
</script>

<style scoped>
.profile-container {
  display: flex;
  min-height: calc(100vh - 70px);
  padding-top: 70px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* 左侧导航栏 */
.sidebar {
  width: 280px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.user-welcome {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  /* margin-bottom: 1rem; */
}

.user-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

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

/* 导航栏 */
.sidebar-nav {
  padding: 1rem 0;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section-title {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.75rem 1.5rem 0.75rem;
  margin-bottom: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  border-left-color: rgba(59, 130, 246, 0.5);
}

.nav-item.active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
}

.nav-icon {
  font-size: 1rem;
  width: 1rem;
  text-align: center;
}

/* 右侧内容区域 */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.content-header {
  margin-bottom: 2rem;
}

.content-title {
  color: #ffffff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.content-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.6;
}

.content-body {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  min-height: 400px;
}

/* 占位符样式 */
.panel-placeholder,
.no-permission {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  height: 300px;
}

.placeholder-icon,
.no-permission-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.panel-placeholder h3,
.no-permission h3 {
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.panel-placeholder p,
.no-permission p {
  font-size: 1rem;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
    padding-top: 0px;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .content-body {
    padding: 1rem;
  }
}
</style> 