<template>
  <div class="relative">
    <!-- Portal Switcher Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
      <span>Switch Portal</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Portal Options Dropdown -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1">
        <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Available Portals
        </div>
        
        <!-- Client Portal -->
        <button
          @click="switchToPortal('client')"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
          :class="{ 'bg-indigo-50 text-indigo-700': currentPortal === 'client' }"
        >
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div>
            <div class="font-medium">Client Portal</div>
            <div class="text-xs text-gray-500">Manage projects & tasks</div>
          </div>
          <div v-if="currentPortal === 'client'" class="ml-auto">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </button>

        <!-- Employee Portal -->
        <button
          @click="switchToPortal('employee')"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
          :class="{ 'bg-indigo-50 text-indigo-700': currentPortal === 'employee' }"
        >
          <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div>
            <div class="font-medium">Employee Portal</div>
            <div class="text-xs text-gray-500">Track time & tasks</div>
          </div>
          <div v-if="currentPortal === 'employee'" class="ml-auto">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </button>

        <!-- Admin Panel -->
        <button
          @click="switchToPortal('admin')"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
          :class="{ 'bg-indigo-50 text-indigo-700': currentPortal === 'admin' }"
        >
          <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div>
            <div class="font-medium">Admin Panel</div>
            <div class="text-xs text-gray-500">System management</div>
          </div>
          <div v-if="currentPortal === 'admin'" class="ml-auto">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </button>

        <div class="border-t border-gray-100 my-1"></div>

        <!-- Super Account Info -->
        <div class="px-4 py-2 text-xs text-gray-500">
          <div class="flex items-center space-x-2">
            <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
            </svg>
            <span>Super Account Access</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop to close dropdown -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const isOpen = ref(false)

// Determine current portal based on URL
const currentPortal = computed(() => {
  const hostname = window.location.hostname
  const port = window.location.port
  
  if (hostname.includes('client') || port === '3001') return 'client'
  if (hostname.includes('employee') || port === '3002') return 'employee'
  if (hostname.includes('admin') || port === '3003') return 'admin'
  
  // Default based on current route or other indicators
  return 'employee'
})

// Portal configurations
const portals = {
  client: {
    name: 'Client Portal',
    url: 'http://localhost:3001',
    description: 'Manage projects & tasks'
  },
  employee: {
    name: 'Employee Portal',
    url: 'http://localhost:3002',
    description: 'Track time & tasks'
  },
  admin: {
    name: 'Admin Panel',
    url: 'http://localhost:3003',
    description: 'System management'
  }
}

const switchToPortal = async (portal) => {
  try {
    // Validate access to the target portal
    const response = await fetch('/api/super-accounts/validate-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ portal })
    })

    if (response.ok) {
      const portalConfig = portals[portal]
      
      // Store current portal info for seamless switching
      localStorage.setItem('currentPortal', currentPortal.value)
      
      // Open portal in new window/tab
      window.open(portalConfig.url, '_blank')
      
      // Close dropdown
      isOpen.value = false
    } else {
      console.error('Access denied to portal:', portal)
      alert('Access denied to this portal')
    }
  } catch (error) {
    console.error('Error switching portal:', error)
    alert('Error switching portal')
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.portal-switcher')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 