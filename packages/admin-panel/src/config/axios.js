import axios from 'axios'
import { config } from './index.js'

// Set base URL for API calls - use environment variable
axios.defaults.baseURL = config.apiUrl

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      console.log('🔐 401 error detected, attempting token refresh...')
      
      // Try to refresh the token
      const refreshToken = localStorage.getItem('admin_refresh_token')
      if (refreshToken) {
        try {
          console.log('🔐 Attempting to refresh token...')
          const response = await axios.post('/api/auth/refresh', {
            refreshToken: refreshToken
          })
          
          if (response.data.success) {
            console.log('🔐 Token refresh successful')
            // Update tokens
            localStorage.setItem('admin_token', response.data.data.accessToken)
            localStorage.setItem('admin_refresh_token', response.data.data.refreshToken)
            
            // Update the auth store
            const authStore = await import('../stores/authStore').then(m => m.useAuthStore())
            authStore.setToken(response.data.data.accessToken, response.data.data.refreshToken)
            
            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`
            return axios(originalRequest)
          }
        } catch (refreshError) {
          console.error('🔐 Token refresh failed:', refreshError)
        }
      } else {
        console.log('🔐 No refresh token found')
      }
      
      // If refresh failed or no refresh token, clear tokens and redirect
      console.log('🔐 Clearing tokens and redirecting to login')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_refresh_token')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default axios
