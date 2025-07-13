<template>
  <div class="create-lorebook">
    <div class="form-header">
      <h3 class="form-title">
        <FontAwesomeIcon :icon="faBook" class="title-icon" />
        创建世界书条目
      </h3>
      <p class="form-description">为指定角色卡添加新的世界书条目</p>
    </div>

    <form @submit.prevent="createEntry" class="lorebook-form">
      <!-- 角色卡选择 -->
      <div class="form-section">
        <h4 class="section-title">基础信息</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">目标角色卡</label>
            <select v-model="formData.character_card_id" class="form-select" required>
              <option value="">请选择角色卡</option>
              <option 
                v-for="character in characters" 
                :key="character.id" 
                :value="character.id"
              >
                {{ character.name }} {{ character.version ? `(v${character.version})` : '' }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">条目名称/注释</label>
            <input
              v-model="formData.comment"
              type="text"
              class="form-input"
              placeholder="为这个世界书条目取一个描述性的名称"
              required
              maxlength="500"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label class="form-label required">条目内容</label>
            <textarea
              v-model="formData.content"
              class="form-textarea"
              placeholder="世界书条目的具体内容..."
              required
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 基本设置 -->
      <div class="form-section">
        <h4 class="section-title">基本设置</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">是否启用</label>
            <div class="checkbox-wrapper">
              <input
                id="enabled"
                v-model="formData.enabled"
                type="checkbox"
                class="form-checkbox"
              />
              <label for="enabled" class="checkbox-label">启用此条目</label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">条目类型</label>
            <select v-model="formData.type" class="form-select">
              <option value="selective">selective (选择性)</option>
              <option value="constant">constant (常量)</option>
              <option value="vectorized">vectorized (向量化)</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">显示顺序</label>
            <input
              v-model.number="formData.display_index"
              type="number"
              class="form-input"
              placeholder="用于自定义排序"
            />
          </div>

          <div class="form-group">
            <label class="form-label">条目顺序</label>
            <input
              v-model.number="formData.order"
              type="number"
              class="form-input"
              placeholder="默认100"
              min="0"
              max="1000"
            />
          </div>

          <div class="form-group">
            <label class="form-label">触发概率 (%)</label>
            <input
              v-model.number="formData.probability"
              type="number"
              class="form-input"
              placeholder="默认100"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <!-- 位置设置 -->
      <div class="form-section">
        <h4 class="section-title">插入位置</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">插入位置</label>
            <select v-model="formData.position" class="form-select">
              <option value="before_character_definition">角色定义之前</option>
              <option value="after_character_definition">角色定义之后</option>
              <option value="before_example_messages">示例消息之前</option>
              <option value="after_example_messages">示例消息之后</option>
              <option value="before_author_note">作者注释之前</option>
              <option value="after_author_note">作者注释之后</option>
              <option value="at_depth_as_system">指定深度(系统)</option>
              <option value="at_depth_as_assistant">指定深度(助手)</option>
              <option value="at_depth_as_user">指定深度(用户)</option>
            </select>
          </div>

          <div class="form-group" v-if="isDepthPosition">
            <label class="form-label">深度值</label>
            <input
              v-model.number="formData.depth"
              type="number"
              class="form-input"
              placeholder="仅当位置为指定深度时有效"
              min="0"
            />
          </div>
        </div>
      </div>

      <!-- 触发条件 -->
      <div class="form-section">
        <h4 class="section-title">触发条件</h4>
        
        <div class="form-row">
          <div class="form-group full-width">
            <label class="form-label">关键词</label>
            <div class="tag-input-wrapper">
              <div class="tags">
                <span 
                  v-for="(key, index) in formData.keys" 
                  :key="index" 
                  class="tag"
                >
                  {{ key }}
                  <button 
                    type="button" 
                    @click="removeKey(index)" 
                    class="tag-remove"
                  >
                    <FontAwesomeIcon :icon="faTimes" />
                  </button>
                </span>
              </div>
              <input
                v-model="newKey"
                @keydown.enter.prevent="addKey"
                type="text"
                class="tag-input"
                placeholder="输入关键词后按回车添加"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">逻辑操作</label>
            <select v-model="formData.logic" class="form-select">
              <option value="and_any">AND任意 (默认)</option>
              <option value="and_all">AND全部</option>
              <option value="not_all">NOT全部</option>
              <option value="not_any">NOT任意</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label class="form-label">过滤器</label>
            <div class="tag-input-wrapper">
              <div class="tags">
                <span 
                  v-for="(filter, index) in formData.filters" 
                  :key="index" 
                  class="tag"
                >
                  {{ filter }}
                  <button 
                    type="button" 
                    @click="removeFilter(index)" 
                    class="tag-remove"
                  >
                    <FontAwesomeIcon :icon="faTimes" />
                  </button>
                </span>
              </div>
              <input
                v-model="newFilter"
                @keydown.enter.prevent="addFilter"
                type="text"
                class="tag-input"
                placeholder="输入过滤器后按回车添加"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="form-section">
        <h4 class="section-title">高级设置</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">扫描深度</label>
            <div class="advanced-setting">
              <select v-model="scanDepthType" class="form-select">
                <option value="global">使用全局设置</option>
                <option value="custom">自定义</option>
              </select>
              <input
                v-if="scanDepthType === 'custom'"
                v-model.number="scanDepthValue"
                type="number"
                class="form-input"
                placeholder="数值"
                min="1"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">大小写敏感</label>
            <div class="advanced-setting">
              <select v-model="caseSensitiveType" class="form-select">
                <option value="global">使用全局设置</option>
                <option value="custom">自定义</option>
              </select>
              <select
                v-if="caseSensitiveType === 'custom'"
                v-model="caseSensitiveValue"
                class="form-select"
              >
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">匹配整词</label>
            <div class="advanced-setting">
              <select v-model="matchWholeWordsType" class="form-select">
                <option value="global">使用全局设置</option>
                <option value="custom">自定义</option>
              </select>
              <select
                v-if="matchWholeWordsType === 'custom'"
                v-model="matchWholeWordsValue"
                class="form-select"
              >
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">使用组评分</label>
            <div class="advanced-setting">
              <select v-model="useGroupScoringType" class="form-select">
                <option value="global">使用全局设置</option>
                <option value="custom">自定义</option>
              </select>
              <select
                v-if="useGroupScoringType === 'custom'"
                v-model="useGroupScoringValue"
                class="form-select"
              >
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 组设置 -->
      <div class="form-section">
        <h4 class="section-title">组设置</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">所属组</label>
            <input
              v-model="formData.group"
              type="text"
              class="form-input"
              placeholder="组名称"
            />
          </div>

          <div class="form-group">
            <label class="form-label">组权重</label>
            <input
              v-model.number="formData.group_weight"
              type="number"
              class="form-input"
              placeholder="默认100"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <div class="checkbox-wrapper">
              <input
                id="group_prioritized"
                v-model="formData.group_prioritized"
                type="checkbox"
                class="form-checkbox"
              />
              <label for="group_prioritized" class="checkbox-label">组优先</label>
            </div>
          </div>
        </div>
      </div>

      <!-- 特殊功能 -->
      <div class="form-section">
        <h4 class="section-title">特殊功能</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">自动化ID</label>
            <input
              v-model="formData.automation_id"
              type="text"
              class="form-input"
              placeholder="自动化标识符"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <div class="checkbox-wrapper">
              <input
                id="exclude_recursion"
                v-model="formData.exclude_recursion"
                type="checkbox"
                class="form-checkbox"
              />
              <label for="exclude_recursion" class="checkbox-label">排除递归</label>
            </div>
          </div>

          <div class="form-group">
            <div class="checkbox-wrapper">
              <input
                id="prevent_recursion"
                v-model="formData.prevent_recursion"
                type="checkbox"
                class="form-checkbox"
              />
              <label for="prevent_recursion" class="checkbox-label">防止递归</label>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">延迟直到递归</label>
            <div class="advanced-setting">
              <select v-model="delayUntilRecursionType" class="form-select">
                <option value="boolean">布尔值</option>
                <option value="number">数值</option>
              </select>
              <select
                v-if="delayUntilRecursionType === 'boolean'"
                v-model="delayUntilRecursionBoolValue"
                class="form-select"
              >
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
              <input
                v-else
                v-model.number="delayUntilRecursionNumValue"
                type="number"
                class="form-input"
                placeholder="递归级别"
                min="0"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Sticky值</label>
            <input
              v-model.number="formData.sticky"
              type="number"
              class="form-input"
              placeholder="Sticky值"
              min="0"
            />
          </div>

          <div class="form-group">
            <label class="form-label">冷却时间</label>
            <input
              v-model.number="formData.cooldown"
              type="number"
              class="form-input"
              placeholder="冷却时间(轮)"
              min="0"
            />
          </div>

          <div class="form-group">
            <label class="form-label">延迟时间</label>
            <input
              v-model.number="formData.delay"
              type="number"
              class="form-input"
              placeholder="延迟时间(轮)"
              min="0"
            />
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          重置表单
        </button>
        <button type="submit" class="btn-primary" :disabled="isCreating">
          <FontAwesomeIcon v-if="isCreating" :icon="faSpinner" class="fa-spin" />
          {{ isCreating ? '创建中...' : '创建世界书条目' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faBook,
  faTimes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'

const userStore = useUserStore()

// 响应式数据
const characters = ref([])
const isCreating = ref(false)

// 表单数据
const formData = ref({
  character_card_id: '',
  comment: '',
  content: '',
  enabled: true,
  type: 'selective',
  display_index: null,
  order: 100,
  probability: 100.0,
  position: 'before_character_definition',
  depth: null,
  keys: [],
  logic: 'and_any',
  filters: [],
  group: '',
  group_prioritized: false,
  group_weight: 100.0,
  automation_id: '',
  exclude_recursion: false,
  prevent_recursion: false,
  sticky: null,
  cooldown: null,
  delay: null
})

// 标签输入
const newKey = ref('')
const newFilter = ref('')

// 高级设置的类型选择
const scanDepthType = ref('global')
const scanDepthValue = ref(null)
const caseSensitiveType = ref('global')
const caseSensitiveValue = ref(false)
const matchWholeWordsType = ref('global')
const matchWholeWordsValue = ref(false)
const useGroupScoringType = ref('global')
const useGroupScoringValue = ref(false)
const delayUntilRecursionType = ref('boolean')
const delayUntilRecursionBoolValue = ref(false)
const delayUntilRecursionNumValue = ref(null)

// 计算属性
const isDepthPosition = computed(() => {
  return formData.value.position && formData.value.position.includes('at_depth')
})

// 获取角色卡列表
const fetchCharacters = async () => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/admin/characters', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    characters.value = data.characters || []
  } catch (error) {
    console.error('获取角色卡列表失败:', error)
    alert('获取角色卡列表失败，请刷新页面重试')
  }
}

// 添加关键词
const addKey = () => {
  const key = newKey.value.trim()
  if (key && !formData.value.keys.includes(key)) {
    formData.value.keys.push(key)
    newKey.value = ''
  }
}

// 移除关键词
const removeKey = (index) => {
  formData.value.keys.splice(index, 1)
}

// 添加过滤器
const addFilter = () => {
  const filter = newFilter.value.trim()
  if (filter && !formData.value.filters.includes(filter)) {
    formData.value.filters.push(filter)
    newFilter.value = ''
  }
}

// 移除过滤器
const removeFilter = (index) => {
  formData.value.filters.splice(index, 1)
}

// 重置表单
const resetForm = () => {
  formData.value = {
    character_card_id: '',
    comment: '',
    content: '',
    enabled: true,
    type: 'selective',
    display_index: null,
    order: 100,
    probability: 100.0,
    position: 'before_character_definition',
    depth: null,
    keys: [],
    logic: 'and_any',
    filters: [],
    group: '',
    group_prioritized: false,
    group_weight: 100.0,
    automation_id: '',
    exclude_recursion: false,
    prevent_recursion: false,
    sticky: null,
    cooldown: null,
    delay: null
  }
  
  // 重置高级设置
  scanDepthType.value = 'global'
  scanDepthValue.value = null
  caseSensitiveType.value = 'global'
  caseSensitiveValue.value = false
  matchWholeWordsType.value = 'global'
  matchWholeWordsValue.value = false
  useGroupScoringType.value = 'global'
  useGroupScoringValue.value = false
  delayUntilRecursionType.value = 'boolean'
  delayUntilRecursionBoolValue.value = false
  delayUntilRecursionNumValue.value = null
}

// 构建API请求数据
const buildRequestData = () => {
  const data = {
    character_card_id: parseInt(formData.value.character_card_id),
    comment: formData.value.comment.trim(),
    content: formData.value.content.trim()
  }

  // 只添加非空的可选字段
  if (formData.value.enabled !== null) data.enabled = formData.value.enabled
  if (formData.value.type) data.type = formData.value.type
  if (formData.value.position) data.position = formData.value.position
  if (formData.value.order !== null) data.order = formData.value.order
  if (formData.value.probability !== null) data.probability = formData.value.probability
  if (formData.value.keys && formData.value.keys.length > 0) data.keys = formData.value.keys
  if (formData.value.logic) data.logic = formData.value.logic
  if (formData.value.filters && formData.value.filters.length > 0) data.filters = formData.value.filters
  if (formData.value.group_prioritized !== null) data.group_prioritized = formData.value.group_prioritized
  if (formData.value.group_weight !== null) data.group_weight = formData.value.group_weight
  if (formData.value.exclude_recursion !== null) data.exclude_recursion = formData.value.exclude_recursion
  if (formData.value.prevent_recursion !== null) data.prevent_recursion = formData.value.prevent_recursion

  // 可选字段
  if (formData.value.display_index !== null) {
    data.display_index = formData.value.display_index
  }
  if (formData.value.depth !== null && isDepthPosition.value) {
    data.depth = formData.value.depth
  }
  if (formData.value.group) {
    data.group = formData.value.group
  }
  if (formData.value.automation_id) {
    data.automation_id = formData.value.automation_id
  }
  if (formData.value.sticky !== null) {
    data.sticky = formData.value.sticky
  }
  if (formData.value.cooldown !== null) {
    data.cooldown = formData.value.cooldown
  }
  if (formData.value.delay !== null) {
    data.delay = formData.value.delay
  }

  // 高级设置 - 正确的map[string]interface{}格式
  if (scanDepthType.value === 'global') {
    data.scan_depth = { "global": "same_as_global" }
  } else if (scanDepthValue.value !== null) {
    data.scan_depth = { "value": scanDepthValue.value }
  }

  if (caseSensitiveType.value === 'global') {
    data.case_sensitive = { "global": "same_as_global" }
  } else {
    data.case_sensitive = { "value": caseSensitiveValue.value }
  }

  if (matchWholeWordsType.value === 'global') {
    data.match_whole_words = { "global": "same_as_global" }
  } else {
    data.match_whole_words = { "value": matchWholeWordsValue.value }
  }

  if (useGroupScoringType.value === 'global') {
    data.use_group_scoring = { "global": "same_as_global" }
  } else {
    data.use_group_scoring = { "value": useGroupScoringValue.value }
  }

  if (delayUntilRecursionType.value === 'boolean') {
    data.delay_until_recursion = { "value": delayUntilRecursionBoolValue.value }
  } else if (delayUntilRecursionNumValue.value !== null) {
    data.delay_until_recursion = { "value": delayUntilRecursionNumValue.value }
  }

  return data
}

// 创建世界书条目
const createEntry = async () => {
  if (!formData.value.character_card_id) {
    alert('请选择角色卡')
    return
  }

  if (!formData.value.comment.trim()) {
    alert('请输入条目名称/注释')
    return
  }

  if (!formData.value.content.trim()) {
    alert('请输入条目内容')
    return
  }

  try {
    isCreating.value = true
    const token = localStorage.getItem('token')
    
    const requestData = buildRequestData()
    
    // 调试信息 - 打印发送的数据
    console.log('发送的请求数据:', JSON.stringify(requestData, null, 2))
    
    const response = await fetch('/api/admin/lorebook', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API错误响应:', errorData)
      const errorMessage = errorData.details ? 
        `${errorData.error}: ${errorData.details}` : 
        (errorData.error || '创建失败')
      throw new Error(errorMessage)
    }

    const createdEntry = await response.json()
    alert('世界书条目创建成功！')
    resetForm()
  } catch (error) {
    console.error('创建世界书条目失败:', error)
    alert(`创建失败: ${error.message}`)
  } finally {
    isCreating.value = false
  }
}

// 组件挂载时获取角色卡列表
onMounted(() => {
  fetchCharacters()
})
</script>

<style scoped>
.create-lorebook {
  color: #ffffff;
  max-width: 1000px;
  margin: 0 auto;
}

/* 表单头部 */
.form-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.title-icon {
  color: #3b82f6;
}

.form-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

/* 表单布局 */
.lorebook-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

/* 表单控件 */
.form-label {
  display: block;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-select option {
  background: #1e293b;
  color: #ffffff;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* 复选框样式 */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.checkbox-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  cursor: pointer;
}

/* 标签输入 */
.tag-input-wrapper {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  min-height: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag-input-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-remove {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 0;
  font-size: 0.75rem;
}

.tag-remove:hover {
  color: #ef4444;
}

.tag-input {
  flex: 1;
  background: none;
  border: none;
  color: #ffffff;
  outline: none;
  font-size: 0.875rem;
  min-width: 150px;
}

.tag-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* 高级设置 */
.advanced-setting {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.advanced-setting .form-select,
.advanced-setting .form-input {
  flex: 1;
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary,
.btn-primary {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .advanced-setting {
    flex-direction: column;
  }
}
</style> 