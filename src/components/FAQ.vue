<template>
  <div class="faq-container">
    <!-- 搜索和筛选区域 -->
    <div class="faq-header">
      <div class="search-section">
        <div class="search-box">
          <FontAwesomeIcon :icon="faSearch" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索问题..."
            class="search-input"
          />
        </div>
        
        <div class="filter-section">
          <label class="filter-label">重要程度：</label>
          <select v-model="selectedImportance" class="filter-select">
            <option value="all">全部</option>
            <option value="必看">必看</option>
            <option value="重要">重要</option>
            <option value="普通">普通</option>
          </select>
        </div>
      </div>
    </div>

    <!-- FAQ列表 -->
    <div class="faq-list">
      <div 
        v-for="(faq, index) in filteredFAQs" 
        :key="index"
        :class="['faq-item', `faq-${faq.importance}`]"
      >
        <!-- 问题标题 -->
        <div 
          class="faq-question" 
          @click="toggleFAQ(index)"
        >
          <div class="question-header">
            <span :class="['importance-tag', `tag-${faq.importance}`]">
              <FontAwesomeIcon :icon="getImportanceIcon(faq.importance)" />
              {{ faq.importance }}
            </span>
            <h3 class="question-title">{{ faq.title }}</h3>
          </div>
          <FontAwesomeIcon 
            :icon="faChevronDown" 
            :class="['expand-icon', { expanded: expandedItems.has(index) }]"
          />
        </div>

        <!-- 问题回答 -->
        <div 
          v-show="expandedItems.has(index)"
          class="faq-answer"
        >
          <div class="answer-content" v-html="faq.content"></div>
          
          <!-- 用户组限制提示 -->
          <div v-if="faq.visibleTo !== 'all'" class="visibility-info">
            <FontAwesomeIcon :icon="faUsers" />
            适用于：{{ getVisibilityText(faq.visibleTo) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredFAQs.length === 0" class="empty-state">
      <FontAwesomeIcon :icon="faSearchMinus" class="empty-icon" />
      <h3>未找到相关问题</h3>
      <p>尝试调整搜索条件或筛选选项</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faSearch,
  faChevronDown,
  faExclamationTriangle,
  faInfoCircle,
  faLightbulb,
  faUsers,
  faSearchMinus
} from '@fortawesome/free-solid-svg-icons'

const userStore = useUserStore()

// 搜索和筛选状态
const searchQuery = ref('')
const selectedImportance = ref('all')
const expandedItems = ref(new Set())

// 切换FAQ展开状态
const toggleFAQ = (index) => {
  if (expandedItems.value.has(index)) {
    expandedItems.value.delete(index)
  } else {
    expandedItems.value.add(index)
  }
}

// 获取重要程度图标
const getImportanceIcon = (importance) => {
  switch (importance) {
    case '必看': return faExclamationTriangle
    case '重要': return faInfoCircle
    case '普通': return faLightbulb
    default: return faLightbulb
  }
}

// 获取可见性文本
const getVisibilityText = (visibleTo) => {
  switch (visibleTo) {
    case 'admin': return '创作者'
    case 'user': return '普通用户'
    case 'all': return '所有用户'
    default: return '所有用户'
  }
}

// 常见问题数据
const faqData = [
  {
    title: '[创作者]创作资源下载',
    content: `
      <strong>以下是进行角色卡创作必要的资源</strong>
      <p><a href="https://files.catbox.moe/nyrqum.png" target="_blank" style="color: #3b82f6;">📖 PilotGarage开发助手角色卡</a></p>
      <p><a href="https://files.catbox.moe/uter2m.md" target="_blank" style="color: #3b82f6;">📖 PilotGarage开发API文档</a></p>
      <strong>请注意：所有关于创作中的说明都在角色卡的角色描述部分 请仔细阅读</strong>
    `,
    importance: '必看',
    visibleTo: 'admin'
  },
  {
    title: '如何注册账户？',
    content: `
      <p>能看到这个面板说明你已经注册成功了(笑)，但是我还是建议你检查：</p>
      <ol>
        <li>你的用户名应该尽量不包含特殊字符 这可能会导致一些预期外的问题</li>
        <li>你的密码不应该包含emoji等页数字符 而且应该足够复杂</li>
        <li>请确保你的邮箱是真实的 因为我们以后可能会扩展邮箱验证</li>
      </ol>
      <p><strong>注意：</strong>用户名一旦注册不可修改，请慎重选择。</p>
      <p>如果你有任何问题 请随时联系我们</p>
      <strong>接下来你要做的就是返回酒馆使用该账号登录 点击更新按钮后即可游玩角色卡</strong>
    `,
    importance: '必看',
    visibleTo: 'all'
  },
  {
    title: '如何获得创作者权限？',
    content: `
      <strong>我们未来会增加创作者权限的申请功能 请耐心等待</strong>
      <p>创作者权限目前需要管理员手动授予。如果您需要创作者权限：</p>
      <ul>
        <li>请联系平台管理员</li>
        <li>说明您的创作需求和用途</li>
        <li>提供必要的身份验证信息(如Discord ID 是否在服务器有创作者身份等)</li>
      </ul>
      <p>获得创作者权限后，您可以：</p>
      <ul>
        <li>创建和管理角色卡</li>
        <li>编写世界书条目</li>
        <li>创建正则表达式</li>
      </ul>
    `,
    importance: '重要',
    visibleTo: 'all'
  },
  {
    title: '什么是世界书？',
    content: `
      <p>世界书是为AI角色提供背景知识的重要工具：</p>
      <ul>
        <li><strong>背景设定：</strong>描述角色所在的世界观、历史背景</li>
        <li><strong>人物关系：</strong>定义角色与其他人物的关系</li>
        <li><strong>特殊概念：</strong>解释世界中的特殊术语或概念</li>
        <li><strong>触发机制：</strong>通过关键词自动激活相关内容</li>
      </ul>
      <p>合理使用世界书可以让AI更好地理解和扮演角色。</p>
    `,
    importance: '重要',
    visibleTo: 'all'
  },
  {
    title: '正则表达式有什么用？',
    content: `
      <p>正则表达式主要用于：</p>
      <ul>
        <li><strong>文本替换：</strong>自动替换特定的文本模式</li>
        <li><strong>格式化：</strong>统一输出格式</li>
        <li><strong>内容过滤：</strong>过滤不合适的内容</li>
        <li><strong>自动化处理：</strong>批量处理文本内容</li>
      </ul>
      <p><em>注意：正则表达式功能较为高级，建议有一定技术基础的创作者使用。或者您可以交给AI帮助编写。</em></p>
    `,
    importance: '普通',
    visibleTo: 'admin'
  },
  {
    title: '如何导出角色卡数据？',
    content: `
      <p>(这只是一条测试条目 您可以不用阅读)目前支持多种格式的角色卡导出：</p>
      <ul>
        <li><strong>SillyTavern格式：</strong>兼容SillyTavern平台</li>
        <li><strong>JSON格式：</strong>通用的数据交换格式</li>
        <li><strong>PNG格式：</strong>包含完整数据的图片文件</li>
      </ul>
      <p>在角色卡管理页面点击对应的导出按钮即可下载。</p>
      <p><a href="https://docs.sillytavern.app/" target="_blank" style="color: #3b82f6;">📖 SillyTavern官方文档</a></p>
    `,
    importance: '重要',
    visibleTo: 'admin'
  },
  {
    title: '忘记密码怎么办？',
    content: `
      <p>如果您忘记了密码：</p>
      <ol>
        <li>我们目前暂不支持自助重置密码</li>
        <li>请联系平台管理员</li>
        <li>提供您的用户名和相关验证信息</li>
        <li>管理员将协助您重置密码</li>
      </ol>
      <p><strong>建议：</strong>请妥善保管您的密码，避免忘记。</p>
    `,
    importance: '必看',
    visibleTo: 'all'
  },
  {
    title: '角色卡数据安全吗？',
    content: `
      <p>我们非常重视数据安全：</p>
      <ul>
        <li><strong>访问控制：</strong>只有创作者本人可以管理自己的角色卡</li>
        <li><strong>数据备份：</strong>定期备份数据库</li>
        <li><strong>安全传输：</strong>所有数据传输均采用HTTPS加密</li>
        <li><strong>API限流：</strong>防止恶意攻击和数据泄露</li>
      </ul>
      <p>您的创作内容受到完善的保护。</p>
    `,
    importance: '重要',
    visibleTo: 'all'
  },
  {
    title: '可以导入角色卡吗？',
    content: `
      <p>目前暂不支持导入功能，但在开发计划中：</p>
      <ul>
        <li>支持PNG格式批量导入</li>
        <li>支持JSON批量导入</li>
      </ul>
      <p>如有大量角色卡需要导入，请联系管理员寻求协助。</p>
    `,
    importance: '普通',
    visibleTo: 'admin'
  }
]

// 过滤FAQ
const filteredFAQs = computed(() => {
  let filtered = faqData.filter(faq => {
    // 用户组权限过滤
    if (faq.visibleTo === 'admin' && userStore.userRole !== 'admin') {
      return false
    }
    if (faq.visibleTo === 'user' && userStore.userRole === 'admin') {
      return false
    }
    
    // 重要程度过滤
    if (selectedImportance.value !== 'all' && faq.importance !== selectedImportance.value) {
      return false
    }
    
    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return faq.title.toLowerCase().includes(query) || 
             faq.content.toLowerCase().includes(query)
    }
    
    return true
  })
  
  // 按重要程度排序
  const importanceOrder = { '必看': 0, '重要': 1, '普通': 2 }
  return filtered.sort((a, b) => importanceOrder[a.importance] - importanceOrder[b.importance])
})

// 组件挂载时展开必看问题
onMounted(() => {
  filteredFAQs.value.forEach((faq, index) => {
    if (faq.importance === '必看') {
      expandedItems.value.add(index)
    }
  })
})
</script>

<style scoped>
.faq-container {
  max-width: 100%;
}

/* 搜索和筛选区域 */
.faq-header {
  margin-bottom: 2rem;
}

.search-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  z-index: 10;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.15);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  white-space: nowrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.875rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* FAQ列表 */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 不同重要程度的样式 */
.faq-必看 {
  border-left: 4px solid #ef4444;
}

.faq-重要 {
  border-left: 4px solid #f59e0b;
}

.faq-普通 {
  border-left: 4px solid #10b981;
}

/* 问题标题区域 */
.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background: rgba(255, 255, 255, 0.05);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.importance-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.tag-必看 {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.tag-重要 {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.tag-普通 {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.question-title {
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.expand-icon {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* 问题回答区域 */
.faq-answer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.answer-content {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 0.875rem;
}

.answer-content p {
  margin-bottom: 1rem;
}

.answer-content ul,
.answer-content ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.answer-content li {
  margin-bottom: 0.5rem;
}

.answer-content strong {
  color: #ffffff;
  font-weight: 600;
}

.answer-content em {
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.answer-content a {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.3s ease;
}

.answer-content a:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.visibility-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: #93c5fd;
  font-size: 0.75rem;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #ffffff;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.875rem;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: unset;
  }
  
  .filter-section {
    justify-content: center;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .question-title {
    font-size: 1rem;
  }
  
  .faq-question {
    padding: 1rem;
  }
  
  .faq-answer {
    padding: 1rem;
  }
}
</style> 