import { ref } from 'vue'
import { config } from '@/config'
import { useAuthStore } from '@/stores/authStore'

const projects = ref([])
const currentProject = ref(null)

// API functions
export const projectService = {
  projects,
  currentProject,

  async fetchProjects(filters = {}) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/projects?${new URLSearchParams(filters)}`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects')
      }

      if (data.success) {
        projects.value = data.data
      } else {
        projects.value = data // Handle direct array response
      }

      return data
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  },

  async getProjectById(projectId) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project')
      }

      if (data.success) {
        currentProject.value = data.data
      } else {
        currentProject.value = data // Handle direct object response
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
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/status`, {
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
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/health`, {
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