<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Business Analytics</h1>
      <p class="text-gray-600 mt-2">Comprehensive business intelligence and performance insights</p>
    </div>

    <!-- Loading State -->
    <div v-if="loadingBusiness" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading analytics data...</span>
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
          <h3 class="text-sm font-medium text-red-800">Error loading analytics</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button @click="refreshAnalytics" class="text-red-400 hover:text-red-600">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Analytics Content -->
    <div v-else-if="businessAnalytics" class="space-y-6">
      <!-- Key Business Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Revenue</p>
              <p class="text-2xl font-semibold text-gray-900">${{ formatCurrency(businessMetrics.totalRevenue) }}</p>
              <p class="text-sm text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                +{{ businessMetrics.revenueGrowth }}%
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
              <p class="text-sm font-medium text-gray-500">New Clients</p>
              <p class="text-2xl font-semibold text-gray-900">{{ businessMetrics.newClients }}</p>
              <p class="text-sm text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                +{{ businessMetrics.clientGrowth }}%
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p class="text-2xl font-semibold text-gray-900">{{ businessMetrics.conversionRate }}%</p>
              <p class="text-sm text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                +{{ businessMetrics.conversionGrowth }}%
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Satisfaction</p>
              <p class="text-2xl font-semibold text-gray-900">{{ businessMetrics.satisfaction }}/5</p>
              <p class="text-sm text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                +{{ businessMetrics.satisfactionGrowth }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics and Team Performance -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Project Performance Metrics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Project Performance</h3>
          <div class="space-y-4">
            <div v-for="metric in projectMetrics" :key="metric.name" class="flex items-center justify-between">
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

        <!-- Team Performance -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div class="space-y-4">
            <div v-for="member in teamPerformance" :key="member.id" class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <span class="text-sm font-medium text-gray-700">{{ member.initials }}</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ member.name }}</p>
                  <p class="text-xs text-gray-500">{{ member.role }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">{{ member.efficiency }}%</p>
                <p class="text-xs text-gray-500">{{ member.completedTasks }} tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Service Performance and Top Clients -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Service Performance -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Service Performance</h3>
          <div class="space-y-4">
            <div v-for="service in servicePerformance" :key="service.name" class="border-b border-gray-200 pb-4 last:border-b-0">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-900">{{ service.name }}</h4>
                <span class="text-sm text-green-600">+{{ service.growth }}%</span>
              </div>
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>{{ service.projects }} projects</span>
                <span>${{ formatCurrency(service.revenue) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Clients -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Clients</h3>
          <div class="space-y-4">
            <div v-for="client in topClients" :key="client.id" class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <span class="text-sm font-medium text-gray-700">{{ client.initials }}</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ client.name }}</p>
                  <p class="text-xs text-gray-500">${{ formatCurrency(client.revenue) }}</p>
                </div>
              </div>
              <div class="text-right">
                <span :class="client.growth >= 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                  {{ client.growth >= 0 ? '+' : '' }}{{ client.growth }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue by Service -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="service in revenueByService" :key="service.name" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-900">{{ service.name }}</h4>
              <div :class="`w-3 h-3 rounded-full ${service.color}`"></div>
            </div>
            <div class="text-2xl font-bold text-gray-900">${{ formatCurrency(service.revenue) }}</div>
            <div class="text-sm text-gray-500">{{ service.percentage }}% of total</div>
          </div>
        </div>
      </div>

      <!-- Detailed Analytics Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Client Analytics Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Client Analytics</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total Clients</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ businessMetrics.newClients + 25 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">+{{ businessMetrics.clientGrowth }}%</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Active Subscriptions</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ Math.floor((businessMetrics.newClients + 25) * 0.85) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">+5.2%</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Avg. Revenue per Client</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ formatCurrency(Math.floor(businessMetrics.totalRevenue / (businessMetrics.newClients + 25))) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">+8.7%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Service Analytics Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Service Analytics</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="service in servicePerformance" :key="service.name">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ service.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ formatCurrency(service.revenue) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">+{{ service.growth }}%</td>
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
import { computed, onMounted } from 'vue'
import { useAdminStore } from '../stores/adminStore'

const adminStore = useAdminStore()

// Computed properties
const businessAnalytics = computed(() => adminStore.businessAnalytics)
const businessMetrics = computed(() => adminStore.businessMetrics)
const projectMetrics = computed(() => adminStore.businessAnalytics?.projectMetrics || [])
const teamPerformance = computed(() => adminStore.teamPerformance)
const servicePerformance = computed(() => adminStore.servicePerformance)
const topClients = computed(() => adminStore.topClients)
const revenueByService = computed(() => adminStore.revenueByService)
const loadingBusiness = computed(() => adminStore.loadingBusiness)
const error = computed(() => adminStore.error)

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount)
}

const refreshAnalytics = async () => {
  try {
    await adminStore.fetchBusinessAnalytics()
  } catch (error) {
    console.error('Failed to refresh analytics:', error)
  }
}

// Load data on mount
onMounted(async () => {
  try {
    await adminStore.fetchBusinessAnalytics()
  } catch (error) {
    console.error('Failed to load analytics:', error)
  }
})
</script> 