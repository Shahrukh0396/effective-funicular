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
      const response = await axios.post('/api/employee/login', { email, password })
      const { token: newToken, user: userData } = response.data
      user.value = userData
      setToken(newToken)
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
      await axios.post('/api/employee/logout')
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
      const response = await axios.get('/api/employee/me')
      user.value = response.data
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