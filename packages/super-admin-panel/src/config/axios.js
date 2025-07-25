import axios from 'axios'

// Use import.meta.env for Vite instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for auth
instance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('super_admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('super_admin_token')
      localStorage.removeItem('super_admin_user')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default instance 