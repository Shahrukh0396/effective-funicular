import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore, ROLES } from './userStore'
import axios from '../config/axios'

export const TASK_TYPES = {
  DEVELOPMENT: 'development',
  DESIGN: 'design',
  QA: 'qa',
  PROJECT_MANAGEMENT: 'project_management',
  SALES: 'sales'
}

export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
}

export const useTaskStore = defineStore('tasks', () => {
  const userStore = useUserStore()
  const availableTasks = ref([])
  const myTasks = ref([])
  const taskHistory = ref([])
  const userPoints = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const sortedAvailableTasks = computed(() => {
    return [...availableTasks.value]
      .filter(task => userStore.canAccessTask(task))
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        // Then by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate)
        }
        return 0
      })
  })

  const roleSpecificTasks = computed(() => {
    return availableTasks.value.filter(task => 
      task.requiredRoles.includes(userStore.role)
    )
  })

  const taskMetrics = computed(() => {
    const metrics = {
      totalTasks: taskHistory.value.length,
      completedTasks: taskHistory.value.filter(t => t.status === 'done').length,
      averageResponseTime: 0,
      successRate: 0
    }

    // Calculate average response time
    const responseTimes = taskHistory.value
      .filter(t => t.assignedAt && t.createdAt)
      .map(t => new Date(t.assignedAt) - new Date(t.createdAt))
    
    if (responseTimes.length > 0) {
      metrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    }

    // Calculate success rate
    if (metrics.totalTasks > 0) {
      metrics.successRate = (metrics.completedTasks / metrics.totalTasks) * 100
    }

    return metrics
  })

  const fetchAvailableTasks = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/tasks?status=available')
      availableTasks.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch available tasks'
      console.error('Error fetching available tasks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMyTasks = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/tasks?assignedTo=me')
      myTasks.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch my tasks'
      console.error('Error fetching my tasks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTaskHistory = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/tasks?status=completed')
      taskHistory.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch task history'
      console.error('Error fetching task history:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const claimTask = async (taskId) => {
    error.value = null
    try {
      const response = await axios.post(`/api/tasks/${taskId}/assign`, {
        assignedTo: 'me'
      })
      // Refresh tasks
      await fetchAvailableTasks()
      await fetchMyTasks()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to claim task'
      console.error('Error claiming task:', err)
      throw err
    }
  }

  const unclaimTask = async (taskId) => {
    error.value = null
    try {
      const response = await axios.post(`/api/tasks/${taskId}/assign`, {
        assignedTo: null
      })
      // Refresh tasks
      await fetchAvailableTasks()
      await fetchMyTasks()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to unclaim task'
      console.error('Error unclaiming task:', err)
      throw err
    }
  }

  const startTask = async (taskId) => {
    error.value = null
    try {
      const response = await axios.post(`/api/tasks/${taskId}/start`)
      // Refresh tasks
      await fetchMyTasks()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to start task'
      console.error('Error starting task:', err)
      throw err
    }
  }

  const stopTask = async (taskId) => {
    error.value = null
    try {
      const response = await axios.post(`/api/tasks/${taskId}/stop`)
      // Refresh tasks
      await fetchMyTasks()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to stop task'
      console.error('Error stopping task:', err)
      throw err
    }
  }

  const updateTaskStatus = async (taskId, status) => {
    error.value = null
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, {
        status: status
      })
      // Refresh tasks
      await fetchMyTasks()
      await fetchAvailableTasks()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update task status'
      console.error('Error updating task status:', err)
      throw err
    }
  }

  const updateTaskProgress = async (taskId, progress) => {
    error.value = null
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, {
        progress: progress
      })
      // Refresh tasks
      await fetchMyTasks()
      await fetchAvailableTasks()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update task progress'
      console.error('Error updating task progress:', err)
      throw err
    }
  }

  const pickTask = async (taskId) => {
    // Legacy method - now uses claimTask
    return await claimTask(taskId)
  }

  const submitTask = async (taskId, submission) => {
    error.value = null
    try {
      const response = await axios.put(`/api/employee/tasks/${taskId}/update-status`, {
        status: 'done',
        submission,
        submissionTime: new Date().toISOString()
      })
      await fetchMyTasks()
      await fetchTaskHistory()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to submit task'
      console.error('Error submitting task:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    availableTasks,
    myTasks,
    taskHistory,
    userPoints,
    loading,
    error,
    sortedAvailableTasks,
    roleSpecificTasks,
    taskMetrics,
    fetchAvailableTasks,
    fetchMyTasks,
    fetchTaskHistory,
    claimTask,
    unclaimTask,
    startTask,
    stopTask,
    updateTaskStatus,
    updateTaskProgress,
    pickTask,
    submitTask,
    clearError
  }
}) 