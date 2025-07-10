<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Welcome back, {{ authStore.user?.firstName || 'Employee' }}!
          </h1>
          <p class="text-gray-600 mt-1">
            {{ getCurrentTime() }} • {{ getCurrentDate() }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500">Current Status</div>
          <div class="text-lg font-semibold" :class="attendanceStatus.color">
            {{ attendanceStatus.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Attendance</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">{{ attendanceData.checkInTime || '--:--' }}</div>
          <div class="text-sm text-gray-600">Check-in Time</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">{{ attendanceData.checkOutTime || '--:--' }}</div>
          <div class="text-sm text-gray-600">Check-out Time</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">{{ attendanceData.totalHours.toFixed(1) }}h</div>
          <div class="text-sm text-gray-600">Total Hours</div>
        </div>
      </div>
      
      <div class="mt-6 flex gap-3">
        <button
          v-if="!attendanceData.checkedIn"
          @click="checkIn"
          :disabled="loading"
          class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Check In
        </button>
        <button
          v-if="attendanceData.checkedIn && !attendanceData.checkedOut"
          @click="checkOut"
          :disabled="loading"
          class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Check Out
        </button>
        <button
          v-if="attendanceData.checkedIn && attendanceData.checkedOut"
          disabled
          class="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
        >
          Day Complete
        </button>
      </div>
    </div>

    <!-- Current Task Section -->
    <div v-if="currentTask" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Currently Working On</h2>
      <div class="border rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-gray-900">{{ currentTask.title }}</h3>
            <p class="text-sm text-gray-600">{{ currentTask.project?.name }}</p>
            <div class="flex items-center mt-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {{ currentTask.status }}
              </span>
              <span class="ml-2 text-sm text-gray-500">
                Started: {{ formatTime(currentTask.startTime) }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-indigo-600">{{ currentTaskDuration }}</div>
            <div class="text-sm text-gray-500">Time Spent</div>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button
            @click="stopTask"
            :disabled="loading"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Stop Task
          </button>
          <button
            @click="pauseTask"
            :disabled="loading"
            class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
          >
            Pause
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
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
            <div class="text-2xl font-bold text-gray-900">{{ stats.myTasks }}</div>
            <div class="text-sm text-gray-600">My Tasks</div>
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
            <div class="text-2xl font-bold text-gray-900">{{ stats.completedTasks }}</div>
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
            <div class="text-2xl font-bold text-gray-900">{{ stats.totalHours }}h</div>
            <div class="text-sm text-gray-600">This Week</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.projects }}</div>
            <div class="text-sm text-gray-600">Projects</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Tasks -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Recent Tasks</h2>
      </div>
      <div class="divide-y divide-gray-200">
        <div
          v-for="task in recentTasks"
          :key="task._id"
          class="px-6 py-4 hover:bg-gray-50 cursor-pointer"
          @click="viewTask(task._id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="text-sm font-medium text-gray-900">{{ task.title }}</h3>
              <p class="text-sm text-gray-600">{{ task.project?.name }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusClass(task.status)"
              >
                {{ task.status }}
              </span>
              <span class="text-sm text-gray-500">{{ formatDate(task.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-gray-200">
        <router-link
          to="/"
          class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all tasks →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const loading = ref(false)
const attendanceData = ref({
  checkedIn: false,
  checkedOut: false,
  checkInTime: null,
  checkOutTime: null,
  totalHours: 0
})
const currentTask = ref(null)
const currentTaskStartTime = ref(null)
const stats = ref({
  myTasks: 0,
  completedTasks: 0,
  totalHours: 0,
  projects: 0
})
const recentTasks = ref([])

// Computed properties
const attendanceStatus = computed(() => {
  if (!attendanceData.value.checkedIn) {
    return { text: 'Not Checked In', color: 'text-red-600' }
  } else if (attendanceData.value.checkedIn && !attendanceData.value.checkedOut) {
    return { text: 'Checked In', color: 'text-green-600' }
  } else {
    return { text: 'Checked Out', color: 'text-gray-600' }
  }
})

const currentTaskDuration = computed(() => {
  if (!currentTaskStartTime.value) return '0:00'
  
  const now = new Date()
  const diff = now - currentTaskStartTime.value
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}:${minutes.toString().padStart(2, '0')}`
})

// Methods
const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (time) => {
  if (!time) return '--:--'
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
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

// API calls
const fetchAttendanceStatus = async () => {
  try {
    const response = await axios.get('/api/employee/attendance/status')
    attendanceData.value = response.data
  } catch (error) {
    console.error('Error fetching attendance status:', error)
  }
}

const fetchCurrentTask = async () => {
  try {
    const response = await axios.get('/api/employee/tasks/my-tasks')
    const runningTask = response.data.find(task => task.status === 'in-progress')
    if (runningTask) {
      currentTask.value = runningTask
      currentTaskStartTime.value = new Date(runningTask.startedAt)
    }
  } catch (error) {
    console.error('Error fetching current task:', error)
  }
}

const fetchStats = async () => {
  try {
    const [tasksResponse, projectsResponse] = await Promise.all([
      axios.get('/api/employee/tasks/my-tasks'),
      axios.get('/api/employee/projects')
    ])
    
    const tasks = tasksResponse.data
    const projects = projectsResponse.data
    
    stats.value = {
      myTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      totalHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
      projects: projects.length
    }
    
    recentTasks.value = tasks.slice(0, 5)
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const checkIn = async () => {
  loading.value = true
  try {
    await axios.post('/api/employee/attendance/check-in')
    await fetchAttendanceStatus()
  } catch (error) {
    console.error('Error checking in:', error)
  } finally {
    loading.value = false
  }
}

const checkOut = async () => {
  loading.value = true
  try {
    await axios.post('/api/employee/attendance/check-out')
    await fetchAttendanceStatus()
  } catch (error) {
    console.error('Error checking out:', error)
  } finally {
    loading.value = false
  }
}

const stopTask = async () => {
  if (!currentTask.value) return
  
  loading.value = true
  try {
    await axios.post(`/api/employee/tasks/${currentTask.value._id}/stop`)
    currentTask.value = null
    currentTaskStartTime.value = null
    await fetchCurrentTask()
  } catch (error) {
    console.error('Error stopping task:', error)
  } finally {
    loading.value = false
  }
}

const pauseTask = async () => {
  if (!currentTask.value) return
  
  loading.value = true
  try {
    await axios.post(`/api/employee/tasks/${currentTask.value._id}/stop`)
    currentTask.value = null
    currentTaskStartTime.value = null
    await fetchCurrentTask()
  } catch (error) {
    console.error('Error pausing task:', error)
  } finally {
    loading.value = false
  }
}

const viewTask = (taskId) => {
  router.push(`/tasks/${taskId}`)
}

// Timer for current task duration
let timer = null

onMounted(async () => {
  await Promise.all([
    fetchAttendanceStatus(),
    fetchCurrentTask(),
    fetchStats()
  ])
  
  // Start timer for current task duration
  if (currentTask.value) {
    timer = setInterval(() => {
      // Force reactivity update
      currentTaskStartTime.value = new Date(currentTaskStartTime.value)
    }, 60000) // Update every minute
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script> 