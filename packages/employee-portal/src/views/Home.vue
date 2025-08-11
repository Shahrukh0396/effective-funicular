<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-2xl font-bold text-gray-900">Employee Portal</h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">Welcome, {{ user?.firstName || user?.email }}</span>
            <router-link
              to="/dashboard"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Dashboard
            </router-link>
            <button
              @click="logout"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="relative z-10 pb-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div class="sm:text-center lg:text-left">
              <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span class="block xl:inline">Welcome back,</span>
                <span class="block text-indigo-600 xl:inline">{{ user?.firstName || 'Employee' }}!</span>
              </h1>
              <p class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Ready to tackle your tasks and boost your productivity? Here's what you can do today.
              </p>
              <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div class="rounded-md shadow">
                  <router-link
                    to="/dashboard"
                    class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                  >
                    Go to Dashboard
                  </router-link>
                </div>
                <div class="mt-3 sm:mt-0 sm:ml-3">
                  <router-link
                    to="/tasks"
                    class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                  >
                    View My Tasks
                  </router-link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div class="h-56 w-full bg-gradient-to-r from-indigo-400 to-purple-500 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
          <div class="text-white text-center">
            <div class="text-6xl mb-4">⚡</div>
            <p class="text-xl font-semibold">Employee Home</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-base text-indigo-600 font-semibold tracking-wide uppercase">Quick Actions</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            What would you like to do?
          </p>
        </div>

        <div class="mt-10">
          <div class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <router-link to="/tasks" class="group">
              <div class="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white group-hover:bg-indigo-600 transition-colors duration-200">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">My Tasks</p>
                <p class="mt-2 ml-16 text-base text-gray-500">
                  View and manage your assigned tasks. Track progress and update status.
                </p>
              </div>
            </router-link>

            <router-link to="/available-tasks" class="group">
              <div class="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white group-hover:bg-indigo-600 transition-colors duration-200">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Available Tasks</p>
                <p class="mt-2 ml-16 text-base text-gray-500">
                  Browse and claim available tasks from your team.
                </p>
              </div>
            </router-link>

            <router-link to="/projects" class="group">
              <div class="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white group-hover:bg-indigo-600 transition-colors duration-200">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Projects</p>
                <p class="mt-2 ml-16 text-base text-gray-500">
                  View project details and track your contributions.
                </p>
              </div>
            </router-link>

            <router-link to="/attendance" class="group">
              <div class="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white group-hover:bg-indigo-600 transition-colors duration-200">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Time Tracking</p>
                <p class="mt-2 ml-16 text-base text-gray-500">
                  Track your work hours and manage attendance.
                </p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="py-12 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-base text-indigo-600 font-semibold tracking-wide uppercase">Recent Activity</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Your recent work
          </p>
        </div>

        <div class="mt-10">
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              <li class="px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">Task Updated</div>
                      <div class="text-sm text-gray-500">Updated status for "Website Redesign"</div>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500">2 hours ago</div>
                </div>
              </li>
              <li class="px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">Time Logged</div>
                      <div class="text-sm text-gray-500">Logged 4.5 hours on "Mobile App Development"</div>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500">Yesterday</div>
                </div>
              </li>
              <li class="px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">Project Joined</div>
                      <div class="text-sm text-gray-500">Added to "E-commerce Platform" project</div>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500">3 days ago</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

// Computed properties for authentication state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// Logout function
const logout = () => {
  authStore.logout()
}
</script> 