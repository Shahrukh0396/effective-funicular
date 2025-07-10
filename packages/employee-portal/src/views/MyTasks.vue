<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p class="text-gray-600 mt-1">Manage your assigned tasks and track your progress</p>
      </div>
      <div class="flex space-x-3">
        <select
          v-model="statusFilter"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="testing">Testing</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
        <select
          v-model="priorityFilter"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>

    <!-- Task Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
            <div class="text-sm text-gray-600">Total Tasks</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.completed }}</div>
            <div class="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.inProgress }}</div>
            <div class="text-sm text-gray-600">In Progress</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.totalHours }}h</div>
            <div class="text-sm text-gray-600">Total Hours</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tasks List -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Task List</h2>
      </div>
      
      <div v-if="taskStore.loading" class="p-6 text-center">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-600">Loading tasks...</p>
      </div>
      
      <div v-else-if="taskStore.error" class="p-6">
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error loading tasks</h3>
              <div class="mt-2 text-sm text-red-700">{{ taskStore.error }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="filteredTasks.length === 0" class="p-6 text-center">
        <svg class="h-12 w-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p class="mt-2 text-gray-600">No tasks found</p>
        <p class="mt-1 text-sm text-gray-500">You don't have any assigned tasks yet.</p>
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="task in filteredTasks"
          :key="task._id"
          class="p-6 hover:bg-gray-50 transition-colors duration-200"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h3 class="text-lg font-medium text-gray-900">{{ task.title }}</h3>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(task.status)"
                >
                  {{ getStatusLabel(task.status) }}
                </span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getPriorityClass(task.priority)"
                >
                  {{ task.priority }}
                </span>
                <!-- Assignment Badge -->
                <span
                  v-if="task.assignedAt"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Assigned {{ formatDate(task.assignedAt) }}
                </span>
              </div>
              
              <p class="mt-1 text-sm text-gray-600">{{ task.description }}</p>
              
              <div class="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                <div v-if="task.project" class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  {{ task.project.name }}
                </div>
                <div v-if="task.estimatedHours" class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ task.estimatedHours }}h estimated
                </div>
                <div v-if="task.actualHours" class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ task.actualHours }}h actual
                </div>
                <div v-if="task.dueDate" class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {{ formatDate(task.dueDate) }}
                </div>
              </div>
            </div>
            
            <div class="ml-6 flex flex-col space-y-2">
              <!-- Time Tracking -->
              <div v-if="task.status === 'in-progress'" class="text-center">
                <div class="text-lg font-bold text-indigo-600">{{ getTaskDuration(task) }}</div>
                <div class="text-xs text-gray-500">Time Spent</div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col space-y-2">
                <button
                  v-if="task.status === 'todo'"
                  @click="startTask(task)"
                  :disabled="taskStore.loading"
                  class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Start
                </button>
                
                <button
                  v-if="task.status === 'in-progress'"
                  @click="stopTask(task)"
                  :disabled="taskStore.loading"
                  class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Stop
                </button>
                
                <button
                  v-if="task.status !== 'in-progress' && task.status !== 'done'"
                  @click="unclaimTask(task)"
                  :disabled="taskStore.loading"
                  class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  Unclaim
                </button>
                
                <select
                  v-model="task.status"
                  @change="updateTaskStatus(task)"
                  :disabled="taskStore.loading"
                  class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="testing">Testing</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
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
import { useTaskStore } from '../stores/taskStore'

const taskStore = useTaskStore()

// Reactive data
const statusFilter = ref('')
const priorityFilter = ref('')

// Computed properties
const filteredTasks = computed(() => {
  let filtered = taskStore.myTasks
  
  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }
  
  if (priorityFilter.value) {
    filtered = filtered.filter(task => task.priority === priorityFilter.value)
  }
  
  return filtered.sort((a, b) => {
    // Sort by priority first, then by due date
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority] || 0
    const bPriority = priorityOrder[b.priority] || 0
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }
    
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    
    return 0
  })
})

const stats = computed(() => {
  const total = taskStore.myTasks.length
  const completed = taskStore.myTasks.filter(t => t.status === 'done').length
  const inProgress = taskStore.myTasks.filter(t => t.status === 'in-progress').length
  const totalHours = taskStore.myTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
  
  return { total, completed, inProgress, totalHours }
})

// Methods
const startTask = async (task) => {
  try {
    await taskStore.startTask(task._id)
  } catch (error) {
    console.error('Error starting task:', error)
  }
}

const stopTask = async (task) => {
  try {
    await taskStore.stopTask(task._id)
  } catch (error) {
    console.error('Error stopping task:', error)
  }
}

const unclaimTask = async (task) => {
  try {
    await taskStore.unclaimTask(task._id)
  } catch (error) {
    console.error('Error unclaiming task:', error)
  }
}

const updateTaskStatus = async (task) => {
  try {
    await taskStore.updateTaskStatus(task._id, task.status)
  } catch (error) {
    console.error('Error updating task status:', error)
  }
}

const getStatusClass = (status) => {
  const classes = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-yellow-100 text-yellow-800',
    'testing': 'bg-purple-100 text-purple-800',
    'done': 'bg-green-100 text-green-800',
    'blocked': 'bg-red-100 text-red-800'
  }
  return classes[status] || classes.todo
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

const getPriorityClass = (priority) => {
  const classes = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-yellow-100 text-yellow-800'
  }
  return classes[priority] || classes.medium
}

const formatDate = (date) => {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getTaskDuration = (task) => {
  if (!task.startedAt) return '0:00'
  
  const now = new Date()
  const startTime = new Date(task.startedAt)
  const diff = now - startTime
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}:${minutes.toString().padStart(2, '0')}`
}

onMounted(async () => {
  await taskStore.fetchMyTasks()
})
</script> 