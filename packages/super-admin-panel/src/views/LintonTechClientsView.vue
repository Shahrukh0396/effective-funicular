<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-gray-200 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Linton Tech Clients</h1>
          <p class="mt-2 text-sm text-gray-600">Manage clients directly under Linton Tech.</p>
        </div>
        <button
          @click="addClient"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Client
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span class="text-blue-600 font-semibold">LT</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Clients</p>
            <p class="text-2xl font-bold text-gray-900">247</p>
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
            <p class="text-sm font-medium text-gray-500">Active Clients</p>
            <p class="text-2xl font-bold text-gray-900">189</p>
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
            <p class="text-2xl font-bold text-gray-900">$2.4M</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span class="text-purple-600 font-semibold">P</span>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Projects</p>
            <p class="text-2xl font-bold text-gray-900">156</p>
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
              placeholder="Search clients..."
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
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <select
            v-model="industryFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Industries</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
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

    <!-- Clients Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industry
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projects
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
            <tr v-for="client in filteredClients" :key="client.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-blue-600 font-semibold text-sm">{{ client.initials }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ client.name }}</div>
                    <div class="text-sm text-gray-500">{{ client.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ client.industry }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(client.status)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ client.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ client.projects }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ client.revenue.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ client.lastActivity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewClient(client.id)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  <button
                    @click="editClient(client.id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Edit
                  </button>
                  <button
                    @click="suspendClient(client.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Suspend
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
          Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">247</span> results
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
const industryFilter = ref('')

const clients = ref([
  {
    id: 1,
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    initials: 'AC',
    industry: 'Technology',
    status: 'active',
    projects: 12,
    revenue: 450000,
    lastActivity: '2 days ago'
  },
  {
    id: 2,
    name: 'Global Healthcare',
    email: 'info@globalhealth.com',
    initials: 'GH',
    industry: 'Healthcare',
    status: 'active',
    projects: 8,
    revenue: 320000,
    lastActivity: '1 week ago'
  },
  {
    id: 3,
    name: 'Finance Solutions',
    email: 'hello@financesolutions.com',
    initials: 'FS',
    industry: 'Finance',
    status: 'pending',
    projects: 5,
    revenue: 180000,
    lastActivity: '3 days ago'
  },
  {
    id: 4,
    name: 'Retail Plus',
    email: 'contact@retailplus.com',
    initials: 'RP',
    industry: 'Retail',
    status: 'inactive',
    projects: 3,
    revenue: 95000,
    lastActivity: '2 weeks ago'
  },
  {
    id: 5,
    name: 'Manufacturing Co',
    email: 'info@manufacturingco.com',
    initials: 'MC',
    industry: 'Manufacturing',
    status: 'active',
    projects: 15,
    revenue: 680000,
    lastActivity: '1 day ago'
  }
])

const filteredClients = computed(() => {
  return clients.value.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || client.status === statusFilter.value
    const matchesIndustry = !industryFilter.value || client.industry === industryFilter.value
    
    return matchesSearch && matchesStatus && matchesIndustry
  })
})

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const addClient = () => {
  alert('Add client functionality')
}

const viewClient = (id) => {
  alert(`View client ${id}`)
}

const editClient = (id) => {
  alert(`Edit client ${id}`)
}

const suspendClient = (id) => {
  if (confirm('Are you sure you want to suspend this client?')) {
    alert(`Client ${id} suspended`)
  }
}

const exportData = () => {
  alert('Export data functionality')
}

const refreshData = () => {
  alert('Refresh data functionality')
}
</script> 