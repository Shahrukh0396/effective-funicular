<template>
  <div class="kanban-container">
    <!-- Header -->
    <div class="kanban-header">
      <div class="header-left">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Project Kanban Board</h2>
          <p class="text-gray-600 mt-1">Track your project progress visually</p>
        </div>
        <div class="view-toggle mt-2">
          <router-link 
            to="/dashboard/sprints" 
            class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            View Sprint Overview
          </router-link>
          <button 
            @click="testAPIs" 
            class="ml-2 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Test APIs
          </button>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="header-filters">
        <div class="filter-group">
          <label class="filter-label">Project:</label>
          <select v-model="selectedProject" @change="filterTasksByProject" class="filter-select">
            <option value="">All Projects</option>
            <option v-for="project in projects" :key="project._id" :value="project._id">
              {{ project.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Sprint:</label>
          <select v-model="selectedSprint" @change="filterTasksBySprint" class="filter-select">
            <option value="">All Sprints</option>
            <option v-for="sprint in sprints" :key="sprint._id" :value="sprint._id">
              {{ sprint.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading Kanban board...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3 class="text-sm font-medium text-red-800">Error loading Kanban board</h3>
      <p class="text-sm text-red-600">{{ error }}</p>
      <div class="mt-4 space-y-2">
        <button @click="loadKanbanData" class="text-red-400 hover:text-red-600">
          Try again
        </button>
        <div v-if="!authStore.isAuthenticated" class="mt-2">
          <router-link to="/auth/login" class="text-blue-600 hover:text-blue-800">
            Go to Login
          </router-link>
        </div>
      </div>
    </div>

    <!-- Kanban Board -->
    <div v-else class="kanban-board">
      <!-- No Data State -->
      <div v-if="tasks.length === 0" class="no-data-state">
        <div class="no-data-icon">📋</div>
        <h3 class="no-data-title">No tasks found</h3>
        <p class="no-data-description">
          {{ error ? 'There was an error loading your tasks. Please try again.' : 'No tasks are available for your projects yet.' }}
        </p>
        <button v-if="error" @click="loadKanbanData" class="retry-button">
          Try Again
        </button>
      </div>
      
      <!-- Kanban Board Content -->
      <div v-else class="board-columns">
        <!-- To Do Column -->
        <div class="board-column">
          <div class="column-header">
            <h3 class="column-title">To Do</h3>
            <span class="task-count">{{ getTasksByStatus('todo').length }}</span>
          </div>
          <div 
            class="column-content"
            @drop="onDrop($event, 'todo')"
            @dragover.prevent
            @dragenter.prevent
          >
            <div
              v-for="task in getTasksByStatus('todo')"
              :key="task._id"
              class="task-card"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @click="openTaskDetails(task)"
            >
              <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <span :class="getPriorityClass(task.priority)" class="task-priority">
                  {{ task.priority }}
                </span>
              </div>
              <p class="task-description">{{ task.description }}</p>
              <div class="task-meta">
                <span class="task-assignee">{{ getAssigneeName(task) }}</span>
                <span class="task-sprint" v-if="task.sprint">{{ getSprintName(task) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="board-column">
          <div class="column-header">
            <h3 class="column-title">In Progress</h3>
            <span class="task-count">{{ getTasksByStatus('in-progress').length }}</span>
          </div>
          <div 
            class="column-content"
            @drop="onDrop($event, 'in-progress')"
            @dragover.prevent
            @dragenter.prevent
          >
            <div
              v-for="task in getTasksByStatus('in-progress')"
              :key="task._id"
              class="task-card"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @click="openTaskDetails(task)"
            >
              <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <span :class="getPriorityClass(task.priority)" class="task-priority">
                  {{ task.priority }}
                </span>
              </div>
              <p class="task-description">{{ task.description }}</p>
              <div class="task-meta">
                <span class="task-assignee">{{ getAssigneeName(task) }}</span>
                <span class="task-sprint" v-if="task.sprint">{{ getSprintName(task) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Column -->
        <div class="board-column">
          <div class="column-header">
            <h3 class="column-title">Review</h3>
            <span class="task-count">{{ getTasksByStatus('review').length }}</span>
          </div>
          <div 
            class="column-content"
            @drop="onDrop($event, 'review')"
            @dragover.prevent
            @dragenter.prevent
          >
            <div
              v-for="task in getTasksByStatus('review')"
              :key="task._id"
              class="task-card"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @click="openTaskDetails(task)"
            >
              <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <span :class="getPriorityClass(task.priority)" class="task-priority">
                  {{ task.priority }}
                </span>
              </div>
              <p class="task-description">{{ task.description }}</p>
              <div class="task-meta">
                <span class="task-assignee">{{ getAssigneeName(task) }}</span>
                <span class="task-sprint" v-if="task.sprint">{{ getSprintName(task) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Done Column -->
        <div class="board-column">
          <div class="column-header">
            <h3 class="column-title">Done</h3>
            <span class="task-count">{{ getTasksByStatus('done').length }}</span>
          </div>
          <div 
            class="column-content"
            @drop="onDrop($event, 'done')"
            @dragover.prevent
            @dragenter.prevent
          >
            <div
              v-for="task in getTasksByStatus('done')"
              :key="task._id"
              class="task-card completed"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @click="openTaskDetails(task)"
            >
              <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <span :class="getPriorityClass(task.priority)" class="task-priority">
                  {{ task.priority }}
                </span>
              </div>
              <p class="task-description">{{ task.description }}</p>
              <div class="task-meta">
                <span class="task-assignee">{{ getAssigneeName(task) }}</span>
                <span class="task-sprint" v-if="task.sprint">{{ getSprintName(task) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Details Modal -->
    <div v-if="selectedTask" class="modal-overlay" @click="closeTaskDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedTask.title }}</h2>
          <button @click="closeTaskDetails" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="task-details">
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span :class="getStatusClass(selectedTask.status)">{{ selectedTask.status }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Priority:</span>
              <span :class="getPriorityClass(selectedTask.priority)">{{ selectedTask.priority }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Assigned To:</span>
              <span>{{ getAssigneeName(selectedTask) }}</span>
            </div>
            <div class="detail-row" v-if="selectedTask.sprint">
              <span class="detail-label">Sprint:</span>
              <span>{{ getSprintName(selectedTask) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <p class="task-description-full">{{ selectedTask.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { taskService } from '@/services/taskService'
import { sprintService } from '@/services/sprintService'
import { projectService } from '@/services/projectService'
import { useAuthStore } from '@/stores/auth'
import { config } from '@/config'

// Reactive data
const authStore = useAuthStore()
const tasks = ref([])
const sprints = ref([])
const projects = ref([])
const selectedProject = ref('')
const selectedSprint = ref('')
const loading = ref(false)
const error = ref(null)
const selectedTask = ref(null)
const draggedTask = ref(null)

// Methods
const loadKanbanData = async () => {
  loading.value = true
  error.value = null
  
    // Check authentication
  console.log('🔐 Auth Store State:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    loading: authStore.loading,
    error: authStore.error
  })
  
  if (!authStore.isAuthenticated) {
    error.value = 'You must be logged in to view the Kanban board'
    loading.value = false
    return
  }
  
  console.log('Auth status:', authStore.isAuthenticated)
  console.log('User:', authStore.user)
  console.log('Token:', authStore.user ? 'Present' : 'Missing')
  console.log('LocalStorage token:', localStorage.getItem('token'))
  console.log('API URL:', config.apiUrl)
  
  // Debug: Show all available statuses
  console.log('Available task statuses:', ['todo', 'in-progress', 'review', 'testing', 'done', 'blocked'])
    
    try {
    const filters = {}
    if (selectedProject.value) filters.project = selectedProject.value
    
    // Load tasks, sprints, and projects in parallel
    const [tasksResponse, sprintsResponse, projectsResponse] = await Promise.all([
      taskService.fetchTasks(filters),
      sprintService.fetchSprints(filters),
      projectService.fetchProjects()
    ])
    
    // Handle tasks - API returns { success: true, data: { tasks: [], pagination: {} } }
    console.log('Tasks Response:', tasksResponse)
    
    if (tasksResponse.success && tasksResponse.data && tasksResponse.data.tasks) {
      originalTasks.value = tasksResponse.data.tasks
      tasks.value = [...originalTasks.value]
      console.log('Loaded tasks from API:', tasks.value.length)
    } else if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
      // Fallback for direct array response
      originalTasks.value = tasksResponse.data
      tasks.value = [...originalTasks.value]
      console.log('Loaded tasks from direct array:', tasks.value.length)
    } else if (tasksResponse.success && tasksResponse.data && Array.isArray(tasksResponse.data)) {
      // Another possible format
      originalTasks.value = tasksResponse.data
      tasks.value = [...originalTasks.value]
      console.log('Loaded tasks from direct data array:', tasks.value.length)
    } else {
      console.warn('No tasks found in API response')
      console.log('Tasks response structure:', JSON.stringify(tasksResponse, null, 2))
      originalTasks.value = []
      tasks.value = []
    }
    
    // Debug: Show loaded tasks
    console.log('All loaded tasks:', tasks.value.map(t => ({ 
      id: t._id, 
      title: t.title, 
      status: t.status, 
      project: t.project?.name || 'No project',
      sprint: t.sprint?.name || 'No sprint'
    })))
    
    // Handle sprints - API returns { success: true, data: [] }
    console.log('Sprints Response:', sprintsResponse)
    
    if (sprintsResponse.success && sprintsResponse.data) {
      sprints.value = sprintsResponse.data
      console.log('Loaded sprints from API:', sprints.value.length)
    } else if (Array.isArray(sprintsResponse.data)) {
      sprints.value = sprintsResponse.data
      console.log('Loaded sprints from direct array:', sprints.value.length)
    } else {
      console.warn('No sprints found in API response')
      console.log('Sprints response structure:', JSON.stringify(sprintsResponse, null, 2))
      sprints.value = []
    }
    
    // Handle projects - API returns { success: true, data: { projects: [] } }
    console.log('Projects Response:', projectsResponse)
    
    if (projectsResponse.success && projectsResponse.data && projectsResponse.data.projects) {
      projects.value = projectsResponse.data.projects
      console.log('Loaded projects from API:', projects.value.length)
    } else if (projectsResponse.data && Array.isArray(projectsResponse.data)) {
      projects.value = projectsResponse.data
      console.log('Loaded projects from direct array:', projects.value.length)
    } else {
      console.warn('No projects found in API response')
      console.log('Projects response structure:', JSON.stringify(projectsResponse, null, 2))
      projects.value = []
    }
  } catch (err) {
    console.error('Error loading Kanban data:', err)
    console.error('Error details:', {
      message: err.message,
      status: err.status,
      response: err.response
    })
    error.value = err.message || 'Failed to load data'
    tasks.value = []
    sprints.value = []
    projects.value = []
  } finally {
    loading.value = false
  }
}

const filterTasksBySprint = () => {
  console.log('Filtering by sprint:', selectedSprint.value)
  
  if (!selectedSprint.value) {
    // Show all tasks if no sprint is selected
    tasks.value = [...originalTasks.value]
    console.log('Showing all tasks:', tasks.value.length)
  } else {
    // Filter tasks by selected sprint
    tasks.value = originalTasks.value.filter(task => 
      task.sprint && task.sprint._id === selectedSprint.value
    )
    console.log('Filtered tasks:', tasks.value.length)
  }
}

// Store original tasks for filtering
const originalTasks = ref([])

// Helper function to filter tasks by project
const filterTasksByProject = () => {
  console.log('Filtering by project:', selectedProject.value)
  
  if (!selectedProject.value) {
    // Show all tasks if no project is selected
    tasks.value = [...originalTasks.value]
    console.log('Showing all tasks:', tasks.value.length)
  } else {
    // Filter tasks by selected project
    tasks.value = originalTasks.value.filter(task => 
      task.project && task.project._id === selectedProject.value
    )
    console.log('Filtered tasks:', tasks.value.length)
  }
}

// Helper function to get project name from task
const getProjectName = (task) => {
  if (task.project && task.project.name) {
    return task.project.name
  }
  return 'Unknown Project'
}

// Helper function to get sprint name from task
const getSprintName = (task) => {
  if (task.sprint && task.sprint.name) {
    return task.sprint.name
  }
  return 'No Sprint'
}

// Helper function to get assignee name from task
const getAssigneeName = (task) => {
  if (task.assignedTo) {
    if (task.assignedTo.firstName && task.assignedTo.lastName) {
      return `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
    } else if (task.assignedTo.firstName) {
      return task.assignedTo.firstName
    } else if (task.assignedTo.email) {
      return task.assignedTo.email.split('@')[0]
    }
  }
  return 'Unassigned'
}



// Drag and drop handlers
const onDragStart = (event, task) => {
  draggedTask.value = task
  event.dataTransfer.effectAllowed = 'move'
}

const onDrop = async (event, newStatus) => {
  event.preventDefault()
  
  if (!draggedTask.value) return
  
  const taskId = draggedTask.value._id
  const oldStatus = draggedTask.value.status
  
  // Update the task status locally first for immediate feedback
  const taskIndex = tasks.value.findIndex(t => t._id === taskId)
  if (taskIndex !== -1) {
    tasks.value[taskIndex].status = newStatus
  }
  
  // Try to update on the server
  try {
    await taskService.updateTask(taskId, { status: newStatus })
  } catch (err) {
    console.error('Error updating task status:', err)
    // Revert the change if the server update failed
    if (taskIndex !== -1) {
      tasks.value[taskIndex].status = oldStatus
    }
  }
  
  draggedTask.value = null
}

// Task details handlers
const openTaskDetails = (task) => {
  selectedTask.value = task
}

const closeTaskDetails = () => {
  selectedTask.value = null
}

// Test API function
const testAPIs = async () => {
  console.log('🧪 Testing APIs...')
  
  try {
    // Test tasks API
    console.log('Testing tasks API...')
    const tasksResponse = await taskService.fetchTasks()
    console.log('Tasks API Response:', tasksResponse)
    
    // Test projects API
    console.log('Testing projects API...')
    const projectsResponse = await projectService.fetchProjects()
    console.log('Projects API Response:', projectsResponse)
    
    // Test sprints API
    console.log('Testing sprints API...')
    const sprintsResponse = await sprintService.fetchSprints()
    console.log('Sprints API Response:', sprintsResponse)
    
  } catch (error) {
    console.error('API Test Error:', error)
  }
}

// Computed properties
const getTasksByStatus = (status) => {
  const filteredTasks = tasks.value.filter(task => task.status === status)
  console.log(`Tasks with status '${status}':`, filteredTasks.length, filteredTasks.map(t => ({ id: t._id, title: t.title, status: t.status })))
  return filteredTasks
}

// Utility methods
const getStatusClass = (status) => {
  const classes = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-yellow-100 text-yellow-800',
    'done': 'bg-green-100 text-green-800'
  }
  return `px-2 py-1 rounded-full text-xs font-medium ${classes[status] || ''}`
}

const getPriorityClass = (priority) => {
  const classes = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800'
  }
  return `px-2 py-1 rounded-full text-xs font-medium ${classes[priority] || ''}`
}

// Lifecycle
onMounted(async () => {
  // Wait for auth store to be ready
  if (authStore.loading) {
    console.log('⏳ Waiting for auth store to initialize...')
    await new Promise(resolve => {
      const unwatch = watch(() => authStore.loading, (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      })
    })
  }
  
  console.log('✅ Auth store ready, loading Kanban data...')
  await loadKanbanData()
})
</script>

<style scoped>
.kanban-container {
  @apply p-6 max-w-7xl mx-auto;
}

.kanban-header {
  @apply flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4;
}

.header-left {
  @apply flex-1;
}

.header-filters {
  @apply flex gap-4;
}

.filter-group {
  @apply flex items-center gap-2;
}

.filter-label {
  @apply text-sm font-medium text-gray-700;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.loading-state {
  @apply flex items-center justify-center py-12;
}

.spinner {
  @apply w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3;
}

.error-state {
  @apply text-center py-12;
}

.no-data-state {
  @apply text-center py-12;
}

.no-data-icon {
  @apply text-6xl mb-4;
}

.no-data-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.no-data-description {
  @apply text-gray-600 mb-4;
}

.retry-button {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}

.kanban-board {
  @apply overflow-x-auto;
}

.board-columns {
  @apply flex gap-4 min-w-max;
}

.board-column {
  @apply flex-shrink-0 w-80;
}

.column-header {
  @apply flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg;
}

.column-title {
  @apply text-lg font-semibold text-gray-900;
}

.task-count {
  @apply bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-medium;
}

.column-content {
  @apply min-h-96 bg-gray-50 rounded-lg p-4 space-y-3;
}

.task-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow;
}

.task-card.completed {
  @apply opacity-75;
}

.task-header {
  @apply flex items-center justify-between mb-2;
}

.task-title {
  @apply text-sm font-medium text-gray-900 flex-1;
}

.task-priority {
  @apply ml-2;
}

.task-description {
  @apply text-sm text-gray-600 mb-3 line-clamp-2;
}

.task-meta {
  @apply flex items-center justify-between text-xs text-gray-500;
}

.task-assignee {
  @apply font-medium;
}

.task-sprint {
  @apply bg-blue-100 text-blue-800 px-2 py-1 rounded;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900;
}

.modal-close {
  @apply text-gray-400 hover:text-gray-600 text-2xl;
}

.modal-body {
  @apply p-6;
}

.task-details {
  @apply space-y-4;
}

.detail-row {
  @apply flex items-start gap-4;
}

.detail-label {
  @apply text-sm font-medium text-gray-700 min-w-24;
}

.task-description-full {
  @apply text-sm text-gray-600 mt-1;
}

/* Responsive design */
@media (max-width: 1024px) {
  .board-columns {
    @apply flex-col;
  }
  
  .board-column {
    @apply w-full;
  }
  
  .header-filters {
    @apply flex-col;
  }
}
</style> 