<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Vendors Management</h1>
        <p class="text-gray-600 mt-2">Manage all vendors and their white-label accounts</p>
      </div>
      <router-link
        to="/vendors/create"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Vendor
      </router-link>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Vendors</p>
            <p class="text-3xl font-bold text-gray-900">{{ statistics.total }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🏢</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">White-Label</p>
            <p class="text-3xl font-bold text-gray-900">{{ statistics.whiteLabel }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🎨</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active</p>
            <p class="text-3xl font-bold text-gray-900">{{ statistics.active }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✅</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Suspended</p>
            <p class="text-3xl font-bold text-gray-900">{{ statistics.suspended }}</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⏸️</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <span class="text-sm">🔍</span>
            </span>
            <input
              type="text"
              placeholder="Search vendors..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Filters -->
        <div class="flex gap-2">
          <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>All Types</option>
            <option>White-Label</option>
            <option>Standard</option>
          </select>
          <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
          </select>
          <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <span class="text-sm">🔧</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Vendors Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clients
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="vendorsStore.loading" class="hover:bg-gray-50">
              <td colspan="7" class="px-6 py-4 text-center">
                <div class="flex items-center justify-center">
                  <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading vendors...
                </div>
              </td>
            </tr>
            <tr v-else-if="displayVendors.length === 0" class="hover:bg-gray-50">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                No vendors found
              </td>
            </tr>
            <tr v-else v-for="vendor in displayVendors" :key="vendor.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span class="text-white font-medium text-sm">{{ vendor.name[0] }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ vendor.name }}</div>
                    <div class="text-sm text-gray-500">{{ vendor.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="vendor.type === 'White-Label' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'"
                >
                  <span class="mr-1">{{ vendor.type === 'White-Label' ? '🎨' : '🏢' }}</span>
                  {{ vendor.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  <span class="mr-1">{{ vendor.status === 'Active' ? '✅' : '⏸️' }}</span>
                  {{ vendor.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ vendor.clients }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ vendor.revenue.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ vendor.joined }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click="viewVendor(vendor)"
                    class="text-blue-600 hover:text-blue-900"
                    title="View Vendor"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    @click="editVendor(vendor)"
                    class="text-green-600 hover:text-green-900"
                    title="Edit Vendor"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    @click="toggleVendorStatus(vendor)"
                    class="text-red-600 hover:text-red-900"
                    title="Toggle Status"
                  >
                    <svg v-if="vendor.status === 'Active'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">247</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="text-sm">←</span>
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="text-sm">→</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVendorsStore } from '../stores/vendors'

const router = useRouter()
const vendorsStore = useVendorsStore()

// Reactive data
const statistics = computed(() => ({
  total: vendorsStore.vendors.length,
  whiteLabel: vendorsStore.whiteLabelVendors.length,
  active: vendorsStore.activeVendors.length,
  suspended: vendorsStore.suspendedVendors.length
}))

// Computed properties for display
const displayVendors = computed(() => {
  return vendorsStore.vendors.map(vendor => ({
    id: vendor._id,
    name: vendor.name,
    email: vendor.email,
    type: vendor.clientType === 'white-label-client' ? 'White-Label' : 'Standard',
    status: vendor.status === 'active' ? 'Active' : 'Suspended',
    clients: vendor.userCount || 0,
    revenue: vendor.revenue || 0,
    joined: new Date(vendor.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }))
})

// Methods
const loadVendors = async () => {
  const result = await vendorsStore.fetchAllVendors()
  if (!result.success) {
    console.error('Failed to load vendors:', result.message)
  }
}

const toggleVendorStatus = async (vendor) => {
  try {
    const newStatus = vendor.status === 'Active' ? 'suspended' : 'active'
    const result = await vendorsStore.updateVendor(vendor.id, { status: newStatus })
    
    if (result.success) {
      vendor.status = vendor.status === 'Active' ? 'Suspended' : 'Active'
    }
  } catch (error) {
    console.error('Error updating vendor status:', error)
    // Fallback to local update if API fails
    vendor.status = vendor.status === 'Active' ? 'Suspended' : 'Active'
  }
}

const viewVendor = (vendor) => {
  router.push(`/vendors/${vendor.id}`)
}

const editVendor = (vendor) => {
  router.push(`/vendors/${vendor.id}/edit`)
}

// Lifecycle
onMounted(() => {
  loadVendors()
})
</script> 