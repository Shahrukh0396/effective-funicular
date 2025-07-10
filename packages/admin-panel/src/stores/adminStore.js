import { defineStore } from 'pinia'
import axios from '../config/axios'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    // Dashboard Analytics
    dashboardAnalytics: null,
    loadingDashboard: false,
    
    // Client Analytics
    clientAnalytics: null,
    loadingClients: false,
    
    // Project Analytics
    projectAnalytics: null,
    loadingProjects: false,
    
    // Business Analytics
    businessAnalytics: null,
    loadingBusiness: false,
    
    // Employee Management
    employees: [],
    loadingEmployees: false,
    
    // Task Management
    tasks: [],
    loadingTasks: false,
    
    // Performance Overview
    performanceOverview: null,
    loadingPerformance: false,
    
    // Attendance Overview
    attendanceOverview: null,
    loadingAttendance: false,
    
    // Error handling
    error: null
  }),

  getters: {
    // Dashboard getters
    dashboardMetrics: (state) => state.dashboardAnalytics?.metrics || {},
    projectStatuses: (state) => state.dashboardAnalytics?.projectStatuses || [],
    taskMetrics: (state) => state.dashboardAnalytics?.taskMetrics || [],
    recentActivity: (state) => state.dashboardAnalytics?.recentActivity || [],
    systemAlerts: (state) => state.dashboardAnalytics?.systemAlerts || [],
    
    // Client getters
    clientMetrics: (state) => state.clientAnalytics || {},
    clientList: (state) => state.clientAnalytics?.clients || [],
    
    // Project getters
    projectMetrics: (state) => state.projectAnalytics || {},
    projectList: (state) => state.projectAnalytics?.projects || [],
    
    // Business getters
    businessMetrics: (state) => state.businessAnalytics?.metrics || {},
    teamPerformance: (state) => state.businessAnalytics?.teamPerformance || [],
    servicePerformance: (state) => state.businessAnalytics?.servicePerformance || [],
    topClients: (state) => state.businessAnalytics?.topClients || [],
    revenueByService: (state) => state.businessAnalytics?.revenueByService || []
  },

  actions: {
    // Dashboard Analytics
    async fetchDashboardAnalytics() {
      this.loadingDashboard = true
      this.error = null
      
      try {
        const response = await axios.get('/api/admin/dashboard/analytics')
        this.dashboardAnalytics = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch dashboard analytics'
        console.error('Dashboard analytics error:', error)
        throw error
      } finally {
        this.loadingDashboard = false
      }
    },

    // Client Analytics
    async fetchClientAnalytics() {
      this.loadingClients = true
      this.error = null
      
      try {
        const response = await axios.get('/api/admin/clients/analytics')
        this.clientAnalytics = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch client analytics'
        console.error('Client analytics error:', error)
        throw error
      } finally {
        this.loadingClients = false
      }
    },

    // Project Analytics
    async fetchProjectAnalytics() {
      this.loadingProjects = true
      this.error = null
      
      try {
        const response = await axios.get('/api/admin/projects/analytics')
        this.projectAnalytics = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch project analytics'
        console.error('Project analytics error:', error)
        throw error
      } finally {
        this.loadingProjects = false
      }
    },

    // Business Analytics
    async fetchBusinessAnalytics() {
      this.loadingBusiness = true
      this.error = null
      
      try {
        const response = await axios.get('/api/admin/analytics/business')
        this.businessAnalytics = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch business analytics'
        console.error('Business analytics error:', error)
        throw error
      } finally {
        this.loadingBusiness = false
      }
    },

    // Employee Management
    async fetchEmployees() {
      this.loadingEmployees = true
      this.error = null
      
      try {
        const response = await axios.get('/api/admin/employees')
        this.employees = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch employees'
        console.error('Employees error:', error)
        throw error
      } finally {
        this.loadingEmployees = false
      }
    },

    async createEmployee(employeeData) {
      this.error = null
      
      try {
        const response = await axios.post('/api/admin/employees', employeeData)
        // Refresh employees list
        await this.fetchEmployees()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create employee'
        console.error('Create employee error:', error)
        throw error
      }
    },

    async getEmployeeDetails(employeeId) {
      this.error = null
      
      try {
        const response = await axios.get(`/api/admin/employees/${employeeId}/details`)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch employee details'
        console.error('Employee details error:', error)
        throw error
      }
    },

    async toggleEmployeeStatus(employeeId) {
      this.error = null
      
      try {
        const response = await axios.put(`/api/admin/employees/${employeeId}/toggle-status`)
        // Refresh employees list
        await this.fetchEmployees()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to toggle employee status'
        console.error('Toggle employee status error:', error)
        throw error
      }
    },

    // Task Management
    async fetchAllTasks() {
      this.loadingTasks = true
      this.error = null
      
      try {
        const response = await axios.get('/api/tasks')
        this.tasks = response.data.data.tasks || []
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch tasks'
        console.error('Tasks error:', error)
        throw error
      } finally {
        this.loadingTasks = false
      }
    },

    async assignTask(taskId, employeeId) {
      this.error = null
      
      try {
        const response = await axios.post('/api/admin/tasks/assign', {
          taskId,
          employeeId
        })
        // Refresh tasks list
        await this.fetchAllTasks()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to assign task'
        console.error('Assign task error:', error)
        throw error
      }
    },

    async unassignTask(taskId) {
      this.error = null
      
      try {
        const response = await axios.post('/api/admin/tasks/unassign', {
          taskId
        })
        // Refresh tasks list
        await this.fetchAllTasks()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to unassign task'
        console.error('Unassign task error:', error)
        throw error
      }
    },

    async bulkAssignTasks(taskIds, employeeId) {
      this.error = null
      
      try {
        const response = await axios.post('/api/admin/tasks/bulk-assign', {
          taskIds,
          employeeId
        })
        // Refresh tasks list
        await this.fetchAllTasks()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to bulk assign tasks'
        console.error('Bulk assign tasks error:', error)
        throw error
      }
    },

    async getTaskAssignments() {
      this.error = null
      
      try {
        const response = await axios.get('/api/admin/tasks/assignments')
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch task assignments'
        console.error('Task assignments error:', error)
        throw error
      }
    },

    // Performance Overview
    async fetchPerformanceOverview(params = {}) {
      this.loadingPerformance = true
      this.error = null
      
      try {
        const response = await axios.get('/api/admin/performance/overview', { params })
        this.performanceOverview = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch performance overview'
        console.error('Performance overview error:', error)
        throw error
      } finally {
        this.loadingPerformance = false
      }
    },

    // Attendance Overview
    async fetchAttendanceOverview(params = {}) {
      this.loadingAttendance = true
      this.error = null
      
      try {
        const response = await axios.get('/api/admin/attendance/overview', { params })
        this.attendanceOverview = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch attendance overview'
        console.error('Attendance overview error:', error)
        throw error
      } finally {
        this.loadingAttendance = false
      }
    },

    // GDPR Management
    async getEmployeeGDPRData(employeeId) {
      this.error = null
      
      try {
        const response = await axios.get(`/api/admin/gdpr/employee/${employeeId}`)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch GDPR data'
        console.error('GDPR data error:', error)
        throw error
      }
    },

    async anonymizeEmployeeData(employeeId) {
      this.error = null
      
      try {
        const response = await axios.post(`/api/admin/gdpr/anonymize/${employeeId}`)
        // Refresh employees list
        await this.fetchEmployees()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to anonymize employee data'
        console.error('Anonymize data error:', error)
        throw error
      }
    },

    // Utility methods
    clearError() {
      this.error = null
    },

    async refreshAllData() {
      await Promise.all([
        this.fetchDashboardAnalytics(),
        this.fetchClientAnalytics(),
        this.fetchProjectAnalytics(),
        this.fetchBusinessAnalytics(),
        this.fetchEmployees(),
        this.fetchAllTasks()
      ])
    }
  }
}) 