import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '../config/axios'

export const useAdminStore = defineStore('admin', () => {
  // State
  const dashboardAnalytics = ref(null)
  const loadingDashboard = ref(false)
  
  const clientAnalytics = ref(null)
  const loadingClients = ref(false)
  
  const projectAnalytics = ref(null)
  const loadingProjects = ref(false)
  
  const businessAnalytics = ref(null)
  const loadingBusiness = ref(false)
  
  const employees = ref([])
  const loadingEmployees = ref(false)
  
  const tasks = ref([])
  const loadingTasks = ref(false)
  
  const performanceOverview = ref(null)
  const loadingPerformance = ref(false)
  
  const attendanceOverview = ref(null)
  const loadingAttendance = ref(false)
  
  const error = ref(null)

  // Computed properties (getters)
  const dashboardMetrics = computed(() => dashboardAnalytics.value?.metrics || {})
  const projectStatuses = computed(() => dashboardAnalytics.value?.projectStatuses || [])
  const taskMetrics = computed(() => dashboardAnalytics.value?.taskMetrics || [])
  const recentActivity = computed(() => dashboardAnalytics.value?.recentActivity || [])
  const systemAlerts = computed(() => dashboardAnalytics.value?.systemAlerts || [])
  
  const clientMetrics = computed(() => clientAnalytics.value || {})
  const clientList = computed(() => clientAnalytics.value?.clients || [])
  
  const projectMetrics = computed(() => projectAnalytics.value || {})
  const projectList = computed(() => {
    // Handle the data structure from /api/projects endpoint
    if (Array.isArray(projectAnalytics.value)) {
      return projectAnalytics.value
    }
    // Fallback for other data structures
    return projectAnalytics.value?.projects || []
  })
  
  const businessMetrics = computed(() => businessAnalytics.value?.metrics || {})
  const teamPerformance = computed(() => businessAnalytics.value?.teamPerformance || [])
  const servicePerformance = computed(() => businessAnalytics.value?.servicePerformance || [])
  const topClients = computed(() => businessAnalytics.value?.topClients || [])
  const revenueByService = computed(() => businessAnalytics.value?.revenueByService || [])

  // Actions
  const fetchDashboardAnalytics = async () => {
    try {
      loadingDashboard.value = true
      error.value = null
      
      const response = await axios.get('/api/analytics/dashboard')
      dashboardAnalytics.value = response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch dashboard analytics'
      return { success: false, error: error.value }
    } finally {
      loadingDashboard.value = false
    }
  }

  const fetchClientAnalytics = async () => {
    try {
      loadingClients.value = true
      error.value = null
      
      const response = await axios.get('/api/analytics/users')
      clientAnalytics.value = response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch user analytics'
      return { success: false, error: error.value }
    } finally {
      loadingClients.value = false
    }
  }

  const fetchProjectAnalytics = async () => {
    try {
      loadingProjects.value = true
      error.value = null
      
      const response = await axios.get('/api/analytics/projects')
      projectAnalytics.value = response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch project analytics'
      return { success: false, error: error.value }
    } finally {
      loadingProjects.value = false
    }
  }

  const fetchBusinessAnalytics = async () => {
    try {
      loadingBusiness.value = true
      error.value = null
      
      const response = await axios.get('/api/analytics/revenue')
      businessAnalytics.value = response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch business analytics'
      return { success: false, error: error.value }
    } finally {
      loadingBusiness.value = false
    }
  }

  const fetchEmployees = async () => {
    try {
      loadingEmployees.value = true
      error.value = null
      
      const response = await axios.get('/api/admin/employees')
      employees.value = response.data.data.employees
      
      return { success: true, data: response.data.data.employees }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch employees'
      return { success: false, error: error.value }
    } finally {
      loadingEmployees.value = false
    }
  }

  const fetchTasks = async () => {
    try {
      loadingTasks.value = true
      error.value = null
      
      const response = await axios.get('/api/admin/tasks')
      tasks.value = response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch tasks'
      return { success: false, error: error.value }
    } finally {
      loadingTasks.value = false
    }
  }

  const fetchAllTasks = async () => {
    try {
      loadingTasks.value = true
      error.value = null
      
      const response = await axios.get('/api/tasks')
      tasks.value = response.data.data.tasks || response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch tasks'
      return { success: false, error: error.value }
    } finally {
      loadingTasks.value = false
    }
  }

  const assignTask = async (taskId, employeeId) => {
    try {
      error.value = null
      
      const response = await axios.put(`/api/tasks/${taskId}`, {
        assignedTo: employeeId
      })
      
      // Update the task in the local state
      const taskIndex = tasks.value.findIndex(task => task._id === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = response.data.data.task
      }
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to assign task'
      return { success: false, error: error.value }
    }
  }

  const unassignTask = async (taskId) => {
    try {
      error.value = null
      
      const response = await axios.put(`/api/tasks/${taskId}`, {
        assignedTo: null
      })
      
      // Update the task in the local state
      const taskIndex = tasks.value.findIndex(task => task._id === taskId)
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = response.data.data.task
      }
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to unassign task'
      return { success: false, error: error.value }
    }
  }

  const createTask = async (taskData) => {
    try {
      error.value = null
      
      const response = await axios.post('/api/tasks', taskData)
      
      // Add the new task to the local state
      tasks.value.push(response.data.data.task)
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create task'
      return { success: false, error: error.value }
    }
  }

  const fetchClients = async () => {
    try {
      loadingClients.value = true
      error.value = null
      
      const response = await axios.get('/api/admin/clients')
      clientAnalytics.value = response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch clients'
      return { success: false, error: error.value }
    } finally {
      loadingClients.value = false
    }
  }

  const fetchProjects = async () => {
    try {
      loadingProjects.value = true
      error.value = null
      
      const response = await axios.get('/api/admin/projects')
      projectAnalytics.value = response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch projects'
      return { success: false, error: error.value }
    } finally {
      loadingProjects.value = false
    }
  }

  const fetchPerformanceOverview = async () => {
    try {
      loadingPerformance.value = true
      error.value = null
      
      const response = await axios.get('/api/analytics/vendor-performance')
      performanceOverview.value = response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch performance overview'
      return { success: false, error: error.value }
    } finally {
      loadingPerformance.value = false
    }
  }

  const fetchAttendanceOverview = async () => {
    try {
      loadingAttendance.value = true
      error.value = null
      
      // TODO: Implement attendance analytics endpoint
      // For now, return empty data structure
      const mockData = {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        attendanceRate: 0,
        recentAttendance: []
      }
      
      attendanceOverview.value = mockData
      
      return { success: true, data: mockData }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch attendance overview'
      return { success: false, error: error.value }
    } finally {
      loadingAttendance.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    dashboardAnalytics,
    loadingDashboard,
    clientAnalytics,
    loadingClients,
    projectAnalytics,
    loadingProjects,
    businessAnalytics,
    loadingBusiness,
    employees,
    loadingEmployees,
    tasks,
    loadingTasks,
    performanceOverview,
    loadingPerformance,
    attendanceOverview,
    loadingAttendance,
    error,
    
    // Computed
    dashboardMetrics,
    projectStatuses,
    taskMetrics,
    recentActivity,
    systemAlerts,
    clientMetrics,
    clientList,
    projectMetrics,
    projectList,
    businessMetrics,
    teamPerformance,
    servicePerformance,
    topClients,
    revenueByService,
    
    // Actions
    fetchDashboardAnalytics,
    fetchClientAnalytics,
    fetchProjectAnalytics,
    fetchBusinessAnalytics,
    fetchEmployees,
    fetchClients,
    fetchProjects,
    fetchTasks,
    fetchAllTasks,
    assignTask,
    unassignTask,
    createTask,
    fetchPerformanceOverview,
    fetchAttendanceOverview,
    clearError
  }
}) 