import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('admin_token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isSuperAdmin = computed(() => 
    user.value?.role === 'super_admin' || user.value?.isSuperAccount
  )

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('admin_token', newToken)
    } else {
      localStorage.removeItem('admin_token')
    }
  }

  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      const response = await axios.post('/api/auth/login', { 
        email, 
        password,
        portalType: 'admin'
      })
      const { data } = response.data
      setToken(data.accessToken)
      user.value = data.user
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    setToken(null)
  }

  const checkAuth = async () => {
    if (!token.value) return false
    
    try {
      loading.value = true
      const response = await axios.get('/api/auth/me')
      user.value = response.data.data.user
      return true
    } catch (err) {
      setToken(null)
      return false
    } finally {
      loading.value = false
    }
  }

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token.value}`,
      'Content-Type': 'application/json'
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    login,
    logout,
    checkAuth,
    getAuthHeaders
  }
}) 