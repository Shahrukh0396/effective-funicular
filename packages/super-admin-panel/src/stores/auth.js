import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/config/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('super_admin_token'))
  const loading = ref(false)

  // Initialize user from localStorage if token exists
  if (token.value) {
    const storedUser = localStorage.getItem('super_admin_user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Error parsing stored user:', e)
      }
    }
  }

  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })
  
  const isSuperAdmin = computed(() => {
    return user.value?.role === 'super_admin'
  })

  // Set up axios defaults
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  const login = async (email, password) => {
    try {
      loading.value = true
      
      // Handle demo credentials
      if (email === 'admin@lintontech.com' && password === 'admin123') {
        const demoUser = {
          id: 1,
          email: 'admin@lintontech.com',
          name: 'Super Admin',
          role: 'super_admin'
        }
        
        const demoToken = 'demo-token'
        
        token.value = demoToken
        user.value = demoUser
        
        localStorage.setItem('super_admin_token', demoToken)
        localStorage.setItem('super_admin_user', JSON.stringify(demoUser))
        axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`
        
        return { success: true }
      }
      
      // Real API call for production
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        portalType: 'super_admin'
      })

      const { accessToken, user: userData } = response.data.data
      
      token.value = accessToken
      user.value = userData
      
      localStorage.setItem('super_admin_token', accessToken)
      localStorage.setItem('super_admin_user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('super_admin_token')
    localStorage.removeItem('super_admin_user')
    delete axios.defaults.headers.common['Authorization']
  }

  const checkAuth = async () => {
    if (!token.value) return false

    try {
      // For demo token, consider it valid
      if (token.value === 'demo-token') {
        return true
      }

      const response = await axios.get('/api/auth/me')
      
      if (response.data.success) {
        user.value = response.data.data.user
        localStorage.setItem('super_admin_user', JSON.stringify(user.value))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Auth check error:', error)
      logout()
      return false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/users/profile/me', profileData)
      
      if (response.data.success) {
        user.value = response.data.data.user
        localStorage.setItem('super_admin_user', JSON.stringify(user.value))
        return { success: true }
      }
      
      return { success: false, message: 'Failed to update profile' }
    } catch (error) {
      console.error('Profile update error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      }
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
    checkAuth,
    updateProfile
  }
}) 