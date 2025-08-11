<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <!-- Desktop Navigation -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              v-for="item in navigationItems"
              :key="item.path"
              :to="item.path"
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="[
                $route.path === item.path
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              {{ item.name }}
            </router-link>
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
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
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
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <div class="px-4 py-2 text-sm text-gray-700">
                {{ authStore.user?.email }}
              </div>
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
      
      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
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
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWebSocketAuthStore } from '../stores/websocketAuthStore'

const router = useRouter()
const authStore = useWebSocketAuthStore()
const isUserMenuOpen = ref(false)
const mobileMenuOpen = ref(false)

const navigationItems = computed(() => {
  console.log('🔐 Navigation - Auth store state:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    isSuperAdmin: authStore.isSuperAdmin
  })
  
  const items = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Projects', path: '/projects' },
    { name: 'Sprints', path: '/sprints' },
    { name: 'Attendance', path: '/attendance' },
    { name: 'Support', path: '/support' },
    { name: 'Chat', path: '/chat' },
    { name: 'Clients', path: '/clients' },
    { name: 'Employees', path: '/employees' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Subscriptions', path: '/subscriptions' }
  ]
  
  // Add Super Accounts menu item only for super admins
  if (authStore.isSuperAdmin) {
    items.push({ name: 'Super Accounts', path: '/super-accounts' })
  }
  
  console.log('🔐 Navigation - Items:', items)
  return items
})

const userInitials = computed(() => {
  const email = authStore.user?.email || ''
  return email
    .split('@')[0]
    .split('.')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script> 