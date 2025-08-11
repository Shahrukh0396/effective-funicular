<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-gray-200 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p class="mt-2 text-sm text-gray-600">Ecosystem Overview & Quick Actions</p>
        </div>
        <div class="flex space-x-3">
          <router-link
            to="/client-requests"
            class="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            View Client Requests
          </router-link>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Active Vendors</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.vendors }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Revenue</p>
            <p class="text-2xl font-bold text-gray-900">${{ statistics.revenue }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Active Users</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.users }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">New Requests</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.newRequests }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Client Requests -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Recent Client Requests</h3>
            <router-link
              to="/client-requests"
              class="text-sm text-blue-600 hover:text-blue-900"
            >
              View All
            </router-link>
          </div>
        </div>
        <div class="p-6">
          <div v-if="recentRequests.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p class="text-gray-500">No recent requests</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="request in recentRequests" :key="request._id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ request.firstName }} {{ request.lastName }}</p>
                <p class="text-xs text-gray-500">{{ request.email }}</p>
                <p v-if="request.company" class="text-xs text-gray-500">{{ request.company }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getStatusClass(request.status)">
                  {{ getStatusLabel(request.status) }}
                </span>
                <button
                  @click="viewRequest(request)"
                  class="text-xs text-blue-600 hover:text-blue-900"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div class="p-6 space-y-4">
          <router-link
            to="/vendors"
            class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg class="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-900">Manage Vendors</p>
              <p class="text-xs text-gray-500">View and manage all vendors</p>
            </div>
          </router-link>
          
          <router-link
            to="/client-requests"
            class="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <svg class="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-900">Manage Client Requests</p>
              <p class="text-xs text-gray-500">Review and process incoming requests</p>
            </div>
          </router-link>
          
          <router-link
            to="/analytics"
            class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-900">View Analytics</p>
              <p class="text-xs text-gray-500">Check platform performance metrics</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/config/axios'

const router = useRouter()

// Reactive data
const statistics = ref({
  vendors: 0,
  revenue: '0',
  users: 0,
  newRequests: 0
})

const recentRequests = ref([])

// Methods
const loadDashboardData = async () => {
  try {
    // Load platform overview
    const overviewResponse = await axios.get('/api/analytics/platform-overview')
    if (overviewResponse.data.success) {
      const data = overviewResponse.data.data
      statistics.value.vendors = data.totals.vendors
      statistics.value.users = data.totals.users
      statistics.value.revenue = '2.4M' // Placeholder - would come from revenue API
    }

    // Load recent client requests
    const requestsResponse = await axios.get('/api/marketing/leads', {
      params: { limit: 5 }
    })
    if (requestsResponse.data.success) {
      recentRequests.value = requestsResponse.data.data.leads
      statistics.value.newRequests = recentRequests.value.filter(req => req.status === 'new').length
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const viewRequest = (request) => {
  router.push({
    name: 'ClientRequests',
    query: { selectedRequest: request._id }
  })
}

const getStatusClass = (status) => {
  const classes = {
    'new': 'bg-yellow-100 text-yellow-800',
    'contacted': 'bg-blue-100 text-blue-800',
    'qualified': 'bg-green-100 text-green-800',
    'converted': 'bg-purple-100 text-purple-800',
    'lost': 'bg-red-100 text-red-800',
    'nurturing': 'bg-orange-100 text-orange-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    'new': 'New',
    'contacted': 'Contacted',
    'qualified': 'Qualified',
    'converted': 'Converted',
    'lost': 'Lost',
    'nurturing': 'Nurturing'
  }
  return labels[status] || status
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
/* No specific styles needed for minimal dashboard, as it's a simple grid layout */
</style> 