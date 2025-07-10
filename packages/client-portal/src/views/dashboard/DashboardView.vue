<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Welcome Section -->
      <div class="mt-8">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900">Welcome back, {{ user?.name || 'User' }}!</h2>
          <p class="mt-1 text-sm text-gray-500">Here's what's happening with your services today.</p>
        </div>
      </div>

      <!-- Overview Card -->
      <div class="mt-8">
        <div class="bg-indigo-600 shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5">
              <h3 class="text-lg font-medium text-white">Active Subscriptions</h3>
              <p class="mt-1 text-3xl font-semibold text-white">{{ activeSubscriptions }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Tasks Progress -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Tasks in Progress</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ completedTasks }}/{{ totalTasks }}</div>
                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span class="sr-only">Completed</span>
                      {{ Math.round((completedTasks / totalTasks) * 100) }}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <router-link to="/dashboard/tasks" class="font-medium text-indigo-600 hover:text-indigo-500">
                View all tasks
              </router-link>
            </div>
          </div>
        </div>

        <!-- Next Deadline -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Next Deadline</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ nextDeadline }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <router-link to="/dashboard/projects" class="font-medium text-indigo-600 hover:text-indigo-500">
                View project details
              </router-link>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Recent Activity</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ recentActivities.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <router-link to="/dashboard/notifications" class="font-medium text-indigo-600 hover:text-indigo-500">
                View all notifications
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- View Project Button -->
      <div class="mt-8">
        <router-link
          to="/dashboard/projects"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View Project
          <svg class="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = ref(null)
const activeSubscriptions = ref(2)
const completedTasks = ref(3)
const totalTasks = ref(5)
const nextDeadline = ref('Sept 15, 2025')
const recentActivities = ref([
  { id: 1, type: 'task_completed', message: 'Task "Update Documentation" completed' },
  { id: 2, type: 'payment_received', message: 'Payment received for subscription' },
  { id: 3, type: 'employee_assigned', message: 'New team member assigned to project' }
])

onMounted(async () => {
  // Fetch user data and other dashboard information
  user.value = await authStore.getCurrentUser()
  // Additional data fetching can be added here
})
</script> 