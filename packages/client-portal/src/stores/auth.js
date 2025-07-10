import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  async function initialize() {
    try {
      loading.value = true
      // Check if we have a token and get user data
      if (authService.token.value) {
        const response = await authService.getMe()
        if (response.success) {
          user.value = response.data.user
        } else {
          // Token is invalid, clear it
          authService.setToken(null)
          user.value = null
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      authService.setToken(null)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    try {
      error.value = null
      loading.value = true
      
      const response = await authService.login({ email, password })
      
      if (response.success) {
        user.value = response.data.user
        return response.data.user
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    try {
      error.value = null
      loading.value = true
      
      const response = await authService.register(userData)
      
      if (response.success) {
        user.value = response.data.user
        return response.data.user
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
      user.value = null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function updateProfile(updates) {
    try {
      error.value = null
      loading.value = true
      
      const response = await authService.updateProfile(updates)
      
      if (response.success) {
        user.value = response.data.user
        return response.data.user
      } else {
        throw new Error(response.message || 'Profile update failed')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function changePassword(passwords) {
    try {
      error.value = null
      loading.value = true
      
      const response = await authService.changePassword(passwords)
      
      if (response.success) {
        return response
      } else {
        throw new Error(response.message || 'Password change failed')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(email) {
    try {
      error.value = null
      loading.value = true
      
      const response = await authService.forgotPassword(email)
      
      if (response.success) {
        return response
      } else {
        throw new Error(response.message || 'Password reset failed')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(token, newPassword) {
    try {
      error.value = null
      loading.value = true
      
      const response = await authService.resetPassword(token, newPassword)
      
      if (response.success) {
        return response
      } else {
        throw new Error(response.message || 'Password reset failed')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // GDPR Compliance Methods
  async function updateConsent(consentType, granted) {
    try {
      error.value = null
      const response = await authService.updateConsent(consentType, granted)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function getConsentStatus() {
    try {
      error.value = null
      const response = await authService.getConsentStatus()
      return response
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function requestDataPortability() {
    try {
      error.value = null
      const response = await authService.requestDataPortability()
      return response
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function requestRightToBeForgotten() {
    try {
      error.value = null
      const response = await authService.requestRightToBeForgotten()
      return response
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initialize,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    updateConsent,
    getConsentStatus,
    requestDataPortability,
    requestRightToBeForgotten
  }
}) 