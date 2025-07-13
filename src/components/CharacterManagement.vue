<template>
  <div class="character-management">
    <!-- 角色卡列表展示 -->
    <div class="character-selector-section">
      <h3 class="section-title">
        <FontAwesomeIcon :icon="faList" class="section-icon" />
        角色卡列表
      </h3>
      
      <div class="character-select-wrapper">
        <select 
          v-model="selectedCharacterId" 
          class="character-select"
          :disabled="isLoading"
        >
          <option value="">请选择角色卡</option>
          <option 
            v-for="character in characters" 
            :key="character.id" 
            :value="character.id"
          >
            {{ character.name }} {{ character.version ? `(v${character.version})` : '' }}
          </option>
        </select>
        
        <button 
          @click="refreshCharacters" 
          class="refresh-btn"
          :disabled="isLoading"
          title="刷新列表"
        >
          <FontAwesomeIcon :icon="faRefresh" :class="{ 'fa-spin': isLoading }" />
        </button>
      </div>

      <!-- 选中角色卡的信息 -->
      <div v-if="selectedCharacter" class="character-info">
        <div class="info-header">
          <h4>角色卡详细信息</h4>
          <button @click="refreshCharacterDetails" class="refresh-details-btn" :disabled="isLoadingDetails">
            <FontAwesomeIcon :icon="faRefresh" :class="{ 'fa-spin': isLoadingDetails }" />
          </button>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">角色卡名称:</span>
            <span class="info-value">{{ characterDetails?.name || selectedCharacter.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">版本:</span>
            <span class="info-value">{{ characterDetails?.version || selectedCharacter.version || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">作者:</span>
            <span class="info-value">{{ characterDetails?.author_name || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间:</span>
            <span class="info-value">{{ characterDetails?.created_date || formatDate(selectedCharacter.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">更新时间:</span>
            <span class="info-value">{{ characterDetails?.updated_date || formatDate(selectedCharacter.updated_at) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">世界书数量:</span>
            <span class="info-value">{{ lorebookCount ?? '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">正则数量:</span>
            <span class="info-value">{{ regexCount ?? '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-section">
      <h3 class="section-title">
        <FontAwesomeIcon :icon="faCogs" class="section-icon" />
        管理操作
      </h3>
      
      <div class="action-buttons">
        <button 
          @click="showCreateModal = true" 
          class="action-btn create-btn"
          :disabled="isLoading"
        >
          <FontAwesomeIcon :icon="faPlus" />
          创建角色卡
        </button>
        
        <button 
          @click="editCharacter" 
          class="action-btn edit-btn"
          :disabled="!selectedCharacterId || isLoading"
        >
          <FontAwesomeIcon :icon="faEdit" />
          编辑角色卡
        </button>
        
        <button 
          @click="deleteCharacter" 
          class="action-btn delete-btn"
          :disabled="!selectedCharacterId || isLoading"
        >
          <FontAwesomeIcon :icon="faTrash" />
          删除角色卡
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <h3 class="section-title">
        <FontAwesomeIcon :icon="faChartBar" class="section-icon" />
        统计信息
      </h3>
      
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">{{ characters.length }}</span>
          <span class="stat-label">总角色卡数</span>
        </div>
      </div>
    </div>

    <!-- 创建角色卡模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>创建新角色卡</h3>
          <button @click="closeCreateModal" class="close-btn">
            <FontAwesomeIcon :icon="faTimes" />
          </button>
        </div>
        
        <form @submit.prevent="createCharacter" class="create-form">
          <div class="form-group">
            <label for="characterName" class="form-label">角色卡名称 *</label>
            <input
              id="characterName"
              v-model="newCharacter.name"
              type="text"
              class="form-input"
              placeholder="请输入角色卡名称"
              required
              maxlength="255"
            />
          </div>
          
          <div class="form-group">
            <label for="characterVersion" class="form-label">版本号</label>
            <input
              id="characterVersion"
              v-model="newCharacter.version"
              type="text"
              class="form-input"
              placeholder="例如: 1.0"
              maxlength="50"
            />
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeCreateModal" class="btn-secondary">
              取消
            </button>
            <button type="submit" class="btn-primary" :disabled="isCreating">
              <FontAwesomeIcon v-if="isCreating" :icon="faSpinner" class="fa-spin" />
              {{ isCreating ? '创建中...' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑角色卡模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑角色卡</h3>
          <button @click="closeEditModal" class="close-btn">
            <FontAwesomeIcon :icon="faTimes" />
          </button>
        </div>
        
        <form @submit.prevent="updateCharacter" class="edit-form">
          <div class="form-group">
            <label for="editCharacterName" class="form-label">角色卡名称 *</label>
            <input
              id="editCharacterName"
              v-model="editCharacterData.name"
              type="text"
              class="form-input"
              placeholder="请输入角色卡名称"
              required
              maxlength="255"
            />
          </div>
          
          <div class="form-group">
            <label for="editCharacterVersion" class="form-label">版本号</label>
            <input
              id="editCharacterVersion"
              v-model="editCharacterData.version"
              type="text"
              class="form-input"
              placeholder="例如: 1.0"
              maxlength="50"
            />
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeEditModal" class="btn-secondary">
              取消
            </button>
            <button type="submit" class="btn-primary" :disabled="isUpdating">
              <FontAwesomeIcon v-if="isUpdating" :icon="faSpinner" class="fa-spin" />
              {{ isUpdating ? '更新中...' : '保存修改' }}
            </button>
          </div>
        </form>
      </div>
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
          <p>您确定要删除角色卡 <strong>"{{ selectedCharacter?.name }}"</strong> 吗？</p>
          <p class="warning-text">此操作将同时删除该角色卡下的所有世界书条目和正则表达式，且无法撤销！</p>
          
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
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faList,
  faPlus,
  faEdit,
  faTrash,
  faCogs,
  faChartBar,
  faRefresh,
  faTimes,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'

const userStore = useUserStore()

// 响应式数据
const characters = ref([])
const selectedCharacterId = ref('')
const isLoading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const isLoadingDetails = ref(false)

// 角色卡详细信息
const characterDetails = ref(null)
const lorebookCount = ref(null)
const regexCount = ref(null)

// 新角色卡数据
const newCharacter = ref({
  name: '',
  version: ''
})

// 编辑角色卡数据
const editCharacterData = ref({
  name: '',
  version: ''
})

// 计算属性
const selectedCharacter = computed(() => {
  if (!selectedCharacterId.value) return null
  return characters.value.find(char => char.id === selectedCharacterId.value)
})

// 监听选中角色卡变化，自动获取详细信息
watch(selectedCharacterId, (newId) => {
  if (newId) {
    fetchCharacterDetails()
  } else {
    characterDetails.value = null
    lorebookCount.value = null
    regexCount.value = null
  }
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
    // 这里可以添加错误提示
  } finally {
    isLoading.value = false
  }
}

// 刷新角色卡列表
const refreshCharacters = () => {
  selectedCharacterId.value = ''
  fetchCharacters()
}

// 获取角色卡详细信息
const fetchCharacterDetails = async () => {
  if (!selectedCharacter.value) return

  try {
    isLoadingDetails.value = true
    const token = localStorage.getItem('token')
    
    // 获取角色卡详细信息
    const infoResponse = await fetch(`/api/character/${selectedCharacter.value.name}/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (infoResponse.ok) {
      characterDetails.value = await infoResponse.json()
    }

    // 获取世界书数量
    const lorebookResponse = await fetch(`/api/character/${selectedCharacter.value.name}/lorebook/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (lorebookResponse.ok) {
      const lorebookData = await lorebookResponse.json()
      lorebookCount.value = lorebookData.count
    }

    // 获取正则数量
    const regexResponse = await fetch(`/api/character/${selectedCharacter.value.name}/regex/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (regexResponse.ok) {
      const regexData = await regexResponse.json()
      regexCount.value = regexData.count
    }
  } catch (error) {
    console.error('获取角色卡详细信息失败:', error)
  } finally {
    isLoadingDetails.value = false
  }
}

// 刷新角色卡详细信息
const refreshCharacterDetails = () => {
  fetchCharacterDetails()
}

// 创建角色卡
const createCharacter = async () => {
  if (!newCharacter.value.name.trim()) {
    alert('请输入角色卡名称')
    return
  }

  try {
    isCreating.value = true
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/admin/character', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newCharacter.value.name.trim(),
        version: newCharacter.value.version.trim() || undefined
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '创建失败')
    }

    const createdCharacter = await response.json()
    characters.value.push(createdCharacter)
    selectedCharacterId.value = createdCharacter.id
    
    // 重置表单并关闭模态框
    newCharacter.value = { name: '', version: '' }
    showCreateModal.value = false
    
    alert('角色卡创建成功！')
  } catch (error) {
    console.error('创建角色卡失败:', error)
    alert(`创建失败: ${error.message}`)
  } finally {
    isCreating.value = false
  }
}

// 编辑角色卡
const editCharacter = () => {
  if (!selectedCharacter.value) {
    alert('请先选择要编辑的角色卡')
    return
  }
  
  // 初始化编辑表单数据
  editCharacterData.value = {
    name: selectedCharacter.value.name,
    version: selectedCharacter.value.version || ''
  }
  
  showEditModal.value = true
}

// 更新角色卡
const updateCharacter = async () => {
  if (!editCharacterData.value.name.trim()) {
    alert('请输入角色卡名称')
    return
  }

  try {
    isUpdating.value = true
    const token = localStorage.getItem('token')
    
    const response = await fetch(`/api/admin/character/${selectedCharacter.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editCharacterData.value.name.trim(),
        version: editCharacterData.value.version.trim() || ''
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '更新失败')
    }

    const updatedCharacter = await response.json()
    
    // 更新本地列表中的角色卡
    const index = characters.value.findIndex(char => char.id === selectedCharacter.value.id)
    if (index !== -1) {
      characters.value[index] = updatedCharacter
    }
    
    // 重新获取详细信息
    fetchCharacterDetails()
    
    // 关闭模态框
    showEditModal.value = false
    
    alert('角色卡更新成功！')
  } catch (error) {
    console.error('更新角色卡失败:', error)
    alert(`更新失败: ${error.message}`)
  } finally {
    isUpdating.value = false
  }
}

// 删除角色卡
const deleteCharacter = () => {
  if (!selectedCharacter.value) {
    alert('请先选择要删除的角色卡')
    return
  }
  showDeleteModal.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!selectedCharacter.value) return

  try {
    isDeleting.value = true
    const token = localStorage.getItem('token')
    
    const response = await fetch(`/api/admin/character/${selectedCharacter.value.id}`, {
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

    // 从列表中移除
    characters.value = characters.value.filter(char => char.id !== selectedCharacter.value.id)
    selectedCharacterId.value = ''
    showDeleteModal.value = false
    
    alert('角色卡删除成功！')
  } catch (error) {
    console.error('删除角色卡失败:', error)
    alert(`删除失败: ${error.message}`)
  } finally {
    isDeleting.value = false
  }
}

// 关闭模态框
const closeCreateModal = () => {
  showCreateModal.value = false
  newCharacter.value = { name: '', version: '' }
}

const closeEditModal = () => {
  showEditModal.value = false
  editCharacterData.value = { name: '', version: '' }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 组件挂载时获取角色卡列表
onMounted(() => {
  fetchCharacters()
})
</script>

<style scoped>
.character-management {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: #ffffff;
}

/* 区域标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #ffffff;
}

.section-icon {
  color: #3b82f6;
}

/* 角色卡选择区域 */
.character-selector-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.character-select-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.character-select {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.3s ease;
}

.character-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.character-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.character-select option {
  background: #1e293b;
  color: #ffffff;
}

.refresh-btn {
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 角色卡信息 */
.character-info {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1rem;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-header h4 {
  color: #ffffff;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.refresh-details-btn {
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.refresh-details-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
}

.refresh-details-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.info-value {
  color: #ffffff;
  font-weight: 500;
}

/* 操作区域 */
.action-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.create-btn {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.create-btn:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.3);
}

.edit-btn {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.edit-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 统计区域 */
.stats-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  text-align: center;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* 表单样式 */
.create-form {
  padding: 1.5rem;
}

.edit-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-secondary,
.btn-primary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

/* 删除确认内容 */
.delete-content {
  padding: 1.5rem;
  text-align: center;
}

.delete-content .form-actions {
  margin-top: 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.warning-icon {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.delete-content p {
  color: #ffffff;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.warning-text {
  color: #ef4444;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .character-select-wrapper {
    flex-direction: column;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
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