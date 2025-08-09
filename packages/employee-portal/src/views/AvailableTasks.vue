<template>
  <div class="space-y-6">
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Available Tasks
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Browse and claim available tasks or view tasks assigned to you
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <div class="relative">
            <select
              v-model="statusFilter"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Tasks</option>
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Assigned to Me</option>
            </select>
          </div>
          <div class="relative">
            <select
              v-model="priorityFilter"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading tasks</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Task Grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="bg-white overflow-hidden shadow rounded-lg border-l-4"
        :class="{
          'border-l-green-500': !task.assignedTo,
          'border-l-blue-500': task.assignedTo && task.assignedTo._id === currentUser.id,
          'border-l-gray-400': task.assignedTo && task.assignedTo._id !== currentUser.id
        }"
      >
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">{{ task.title }}</h3>
            <div class="flex space-x-2">
              <span
                :class="{
                  'bg-red-100 text-red-800': task.priority === 'high',
                  'bg-yellow-100 text-yellow-800': task.priority === 'medium',
                  'bg-green-100 text-green-800': task.priority === 'low'
                }"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ task.priority }}
              </span>
              <span
                :class="getStatusColor(task.status)"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ getStatusLabel(task.status) }}
              </span>
            </div>
          </div>
          
          <div class="mt-2">
            <p class="text-sm text-gray-500">{{ task.description }}</p>
          </div>
          
          <!-- Assignment Status -->
          <div class="mt-3">
            <div class="flex items-center">
              <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-sm text-gray-600">
                <span v-if="!task.assignedTo" class="text-orange-600 font-medium">Unassigned</span>
                <span v-else-if="task.assignedTo._id === currentUser.id" class="text-green-600 font-medium">
                  Assigned to you
                </span>
                <span v-else class="text-gray-500">
                  Assigned to {{ task.assignedTo.firstName }} {{ task.assignedTo.lastName }}
                </span>
              </span>
            </div>
          </div>
          
          <div class="mt-4">
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <svg
                  class="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="ml-1 text-sm text-gray-500">
                  {{ formatDeadline(task.dueDate) }}
                </span>
              </div>
              <div v-if="task.estimatedHours" class="flex items-center">
                <svg
                  class="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="ml-1 text-sm text-gray-500">{{ task.estimatedHours }}h</span>
              </div>
            </div>
          </div>
          
          <!-- Project Info -->
          <div v-if="task.project" class="mt-3">
            <div class="flex items-center">
              <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span class="text-sm text-gray-600">{{ task.project.name }}</span>
            </div>
          </div>
          
          <div class="mt-4 flex justify-end space-x-2">
            <!-- Claim Task Button -->
            <button
              v-if="!task.assignedTo"
              @click="claimTask(task.id)"
              :disabled="claimingTask === task.id"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="claimingTask === task.id" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Claim Task
            </button>
            
            <!-- Unclaim Task Button -->
            <button
              v-else-if="task.assignedTo._id === currentUser.id && task.status !== 'in-progress'"
              @click="unclaimTask(task.id)"
              :disabled="unclaimingTask === task.id"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="unclaimingTask === task.id" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Unclaim
            </button>
            
            <!-- View Details Button -->
            <button
              @click="viewTaskDetails(task)"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredTasks.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No tasks available</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ statusFilter === 'unassigned' ? 'No unassigned tasks at the moment.' : 
           statusFilter === 'assigned' ? 'No tasks assigned to you.' : 
           'No tasks match your current filters.' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import { formatDistanceToNow } from 'date-fns'

const taskStore = useTaskStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const claimingTask = ref(null)
const unclaimingTask = ref(null)
const statusFilter = ref('all')
const priorityFilter = ref('all')

const currentUser = computed(() => authStore.user || { id: null })
const tasks = computed(() => {
  console.log('🔍 AvailableTasks - Computing tasks:', taskStore.availableTasks)
  return taskStore.availableTasks
})

const filteredTasks = computed(() => {
  console.log('🔍 AvailableTasks - Computing filtered tasks from:', tasks.value)
  let filtered = tasks.value || []

  // Filter by status
  if (statusFilter.value === 'unassigned') {
    filtered = filtered.filter(task => !task.assignedTo)
  } else if (statusFilter.value === 'assigned') {
    filtered = filtered.filter(task => task.assignedTo && task.assignedTo._id === currentUser.value.id)
  }

  // Filter by priority
  if (priorityFilter.value !== 'all') {
    filtered = filtered.filter(task => task.priority === priorityFilter.value)
  }

  console.log('🔍 AvailableTasks - Filtered tasks result:', filtered)
  return filtered
})

const getStatusColor = (status) => {
  const colors = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-yellow-100 text-yellow-800',
    'testing': 'bg-purple-100 text-purple-800',
    'done': 'bg-green-100 text-green-800',
    'blocked': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    'todo': 'Todo',
    'in-progress': 'In Progress',
    'review': 'Review',
    'testing': 'Testing',
    'done': 'Done',
    'blocked': 'Blocked'
  }
  return labels[status] || status
}

const formatDeadline = (deadline) => {
  if (!deadline) return 'No due date'
  return formatDistanceToNow(new Date(deadline), { addSuffix: true })
}

const claimTask = async (taskId) => {
  claimingTask.value = taskId
  try {
    await taskStore.claimTask(taskId)
    await loadTasks()
  } catch (error) {
    console.error('Error claiming task:', error)
  } finally {
    claimingTask.value = null
  }
}

const unclaimTask = async (taskId) => {
  unclaimingTask.value = taskId
  try {
    await taskStore.unclaimTask(taskId)
    await loadTasks()
  } catch (error) {
    console.error('Error unclaiming task:', error)
  } finally {
    unclaimingTask.value = null
  }
}

const viewTaskDetails = (task) => {
  // Show task details in a modal or navigate to task details page
  alert(`Task Details:\n\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nStatus: ${task.status}\nProject: ${task.project?.name || 'No project'}\nAssigned To: ${task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}`)
}

const loadTasks = async () => {
  loading.value = true
  error.value = null
  try {
    console.log('🔍 AvailableTasks - Loading tasks...')
    await taskStore.fetchAvailableTasks()
    console.log('🔍 AvailableTasks - Tasks loaded:', taskStore.availableTasks)
    console.log('🔍 AvailableTasks - Current user:', currentUser.value)
  } catch (err) {
    console.error('🔍 AvailableTasks - Error loading tasks:', err)
    error.value = err.message || 'Failed to load tasks'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  console.log('🔍 AvailableTasks - Component mounted')
  console.log('🔍 AvailableTasks - Auth store user:', authStore.user)
  console.log('🔍 AvailableTasks - Auth store token:', !!authStore.token)
  await loadTasks()
})
</script> 