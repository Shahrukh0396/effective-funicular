import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '../config/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('employee_token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('employee_token', newToken)
      localStorage.setItem('employee_user', JSON.stringify(user.value))
    } else {
      localStorage.removeItem('employee_token')
      localStorage.removeItem('employee_user')
    }
  }

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/employee/login', { 
        email, 
        password
      })
      
      console.log('🔐 Auth Store: Full response data:', response.data)
      
      const { token: accessToken, user: userData } = response.data
      
      console.log('🔐 Auth Store: Destructured accessToken:', accessToken)
      console.log('🔐 Auth Store: Destructured userData:', userData)
      
      user.value = userData
      setToken(accessToken)
      
      // Force update the isAuthenticated computed property
      console.log('🔐 Auth Store: Login successful, token set:', !!accessToken)
      console.log('🔐 Auth Store: User set:', userData.email)
      console.log('🔐 Auth Store: isAuthenticated should be:', !!accessToken)
      console.log('🔐 Auth Store: Token stored in localStorage:', !!localStorage.getItem('employee_token'))
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to login'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setToken(null)
      user.value = null
    }
  }

  const checkAuth = async () => {
    if (!token.value) return false
    try {
      const response = await axios.get('/api/auth/me')
      user.value = response.data.data.user
      return true
    } catch (err) {
      setToken(null)
      user.value = null
      return false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const getAuthHeaders = () => {
    console.log('🔍 Auth Store - Token value:', token.value ? 'Present' : 'Missing')
    console.log('🔍 Auth Store - Token length:', token.value?.length || 0)
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
    login,
    logout,
    checkAuth,
    clearError,
    getAuthHeaders
  }
}) 