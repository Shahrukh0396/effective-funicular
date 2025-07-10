import { ref } from 'vue'
import { io } from 'socket.io-client'
import { config } from '@/config'
import { authService } from './authService'

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

socket.on('project:member:added', ({ projectId, member }) => {
  const project = projects.value.find(p => p._id === projectId)
  if (project) {
    if (!project.team) project.team = []
    project.team.push(member)
  }
})

socket.on('project:member:removed', ({ projectId, memberId }) => {
  const project = projects.value.find(p => p._id === projectId)
  if (project && project.team) {
    project.team = project.team.filter(m => m._id !== memberId)
  }
})

// API functions
export const projectService = {
  projects,

  async fetchProjects(filters = {}) {
    try {
      const response = await fetch(`/api/projects?${new URLSearchParams(filters)}`, {
        headers: authService.getAuthHeaders()
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
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: authService.getAuthHeaders()
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
    try {
      const response = await fetch(`${config.apiUrl}/api/projects`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
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
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
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
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
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

  async addTeamMember(projectId, memberData) {
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/team`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(memberData)
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

  async removeTeamMember(projectId, memberId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/team/${memberId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
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

  async uploadFile(projectId, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: {
          Authorization: authService.getAuthHeaders().Authorization
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload file')
      }

      return data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  async deleteFile(projectId, fileId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/files/${fileId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete file')
      }

      return data
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  },

  async getProjectAnalytics(projectId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/analytics`, {
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project analytics')
      }

      return data
    } catch (error) {
      console.error('Error fetching project analytics:', error)
      throw error
    }
  },

  async getProjectTimeline(projectId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/projects/${projectId}/timeline`, {
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project timeline')
      }

      return data
    } catch (error) {
      console.error('Error fetching project timeline:', error)
      throw error
    }
  },

  // Join project room for real-time updates
  joinProjectRoom(projectId) {
    socket.emit('joinProject', projectId)
  },

  // Leave project room
  leaveProjectRoom(projectId) {
    socket.emit('leaveProject', projectId)
  }
} 