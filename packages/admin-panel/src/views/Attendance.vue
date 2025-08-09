<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Employee Attendance</h1>
        <p class="text-gray-600 mt-1">Monitor and manage employee attendance</p>
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
          @click="generateReport"
          :disabled="loading"
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Generate Report
        </button>
      </div>
    </div>

    <!-- Today's Overview -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-gray-900">{{ overview.totalEmployees }}</div>
          <div class="text-sm text-gray-600">Total Employees</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ overview.presentToday }}</div>
          <div class="text-sm text-gray-600">Present Today</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-red-600">{{ overview.absentToday }}</div>
          <div class="text-sm text-gray-600">Absent Today</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ overview.attendanceRate }}%</div>
          <div class="text-sm text-gray-600">Attendance Rate</div>
        </div>
      </div>
    </div>

    <!-- Employee Status Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Current Employee Status</h2>
      </div>
      
      <div v-if="loading" class="p-6 text-center">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-600">Loading employee status...</p>
      </div>
      
      <div v-else-if="overview.employeeStatus.length === 0" class="p-6 text-center">
        <svg class="h-12 w-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
        </svg>
        <p class="mt-2 text-gray-600">No employees found</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours Today
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="employee in overview.employeeStatus"
              :key="employee._id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ getInitials(employee.firstName, employee.lastName) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ employee.firstName }} {{ employee.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ employee.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ employee.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div 
                    class="w-2 h-2 rounded-full mr-2"
                    :class="getStatusColor(employee.status)"
                  ></div>
                  <span class="text-sm text-gray-900">{{ formatStatus(employee.status) }}</span>
                  <span v-if="employee.onBreak" class="ml-2 text-xs text-yellow-600">
                    ({{ employee.breakReason || 'break' }})
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTime(employee.checkInTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTime(employee.checkOutTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ employee.totalHours.toFixed(1) }}h
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  @click="viewEmployeeAttendance(employee)"
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

    <!-- Employee Attendance Details Modal -->
    <div
      v-if="showEmployeeModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showEmployeeModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Attendance Details - {{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}
            </h3>
            <button
              @click="showEmployeeModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Employee Summary -->
          <div v-if="employeeAttendance" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ employeeAttendance.summary.totalDays }}</div>
              <div class="text-sm text-gray-600">Total Days</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ employeeAttendance.summary.presentDays }}</div>
              <div class="text-sm text-gray-600">Present Days</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-red-600">{{ employeeAttendance.summary.absentDays }}</div>
              <div class="text-sm text-gray-600">Absent Days</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ employeeAttendance.summary.averageHoursPerDay }}h</div>
              <div class="text-sm text-gray-600">Avg Hours/Day</div>
            </div>
          </div>
          
          <!-- Attendance History Table -->
          <div v-if="employeeAttendance?.attendanceHistory" class="overflow-x-auto">
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
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="record in employeeAttendance.attendanceHistory"
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
                </tr>
              </tbody>
            </table>
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
const overview = ref({
  totalEmployees: 0,
  presentToday: 0,
  absentToday: 0,
  attendanceRate: 0,
  employeeStatus: []
})
const startDate = ref('')
const endDate = ref('')
const showEmployeeModal = ref(false)
const selectedEmployee = ref(null)
const employeeAttendance = ref(null)

// Methods
const fetchAttendanceOverview = async () => {
  loading.value = true
  try {
    console.log('🔍 Admin Attendance - Fetching overview...')
    console.log('🔍 Admin Attendance - API URL:', axios.defaults.baseURL)
    console.log('🔍 Admin Attendance - Token:', localStorage.getItem('admin_token') ? 'Present' : 'Missing')
    
    const response = await axios.get('/api/admin/attendance/overview')
    console.log('🔍 Admin Attendance - Response:', response.data)
    overview.value = response.data.data
  } catch (error) {
    console.error('Error fetching attendance overview:', error)
    console.error('Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      config: error.config
    })
  } finally {
    loading.value = false
  }
}

const generateReport = async () => {
  if (!startDate.value || !endDate.value) {
    alert('Please select both start and end dates')
    return
  }
  
  try {
    const response = await axios.get('/api/admin/attendance/report', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value
      }
    })
    
    // For now, just show the data in console
    console.log('Attendance Report:', response.data.data)
    alert('Report generated successfully! Check console for details.')
  } catch (error) {
    console.error('Error generating report:', error)
    alert('Failed to generate report')
  }
}

const viewEmployeeAttendance = async (employee) => {
  selectedEmployee.value = employee
  showEmployeeModal.value = true
  
  try {
    const response = await axios.get(`/api/admin/attendance/employee/${employee._id}`)
    employeeAttendance.value = response.data.data
  } catch (error) {
    console.error('Error fetching employee attendance:', error)
  }
}

const getInitials = (firstName, lastName) => {
  return (firstName?.charAt(0) + lastName?.charAt(0)).toUpperCase()
}

const getStatusColor = (status) => {
  const colors = {
    'checked_in': 'bg-green-500',
    'checked_out': 'bg-gray-500',
    'on_break': 'bg-yellow-500',
    'not_checked_in': 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

const formatStatus = (status) => {
  const statusMap = {
    'checked_in': 'Checked In',
    'checked_out': 'Checked Out',
    'on_break': 'On Break',
    'not_checked_in': 'Not Checked In'
  }
  return statusMap[status] || status
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
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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

onMounted(() => {
  // Set default date range to last 30 days
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  
  endDate.value = end.toISOString().split('T')[0]
  startDate.value = start.toISOString().split('T')[0]
  
  console.log('🔍 Admin Attendance - Component mounted')
  console.log('🔍 Admin Attendance - Checking authentication...')
  console.log('🔍 Admin Attendance - Token:', localStorage.getItem('admin_token') ? 'Present' : 'Missing')
  console.log('🔍 Admin Attendance - User:', localStorage.getItem('admin_user') ? 'Present' : 'Missing')
  
  fetchAttendanceOverview()
})
</script> 