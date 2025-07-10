import axios from 'axios'

// Create axios instance
const instance = axios.create({
  baseURL: 'http://localhost:3000',
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