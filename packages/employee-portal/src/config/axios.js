import axios from 'axios'
import { config } from './index.js'

// Create axios instance with environment variable
const instance = axios.create({
  baseURL: config.apiUrl, // Use environment variable instead of hardcoded localhost
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employee_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('employee_token')
      localStorage.removeItem('employee_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
