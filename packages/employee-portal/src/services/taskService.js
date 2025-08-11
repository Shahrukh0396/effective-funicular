import { config } from '@/config'
import { useAuthStore } from '@/stores/authStore'

// API functions
export const taskService = {

  async fetchTasks(filters = {}) {
    const authStore = useAuthStore()
    try {
      const headers = authStore.getAuthHeaders()
      console.log('🔍 Task Service - Headers:', headers)
      console.log('🔍 Task Service - Token present:', !!headers.Authorization)
      
      // Determine the correct endpoint based on filters
      let endpoint = '/api/employee/tasks'
      if (filters.assignedTo === 'me') {
        endpoint = '/api/employee/tasks/my-tasks'
      } else if (filters.status === 'available') {
        endpoint = '/api/employee/tasks/available'
      }
      
      const fullUrl = `${config.apiUrl}${endpoint}?_t=${Date.now()}&v=2`
      console.log('🔍 Task Service - Using endpoint:', endpoint)
      console.log('🔍 Task Service - Full URL:', fullUrl)
      console.log('🔍 Task Service - Filters:', filters)
      
      const response = await fetch(fullUrl, {
        headers: {
          ...headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      const data = await response.json()
      console.log('🔍 Task Service - Response status:', response.status)
      console.log('🔍 Task Service - Response data:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tasks')
      }

      console.log('🔍 Task Service - Data received:', data)
      
      return data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  },

  async createTask(taskData) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/employee/tasks`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task')
      }

      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  async updateTask(taskId, updates) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/employee/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task')
      }

      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  },

  async claimTask(taskId) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/employee/tasks/${taskId}/claim`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to claim task')
      }

      return data
    } catch (error) {
      console.error('Error claiming task:', error)
      throw error
    }
  },

  async unclaimTask(taskId) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/employee/tasks/${taskId}/unclaim`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to unclaim task')
      }

      return data
    } catch (error) {
      console.error('Error unclaiming task:', error)
      throw error
    }
  },

  async getTaskById(taskId) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/employee/tasks/${taskId}`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch task')
      }

      return data
    } catch (error) {
      console.error('Error fetching task:', error)
      throw error
    }
  }
} 