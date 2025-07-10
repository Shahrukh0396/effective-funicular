import { ref } from 'vue'
import { io } from 'socket.io-client'
import { config } from '@/config'
import { useAuthStore } from '@/stores/authStore'

const projects = ref([])
const socket = io(config.apiUrl)

// Socket event handlers
socket.on('project:created', (project) => {
  projects.value.push(project)
})

socket.on('project:updated', (updatedProject) => {
  const index = projects.value.findIndex(p => p._id === updatedProject._id)
  if (index !== -1) {
    projects.value[index] = updatedProject
  }
})

socket.on('project:deleted', (projectId) => {
  projects.value = projects.value.filter(p => p._id !== projectId)
})

// API functions
export const projectService = {
  projects,

  async fetchProjects(filters = {}) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`/api/projects?${new URLSearchParams(filters)}`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects')
      }

      if (data.success) {
        projects.value = data.data
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
      const response = await fetch(`/api/projects/${projectId}`, {
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

  async createProject(projectData) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create project')
      }

      return data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  },

  async updateProject(projectId, updates) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project')
      }

      return data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },

  async deleteProject(projectId) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete project')
      }

      return data
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }
} 