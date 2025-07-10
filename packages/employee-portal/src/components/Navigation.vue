<template>
  <nav class="bg-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-indigo-600">Employee Portal</h1>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              v-for="item in navigationItems"
              :key="item.path"
              :to="item.path"
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              :class="[
                $route.path === item.path
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              <svg v-if="item.icon" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
              </svg>
              {{ item.name }}
            </router-link>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <!-- Attendance Status Indicator -->
          <div class="mr-4">
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full mr-2" :class="attendanceStatusClass"></div>
              <span class="text-sm text-gray-600">{{ attendanceStatusText }}</span>
            </div>
          </div>
          
          <div class="ml-3 relative">
            <div>
              <button
                @click="isUserMenuOpen = !isUserMenuOpen"
                class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span class="text-white font-medium">{{ userInitials }}</span>
                </div>
              </button>
            </div>
            <div
              v-if="isUserMenuOpen"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <div class="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <div class="font-medium">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</div>
                <div class="text-gray-500">{{ authStore.user?.email }}</div>
              </div>
              <router-link
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                @click="isUserMenuOpen = false"
              >
                Profile Settings
              </router-link>
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const isUserMenuOpen = ref(false)
const attendanceStatus = ref('unknown')

const navigationItems = [
  { 
    name: 'Dashboard', 
    path: '/',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
  },
  { 
    name: 'My Tasks', 
    path: '/tasks',
    icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  },
  { 
    name: 'Available Tasks', 
    path: '/available-tasks',
    icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
  },
  { 
    name: 'Projects', 
    path: '/projects',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
  },
  { 
    name: 'Attendance', 
    path: '/attendance',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  { 
    name: 'Sprints', 
    path: '/sprints',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  { 
    name: 'Team Chat', 
    path: '/chat',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  }
]

const userInitials = computed(() => {
  const firstName = authStore.user?.firstName || ''
  const lastName = authStore.user?.lastName || ''
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
})

const attendanceStatusClass = computed(() => {
  switch (attendanceStatus.value) {
    case 'checked-in':
      return 'bg-green-500'
    case 'checked-out':
      return 'bg-gray-500'
    default:
      return 'bg-red-500'
  }
})

const attendanceStatusText = computed(() => {
  switch (attendanceStatus.value) {
    case 'checked-in':
      return 'Checked In'
    case 'checked-out':
      return 'Checked Out'
    default:
      return 'Not Checked In'
  }
})

const fetchAttendanceStatus = async () => {
  try {
    const response = await axios.get('/api/employee/attendance/status')
    if (response.data.checkedIn && response.data.checkedOut) {
      attendanceStatus.value = 'checked-out'
    } else if (response.data.checkedIn) {
      attendanceStatus.value = 'checked-in'
    } else {
      attendanceStatus.value = 'not-checked-in'
    }
  } catch (error) {
    console.error('Error fetching attendance status:', error)
  }
}

const handleLogout = async () => {
  isUserMenuOpen.value = false
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchAttendanceStatus()
})
</script> 