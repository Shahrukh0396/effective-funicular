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
      
      const response = await axios.get('/api/admin/dashboard/analytics')
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
      
      const response = await axios.get('/api/admin/analytics/clients')
      clientAnalytics.value = response.data.data
      
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch client analytics'
      return { success: false, error: error.value }
    } finally {
      loadingClients.value = false
    }
  }

  const fetchProjectAnalytics = async () => {
    try {
      loadingProjects.value = true
      error.value = null
      
      const response = await axios.get('/api/projects')
      projectAnalytics.value = response.data.data.projects
      
      return { success: true, data: response.data.data.projects }
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
      
      const response = await axios.get('/api/admin/analytics/business')
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
      employees.value = response.data.data
      
      return { success: true, data: response.data.data }
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

  const fetchPerformanceOverview = async () => {
    try {
      loadingPerformance.value = true
      error.value = null
      
      const response = await axios.get('/api/admin/analytics/performance')
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
      
      const response = await axios.get('/api/admin/analytics/attendance')
      attendanceOverview.value = response.data.data
      
      return { success: true, data: response.data.data }
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
    fetchTasks,
    fetchPerformanceOverview,
    fetchAttendanceOverview,
    clearError
  }
}) 