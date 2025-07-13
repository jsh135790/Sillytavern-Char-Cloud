<template>
  <div class="edit-regex">
    <div class="form-header">
      <h3 class="form-title">
        <FontAwesomeIcon :icon="faCogs" class="title-icon" />
        修改正则表达式
      </h3>
      <p class="form-description">选择角色卡和正则条目进行修改</p>
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
          <label class="form-label required">选择正则条目</label>
          <select 
            v-model="selectedRegexId" 
            class="form-select" 
            @change="onRegexChange" 
            :disabled="!selectedCharacterId || isLoadingRegexes"
          >
            <option value="">请选择正则条目</option>
            <option 
              v-for="regex in regexEntries" 
              :key="regex.id" 
              :value="regex.id"
            >
              {{ regex.script_name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="selectedRegexId && selectedRegex" class="entry-preview">
        <h4>当前条目预览</h4>
        <div class="preview-item">
          <span class="preview-label">脚本名称:</span>
          <span class="preview-value">{{ selectedRegex.script_name }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">作用域:</span>
          <span class="preview-value">{{ selectedRegex.scope || 'character' }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">是否启用:</span>
          <span class="preview-value">{{ selectedRegex.enabled ? '是' : '否' }}</span>
        </div>
      </div>
    </div>

    <!-- 编辑表单 - 仅在选择了条目后显示 -->
    <div v-if="selectedRegexId && formData.script_name" class="edit-form-container">
      <form @submit.prevent="updateRegex" class="regex-form">
        <!-- 基础信息 -->
        <div class="form-section">
          <h4 class="section-title">基础信息</h4>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">脚本名称</label>
              <input
                v-model="formData.script_name"
                type="text"
                class="form-input"
                placeholder="为这个正则规则取一个描述性的名称"
                required
                maxlength="255"
              />
            </div>

            <div class="form-group">
              <label class="form-label">正则ID</label>
              <input
                v-model="formData.regex_id"
                type="text"
                class="form-input"
                placeholder="可选的唯一标识符"
                maxlength="255"
              />
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
                <label for="enabled" class="checkbox-label">启用此正则</label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">编辑时运行</label>
              <div class="checkbox-wrapper">
                <input
                  id="run_on_edit"
                  v-model="formData.run_on_edit"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="run_on_edit" class="checkbox-label">在编辑时运行正则</label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">作用域</label>
              <select v-model="formData.scope" class="form-select">
                <option value="character">角色专属</option>
                <option value="global">全局</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 正则规则 -->
        <div class="form-section">
          <h4 class="section-title">正则规则</h4>
          
          <div class="form-row">
            <div class="form-group full-width">
              <label class="form-label">查找正则</label>
              <textarea
                v-model="formData.find_regex"
                class="form-textarea"
                placeholder="输入要匹配的正则表达式..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label class="form-label">替换字符串</label>
              <textarea
                v-model="formData.replace_string"
                class="form-textarea"
                placeholder="输入替换的内容，可以使用 $1, $2 等捕获组..."
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 触发来源 -->
        <div class="form-section">
          <h4 class="section-title">触发来源</h4>
          <p class="section-description">选择此正则应该处理哪些来源的文本</p>
          
          <div class="form-row">
            <div class="form-group">
              <div class="checkbox-wrapper">
                <input
                  id="source_user_input"
                  v-model="formData.source.user_input"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="source_user_input" class="checkbox-label">用户输入</label>
              </div>
            </div>

            <div class="form-group">
              <div class="checkbox-wrapper">
                <input
                  id="source_ai_output"
                  v-model="formData.source.ai_output"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="source_ai_output" class="checkbox-label">AI输出</label>
              </div>
            </div>

            <div class="form-group">
              <div class="checkbox-wrapper">
                <input
                  id="source_slash_command"
                  v-model="formData.source.slash_command"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="source_slash_command" class="checkbox-label">斜杠命令</label>
              </div>
            </div>

            <div class="form-group">
              <div class="checkbox-wrapper">
                <input
                  id="source_world_info"
                  v-model="formData.source.world_info"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="source_world_info" class="checkbox-label">世界书信息</label>
              </div>
            </div>
          </div>
        </div>

        <!-- 输出目标 -->
        <div class="form-section">
          <h4 class="section-title">输出目标</h4>
          <p class="section-description">选择处理后的文本应该应用到哪里</p>
          
          <div class="form-row">
            <div class="form-group">
              <div class="checkbox-wrapper">
                <input
                  id="destination_display"
                  v-model="formData.destination.display"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="destination_display" class="checkbox-label">显示文本</label>
              </div>
            </div>

            <div class="form-group">
              <div class="checkbox-wrapper">
                <input
                  id="destination_prompt"
                  v-model="formData.destination.prompt"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="destination_prompt" class="checkbox-label">提示文本</label>
              </div>
            </div>
          </div>
        </div>

        <!-- 深度设置 -->
        <div class="form-section">
          <h4 class="section-title">深度设置</h4>
          <p class="section-description">可选：限制正则作用的聊天历史深度范围</p>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">最小深度</label>
              <input
                v-model.number="formData.min_depth"
                type="number"
                class="form-input"
                placeholder="留空表示不限制"
                min="0"
              />
            </div>

            <div class="form-group">
              <label class="form-label">最大深度</label>
              <input
                v-model.number="formData.max_depth"
                type="number"
                class="form-input"
                placeholder="留空表示不限制"
                min="0"
              />
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button 
            type="button" 
            @click="deleteRegex" 
            class="btn-danger" 
            :disabled="isUpdating || isDeleting"
          >
            <FontAwesomeIcon v-if="isDeleting" :icon="faSpinner" class="fa-spin" />
            <FontAwesomeIcon v-else :icon="faTrash" />
            {{ isDeleting ? '删除中...' : '删除正则' }}
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
          <p>您确定要删除正则条目 <strong>"{{ selectedRegex?.script_name }}"</strong> 吗？</p>
          <p class="warning-text">此操作无法撤销！</p>
          
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faCogs,
  faTimes,
  faSpinner,
  faTrash,
  faSave,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'

const userStore = useUserStore()

// 响应式数据
const characters = ref([])
const regexEntries = ref([])
const selectedCharacterId = ref('')
const selectedRegexId = ref('')
const isLoading = ref(false)
const isLoadingRegexes = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)

// 表单数据
const formData = ref({
  regex_id: '',
  script_name: '',
  enabled: true,
  run_on_edit: false,
  scope: 'character',
  find_regex: '',
  replace_string: '',
  source: {
    user_input: false,
    ai_output: false,
    slash_command: false,
    world_info: false
  },
  destination: {
    display: false,
    prompt: false
  },
  min_depth: null,
  max_depth: null
})

// 计算属性
const selectedRegex = computed(() => {
  if (!selectedRegexId.value) return null
  return regexEntries.value.find(regex => regex.id === parseInt(selectedRegexId.value))
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

// 角色卡变化时清空正则选择
const onCharacterChange = () => {
  selectedRegexId.value = ''
  regexEntries.value = []
  resetFormData()
  if (selectedCharacterId.value) {
    fetchRegexEntries()
  }
}

// 获取正则条目列表
const fetchRegexEntries = async () => {
  if (!selectedCharacterId.value) return

  try {
    isLoadingRegexes.value = true
    const token = localStorage.getItem('token')
    
    // 先获取角色卡信息以得到名称
    const character = characters.value.find(c => c.id === parseInt(selectedCharacterId.value))
    if (!character) return

    const response = await fetch(`/api/character/${encodeURIComponent(character.name)}/regex/entries`, {
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
    regexEntries.value = data.regexes || []
  } catch (error) {
    console.error('获取正则条目列表失败:', error)
    alert('获取正则条目列表失败')
  } finally {
    isLoadingRegexes.value = false
  }
}

// 正则条目变化时加载数据
const onRegexChange = () => {
  if (selectedRegexId.value && selectedRegex.value) {
    loadFormData(selectedRegex.value)
  } else {
    resetFormData()
  }
}

// 加载选中正则的数据到表单
const loadFormData = (regex) => {
  formData.value = {
    regex_id: regex.regex_id || '',
    script_name: regex.script_name || '',
    enabled: regex.enabled !== null ? regex.enabled : true,
    run_on_edit: regex.run_on_edit !== null ? regex.run_on_edit : false,
    scope: regex.scope || 'character',
    find_regex: regex.find_regex || '',
    replace_string: regex.replace_string || '',
    source: {
      user_input: regex.source?.user_input || false,
      ai_output: regex.source?.ai_output || false,
      slash_command: regex.source?.slash_command || false,
      world_info: regex.source?.world_info || false
    },
    destination: {
      display: regex.destination?.display || false,
      prompt: regex.destination?.prompt || false
    },
    min_depth: regex.min_depth,
    max_depth: regex.max_depth
  }
}

// 重置表单数据
const resetFormData = () => {
  formData.value = {
    regex_id: '',
    script_name: '',
    enabled: true,
    run_on_edit: false,
    scope: 'character',
    find_regex: '',
    replace_string: '',
    source: {
      user_input: false,
      ai_output: false,
      slash_command: false,
      world_info: false
    },
    destination: {
      display: false,
      prompt: false
    },
    min_depth: null,
    max_depth: null
  }
}

// 构建更新请求数据
const buildUpdateRequestData = () => {
  const data = {
    script_name: formData.value.script_name.trim(),
    source: {
      user_input: formData.value.source.user_input,
      ai_output: formData.value.source.ai_output,
      slash_command: formData.value.source.slash_command,
      world_info: formData.value.source.world_info
    },
    destination: {
      display: formData.value.destination.display,
      prompt: formData.value.destination.prompt
    }
  }

  // 只添加非空的可选字段
  if (formData.value.regex_id && formData.value.regex_id.trim()) {
    data.regex_id = formData.value.regex_id.trim()
  }
  if (formData.value.enabled !== null) data.enabled = formData.value.enabled
  if (formData.value.run_on_edit !== null) data.run_on_edit = formData.value.run_on_edit
  if (formData.value.scope) data.scope = formData.value.scope
  if (formData.value.find_regex && formData.value.find_regex.trim()) {
    data.find_regex = formData.value.find_regex.trim()
  }
  if (formData.value.replace_string && formData.value.replace_string.trim()) {
    data.replace_string = formData.value.replace_string.trim()
  }
  if (formData.value.min_depth !== null && formData.value.min_depth !== undefined) {
    data.min_depth = formData.value.min_depth
  }
  if (formData.value.max_depth !== null && formData.value.max_depth !== undefined) {
    data.max_depth = formData.value.max_depth
  }

  return data
}

// 更新正则
const updateRegex = async () => {
  if (!selectedRegexId.value) {
    alert('请选择要修改的正则条目')
    return
  }

  if (!formData.value.script_name.trim()) {
    alert('请输入脚本名称')
    return
  }

  // 验证至少选择了一个来源
  const hasSource = Object.values(formData.value.source).some(value => value)
  if (!hasSource) {
    alert('请至少选择一个触发来源')
    return
  }

  // 验证至少选择了一个目标
  const hasDestination = Object.values(formData.value.destination).some(value => value)
  if (!hasDestination) {
    alert('请至少选择一个输出目标')
    return
  }

  try {
    isUpdating.value = true
    const token = localStorage.getItem('token')
    
    const requestData = buildUpdateRequestData()
    
    console.log('更新请求数据:', JSON.stringify(requestData, null, 2))
    
    const response = await fetch(`/api/admin/regex/${selectedRegexId.value}`, {
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

    const updatedRegex = await response.json()
    alert('正则表达式更新成功！')
    
    // 刷新条目列表
    await fetchRegexEntries()
    // 重新加载表单数据
    onRegexChange()
  } catch (error) {
    console.error('更新正则表达式失败:', error)
    alert(`更新失败: ${error.message}`)
  } finally {
    isUpdating.value = false
  }
}

// 删除正则
const deleteRegex = () => {
  if (!selectedRegexId.value) {
    alert('请选择要删除的正则条目')
    return
  }
  showDeleteModal.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!selectedRegexId.value) return

  try {
    isDeleting.value = true
    const token = localStorage.getItem('token')
    
    const response = await fetch(`/api/admin/regex/${selectedRegexId.value}`, {
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

    alert('正则表达式删除成功！')
    showDeleteModal.value = false
    
    // 重置选择和表单
    selectedRegexId.value = ''
    resetFormData()
    
    // 刷新条目列表
    await fetchRegexEntries()
  } catch (error) {
    console.error('删除正则表达式失败:', error)
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
.edit-regex {
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

/* 选择器区域 */
.selector-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.entry-preview {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
}

.entry-preview h4 {
  color: #3b82f6;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.preview-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  min-width: 100px;
  margin-right: 0.5rem;
}

.preview-value {
  color: #ffffff;
  font-weight: 600;
}

/* 编辑表单容器 */
.edit-form-container {
  overflow: visible;
  max-height: none;
}

/* 表单布局 */
.regex-form {
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

.section-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  font-style: italic;
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
.btn-primary,
.btn-danger {
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

.btn-danger {
  background: #ef4444;
  color: #ffffff;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-primary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 删除确认模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
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
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ffffff;
}

.delete-content {
  padding: 1.5rem;
  text-align: center;
}

.delete-content .form-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.warning-icon {
  color: #f59e0b;
  font-size: 3rem;
  margin-bottom: 1rem;
}

.delete-content p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  line-height: 1.5;
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
  
  .btn-secondary,
  .btn-primary,
  .btn-danger {
    width: 100%;
    justify-content: center;
  }
}
</style> 