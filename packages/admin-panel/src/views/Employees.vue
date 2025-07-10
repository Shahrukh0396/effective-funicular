<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Employee Management</h1>
          <p class="text-gray-600 mt-1">Monitor employee performance, attendance, and manage team</p>
        </div>
        <button
          @click="showAddEmployeeModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add New Employee
        </button>
      </div>

      <!-- Employee Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ stats.totalEmployees }}</div>
              <div class="text-sm text-gray-600">Total Employees</div>
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
              <div class="text-2xl font-bold text-gray-900">{{ stats.activeEmployees }}</div>
              <div class="text-sm text-gray-600">Active Today</div>
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
              <div class="text-sm text-gray-600">Total Hours Today</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ stats.avgProductivity }}%</div>
              <div class="text-sm text-gray-600">Avg Productivity</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              v-model="filters.role"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="senior">Senior</option>
              <option value="lead">Team Lead</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Attendance</label>
            <select
              v-model="filters.attendance"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search employees..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Employee List -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Employee List</h2>
        </div>
        
        <div v-if="loading" class="p-6 text-center">
          <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-gray-600">Loading employees...</p>
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
                  Attendance
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Today
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="employee in filteredEmployees"
                :key="employee._id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span class="text-white font-medium">
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
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(employee.isActive ? 'active' : 'inactive')"
                  >
                    {{ employee.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full mr-2" :class="getAttendanceClass(employee.attendanceStatus)"></div>
                    <span class="text-sm text-gray-900">{{ employee.attendanceStatus || 'Not Checked In' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ employee.hoursToday ? employee.hoursToday.toFixed(1) + 'h' : '--' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="bg-green-600 h-2 rounded-full"
                        :style="{ width: employee.performance + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-900">{{ employee.performance }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="viewEmployeeDetails(employee)"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </button>
                    <button
                      @click="editEmployee(employee)"
                      class="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </button>
                    <button
                      @click="toggleEmployeeStatus(employee)"
                      :class="employee.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                    >
                      {{ employee.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Employee Details Modal -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showDetailsModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Employee Details</h3>
            <button
              @click="showDetailsModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div v-if="selectedEmployee" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Info -->
            <div class="space-y-4">
              <h4 class="font-medium text-gray-900">Basic Information</h4>
              <div>
                <label class="text-sm font-medium text-gray-700">Name:</label>
                <p class="text-sm text-gray-900">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">Email:</label>
                <p class="text-sm text-gray-900">{{ selectedEmployee.email }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">Role:</label>
                <p class="text-sm text-gray-900">{{ selectedEmployee.role }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700">Position:</label>
                <p class="text-sm text-gray-900">{{ selectedEmployee.position || 'Not specified' }}</p>
              </div>
            </div>
            
            <!-- Performance Stats -->
            <div class="space-y-4">
              <h4 class="font-medium text-gray-900">Performance Statistics</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-2xl font-bold text-indigo-600">{{ selectedEmployee.stats?.totalTasks || 0 }}</div>
                  <div class="text-sm text-gray-600">Total Tasks</div>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">{{ selectedEmployee.stats?.completedTasks || 0 }}</div>
                  <div class="text-sm text-gray-600">Completed</div>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-2xl font-bold text-yellow-600">{{ selectedEmployee.stats?.totalHours || 0 }}h</div>
                  <div class="text-sm text-gray-600">Total Hours</div>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-2xl font-bold text-purple-600">{{ selectedEmployee.stats?.avgHoursPerDay || 0 }}h</div>
                  <div class="text-sm text-gray-600">Avg/Day</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <div v-if="showAddEmployeeModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Employee</h3>
            <form @submit.prevent="handleSubmit">
              <div class="space-y-4">
                <FormInput
                  id="firstName"
                  label="First Name"
                  v-model="newEmployee.firstName"
                  required
                />
                <FormInput
                  id="lastName"
                  label="Last Name"
                  v-model="newEmployee.lastName"
                  required
                />
                <FormInput
                  id="email"
                  label="Email"
                  type="email"
                  v-model="newEmployee.email"
                  required
                />
                <FormInput
                  id="password"
                  label="Password"
                  type="password"
                  v-model="newEmployee.password"
                  required
                />
                <FormSelect
                  id="role"
                  label="Role"
                  v-model="newEmployee.role"
                  :options="roleOptions"
                  required
                />
                <FormInput
                  id="position"
                  label="Position"
                  v-model="newEmployee.position"
                />
              </div>
              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  :disabled="loading"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {{ loading ? 'Adding...' : 'Add Employee' }}
                </button>
                <button
                  type="button"
                  @click="showAddEmployeeModal = false"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from '../components/DataTable.vue'
import FormInput from '../components/FormInput.vue'
import FormSelect from '../components/FormSelect.vue'
import axios from 'axios'

// Reactive data
const loading = ref(false)
const employees = ref([])
const showAddEmployeeModal = ref(false)
const showDetailsModal = ref(false)
const selectedEmployee = ref(null)
const filters = ref({
  role: '',
  status: '',
  attendance: '',
  search: ''
})

const newEmployee = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'employee',
  position: ''
})

// Computed properties
const filteredEmployees = computed(() => {
  let filtered = employees.value
  
  if (filters.value.role) {
    filtered = filtered.filter(emp => emp.role === filters.value.role)
  }
  
  if (filters.value.status) {
    filtered = filtered.filter(emp => {
      if (filters.value.status === 'active') return emp.isActive
      if (filters.value.status === 'inactive') return !emp.isActive
      return true
    })
  }
  
  if (filters.value.attendance) {
    filtered = filtered.filter(emp => emp.attendanceStatus === filters.value.attendance)
  }
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(emp => 
      emp.firstName.toLowerCase().includes(search) ||
      emp.lastName.toLowerCase().includes(search) ||
      emp.email.toLowerCase().includes(search)
    )
  }
  
  return filtered
})

const stats = computed(() => {
  const totalEmployees = employees.value.length
  const activeEmployees = employees.value.filter(emp => emp.attendanceStatus === 'checked_in').length
  const totalHours = employees.value.reduce((sum, emp) => sum + (emp.hoursToday || 0), 0)
  const avgProductivity = employees.value.length > 0 
    ? employees.value.reduce((sum, emp) => sum + (emp.performance || 0), 0) / employees.value.length 
    : 0
  
  return {
    totalEmployees,
    activeEmployees,
    totalHours,
    avgProductivity: Math.round(avgProductivity)
  }
})

const roleOptions = [
  { value: 'employee', label: 'Employee' },
  { value: 'senior', label: 'Senior Employee' },
  { value: 'lead', label: 'Team Lead' },
  { value: 'admin', label: 'Administrator' }
]

// Methods
const fetchEmployees = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/employees')
    employees.value = response.data.map(emp => ({
      ...emp,
      attendanceStatus: emp.attendanceStatus || 'not_checked_in',
      hoursToday: emp.hoursToday || 0,
      performance: emp.performance || 0
    }))
  } catch (error) {
    console.error('Error fetching employees:', error)
  } finally {
    loading.value = false
  }
}

const getInitials = (firstName, lastName) => {
  return (firstName?.charAt(0) + lastName?.charAt(0)).toUpperCase()
}

const getStatusClass = (status) => {
  const classes = {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-red-100 text-red-800',
    'on_leave': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getAttendanceClass = (status) => {
  const classes = {
    'checked_in': 'bg-green-500',
    'checked_out': 'bg-gray-500',
    'absent': 'bg-red-500'
  }
  return classes[status] || 'bg-red-500'
}

const viewEmployeeDetails = async (employee) => {
  try {
    const response = await axios.get(`/api/admin/employees/${employee._id}/details`)
    selectedEmployee.value = response.data
    showDetailsModal.value = true
  } catch (error) {
    console.error('Error fetching employee details:', error)
  }
}

const editEmployee = (employee) => {
  // TODO: Implement edit functionality
  console.log('Edit employee:', employee)
}

const toggleEmployeeStatus = async (employee) => {
  try {
    await axios.put(`/api/admin/employees/${employee._id}/toggle-status`)
    employee.isActive = !employee.isActive
  } catch (error) {
    console.error('Error toggling employee status:', error)
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await axios.post('/api/admin/employees', newEmployee.value)
    await fetchEmployees()
    
    // Reset form
    newEmployee.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'employee',
      position: ''
    }
    showAddEmployeeModal.value = false
  } catch (error) {
    console.error('Error adding employee:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEmployees()
})
</script> 