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

  // ==================== CORE PROJECT APIs ====================
  
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
      console.log('🔐 Getting project by ID:', projectId)
      console.log('🔐 Auth store state:', {
        hasToken: !!authStore.token,
        hasRefreshToken: !!authStore.refreshToken,
        tokenFromStorage: !!localStorage.getItem('admin_token'),
        refreshTokenFromStorage: !!localStorage.getItem('admin_refresh_token')
      })
      
      // Ensure we have a valid token before making the request
      console.log('🔐 Calling ensureValidToken...')
      const tokenValid = await authStore.ensureValidToken()
      console.log('🔐 ensureValidToken result:', tokenValid)
      
      if (!tokenValid) {
        console.log('🔐 Token validation failed')
        throw new Error('Authentication required')
      }
      
      console.log('🔐 Token is valid, proceeding with API call')
      console.log('🔐 Auth headers:', authStore.getAuthHeaders())
      
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}`, {
        headers: authStore.getAuthHeaders()
      })
      
      console.log('🔐 Response status:', response.status)
      console.log('🔐 Response ok:', response.ok)
      
      const data = await response.json()
      console.log('🔐 Response data:', data)
      
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
        method: 'PUT',
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
  },

  // ==================== PROJECT ANALYTICS APIs ====================
  
  async getProjectAnalytics(projectId) {
    const authStore = useAuthStore()
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/analytics`, {
        headers: authStore.getAuthHeaders(),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project analytics')
      }

      return data
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Analytics request timed out')
        throw new Error('Analytics request timed out')
      }
      console.error('Error fetching project analytics:', error)
      throw error
    }
  },

  async getProjectTimeline(projectId) {
    const authStore = useAuthStore()
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/timeline`, {
        headers: authStore.getAuthHeaders(),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project timeline')
      }

      return data
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Timeline request timed out')
        throw new Error('Timeline request timed out')
      }
      console.error('Error fetching project timeline:', error)
      throw error
    }
  },

  // ==================== PROJECT TASKS APIs ====================
  
  async getProjectTasks(projectId, filters = {}) {
    const authStore = useAuthStore()
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/tasks?${new URLSearchParams(filters)}`, {
        headers: authStore.getAuthHeaders(),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project tasks')
      }

      return data
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Tasks request timed out')
        throw new Error('Tasks request timed out')
      }
      console.error('Error fetching project tasks:', error)
      throw error
    }
  },

  // ==================== PROJECT SPRINTS APIs ====================
  
  async getProjectSprints(projectId, filters = {}) {
    const authStore = useAuthStore()
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/sprints?${new URLSearchParams(filters)}`, {
        headers: authStore.getAuthHeaders(),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project sprints')
      }

      return data
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Sprints request timed out')
        throw new Error('Sprints request timed out')
      }
      console.error('Error fetching project sprints:', error)
      throw error
    }
  },

  // ==================== PROJECT TEAM MANAGEMENT APIs ====================
  
  async addTeamMember(projectId, userId, role) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/team`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, role })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add team member')
      }

      return data
    } catch (error) {
      console.error('Error adding team member:', error)
      throw error
    }
  },

  async removeTeamMember(projectId, userId) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/team/${userId}`, {
        method: 'DELETE',
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove team member')
      }

      return data
    } catch (error) {
      console.error('Error removing team member:', error)
      throw error
    }
  },

  // ==================== PROJECT DOCUMENTS APIs ====================
  
  async uploadProjectAttachment(projectId, file) {
    const authStore = useAuthStore()
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/attachments`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders()
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload attachment')
      }

      return data
    } catch (error) {
      console.error('Error uploading attachment:', error)
      throw error
    }
  },

  // ==================== BULK OPERATIONS ====================
  
  async bulkUpdateProjects(projectIds, updates) {
    const authStore = useAuthStore()
    try {
      // Since bulk update doesn't exist, we'll update projects one by one
      const results = []
      for (const projectId of projectIds) {
        const response = await fetch(`${config.apiUrl}/api/projects/${projectId}`, {
          method: 'PUT',
          headers: {
            ...authStore.getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        })
        
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || `Failed to update project ${projectId}`)
        }
        results.push(data)
      }
      
      return { success: true, data: results }
    } catch (error) {
      console.error('Error bulk updating projects:', error)
      throw error
    }
  },

  async exportProjects(filters = {}) {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`${config.apiUrl}/api/projects?${new URLSearchParams(filters)}`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects for export')
      }

      // Create CSV export manually since no export endpoint exists
      const projects = data.data || []
      const csvContent = this.convertToCSV(projects)
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'projects-export.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }
    } catch (error) {
      console.error('Error exporting projects:', error)
      throw error
    }
  },

  // Helper method to convert projects to CSV
  convertToCSV(projects) {
    const headers = [
      'Name',
      'Description', 
      'Status',
      'Priority',
      'Type',
      'Progress',
      'Client',
      'Estimated Budget',
      'Actual Budget',
      'Start Date',
      'End Date',
      'Team Size',
      'Created At'
    ]
    
    const rows = projects.map(project => [
      project.name || '',
      project.description || '',
      project.status || '',
      project.priority || '',
      project.type || '',
      project.progress?.overall || 0,
      project.clientId?.firstName + ' ' + project.clientId?.lastName || '',
      project.budget?.estimated || 0,
      project.budget?.actual || 0,
      project.timeline?.startDate || '',
      project.timeline?.endDate || '',
      project.team?.members?.length || 0,
      project.createdAt || ''
    ])
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }
} 