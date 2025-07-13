import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  // 从localStorage恢复用户信息
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      userInfo.value = JSON.parse(storedUser)
    } catch (error) {
      console.error('Failed to parse stored user info:', error)
      localStorage.removeItem('user')
    }
  }

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const username = computed(() => userInfo.value?.username || '')
  const userRole = computed(() => userInfo.value?.role || 'user')

  // 用户登录
  const login = (authData) => {
    token.value = authData.token
    userInfo.value = authData.user
    
    // 保存到localStorage
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData.user))
    
    console.log('用户登录成功:', userInfo.value)
  }

  // 用户登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    
    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    console.log('用户已登出')
  }

  // 检查token是否有效
  const checkTokenValid = () => {
    if (!token.value) return false
    
    try {
      // 简单的JWT过期检查
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      if (payload.exp < currentTime) {
        // Token已过期，清除状态
        logout()
        return false
      }
      
      return true
    } catch (error) {
      // Token格式错误，清除状态
      logout()
      return false
    }
  }

  // 更新用户信息
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = { ...userInfo.value, ...newUserInfo }
    localStorage.setItem('user', JSON.stringify(userInfo.value))
  }

  // 获取用户详细信息（可以调用API获取最新信息）
  const fetchUserInfo = async () => {
    if (!token.value) return false
    
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        updateUserInfo(userData)
        return true
      } else {
        // API调用失败，可能token无效
        logout()
        return false
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      return false
    }
  }

  // 初始化时检查token有效性
  if (token.value) {
    checkTokenValid()
  }

  return {
    // 状态
    token,
    userInfo,
    
    // 计算属性
    isLoggedIn,
    username,
    userRole,
    
    // 方法
    login,
    logout,
    checkTokenValid,
    updateUserInfo,
    fetchUserInfo
  }
}) 