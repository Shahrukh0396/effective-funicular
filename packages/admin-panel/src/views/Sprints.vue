<template>
  <div class="sprints-container">
    <!-- Header -->
    <div class="header">
      <h1 class="text-3xl font-bold text-gray-900">Sprint Management</h1>
      <div class="header-actions">
        <button @click="showCreateSprintModal = true" class="btn-primary">
          Create Sprint
        </button>
      </div>
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

    <!-- Sprint Analytics -->
    <div class="analytics-section">
      <h2 class="section-title">Sprint Analytics</h2>
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="analytics-icon">📊</div>
          <div class="analytics-content">
            <h3 class="analytics-title">Active Sprints</h3>
            <p class="analytics-value">{{ activeSprintsCount }}</p>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon">✅</div>
          <div class="analytics-content">
            <h3 class="analytics-title">Completed This Month</h3>
            <p class="analytics-value">{{ completedThisMonth }}</p>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon">📈</div>
          <div class="analytics-content">
            <h3 class="analytics-title">Average Velocity</h3>
            <p class="analytics-value">{{ averageVelocity }}</p>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon">🎯</div>
          <div class="analytics-content">
            <h3 class="analytics-title">Success Rate</h3>
            <p class="analytics-value">{{ successRate }}%</p>
          </div>
        </div>
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
      <!-- Sprint Table -->
      <div class="sprint-table-container">
        <table class="sprint-table">
          <thead>
            <tr>
              <th>Sprint Name</th>
              <th>Project</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Progress</th>
              <th>Team Size</th>
              <th>Velocity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sprint in sprints" :key="sprint._id" class="sprint-row">
              <td>
                <div class="sprint-name-cell">
                  <span class="sprint-name">{{ sprint.name }}</span>
                  <span class="sprint-dates">{{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}</span>
                </div>
              </td>
              <td>{{ sprint.project?.name || 'N/A' }}</td>
              <td>
                <span :class="getStatusClass(sprint.status)">{{ sprint.status }}</span>
              </td>
              <td>{{ getSprintDuration(sprint) }} days</td>
              <td>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: `${getProgressPercentage(sprint)}%` }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ getProgressPercentage(sprint) }}%</span>
                </div>
              </td>
              <td>{{ sprint.team?.length || 0 }} members</td>
              <td>{{ sprint.metrics?.velocity || 0 }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="viewSprint(sprint)" class="btn-view">View</button>
                  <button @click="editSprint(sprint)" class="btn-edit">Edit</button>
                  <button @click="deleteSprint(sprint._id)" class="btn-delete">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3 class="empty-title">No sprints found</h3>
      <p class="empty-description">
        {{ selectedProject || selectedStatus ? 'Try adjusting your filters' : 'Create your first sprint to get started' }}
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
            <div class="overview-item">
              <span class="overview-label">Project:</span>
              <span>{{ selectedSprint.project?.name || 'N/A' }}</span>
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

          <!-- Sprint Actions -->
          <div class="sprint-actions">
            <button
              v-if="selectedSprint.status === 'planning'"
              @click="startSprint(selectedSprint._id)"
              class="btn-success"
            >
              Start Sprint
            </button>
            <button
              v-if="selectedSprint.status === 'active'"
              @click="completeSprint(selectedSprint._id)"
              class="btn-warning"
            >
              Complete Sprint
            </button>
            <button
              @click="editSprint(selectedSprint)"
              class="btn-secondary"
            >
              Edit Sprint
            </button>
            <button
              @click="deleteSprint(selectedSprint._id)"
              class="btn-danger"
            >
              Delete Sprint
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Sprint Modal -->
    <div v-if="showCreateSprintModal" class="modal-overlay" @click="showCreateSprintModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Create New Sprint</h2>
          <button @click="showCreateSprintModal = false" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="createSprint" class="sprint-form">
            <div class="form-group">
              <label class="form-label">Sprint Name *</label>
              <input
                v-model="newSprint.name"
                type="text"
                required
                class="form-input"
                placeholder="e.g., Sprint 1 - User Authentication"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="newSprint.description"
                class="form-textarea"
                placeholder="Sprint description and objectives..."
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Start Date *</label>
                <input
                  v-model="newSprint.startDate"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">End Date *</label>
                <input
                  v-model="newSprint.endDate"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Project *</label>
              <select v-model="newSprint.projectId" required class="form-select">
                <option value="">Select Project</option>
                <option v-for="project in projects" :key="project._id" :value="project._id">
                  {{ project.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Goals</label>
              <div class="goals-input">
                <div
                  v-for="(goal, index) in newSprint.goals"
                  :key="index"
                  class="goal-input-row"
                >
                  <input
                    v-model="newSprint.goals[index]"
                    type="text"
                    class="form-input"
                    placeholder="Sprint goal..."
                  />
                  <button
                    type="button"
                    @click="removeGoal(index)"
                    class="btn-remove"
                  >
                    Remove
                  </button>
                </div>
                <button
                  type="button"
                  @click="addGoal"
                  class="btn-add"
                >
                  Add Goal
                </button>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="showCreateSprintModal = false" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="creating">
                {{ creating ? 'Creating...' : 'Create Sprint' }}
              </button>
            </div>
          </form>
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
const showCreateSprintModal = ref(false)
const creating = ref(false)

// New sprint form
const newSprint = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  projectId: '',
  goals: ['']
})

// Computed properties
const activeSprintsCount = computed(() => {
  return sprints.value.filter(sprint => sprint.status === 'active').length
})

const completedThisMonth = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return sprints.value.filter(sprint => 
    sprint.status === 'completed' && 
    new Date(sprint.completedAt) >= startOfMonth
  ).length
})

const averageVelocity = computed(() => {
  const completedSprints = sprints.value.filter(sprint => sprint.status === 'completed')
  if (completedSprints.length === 0) return 0
  
  const totalVelocity = completedSprints.reduce((sum, sprint) => 
    sum + (sprint.metrics?.velocity || 0), 0
  )
  return Math.round(totalVelocity / completedSprints.length)
})

const successRate = computed(() => {
  const completedSprints = sprints.value.filter(sprint => sprint.status === 'completed')
  const totalSprints = sprints.value.filter(sprint => 
    sprint.status === 'completed' || sprint.status === 'cancelled'
  )
  
  if (totalSprints.length === 0) return 0
  return Math.round((completedSprints.length / totalSprints.length) * 100)
})

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

const viewSprint = (sprint) => {
  selectedSprint.value = sprint
}

const closeSprintDetails = () => {
  selectedSprint.value = null
}

const startSprint = async (sprintId) => {
  try {
    await sprintService.startSprint(sprintId)
    await loadSprints()
    closeSprintDetails()
  } catch (err) {
    console.error('Failed to start sprint:', err)
  }
}

const completeSprint = async (sprintId) => {
  try {
    await sprintService.completeSprint(sprintId)
    await loadSprints()
    closeSprintDetails()
  } catch (err) {
    console.error('Failed to complete sprint:', err)
  }
}

const deleteSprint = async (sprintId) => {
  if (!confirm('Are you sure you want to delete this sprint?')) return
  
  try {
    await sprintService.deleteSprint(sprintId)
    await loadSprints()
    closeSprintDetails()
  } catch (err) {
    console.error('Failed to delete sprint:', err)
  }
}

const createSprint = async () => {
  creating.value = true
  
  try {
    const sprintData = {
      ...newSprint.value,
      goals: newSprint.value.goals.filter(goal => goal.trim())
    }
    
    await sprintService.createSprint(sprintData)
    await loadSprints()
    showCreateSprintModal.value = false
    resetNewSprint()
  } catch (err) {
    console.error('Failed to create sprint:', err)
  } finally {
    creating.value = false
  }
}

const addGoal = () => {
  newSprint.value.goals.push('')
}

const removeGoal = (index) => {
  newSprint.value.goals.splice(index, 1)
}

const resetNewSprint = () => {
  newSprint.value = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    projectId: '',
    goals: ['']
  }
}

const editSprint = (sprint) => {
  // TODO: Implement edit sprint functionality
  console.log('Edit sprint:', sprint)
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
  @apply flex items-center justify-between mb-6;
}

.header-actions {
  @apply flex gap-3;
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

.analytics-section {
  @apply mb-8;
}

.section-title {
  @apply text-xl font-semibold text-gray-900 mb-4;
}

.analytics-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.analytics-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center;
}

.analytics-icon {
  @apply text-3xl mr-4;
}

.analytics-content {
  @apply flex-1;
}

.analytics-title {
  @apply text-sm font-medium text-gray-600;
}

.analytics-value {
  @apply text-2xl font-bold text-gray-900;
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

.sprint-table-container {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
}

.sprint-table {
  @apply w-full;
}

.sprint-table th {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50;
}

.sprint-table td {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-200;
}

.sprint-row {
  @apply hover:bg-gray-50;
}

.sprint-name-cell {
  @apply flex flex-col;
}

.sprint-name {
  @apply font-medium text-gray-900;
}

.sprint-dates {
  @apply text-xs text-gray-500;
}

.progress-container {
  @apply flex items-center gap-2;
}

.progress-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-500 transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-600 min-w-[3rem];
}

.action-buttons {
  @apply flex gap-2;
}

.btn-view {
  @apply bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors;
}

.btn-edit {
  @apply bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs hover:bg-yellow-200 transition-colors;
}

.btn-delete {
  @apply bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-4xl mb-4;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 mb-2;
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
  @apply grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6;
}

.overview-item {
  @apply flex items-center justify-between;
}

.overview-label {
  @apply text-sm font-medium text-gray-700;
}

.metrics-grid {
  @apply grid grid-cols-4 gap-4 mb-6;
}

.metric-card {
  @apply bg-gray-50 rounded-lg p-4 text-center;
}

.metric-number {
  @apply block text-2xl font-bold text-gray-900;
}

.metric-label {
  @apply block text-sm text-gray-600;
}

.goals-grid {
  @apply space-y-3 mb-6;
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

.sprint-actions {
  @apply flex gap-3 justify-end;
}

.sprint-form {
  @apply space-y-6;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
  resize: vertical;
}

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.form-row {
  @apply grid grid-cols-2 gap-4;
}

.goals-input {
  @apply space-y-3;
}

.goal-input-row {
  @apply flex gap-2;
}

.form-actions {
  @apply flex gap-3 justify-end;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors;
}

.btn-success {
  @apply bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors;
}

.btn-warning {
  @apply bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors;
}

.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors;
}

.btn-remove {
  @apply bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors;
}

.btn-add {
  @apply bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors;
}
</style> 