import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectService } from '@/services/projectService'

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
  CANCELLED: 'cancelled'
}

export const PROJECT_HEALTH = {
  GOOD: 'good',
  WARNING: 'warning',
  CRITICAL: 'critical'
}

export const useProjectStore = defineStore('projects', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const activeProjects = computed(() => 
    projects.value.filter(project => project.status === PROJECT_STATUS.ACTIVE)
  )

  const projectsByPriority = computed(() => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return [...projects.value].sort((a, b) => 
      (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    )
  })

  const projectsByHealth = computed(() => {
    const healthOrder = { critical: 3, warning: 2, good: 1 }
    return [...projects.value].sort((a, b) => 
      (healthOrder[b.health] || 0) - (healthOrder[a.health] || 0)
    )
  })

  // Methods
  const fetchProjects = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      console.log('🔍 Project Store - Fetching projects...')
      const response = await projectService.fetchProjects(filters)
      console.log('🔍 Project Store - Response received:', response)
      console.log('🔍 Project Store - Response.data:', response.data)
      console.log('🔍 Project Store - Response.data length:', response.data?.length)
      
      if (response.success && response.data) {
        projects.value = response.data
        console.log('🔍 Project Store - Projects set from response.data:', projects.value)
      } else {
        projects.value = response // Handle direct array response
        console.log('🔍 Project Store - Projects set from response:', projects.value)
      }
      console.log('🔍 Project Store - Projects length:', projects.value?.length)
    } catch (err) {
      error.value = 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProjectById = async (projectId) => {
    loading.value = true
    error.value = null
    try {
      const response = await projectService.getProjectById(projectId)
      if (response.success && response.data) {
        currentProject.value = response.data
      } else {
        currentProject.value = response // Handle direct object response
      }
      if (!currentProject.value) {
        error.value = 'Project not found'
      }
    } catch (err) {
      error.value = 'Failed to fetch project details'
      console.error('Error fetching project:', err)
    } finally {
      loading.value = false
    }
  }

  const updateProjectStatus = async (projectId, status) => {
    try {
      await projectService.updateProjectStatus(projectId, status)
      
      // Update local state
      const project = projects.value.find(p => p._id === projectId || p.id === projectId)
      if (project) {
        project.status = status
        project.updatedAt = new Date().toISOString()
      }
    } catch (err) {
      error.value = 'Failed to update project status'
      console.error('Error updating project status:', err)
    }
  }

  const updateProjectHealth = async (projectId, health) => {
    try {
      await projectService.updateProjectHealth(projectId, health)
      
      // Update local state
      const project = projects.value.find(p => p._id === projectId || p.id === projectId)
      if (project) {
        project.health = health
        project.updatedAt = new Date().toISOString()
      }
    } catch (err) {
      error.value = 'Failed to update project health'
      console.error('Error updating project health:', err)
    }
  }

  return {
    projects,
    currentProject,
    loading,
    error,
    activeProjects,
    projectsByPriority,
    projectsByHealth,
    fetchProjects,
    fetchProjectById,
    updateProjectStatus,
    updateProjectHealth
  }
}) 