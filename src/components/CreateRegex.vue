<template>
  <div class="create-regex">
    <div class="form-header">
      <h3 class="form-title">
        <FontAwesomeIcon :icon="faCode" class="title-icon" />
        创建正则表达式
      </h3>
      <p class="form-description">为指定角色卡添加新的正则表达式规则</p>
    </div>

    <form @submit.prevent="createRegex" class="regex-form">
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

      <!-- 表单操作 -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          <FontAwesomeIcon :icon="faUndo" />
          重置表单
        </button>
        <button type="submit" :disabled="isCreating" class="btn-primary">
          <FontAwesomeIcon :icon="isCreating ? faSpinner : faPlus" :spin="isCreating" />
          {{ isCreating ? '创建中...' : '创建正则' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faCode,
  faPlus,
  faUndo,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'

// 响应式数据
const isCreating = ref(false)
const characters = ref([])

// 表单数据
const formData = ref({
  character_card_id: '',
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

// 获取角色卡列表
const fetchCharacters = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/characters', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '获取角色卡列表失败')
    }

    const data = await response.json()
    characters.value = data.characters
  } catch (error) {
    console.error('获取角色卡列表失败:', error)
    alert(`获取角色卡列表失败: ${error.message}`)
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    character_card_id: '',
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

// 构建API请求数据
const buildRequestData = () => {
  const data = {
    character_card_id: parseInt(formData.value.character_card_id),
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

// 创建正则
const createRegex = async () => {
  if (!formData.value.character_card_id) {
    alert('请选择角色卡')
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
    isCreating.value = true
    const token = localStorage.getItem('token')
    
    const requestData = buildRequestData()
    
    // 调试信息 - 打印发送的数据
    console.log('发送的请求数据:', JSON.stringify(requestData, null, 2))
    
    const response = await fetch('/api/admin/regex', {
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

    const createdRegex = await response.json()
    alert('正则表达式创建成功！')
    resetForm()
  } catch (error) {
    console.error('创建正则表达式失败:', error)
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
.create-regex {
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
}
</style> 