import { config } from '@/config'
import { useAuthStore } from '@/stores/authStore'

// API functions
export const projectService = {

  async fetchProjects(filters = {}) {
    const authStore = useAuthStore()
    try {
      const headers = authStore.getAuthHeaders()
      console.log('🔍 Project Service - Headers:', headers)
      console.log('🔍 Project Service - Token present:', !!headers.Authorization)
      
      const response = await fetch(`${config.apiUrl}/api/employee/projects?${new URLSearchParams(filters)}`, {
        headers: {
          ...headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      const data = await response.json()
      console.log('🔍 Project Service - Response status:', response.status)
      console.log('🔍 Project Service - Response data:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects')
      }

      console.log('🔍 Project Service - Data received:', data)
      console.log('🔍 Project Service - Data.success:', data.success)
      console.log('🔍 Project Service - Data.data:', data.data)
      
      return data
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  },

  async getProjectById(projectId) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/employee/projects/${projectId}`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project')
      }

      return data
    } catch (error) {
      console.error('Error fetching project:', error)
      throw error
    }
  },

  async updateProjectStatus(projectId, status) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/employee/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project status')
      }

      return data
    } catch (error) {
      console.error('Error updating project status:', error)
      throw error
    }
  },

  async updateProjectHealth(projectId, health) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/employee/projects/${projectId}/health`, {
        method: 'PATCH',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ health })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project health')
      }

      return data
    } catch (error) {
      console.error('Error updating project health:', error)
      throw error
    }
  }
} 