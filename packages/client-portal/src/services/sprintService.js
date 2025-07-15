import { ref } from 'vue'
import { io } from 'socket.io-client'
import { config } from '@/config'
import { authService } from './authService'

const sprints = ref([])
const socket = io(config.apiUrl)

// Socket event handlers
socket.on('sprint:created', (sprint) => {
  sprints.value.push(sprint)
})

socket.on('sprint:updated', (updatedSprint) => {
  const index = sprints.value.findIndex(s => s._id === updatedSprint._id)
  if (index !== -1) {
    sprints.value[index] = updatedSprint
  }
})

socket.on('sprint:deleted', (sprintId) => {
  sprints.value = sprints.value.filter(s => s._id !== sprintId)
})

socket.on('sprint:task:added', ({ sprintId, task }) => {
  const sprint = sprints.value.find(s => s._id === sprintId)
  if (sprint) {
    if (!sprint.tasks) sprint.tasks = []
    sprint.tasks.push(task)
  }
})

socket.on('sprint:task:removed', ({ sprintId, taskId }) => {
  const sprint = sprints.value.find(s => s._id === sprintId)
  if (sprint && sprint.tasks) {
    sprint.tasks = sprint.tasks.filter(t => t._id !== taskId)
  }
})

// API functions
export const sprintService = {
  sprints,

  async fetchSprints(filters = {}) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints?${new URLSearchParams(filters)}`, {
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch sprints')
      }

      if (data.success) {
        sprints.value = data.data
      }

      return data
    } catch (error) {
      console.error('Error fetching sprints:', error)
      throw error
    }
  },

  async getSprintById(sprintId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints/${sprintId}`, {
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch sprint')
      }

      return data
    } catch (error) {
      console.error('Error fetching sprint:', error)
      throw error
    }
  },

  async createSprint(sprintData) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(sprintData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create sprint')
      }

      return data
    } catch (error) {
      console.error('Error creating sprint:', error)
      throw error
    }
  },

  async updateSprint(sprintId, updates) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints/${sprintId}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update sprint')
      }

      return data
    } catch (error) {
      console.error('Error updating sprint:', error)
      throw error
    }
  },

  async deleteSprint(sprintId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints/${sprintId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete sprint')
      }

      return data
    } catch (error) {
      console.error('Error deleting sprint:', error)
      throw error
    }
  },

  async startSprint(sprintId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints/${sprintId}/start`, {
        method: 'POST',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to start sprint')
      }

      return data
    } catch (error) {
      console.error('Error starting sprint:', error)
      throw error
    }
  },

  async completeSprint(sprintId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints/${sprintId}/complete`, {
        method: 'POST',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete sprint')
      }

      return data
    } catch (error) {
      console.error('Error completing sprint:', error)
      throw error
    }
  },

  async getSprintMetrics(sprintId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints/${sprintId}/metrics`, {
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch sprint metrics')
      }

      return data
    } catch (error) {
      console.error('Error fetching sprint metrics:', error)
      throw error
    }
  },

  async addTaskToSprint(sprintId, taskId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints/${sprintId}/tasks`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ taskId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add task to sprint')
      }

      return data
    } catch (error) {
      console.error('Error adding task to sprint:', error)
      throw error
    }
  },

  async removeTaskFromSprint(sprintId, taskId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/sprints/${sprintId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove task from sprint')
      }

      return data
    } catch (error) {
      console.error('Error removing task from sprint:', error)
      throw error
    }
  }
} 