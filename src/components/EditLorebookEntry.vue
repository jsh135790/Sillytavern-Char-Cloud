<template>
  <div class="edit-lorebook">
    <div class="form-header">
      <h3 class="form-title">
        <FontAwesomeIcon :icon="faEdit" class="title-icon" />
        修改世界书条目
      </h3>
      <p class="form-description">选择角色卡和世界书条目进行修改</p>
    </div>

    <!-- 选择器区域 -->
    <div class="selector-section">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">选择角色卡</label>
          <select v-model="selectedCharacterId" class="form-select" @change="onCharacterChange" :disabled="isLoading">
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

        <div class="form-group">
          <label class="form-label required">选择世界书条目</label>
          <select 
            v-model="selectedEntryId" 
            class="form-select" 
            @change="onEntryChange" 
            :disabled="!selectedCharacterId || isLoadingEntries"
          >
            <option value="">请选择世界书条目</option>
            <option 
              v-for="entry in lorebookEntries" 
              :key="entry.id" 
              :value="entry.id"
            >
              {{ entry.comment }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="selectedEntryId && selectedEntry" class="entry-preview">
        <h4>当前条目预览</h4>
        <div class="preview-item">
          <span class="preview-label">条目名称:</span>
          <span class="preview-value">{{ selectedEntry.comment }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">条目类型:</span>
          <span class="preview-value">{{ selectedEntry.type || 'selective' }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">是否启用:</span>
          <span class="preview-value">{{ selectedEntry.enabled ? '是' : '否' }}</span>
        </div>
      </div>
    </div>

    <!-- 编辑表单 - 仅在选择了条目后显示 -->
    <div v-if="selectedEntryId && formData.comment" class="edit-form-container">
    <!-- <div v-if="selectedEntryId" class="edit-form-container"> -->
      <form @submit.prevent="updateEntry" class="lorebook-form">
        <!-- 基础信息 -->
        <div class="form-section">
          <h4 class="section-title">基础信息</h4>
          
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
                  <option value="global">全局设置</option>
                  <option value="custom">自定义</option>
                </select>
                <input
                  v-if="scanDepthType === 'custom'"
                  v-model.number="scanDepthValue"
                  type="number"
                  class="form-input"
                  placeholder="扫描深度"
                  min="0"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">大小写敏感</label>
              <div class="advanced-setting">
                <select v-model="caseSensitiveType" class="form-select">
                  <option value="global">全局设置</option>
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
                  <option value="global">全局设置</option>
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

            <div class="form-group">
              <label class="form-label">使用组评分</label>
              <div class="advanced-setting">
                <select v-model="useGroupScoringType" class="form-select">
                  <option value="global">全局设置</option>
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

            <div class="form-group">
              <label class="form-label">组优先</label>
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
              <label class="form-label">递归设置</label>
              <div class="checkbox-wrapper">
                <input
                  id="exclude_recursion"
                  v-model="formData.exclude_recursion"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="exclude_recursion" class="checkbox-label">排除递归</label>
              </div>
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

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button 
            type="button" 
            @click="deleteEntry" 
            class="btn-danger" 
            :disabled="isUpdating || isDeleting"
          >
            <FontAwesomeIcon v-if="isDeleting" :icon="faSpinner" class="fa-spin" />
            <FontAwesomeIcon v-else :icon="faTrash" />
            {{ isDeleting ? '删除中...' : '删除世界书' }}
          </button>
          
          <button type="submit" class="btn-primary" :disabled="isUpdating || isDeleting">
            <FontAwesomeIcon v-if="isUpdating" :icon="faSpinner" class="fa-spin" />
            <FontAwesomeIcon v-else :icon="faSave" />
            {{ isUpdating ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>确认删除</h3>
          <button @click="closeDeleteModal" class="close-btn">
            <FontAwesomeIcon :icon="faTimes" />
          </button>
        </div>
        
        <div class="delete-content">
          <div class="warning-icon">
            <FontAwesomeIcon :icon="faExclamationTriangle" />
          </div>
          <p>您确定要删除世界书条目 <strong>"{{ selectedEntry?.comment }}"</strong> 吗？</p>
          <p class="warning-text">此操作无法撤销！</p>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeDeleteModal" class="btn-secondary">
            取消
          </button>
          <button @click="confirmDelete" class="btn-danger" :disabled="isDeleting">
            <FontAwesomeIcon v-if="isDeleting" :icon="faSpinner" class="fa-spin" />
            {{ isDeleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faEdit,
  faTimes,
  faSpinner,
  faTrash,
  faSave,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'

const userStore = useUserStore()

// 响应式数据
const characters = ref([])
const lorebookEntries = ref([])
const selectedCharacterId = ref('')
const selectedEntryId = ref('')
const isLoading = ref(false)
const isLoadingEntries = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)

// 新建标签输入
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

// 表单数据
const formData = ref({
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

// 计算属性
const selectedEntry = computed(() => {
  if (!selectedEntryId.value) return null
  return lorebookEntries.value.find(entry => entry.id === parseInt(selectedEntryId.value))
})

const isDepthPosition = computed(() => {
  return formData.value.position && formData.value.position.includes('at_depth')
})

// 获取角色卡列表
const fetchCharacters = async () => {
  try {
    isLoading.value = true
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
  } finally {
    isLoading.value = false
  }
}

// 角色卡变化时清空世界书选择
const onCharacterChange = () => {
  selectedEntryId.value = ''
  lorebookEntries.value = []
  resetFormData()
  if (selectedCharacterId.value) {
    fetchLorebookEntries()
  }
}

// 获取世界书条目列表
const fetchLorebookEntries = async () => {
  if (!selectedCharacterId.value) return

  try {
    isLoadingEntries.value = true
    const token = localStorage.getItem('token')
    
    // 先获取角色卡信息以得到名称
    const character = characters.value.find(c => c.id === parseInt(selectedCharacterId.value))
    if (!character) return

    const response = await fetch(`/api/character/${encodeURIComponent(character.name)}/lorebook/entries`, {
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
    lorebookEntries.value = data.entries || []
  } catch (error) {
    console.error('获取世界书条目失败:', error)
    alert('获取世界书条目失败')
  } finally {
    isLoadingEntries.value = false
  }
}

// 世界书条目变化时加载数据到表单
const onEntryChange = () => {
  if (!selectedEntryId.value) {
    resetFormData()
    return
  }

  const entry = selectedEntry.value
  if (!entry) return

  // 加载条目数据到表单
  formData.value = {
    comment: entry.comment || '',
    content: entry.content || '',
    enabled: entry.enabled !== null ? entry.enabled : true,
    type: entry.type || 'selective',
    display_index: entry.display_index,
    order: entry.order !== null ? entry.order : 100,
    probability: entry.probability !== null ? entry.probability : 100.0,
    position: entry.position || 'before_character_definition',
    depth: entry.depth,
    keys: entry.keys || [],
    logic: entry.logic || 'and_any',
    filters: entry.filters || [],
    group: entry.group || '',
    group_prioritized: entry.group_prioritized !== null ? entry.group_prioritized : false,
    group_weight: entry.group_weight !== null ? entry.group_weight : 100.0,
    automation_id: entry.automation_id || '',
    exclude_recursion: entry.exclude_recursion !== null ? entry.exclude_recursion : false,
    prevent_recursion: entry.prevent_recursion !== null ? entry.prevent_recursion : false,
    sticky: entry.sticky,
    cooldown: entry.cooldown,
    delay: entry.delay
  }

  // 加载高级设置数据
  loadAdvancedSettings(entry)
}

// 加载高级设置
const loadAdvancedSettings = (entry) => {
  // 扫描深度
  if (entry.scan_depth) {
    if (entry.scan_depth.global) {
      scanDepthType.value = 'global'
    } else {
      scanDepthType.value = 'custom'
      scanDepthValue.value = entry.scan_depth.value
    }
  } else {
    scanDepthType.value = 'global'
  }

  // 大小写敏感
  if (entry.case_sensitive) {
    if (entry.case_sensitive.global) {
      caseSensitiveType.value = 'global'
    } else {
      caseSensitiveType.value = 'custom'
      caseSensitiveValue.value = entry.case_sensitive.value
    }
  } else {
    caseSensitiveType.value = 'global'
  }

  // 匹配整词
  if (entry.match_whole_words) {
    if (entry.match_whole_words.global) {
      matchWholeWordsType.value = 'global'
    } else {
      matchWholeWordsType.value = 'custom'
      matchWholeWordsValue.value = entry.match_whole_words.value
    }
  } else {
    matchWholeWordsType.value = 'global'
  }

  // 使用组评分
  if (entry.use_group_scoring) {
    if (entry.use_group_scoring.global) {
      useGroupScoringType.value = 'global'
    } else {
      useGroupScoringType.value = 'custom'
      useGroupScoringValue.value = entry.use_group_scoring.value
    }
  } else {
    useGroupScoringType.value = 'global'
  }

  // 延迟直到递归
  if (entry.delay_until_recursion) {
    if (typeof entry.delay_until_recursion.value === 'boolean') {
      delayUntilRecursionType.value = 'boolean'
      delayUntilRecursionBoolValue.value = entry.delay_until_recursion.value
    } else {
      delayUntilRecursionType.value = 'number'
      delayUntilRecursionNumValue.value = entry.delay_until_recursion.value
    }
  } else {
    delayUntilRecursionType.value = 'boolean'
    delayUntilRecursionBoolValue.value = false
  }
}

// 重置表单数据
const resetFormData = () => {
  formData.value = {
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

// 更新世界书条目
const updateEntry = async () => {
  if (!selectedEntryId.value) {
    alert('请选择要修改的世界书条目')
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
    isUpdating.value = true
    const token = localStorage.getItem('token')
    
    const requestData = buildUpdateRequestData()
    
    console.log('更新请求数据:', JSON.stringify(requestData, null, 2))
    
    const response = await fetch(`/api/admin/lorebook/${selectedEntryId.value}`, {
      method: 'PUT',
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
        (errorData.error || '更新失败')
      throw new Error(errorMessage)
    }

    const updatedEntry = await response.json()
    alert('世界书条目更新成功！')
    
    // 刷新条目列表
    await fetchLorebookEntries()
    // 重新加载表单数据
    onEntryChange()
  } catch (error) {
    console.error('更新世界书条目失败:', error)
    alert(`更新失败: ${error.message}`)
  } finally {
    isUpdating.value = false
  }
}

// 构建更新请求数据
const buildUpdateRequestData = () => {
  const data = {
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
  if (formData.value.display_index !== null) data.display_index = formData.value.display_index
  if (formData.value.depth !== null && isDepthPosition.value) data.depth = formData.value.depth
  if (formData.value.group) data.group = formData.value.group
  if (formData.value.automation_id) data.automation_id = formData.value.automation_id
  if (formData.value.sticky !== null) data.sticky = formData.value.sticky
  if (formData.value.cooldown !== null) data.cooldown = formData.value.cooldown
  if (formData.value.delay !== null) data.delay = formData.value.delay

  // 高级设置字段 - 使用正确的map[string]interface{}格式
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

// 删除世界书条目
const deleteEntry = () => {
  if (!selectedEntryId.value) {
    alert('请选择要删除的世界书条目')
    return
  }
  showDeleteModal.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!selectedEntryId.value) return

  try {
    isDeleting.value = true
    const token = localStorage.getItem('token')
    
    const response = await fetch(`/api/admin/lorebook/${selectedEntryId.value}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '删除失败')
    }

    alert('世界书条目删除成功！')
    showDeleteModal.value = false
    
    // 重置选择和表单
    selectedEntryId.value = ''
    resetFormData()
    
    // 刷新条目列表
    await fetchLorebookEntries()
  } catch (error) {
    console.error('删除世界书条目失败:', error)
    alert(`删除失败: ${error.message}`)
  } finally {
    isDeleting.value = false
  }
}

// 关闭删除模态框
const closeDeleteModal = () => {
  showDeleteModal.value = false
}

// 组件挂载时获取角色卡列表
onMounted(() => {
  fetchCharacters()
})
</script>

<style scoped>
/* 基础样式 */
.edit-lorebook {
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

/* 高级设置样式 */
.advanced-setting {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.advanced-setting .form-select,
.advanced-setting .form-input {
  flex: 1;
}

/* 选择器区域特有样式 */
.selector-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.entry-preview {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.entry-preview h4 {
  color: #3b82f6;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.preview-value {
  color: #ffffff;
  font-weight: 500;
  font-size: 0.875rem;
}

.edit-form-container {
  margin-top: 2rem;
}

/* 按钮样式调整 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-danger {
  background: #ef4444;
  color: #ffffff;
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

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 表单操作按钮 */
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

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.delete-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.warning-icon {
  color: #f59e0b;
  font-size: 3rem;
  margin-bottom: 1rem;
}

.delete-content p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.warning-text {
  color: #ef4444;
  font-weight: 600;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-danger,
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style> 