<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
    <!-- Top navigation - Professional style -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
      <div class="flex h-16 items-center justify-between px-6">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <ShieldCheckIcon class="w-6 h-6 text-white" />
          </div>
          <span class="ml-3 text-xl font-bold text-gray-900">Super Admin</span>
        </div>

        <!-- Navigation Links - Professional style -->
        <nav class="flex items-center space-x-2">
          <router-link
            to="/"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="$route.path === '/' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <HomeIcon class="w-4 h-4 mr-2" />
            Dashboard
          </router-link>
          
          <router-link
            to="/vendors"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="$route.path.startsWith('/vendors') ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <BuildingOfficeIcon class="w-4 h-4 mr-2" />
            Vendors
          </router-link>
          
          <router-link
            to="/vendors/white-label"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="$route.path === '/vendors/white-label' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <PaintBrushIcon class="w-4 h-4 mr-2" />
            White-Label
          </router-link>
          
          <router-link
            to="/analytics"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="$route.path === '/analytics' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <ChartBarIcon class="w-4 h-4 mr-2" />
            Analytics
          </router-link>
          
          <router-link
            to="/users"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="$route.path === '/users' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <UsersIcon class="w-4 h-4 mr-2" />
            Users
          </router-link>
          
          <router-link
            to="/revenue"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="$route.path === '/revenue' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <CurrencyDollarIcon class="w-4 h-4 mr-2" />
            Revenue
          </router-link>
          
          <router-link
            to="/client-requests"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="$route.path === '/client-requests' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Requests
          </router-link>
        </nav>

        <!-- Right side - Notifications and Profile -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button class="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md">
            <BellIcon class="w-5 h-5" />
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <!-- Profile dropdown -->
          <div class="relative">
            <button
              @click="profileDropdownOpen = !profileDropdownOpen"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
            >
              <div class="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                <UserIcon class="w-5 h-5 text-white" />
              </div>
              <span class="text-sm font-medium text-gray-700">Admin</span>
              <ChevronDownIcon class="w-4 h-4 text-gray-400" />
            </button>

            <!-- Dropdown menu -->
            <div
              v-if="profileDropdownOpen"
              class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200/50 backdrop-blur-xl"
            >
              <router-link
                to="/profile"
                class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200"
              >
                <UserIcon class="w-4 h-4 mr-3" />
                Profile
              </router-link>
              <router-link
                to="/settings"
                class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200"
              >
                <CogIcon class="w-4 h-4 mr-3" />
                Settings
              </router-link>
              <hr class="my-2 border-gray-200">
              <button
                @click="logout"
                class="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon class="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content with top padding for fixed header -->
    <main class="flex-1 pt-16">
      <div class="py-6">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <router-view />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  ShieldCheckIcon,
  HomeIcon,
  BuildingOfficeIcon,
  PaintBrushIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BellIcon,
  UserIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const profileDropdownOpen = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>