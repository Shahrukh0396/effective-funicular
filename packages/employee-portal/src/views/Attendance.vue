<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Attendance History</h1>
        <p class="text-gray-600 mt-1">Track your attendance and working hours</p>
      </div>
      <div class="flex space-x-3">
        <input
          v-model="startDate"
          type="date"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          v-model="endDate"
          type="date"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          @click="fetchAttendanceHistory"
          :disabled="loading"
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Filter
        </button>
      </div>
    </div>

    <!-- Attendance Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats.totalDays }}</div>
            <div class="text-sm text-gray-600">Total Days</div>
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
            <div class="text-2xl font-bold text-gray-900">{{ stats.presentDays }}</div>
            <div class="text-sm text-gray-600">Present Days</div>
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
            <div class="text-2xl font-bold text-gray-900">{{ stats.totalHours.toFixed(1) }}h</div>
            <div class="text-sm text-gray-600">Total Hours</div>
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
            <div class="text-2xl font-bold text-gray-900">{{ stats.averageHoursPerDay.toFixed(1) }}h</div>
            <div class="text-sm text-gray-600">Avg Hours/Day</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance History Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Attendance Records</h2>
      </div>
      
      <div v-if="loading" class="p-6 text-center">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-600">Loading attendance records...</p>
      </div>
      
      <div v-else-if="attendanceHistory.length === 0" class="p-6 text-center">
        <svg class="h-12 w-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <p class="mt-2 text-gray-600">No attendance records found</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="record in attendanceHistory"
              :key="record._id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ formatDate(record.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTime(record.checkIn) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTime(record.checkOut) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ record.totalHours ? record.totalHours.toFixed(1) + 'h' : '--' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(record.status)"
                >
                  {{ record.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  @click="viewDetails(record)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showDetailsModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Attendance Details</h3>
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-700">Date:</label>
              <p class="text-sm text-gray-900">{{ formatDate(selectedRecord.date) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Check In:</label>
              <p class="text-sm text-gray-900">{{ formatTime(selectedRecord.checkIn) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Check Out:</label>
              <p class="text-sm text-gray-900">{{ formatTime(selectedRecord.checkOut) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Total Hours:</label>
              <p class="text-sm text-gray-900">{{ selectedRecord.totalHours ? selectedRecord.totalHours.toFixed(1) + 'h' : '--' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Status:</label>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2"
                :class="getStatusClass(selectedRecord.status)"
              >
                {{ selectedRecord.status }}
              </span>
            </div>
            <div v-if="selectedRecord.notes">
              <label class="text-sm font-medium text-gray-700">Notes:</label>
              <p class="text-sm text-gray-900">{{ selectedRecord.notes }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button
              @click="showDetailsModal = false"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Reactive data
const loading = ref(false)
const attendanceHistory = ref([])
const startDate = ref('')
const endDate = ref('')
const showDetailsModal = ref(false)
const selectedRecord = ref({})

// Computed properties
const stats = computed(() => {
  const totalDays = attendanceHistory.value.length
  const presentDays = attendanceHistory.value.filter(r => r.status === 'present').length
  const totalHours = attendanceHistory.value.reduce((sum, r) => sum + (r.totalHours || 0), 0)
  const averageHoursPerDay = presentDays > 0 ? totalHours / presentDays : 0
  
  return {
    totalDays,
    presentDays,
    totalHours,
    averageHoursPerDay
  }
})

// Methods
const fetchAttendanceHistory = async () => {
  loading.value = true
  try {
    const params = {}
    if (startDate.value) params.startDate = startDate.value
    if (endDate.value) params.endDate = endDate.value
    
    const response = await axios.get('/api/employee/attendance/history', { params })
    attendanceHistory.value = response.data
  } catch (error) {
    console.error('Error fetching attendance history:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
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

const getStatusClass = (status) => {
  const classes = {
    'present': 'bg-green-100 text-green-800',
    'absent': 'bg-red-100 text-red-800',
    'late': 'bg-yellow-100 text-yellow-800',
    'early-leave': 'bg-orange-100 text-orange-800',
    'half-day': 'bg-purple-100 text-purple-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const viewDetails = (record) => {
  selectedRecord.value = record
  showDetailsModal.value = true
}

onMounted(() => {
  // Set default date range to last 30 days
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  
  endDate.value = end.toISOString().split('T')[0]
  startDate.value = start.toISOString().split('T')[0]
  
  fetchAttendanceHistory()
})
</script> 