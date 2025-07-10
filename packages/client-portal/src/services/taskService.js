import { ref } from 'vue'
import { io } from 'socket.io-client'
import { config } from '@/config'
import { authService } from './authService'

const tasks = ref([])
const socket = io(config.apiUrl)

// Socket event handlers
socket.on('task:created', (task) => {
  tasks.value.push(task)
})

socket.on('task:updated', (updatedTask) => {
  const index = tasks.value.findIndex(t => t._id === updatedTask._id)
  if (index !== -1) {
    tasks.value[index] = updatedTask
  }
})

socket.on('task:deleted', (taskId) => {
  tasks.value = tasks.value.filter(t => t._id !== taskId)
})

socket.on('task:comment:added', ({ taskId, comment }) => {
  const task = tasks.value.find(t => t._id === taskId)
  if (task) {
    if (!task.comments) task.comments = []
    task.comments.push(comment)
  }
})

socket.on('task:attachment:added', ({ taskId, attachment }) => {
  const task = tasks.value.find(t => t._id === taskId)
  if (task) {
    if (!task.attachments) task.attachments = []
    task.attachments.push(attachment)
  }
})

// API functions
export const taskService = {
  tasks,

  async fetchTasks(filters = {}) {
    try {
      const response = await fetch(`/api/tasks?${new URLSearchParams(filters)}`, {
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tasks')
      }

      if (data.success) {
        tasks.value = data.data
      }

      return data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  },

  async createTask(task) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(task),
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
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(updates),
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

  async deleteTask(taskId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete task')
      }

      return data
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  },

  async addComment(taskId, comment) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(comment),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add comment')
      }

      return data
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  },

  async addAttachment(taskId, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: {
          Authorization: authService.getAuthHeaders().Authorization
        },
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add attachment')
      }

      return data
    } catch (error) {
      console.error('Error adding attachment:', error)
      throw error
    }
  },

  async deleteAttachment(taskId, attachmentId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete attachment')
      }

      return data
    } catch (error) {
      console.error('Error deleting attachment:', error)
      throw error
    }
  },

  async addDependency(taskId, dependencyId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}/dependencies`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ dependencyId }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add dependency')
      }

      return data
    } catch (error) {
      console.error('Error adding dependency:', error)
      throw error
    }
  },

  async removeDependency(taskId, dependencyId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}/dependencies/${dependencyId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove dependency')
      }

      return data
    } catch (error) {
      console.error('Error removing dependency:', error)
      throw error
    }
  },

  async addToSprint(taskId, sprintId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}/sprint`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ sprintId }),
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

  async removeFromSprint(taskId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}/sprint`, {
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
  },

  async logTime(taskId, timeEntry) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}/time`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(timeEntry),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to log time')
      }

      return data
    } catch (error) {
      console.error('Error logging time:', error)
      throw error
    }
  },

  async getTimeEntries(taskId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks/${taskId}/time`, {
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get time entries')
      }

      return data
    } catch (error) {
      console.error('Error getting time entries:', error)
      throw error
    }
  }
} 