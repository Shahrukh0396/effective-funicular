<template>
  <div class="sprints-container">
    <!-- Header -->
    <div class="header">
      <h1 class="text-3xl font-bold text-gray-900">Sprint Overview</h1>
      <p class="text-gray-600 mt-2">Track progress and milestones for your projects</p>
    </div>

    <!-- Sprint Filters -->
    <div class="filters">
      <div class="filter-group">
        <label class="filter-label">Project:</label>
        <select v-model="selectedProject" @change="loadSprints" class="filter-select">
          <option value="">All Projects</option>
          <option v-for="project in projects" :key="project._id" :value="project._id">
            {{ project.name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Status:</label>
        <select v-model="selectedStatus" @change="loadSprints" class="filter-select">
          <option value="">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading sprints...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3 class="text-sm font-medium text-red-800">Error loading sprints</h3>
      <p class="text-sm text-red-600">{{ error }}</p>
      <button @click="loadSprints" class="text-red-400 hover:text-red-600">
        Try again
      </button>
    </div>

    <!-- Sprints Content -->
    <div v-else-if="sprints.length > 0" class="sprints-content">
      <!-- Sprint Cards -->
      <div class="sprint-grid">
        <div
          v-for="sprint in sprints"
          :key="sprint._id"
          class="sprint-card"
          @click="selectSprint(sprint)"
        >
          <div class="sprint-header">
            <h3 class="sprint-name">{{ sprint.name }}</h3>
            <span :class="getStatusClass(sprint.status)">{{ sprint.status }}</span>
          </div>
          
          <div class="sprint-dates">
            <span>{{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}</span>
          </div>
          
          <div class="sprint-metrics">
            <div class="metric">
              <span class="metric-label">Tasks</span>
              <span class="metric-value">{{ sprint.metrics?.totalTasks || 0 }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Completed</span>
              <span class="metric-value">{{ sprint.metrics?.completedTasks || 0 }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Progress</span>
              <span class="metric-value">{{ getProgressPercentage(sprint) }}%</span>
            </div>
          </div>
          
          <div class="sprint-goals" v-if="sprint.goals?.length">
            <h4 class="goals-title">Goals:</h4>
            <ul class="goals-list">
              <li
                v-for="goal in sprint.goals.slice(0, 2)"
                :key="goal._id"
                :class="{ 'completed': goal.isCompleted }"
                class="goal-item"
              >
                {{ goal.description }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3 class="empty-title">No sprints found</h3>
      <p class="empty-description">
        {{ selectedProject || selectedStatus ? 'Try adjusting your filters' : 'Sprints will appear here once they are created for your projects' }}
      </p>
    </div>

    <!-- Sprint Details Modal -->
    <div v-if="selectedSprint" class="modal-overlay" @click="closeSprintDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedSprint.name }}</h2>
          <button @click="closeSprintDetails" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Sprint Overview -->
          <div class="sprint-overview">
            <div class="overview-item">
              <span class="overview-label">Status:</span>
              <span :class="getStatusClass(selectedSprint.status)">{{ selectedSprint.status }}</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">Duration:</span>
              <span>{{ getSprintDuration(selectedSprint) }} days</span>
            </div>
            <div class="overview-item">
              <span class="overview-label">Team Size:</span>
              <span>{{ selectedSprint.team?.length || 0 }} members</span>
            </div>
          </div>

          <!-- Sprint Metrics -->
          <div class="sprint-metrics-detailed">
            <h3 class="section-title">Sprint Metrics</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <span class="metric-number">{{ selectedSprint.metrics?.totalTasks || 0 }}</span>
                <span class="metric-label">Total Tasks</span>
              </div>
              <div class="metric-card">
                <span class="metric-number">{{ selectedSprint.metrics?.completedTasks || 0 }}</span>
                <span class="metric-label">Completed</span>
              </div>
              <div class="metric-card">
                <span class="metric-number">{{ selectedSprint.metrics?.inProgressTasks || 0 }}</span>
                <span class="metric-label">In Progress</span>
              </div>
              <div class="metric-card">
                <span class="metric-number">{{ selectedSprint.metrics?.velocity || 0 }}</span>
                <span class="metric-label">Velocity</span>
              </div>
            </div>
          </div>

          <!-- Sprint Goals -->
          <div class="sprint-goals-detailed" v-if="selectedSprint.goals?.length">
            <h3 class="section-title">Sprint Goals</h3>
            <div class="goals-grid">
              <div
                v-for="goal in selectedSprint.goals"
                :key="goal._id"
                class="goal-card"
                :class="{ 'completed': goal.isCompleted }"
              >
                <div class="goal-content">
                  <span class="goal-text">{{ goal.description }}</span>
                  <span class="goal-status">{{ goal.isCompleted ? '✓' : '○' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sprint Tasks -->
          <div class="sprint-tasks">
            <h3 class="section-title">Sprint Tasks</h3>
            <div class="tasks-list">
              <div
                v-for="task in selectedSprint.tasks"
                :key="task._id"
                class="task-item"
              >
                <div class="task-info">
                  <span class="task-title">{{ task.title }}</span>
                  <span :class="getTaskStatusClass(task.status)">{{ task.status }}</span>
                </div>
                <div class="task-meta">
                  <span class="task-assignee">{{ task.assignedTo?.firstName || 'Unassigned' }}</span>
                  <span class="task-priority">{{ task.priority }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { sprintService } from '@/services/sprintService'
import { projectService } from '@/services/projectService'

// Reactive data
const sprints = ref([])
const projects = ref([])
const selectedProject = ref('')
const selectedStatus = ref('')
const loading = ref(false)
const error = ref(null)
const selectedSprint = ref(null)

// Methods
const loadSprints = async () => {
  loading.value = true
  error.value = null
  
  try {
    const filters = {}
    if (selectedProject.value) filters.projectId = selectedProject.value
    if (selectedStatus.value) filters.status = selectedStatus.value
    
    const response = await sprintService.fetchSprints(filters)
    sprints.value = response.data || response
  } catch (err) {
    error.value = err.message || 'Failed to load sprints'
  } finally {
    loading.value = false
  }
}

const loadProjects = async () => {
  try {
    const response = await projectService.fetchProjects()
    projects.value = response.data || response
  } catch (err) {
    console.error('Failed to load projects:', err)
  }
}

const selectSprint = (sprint) => {
  selectedSprint.value = sprint
}

const closeSprintDetails = () => {
  selectedSprint.value = null
}

// Utility methods
const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getStatusClass = (status) => {
  const classes = {
    'planning': 'bg-blue-100 text-blue-800',
    'active': 'bg-green-100 text-green-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return `px-2 py-1 rounded-full text-sm font-medium ${classes[status] || ''}`
}

const getTaskStatusClass = (status) => {
  const classes = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-yellow-100 text-yellow-800',
    'testing': 'bg-purple-100 text-purple-800',
    'done': 'bg-green-100 text-green-800'
  }
  return `px-2 py-1 rounded-full text-xs ${classes[status] || ''}`
}

const getProgressPercentage = (sprint) => {
  const total = sprint.metrics?.totalTasks || 0
  const completed = sprint.metrics?.completedTasks || 0
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

const getSprintDuration = (sprint) => {
  const start = new Date(sprint.startDate)
  const end = new Date(sprint.endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadSprints(), loadProjects()])
})
</script>

<style scoped>
.sprints-container {
  @apply p-6 max-w-7xl mx-auto;
}

.header {
  @apply mb-6;
}

.filters {
  @apply flex gap-4 mb-6;
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

.sprint-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.sprint-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow;
}

.sprint-header {
  @apply flex items-center justify-between mb-3;
}

.sprint-name {
  @apply text-lg font-semibold text-gray-900;
}

.sprint-dates {
  @apply text-sm text-gray-600 mb-4;
}

.sprint-metrics {
  @apply grid grid-cols-3 gap-4 mb-4;
}

.metric {
  @apply text-center;
}

.metric-label {
  @apply block text-xs text-gray-600;
}

.metric-value {
  @apply block text-lg font-semibold text-gray-900;
}

.sprint-goals {
  @apply mt-4;
}

.goals-title {
  @apply text-sm font-medium text-gray-700 mb-2;
}

.goals-list {
  @apply space-y-1;
}

.goal-item {
  @apply text-sm text-gray-600;
}

.goal-item.completed {
  @apply text-green-600 line-through;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-6xl mb-4;
}

.empty-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.empty-description {
  @apply text-gray-600;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto;
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

.sprint-overview {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-6;
}

.overview-item {
  @apply flex items-center justify-between;
}

.overview-label {
  @apply text-sm font-medium text-gray-700;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

.metrics-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4 mb-6;
}

.metric-card {
  @apply bg-gray-50 rounded-lg p-4 text-center;
}

.metric-number {
  @apply block text-2xl font-bold text-gray-900;
}

.goals-grid {
  @apply space-y-2 mb-6;
}

.goal-card {
  @apply bg-gray-50 rounded-lg p-3;
}

.goal-card.completed {
  @apply bg-green-50;
}

.goal-content {
  @apply flex items-center justify-between;
}

.goal-text {
  @apply text-sm text-gray-700;
}

.goal-status {
  @apply text-lg;
}

.tasks-list {
  @apply space-y-2;
}

.task-item {
  @apply bg-gray-50 rounded-lg p-3;
}

.task-info {
  @apply flex items-center justify-between mb-2;
}

.task-title {
  @apply text-sm font-medium text-gray-900;
}

.task-meta {
  @apply flex items-center gap-2;
}

.task-assignee {
  @apply text-xs text-gray-600;
}

.task-priority {
  @apply text-xs;
}
</style> 