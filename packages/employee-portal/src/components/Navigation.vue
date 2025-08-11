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
        
        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span class="sr-only">Open main menu</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <!-- Mobile Attendance Status -->
          <div class="px-3 py-2 border-b border-gray-200">
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full mr-2" :class="attendanceStatusClass"></div>
              <span class="text-sm text-gray-600">{{ attendanceStatusText }}</span>
            </div>
          </div>
          
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="[
              $route.path === item.path
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            ]"
            @click="mobileMenuOpen = false"
          >
            <svg v-if="item.icon" class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
            </svg>
            {{ item.name }}
          </router-link>
        </div>
        
        <!-- Mobile user menu -->
        <div class="pt-4 pb-3 border-t border-gray-200">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <span class="text-white font-medium">{{ userInitials }}</span>
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</div>
              <div class="text-sm font-medium text-gray-500">{{ authStore.user?.email }}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <router-link
              to="/profile"
              class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              @click="mobileMenuOpen = false"
            >
              Profile Settings
            </router-link>
            <button
              @click="handleLogout"
              class="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useAttendanceStore } from '../stores/attendanceStore'

const router = useRouter()
const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()
const isUserMenuOpen = ref(false)
const mobileMenuOpen = ref(false)

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
  if (attendanceStore.isCheckedIn && attendanceStore.isCheckedOut) {
    return 'bg-gray-500'
  } else if (attendanceStore.onBreak) {
    return 'bg-yellow-500'
  } else if (attendanceStore.isCheckedIn) {
    return 'bg-green-500'
  } else {
    return 'bg-red-500'
  }
})

const attendanceStatusText = computed(() => {
  if (attendanceStore.isCheckedIn && attendanceStore.isCheckedOut) {
    return 'Checked Out'
  } else if (attendanceStore.onBreak) {
    return 'On Break'
  } else if (attendanceStore.isCheckedIn) {
    return 'Checked In'
  } else {
    return 'Not Checked In'
  }
})

const handleLogout = async () => {
  isUserMenuOpen.value = false
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  // Fetch initial attendance status
  try {
    await attendanceStore.fetchCurrentStatus()
  } catch (error) {
    console.error('Error fetching initial attendance status:', error)
  }
})

// Watch for attendance status changes to ensure UI updates
watch(() => attendanceStore.currentStatus, (newStatus) => {
  console.log('🔍 Navigation - Attendance status updated:', newStatus)
}, { deep: true })
</script> 