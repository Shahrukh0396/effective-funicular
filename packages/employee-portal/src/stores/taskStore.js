import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore, ROLES } from './userStore'
import { taskService } from '../services/taskService'

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
      console.log('🔍 TaskStore - Fetching available tasks...')
      const response = await taskService.fetchTasks({ status: 'available' })
      console.log('🔍 TaskStore - Available tasks response:', response)
      
      // The backend returns an array directly for available tasks
      availableTasks.value = Array.isArray(response) ? response : []
      
      console.log('🔍 TaskStore - Available tasks set:', availableTasks.value)
      return availableTasks.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch available tasks'
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
      console.log('🔍 TaskStore - Fetching my tasks...')
      const response = await taskService.fetchTasks({ assignedTo: 'me' })
      console.log('🔍 TaskStore - My tasks response:', response)
      
      // The backend returns an array directly for my tasks
      myTasks.value = Array.isArray(response) ? response : []
      
      console.log('🔍 TaskStore - My tasks set:', myTasks.value)
      return myTasks.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch my tasks'
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
      const response = await taskService.fetchTasks({ status: 'completed' })
      if (response.success && response.data) {
        taskHistory.value = response.data.tasks || response.data
      } else {
        taskHistory.value = response.data || []
      }
      return taskHistory.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch task history'
      console.error('Error fetching task history:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const claimTask = async (taskId) => {
    error.value = null
    try {
      const response = await taskService.claimTask(taskId)
      // Refresh tasks
      await fetchAvailableTasks()
      await fetchMyTasks()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to claim task'
      console.error('Error claiming task:', err)
      throw err
    }
  }

  const unclaimTask = async (taskId) => {
    error.value = null
    try {
      const response = await taskService.unclaimTask(taskId)
      // Refresh tasks
      await fetchAvailableTasks()
      await fetchMyTasks()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to unclaim task'
      console.error('Error unclaiming task:', err)
      throw err
    }
  }

  const startTask = async (taskId) => {
    error.value = null
    try {
      const response = await taskService.updateTask(taskId, { 
        status: 'in-progress',
        startedAt: new Date().toISOString()
      })
      // Refresh tasks
      await fetchMyTasks()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to start task'
      console.error('Error starting task:', err)
      throw err
    }
  }

  const stopTask = async (taskId) => {
    error.value = null
    try {
      const response = await taskService.updateTask(taskId, { 
        status: 'todo',
        stoppedAt: new Date().toISOString()
      })
      // Refresh tasks
      await fetchMyTasks()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to stop task'
      console.error('Error stopping task:', err)
      throw err
    }
  }

  const updateTaskStatus = async (taskId, status) => {
    error.value = null
    try {
      const response = await taskService.updateTask(taskId, { status })
      // Refresh tasks
      await fetchMyTasks()
      await fetchAvailableTasks()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to update task status'
      console.error('Error updating task status:', err)
      throw err
    }
  }

  const updateTaskProgress = async (taskId, progress) => {
    error.value = null
    try {
      const response = await taskService.updateTask(taskId, { progress })
      // Refresh tasks
      await fetchMyTasks()
      await fetchAvailableTasks()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to update task progress'
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
      const response = await taskService.updateTask(taskId, {
        status: 'done',
        submission,
        submissionTime: new Date().toISOString()
      })
      await fetchMyTasks()
      await fetchTaskHistory()
      return response
    } catch (err) {
      error.value = err.message || 'Failed to submit task'
      console.error('Error submitting task:', err)
      throw err
    }
  }

  const getTaskById = async (taskId) => {
    error.value = null
    try {
      const response = await taskService.getTaskById(taskId)
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch task details'
      console.error('Error fetching task details:', err)
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
    getTaskById,
    clearError
  }
}) 