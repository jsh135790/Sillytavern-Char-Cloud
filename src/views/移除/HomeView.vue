<script setup>
import { ref, onMounted } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const { t } = useLanguage()

// 响应式数据
const activePanel = ref('news')
const newsData = ref([])
const charactersData = ref([])
const projectsData = ref([])
const toolsData = ref([
  {
    id: 1,
    name: 'JSON 格式化工具',
    description: '格式化和验证 JSON 数据，支持压缩和美化',
    icon: 'fas fa-code',
    status: 'available',
    url: '/tools/json-formatter'
  },
  {
    id: 2,
    name: '颜色选择器',
    description: '在线颜色选择和调色板工具',
    icon: 'fas fa-palette',
    status: 'available',
    url: '/tools/color-picker'
  },
  {
    id: 3,
    name: 'Base64 编解码',
    description: 'Base64 编码和解码工具',
    icon: 'fas fa-lock',
    status: 'available',
    url: '/tools/base64'
  },
  {
    id: 4,
    name: 'UUID 生成器',
    description: '生成各种版本的 UUID',
    icon: 'fas fa-fingerprint',
    status: 'available',
    url: '/tools/uuid-generator'
  },
  {
    id: 5,
    name: '二维码生成器',
    description: '生成自定义二维码',
    icon: 'fas fa-qrcode',
    status: 'development',
    url: '/tools/qr-generator'
  },
  {
    id: 6,
    name: 'Markdown 编辑器',
    description: '在线 Markdown 编辑和预览',
    icon: 'fab fa-markdown',
    status: 'development',
    url: '/tools/markdown-editor'
  }
])

// 加载状态
const loading = ref({
  news: false,
  characters: false,
  projects: false
})

// 面板配置
const panels = [
  { id: 'news', name: '最新资讯', icon: 'fas fa-newspaper' },
  { id: 'characters', name: '角色卡', icon: 'fas fa-users' },
  { id: 'projects', name: '开源项目', icon: 'fab fa-github' },
  { id: 'tools', name: '在线工具', icon: 'fas fa-tools' }
]

// API 基础 URL
const API_BASE_URL = 'http://localhost:5000/api'

// 获取资讯数据
async function fetchNews() {
  loading.value.news = true
  try {
    const response = await fetch(`${API_BASE_URL}/news`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    newsData.value = await response.json()
  } catch (error) {
    console.error('获取资讯失败:', error)
    // 可以在这里添加用户友好的错误提示
  } finally {
    loading.value.news = false
  }
}

// 获取角色卡数据
async function fetchCharacters() {
  loading.value.characters = true
  try {
    const response = await fetch(`${API_BASE_URL}/character-cards`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    charactersData.value = await response.json()
  } catch (error) {
    console.error('获取角色卡失败:', error)
  } finally {
    loading.value.characters = false
  }
}

// 获取开源项目数据
async function fetchProjects() {
  loading.value.projects = true
  try {
    const response = await fetch(`${API_BASE_URL}/open-source-projects`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    projectsData.value = await response.json()
  } catch (error) {
    console.error('获取项目失败:', error)
  } finally {
    loading.value.projects = false
  }
}

// 打开工具
function openTool(tool) {
  if (tool.status === 'available') {
    // 这里可以跳转到具体的工具页面
    console.log('打开工具:', tool.name)
    // 可以用 router.push(tool.url) 来跳转
  } else {
    alert('该工具还在开发中，敬请期待！')
  }
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNews()
  fetchCharacters()
  fetchProjects()
})
</script>

<template>
  <div class="space-y-12">
    <!-- Hero 区域 -->
    <section class="text-center py-20">
      <h1 class="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        {{ t('brand') }}
      </h1>
      <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        欢迎来到我的个人主页，在下方选择你感兴趣的内容
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <button class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
          开始探索
        </button>
        <button class="border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
          了解更多
        </button>
      </div>
    </section>

    <!-- 数据面板切换区域 -->
    <section class="py-8">
      <!-- 面板切换按钮 -->
      <div class="flex flex-wrap justify-center gap-4 mb-8">
        <button
          v-for="panel in panels"
          :key="panel.id"
          @click="activePanel = panel.id"
          :class="[
            'px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2',
            activePanel === panel.id 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25' 
              : 'bg-gray-800/50 border border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400'
          ]"
        >
          <font-awesome-icon :icon="panel.icon" class="text-lg" />
          <span>{{ panel.name }}</span>
        </button>
      </div>

      <!-- 面板内容区域 -->
      <div class="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 min-h-[400px]">
        <!-- 最新资讯面板 -->
        <div v-if="activePanel === 'news'" class="space-y-4">
          <!-- <h3 class="text-2xl font-bold text-cyan-400 mb-6 flex items-center space-x-2">
            <font-awesome-icon icon="fas fa-newspaper" />
            <span>最新资讯</span>
          </h3> -->
          <div v-if="loading.news" class="text-center py-8">
            <div class="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-gray-400 mt-4">加载中...</p>
          </div>
          <div v-else-if="newsData.length === 0" class="text-center py-8 text-gray-400">
            暂无资讯数据
          </div>
          <div v-else class="grid gap-4">
            <div
              v-for="news in newsData"
              :key="news.id"
              class="bg-gray-800/50 border border-gray-600 rounded-lg p-4 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-semibold text-white">{{ news.title }}</h4>
                <span class="text-xs text-gray-400">{{ formatDate(news.publish_time) }}</span>
              </div>
              <p class="text-gray-300 mb-3 line-clamp-2">{{ news.content }}</p>
              <div class="flex justify-between items-center">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in news.tags"
                    :key="tag"
                    class="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30"
                  >
                    {{ tag }}
                  </span>
                </div>
                <span class="text-sm text-gray-400">作者: {{ news.author }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 角色卡面板 -->
        <div v-if="activePanel === 'characters'" class="space-y-4">
          <!-- <h3 class="text-2xl font-bold text-purple-400 mb-6 flex items-center space-x-2">
            <font-awesome-icon icon="fas fa-users" />
            <span>角色卡</span>
          </h3> -->
          <div v-if="loading.characters" class="text-center py-8">
            <div class="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-gray-400 mt-4">加载中...</p>
          </div>
          <div v-else-if="charactersData.length === 0" class="text-center py-8 text-gray-400">
            暂无角色卡数据
          </div>
          <div v-else class="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
             <div
               v-for="character in charactersData"
               :key="character.id"
               class="character-card group"
               :class="{ 'nsfw-card': character.isNSFW }"
             >
               <!-- 背景图片 -->
               <div 
                 class="character-bg"
                 :style="{ backgroundImage: `url(${character.preview_image_urls})` }"
                 :class="{ 'nsfw-bg': character.isNSFW }"
               ></div>
               
               <!-- 覆盖层 -->
               <div class="character-overlay">
                 <!-- NSFW 警告图标 -->
                 <div v-if="character.isNSFW" class="nsfw-warning">
                   <font-awesome-icon icon="fas fa-eye-slash" class="text-2xl text-red-400" />
                   <span class="text-xs text-red-400 mt-1">NSFW</span>
                 </div>
                 
                 <!-- 内容区域 -->
                 <div class="character-content">
                   <!-- 顶部区域：版本号和状态 -->
                   <div class="character-header">
                     <span class="version-badge">v{{ character.version }}</span>
                     <span
                       :class="[
                         'status-badge',
                         character.isNSFW ? 'status-nsfw' : 'status-sfw'
                       ]"
                     >
                       {{ character.isNSFW ? 'NSFW' : 'SFW' }}
                     </span>
                   </div>
                   
                   <!-- 底部区域：标题和标签 -->
                   <div class="character-footer">
                     <h4 class="character-title">{{ character.card_name }}</h4>
                     <div class="character-tags">
                       <span
                         v-for="tag in character.tags.slice(0, 3)"
                         :key="tag"
                         class="tag-item"
                       >
                         {{ tag }}
                       </span>
                       <span v-if="character.tags.length > 3" class="tag-more">
                         +{{ character.tags.length - 3 }}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        <!-- 开源项目面板 -->
        <div v-if="activePanel === 'projects'" class="space-y-4">
          <!-- <h3 class="text-2xl font-bold text-green-400 mb-6 flex items-center space-x-2">
            <font-awesome-icon icon="fab fa-github" />
            <span>开源项目</span>
          </h3> -->
          <div v-if="loading.projects" class="text-center py-8">
            <div class="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-gray-400 mt-4">加载中...</p>
          </div>
          <div v-else-if="projectsData.length === 0" class="text-center py-8 text-gray-400">
            暂无项目数据
          </div>
          <div v-else class="grid gap-4">
            <div
              v-for="project in projectsData"
              :key="project.id"
              class="bg-gray-800/50 border border-gray-600 rounded-lg p-4 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
            >
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fas fa-code" class="text-xl text-white" />
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="text-lg font-semibold text-white">{{ project.project_name }}</h4>
                    <a
                      :href="project.project_link"
                      target="_blank"
                      class="text-green-400 hover:text-green-300 transition-colors duration-200"
                    >
                      <font-awesome-icon icon="fas fa-external-link-alt" />
                    </a>
                  </div>
                  <p class="text-gray-300 mb-3">{{ project.description }}</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in project.tags"
                      :key="tag"
                      class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 在线工具面板 -->
        <!-- <div v-if="activePanel === 'tools'" class="space-y-4">
          <h3 class="text-2xl font-bold text-yellow-400 mb-6 flex items-center space-x-2">
            <font-awesome-icon icon="fas fa-tools" />
            <span>在线工具</span>
          </h3>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="tool in toolsData"
              :key="tool.id"
              class="bg-gray-800/50 border border-gray-600 rounded-lg p-4 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 cursor-pointer"
              @click="openTool(tool)"
            >
              <div class="text-center">
                <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <font-awesome-icon :icon="tool.icon" class="text-2xl text-white" />
                </div>
                <h4 class="text-lg font-semibold text-white mb-2">{{ tool.name }}</h4>
                <p class="text-gray-300 text-sm mb-3">{{ tool.description }}</p>
                <div class="flex justify-center">
                  <span
                    :class="[
                      'px-3 py-1 text-xs rounded-full',
                      tool.status === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    ]"
                  >
                    {{ tool.status === 'available' ? '可用' : '开发中' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </section>

    <!-- 特色展示区域 -->
    <section class="grid md:grid-cols-3 gap-8">
      <div class="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
        <div class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mb-4">
          <font-awesome-icon icon="fas fa-code" class="text-xl text-white" />
        </div>
        <h3 class="text-xl font-semibold text-cyan-400 mb-3">前端技术</h3>
        <p class="text-gray-300">使用 Vue 3 + Tailwind CSS 构建的现代化界面，体验流畅的交互效果</p>
      </div>

      <div class="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
        <div class="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-4">
          <font-awesome-icon icon="fas fa-palette" class="text-xl text-white" />
        </div>
        <h3 class="text-xl font-semibold text-purple-400 mb-3">视觉设计</h3>
        <p class="text-gray-300">赛博朋克风格的动态背景和霓虹效果，打造沉浸式视觉体验</p>
      </div>

      <div class="bg-gray-900/50 backdrop-blur-sm border border-pink-500/30 rounded-xl p-6 hover:border-pink-400 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
        <div class="w-12 h-12 bg-gradient-to-r from-pink-400 to-yellow-500 rounded-lg flex items-center justify-center mb-4">
          <font-awesome-icon icon="fas fa-rocket" class="text-xl text-white" />
        </div>
        <h3 class="text-xl font-semibold text-pink-400 mb-3">性能优化</h3>
        <p class="text-gray-300">轻量级的代码结构和流畅的动画效果，确保最佳的用户体验</p>
      </div>
    </section>

    <!-- 技术栈展示 -->
    <section class="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
      <h2 class="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        技术栈
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="text-center p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300">
          <div class="text-3xl mb-2">⚡</div>
          <div class="text-sm text-gray-300">Vue 3</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300">
          <div class="text-3xl mb-2">🎨</div>
          <div class="text-sm text-gray-300">Tailwind CSS</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300">
          <div class="text-3xl mb-2">🚀</div>
          <div class="text-sm text-gray-300">Vite</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300">
          <div class="text-3xl mb-2">📦</div>
          <div class="text-sm text-gray-300">Pinia</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import "tailwindcss";
/* 添加一些自定义动画效果 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}

/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义滚动条 */
.min-h-\[400px\] {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.5) rgba(0, 0, 0, 0.1);
}

.min-h-\[400px\]::-webkit-scrollbar {
  width: 6px;
}

.min-h-\[400px\]::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.min-h-\[400px\]::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 3px;
}

.min-h-\[400px\]::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}

/* 角色卡样式 */
.character-card {
  @apply relative rounded-xl overflow-hidden border border-gray-600 cursor-pointer transition-all duration-300;
  aspect-ratio: 3/4;
  min-height: 300px;
}

.character-card:hover {
  @apply border-purple-400 shadow-lg;
  box-shadow: 0 0 25px rgba(168, 85, 247, 0.3);
  transform: translateY(-5px);
}

.character-bg {
  @apply absolute inset-0 bg-cover bg-center bg-no-repeat;
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;
}

.nsfw-bg {
  filter: grayscale(100%) blur(8px);
}

.character-card:hover .nsfw-bg {
  filter: grayscale(80%) blur(4px);
}

.character-overlay {
  @apply absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
}

.nsfw-warning {
  @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center;
  z-index: 10;
}

.character-content {
  @apply flex flex-col justify-between h-full;
  z-index: 5;
}

.character-header {
  @apply flex justify-between items-start;
}

.version-badge {
  @apply px-2 py-1 bg-black/60 backdrop-blur-sm text-gray-300 text-xs rounded-full border border-gray-500/30;
}

.status-badge {
  @apply px-2 py-1 text-xs rounded-full backdrop-blur-sm;
}

.status-sfw {
  @apply bg-green-500/20 text-green-400 border border-green-500/30;
}

.status-nsfw {
  @apply bg-red-500/20 text-red-400 border border-red-500/30;
}

.character-footer {
  @apply mt-auto;
}

.character-title {
  @apply text-lg font-bold text-white mb-2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.character-tags {
  @apply flex flex-wrap gap-1;
}

.tag-item {
  @apply px-2 py-1 bg-purple-500/30 backdrop-blur-sm text-purple-200 text-xs rounded-full border border-purple-400/30;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.tag-more {
  @apply px-2 py-1 bg-gray-500/30 backdrop-blur-sm text-gray-300 text-xs rounded-full border border-gray-400/30;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

/* NSFW卡片特殊样式 */
.nsfw-card {
  position: relative;
}

.nsfw-card::before {
  content: '';
  @apply absolute inset-0 bg-red-900/20 rounded-xl;
  z-index: 1;
  pointer-events: none;
}

.nsfw-card:hover::before {
  @apply bg-red-900/10;
}
</style>
