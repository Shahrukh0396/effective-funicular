<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">{{ companyName }} Admin Dashboard</h1>
      <p class="text-gray-600 mt-2">Manage your employees, clients, and business operations</p>
    </div>

    <!-- Loading State -->
    <div v-if="loadingDashboard" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading dashboard data...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading dashboard</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="refreshDashboard" class="text-red-400 hover:text-red-600">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashboardAnalytics" class="space-y-6">
      <!-- Key Performance Indicators -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Employees</p>
              <p class="text-2xl font-semibold text-gray-900">{{ dashboardMetrics.totalEmployees }}</p>
              <p class="text-sm text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                +{{ dashboardMetrics.employeeGrowth }}%
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Active Clients</p>
              <p class="text-2xl font-semibold text-gray-900">{{ dashboardMetrics.activeClients }}</p>
              <p class="text-sm text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                +{{ dashboardMetrics.clientGrowth }}%
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Active Projects</p>
              <p class="text-2xl font-semibold text-gray-900">{{ dashboardMetrics.activeProjects }}</p>
              <p class="text-sm text-blue-600">{{ dashboardMetrics.projectCompletionRate }}% completion rate</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Team Efficiency</p>
              <p class="text-2xl font-semibold text-gray-900">{{ dashboardMetrics.teamEfficiency }}%</p>
              <p class="text-sm text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                +{{ dashboardMetrics.efficiencyChange }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Project Status Chart -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Project Status Overview</h3>
          <div class="space-y-4">
            <div v-for="status in projectStatuses" :key="status.name" class="flex items-center justify-between">
              <div class="flex items-center">
                <div :class="`w-3 h-3 rounded-full ${status.color}`"></div>
                <span class="ml-2 text-sm text-gray-600">{{ status.name }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-900">{{ status.count }}</span>
                <span class="text-sm text-gray-500 ml-2">({{ status.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Metrics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Task Completion</h3>
          <div class="space-y-4">
            <div v-for="metric in taskMetrics" :key="metric.name" class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ metric.name }}</span>
              <div class="flex items-center">
                <div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: metric.percentage + '%' }"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ metric.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity and Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-4">
            <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start space-x-3">
              <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${activity.iconBg}`">
                <svg class="w-4 h-4" :class="activity.iconColor" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="activity.icon === 'ProjectIcon'" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  <path v-else-if="activity.icon === 'TaskIcon'" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path v-else d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                <p class="text-sm text-gray-500">{{ activity.description }}</p>
                <p class="text-xs text-gray-400">{{ formatTime(activity.time) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- System Alerts -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div class="space-y-4">
            <div v-for="alert in systemAlerts" :key="alert.id" class="flex items-start space-x-3">
              <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${alert.severityBg}`">
                <svg class="w-4 h-4" :class="alert.severityColor" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="alert.severity === 'Warning'" fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ alert.title }}</p>
                <p class="text-sm text-gray-500">{{ alert.description }}</p>
                <p class="text-xs text-gray-400">{{ formatTime(alert.time) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Client Satisfaction -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Client Satisfaction</h3>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="text-3xl font-bold text-gray-900">{{ dashboardMetrics.clientSatisfaction }}</div>
            <div class="ml-4">
              <div class="flex items-center">
                <div class="flex items-center">
                  <svg v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.floor(dashboardMetrics.clientSatisfaction) ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ dashboardMetrics.satisfactionResponses }} responses</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Average Rating</p>
            <p class="text-lg font-semibold text-gray-900">Excellent</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useAdminStore } from '../stores/adminStore'
import { useTenantBrandingStore } from '../stores/tenantBranding'

const adminStore = useAdminStore()
const tenantBrandingStore = useTenantBrandingStore()

const companyName = computed(() => tenantBrandingStore.companyName)

// Computed properties
const dashboardAnalytics = computed(() => adminStore.dashboardAnalytics)
const dashboardMetrics = computed(() => adminStore.dashboardMetrics)
const projectStatuses = computed(() => adminStore.projectStatuses)
const taskMetrics = computed(() => adminStore.taskMetrics)
const recentActivity = computed(() => adminStore.recentActivity)
const systemAlerts = computed(() => adminStore.systemAlerts)
const loadingDashboard = computed(() => adminStore.loadingDashboard)
const error = computed(() => adminStore.error)

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount)
}

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    return date.toLocaleDateString()
  }
}

const refreshDashboard = async () => {
  try {
    await adminStore.fetchDashboardAnalytics()
  } catch (error) {
    console.error('Failed to refresh dashboard:', error)
  }
}

// Load data on mount
onMounted(async () => {
  try {
    await adminStore.fetchDashboardAnalytics()
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
})
</script> 