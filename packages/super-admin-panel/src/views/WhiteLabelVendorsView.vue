<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-gray-200 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">White-Label Vendors</h1>
          <p class="mt-2 text-sm text-gray-600">Manage vendors with white-label services.</p>
        </div>
        <button
          @click="addWhiteLabelVendor"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add White-Label Vendor
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span class="text-purple-600 font-semibold">WL</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total White-Label</p>
            <p class="text-2xl font-bold text-gray-900">89</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span class="text-green-600 font-semibold">A</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Active</p>
            <p class="text-2xl font-bold text-gray-900">67</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span class="text-yellow-600 font-semibold">R</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Revenue</p>
            <p class="text-2xl font-bold text-gray-900">$1.8M</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span class="text-blue-600 font-semibold">C</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Commission</p>
            <p class="text-2xl font-bold text-gray-900">$270K</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search white-label vendors..."
              class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-400">🔍</span>
            </div>
          </div>
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            v-model="commissionFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Commission Rates</option>
            <option value="0-10">0-10%</option>
            <option value="10-15">10-15%</option>
            <option value="15-20">15-20%</option>
            <option value="20+">20%+</option>
          </select>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="exportData"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export
          </button>
          <button
            @click="refreshData"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- White-Label Vendors Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                White-Label Brand
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission Rate
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
                Last Activity
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="vendor in filteredVendors" :key="vendor.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span class="text-purple-600 font-semibold text-sm">{{ vendor.initials }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ vendor.name }}</div>
                    <div class="text-sm text-gray-500">{{ vendor.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ vendor.whiteLabelBrand }}</div>
                <div class="text-sm text-gray-500">{{ vendor.website }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">{{ vendor.commissionRate }}%</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(vendor.status)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
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
                {{ vendor.lastActivity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewVendor(vendor.id)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  <button
                    @click="editVendor(vendor.id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Edit
                  </button>
                  <button
                    v-if="vendor.status === 'active'"
                    @click="suspendVendor(vendor.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Suspend
                  </button>
                  <button
                    v-if="vendor.status === 'suspended'"
                    @click="activateVendor(vendor.id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Activate
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">89</span> results
        </div>
        <div class="flex items-center space-x-2">
          <button class="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Previous
          </button>
          <button class="px-3 py-1 text-sm text-white bg-blue-600 border border-blue-600 rounded-md">
            1
          </button>
          <button class="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            2
          </button>
          <button class="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            3
          </button>
          <button class="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const statusFilter = ref('')
const commissionFilter = ref('')

const vendors = ref([
  {
    id: 1,
    name: 'TechPro Solutions',
    email: 'contact@techpro.com',
    initials: 'TP',
    whiteLabelBrand: 'TechPro',
    website: 'techpro.com',
    commissionRate: 15,
    status: 'active',
    clients: 45,
    revenue: 320000,
    lastActivity: '2 days ago'
  },
  {
    id: 2,
    name: 'Digital Dynamics',
    email: 'hello@digitaldynamics.com',
    initials: 'DD',
    whiteLabelBrand: 'DigitalDynamics',
    website: 'digitaldynamics.com',
    commissionRate: 18,
    status: 'active',
    clients: 32,
    revenue: 280000,
    lastActivity: '1 week ago'
  },
  {
    id: 3,
    name: 'Innovate Labs',
    email: 'info@innovatelabs.com',
    initials: 'IL',
    whiteLabelBrand: 'InnovateLabs',
    website: 'innovatelabs.com',
    commissionRate: 12,
    status: 'pending',
    clients: 0,
    revenue: 0,
    lastActivity: '3 days ago'
  },
  {
    id: 4,
    name: 'Cloud Systems',
    email: 'contact@cloudsystems.com',
    initials: 'CS',
    whiteLabelBrand: 'CloudSystems',
    website: 'cloudsystems.com',
    commissionRate: 20,
    status: 'suspended',
    clients: 18,
    revenue: 95000,
    lastActivity: '2 weeks ago'
  },
  {
    id: 5,
    name: 'Smart Solutions',
    email: 'hello@smartsolutions.com',
    initials: 'SS',
    whiteLabelBrand: 'SmartSolutions',
    website: 'smartsolutions.com',
    commissionRate: 16,
    status: 'active',
    clients: 67,
    revenue: 450000,
    lastActivity: '1 day ago'
  }
])

const filteredVendors = computed(() => {
  return vendors.value.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         vendor.whiteLabelBrand.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || vendor.status === statusFilter.value
    const matchesCommission = !commissionFilter.value || getCommissionRange(vendor.commissionRate) === commissionFilter.value
    
    return matchesSearch && matchesStatus && matchesCommission
  })
})

const getCommissionRange = (rate) => {
  if (rate <= 10) return '0-10'
  if (rate <= 15) return '10-15'
  if (rate <= 20) return '15-20'
  return '20+'
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'suspended':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const addWhiteLabelVendor = () => {
  alert('Add white-label vendor functionality')
}

const viewVendor = (id) => {
  alert(`View vendor ${id}`)
}

const editVendor = (id) => {
  alert(`Edit vendor ${id}`)
}

const suspendVendor = (id) => {
  if (confirm('Are you sure you want to suspend this white-label vendor?')) {
    alert(`Vendor ${id} suspended`)
  }
}

const activateVendor = (id) => {
  alert(`Vendor ${id} activated`)
}

const exportData = () => {
  alert('Export data functionality')
}

const refreshData = () => {
  alert('Refresh data functionality')
}
</script> 