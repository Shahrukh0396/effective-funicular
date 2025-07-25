<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-gray-200 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Client Requests</h1>
          <p class="mt-2 text-sm text-gray-600">Manage incoming client requests and inquiries.</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="refreshRequests"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            @change="filterRequests"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
            <option value="nurturing">Nurturing</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select
            v-model="filters.source"
            @change="filterRequests"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sources</option>
            <option value="website">Website</option>
            <option value="demo_request">Demo Request</option>
            <option value="contact_form">Contact Form</option>
            <option value="referral">Referral</option>
            <option value="social">Social Media</option>
            <option value="ads">Ads</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            v-model="filters.type"
            @change="filterRequests"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="white_label">White Label</option>
            <option value="demo">Demo Request</option>
            <option value="inquiry">General Inquiry</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="filters.search"
            @input="filterRequests"
            type="text"
            placeholder="Search by name, email, company..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Requests</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.total }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Qualified</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.qualified }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Converted</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.converted }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">New Today</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.newToday }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Client Requests</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="request in filteredRequests" :key="request._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ request.firstName }} {{ request.lastName }}
                  </div>
                  <div class="text-sm text-gray-500">{{ request.email }}</div>
                  <div v-if="request.company" class="text-sm text-gray-500">{{ request.company }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getTypeClass(request.source)">
                  {{ getTypeLabel(request.source) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getSourceLabel(request.source) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getStatusClass(request.status)">
                  {{ getStatusLabel(request.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(request.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="viewRequest(request)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                  <button
                    @click="updateStatus(request)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Update
                  </button>
                  <button
                    @click="createVendorFromRequest(request)"
                    class="text-purple-600 hover:text-purple-900"
                  >
                    Create Vendor
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ pagination.start }} to {{ pagination.end }} of {{ pagination.total }} results
      </div>
      <div class="flex space-x-2">
        <button
          @click="previousPage"
          :disabled="pagination.page === 1"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          @click="nextPage"
          :disabled="pagination.page >= pagination.pages"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Request Details Modal -->
    <div v-if="selectedRequest" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Request Details</h3>
            <button @click="selectedRequest = null" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <p class="text-sm text-gray-900">{{ selectedRequest.firstName }} {{ selectedRequest.lastName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <p class="text-sm text-gray-900">{{ selectedRequest.email }}</p>
              </div>
              <div v-if="selectedRequest.company">
                <label class="block text-sm font-medium text-gray-700">Company</label>
                <p class="text-sm text-gray-900">{{ selectedRequest.company }}</p>
              </div>
              <div v-if="selectedRequest.phone">
                <label class="block text-sm font-medium text-gray-700">Phone</label>
                <p class="text-sm text-gray-900">{{ selectedRequest.phone }}</p>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Message/Notes</label>
              <p class="text-sm text-gray-900 mt-1">{{ selectedRequest.notes || 'No message provided' }}</p>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Source</label>
                <p class="text-sm text-gray-900">{{ getSourceLabel(selectedRequest.source) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <p class="text-sm text-gray-900">{{ getStatusLabel(selectedRequest.status) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Lead Score</label>
                <p class="text-sm text-gray-900">{{ selectedRequest.leadScore || 'N/A' }}</p>
              </div>
            </div>
            
            <div v-if="selectedRequest.interests && selectedRequest.interests.length > 0">
              <label class="block text-sm font-medium text-gray-700">Interests</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="interest in selectedRequest.interests" :key="interest"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ interest }}
                </span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Date Received</label>
              <p class="text-sm text-gray-900">{{ formatDate(selectedRequest.createdAt) }}</p>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="selectedRequest = null"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button
              @click="createVendorFromRequest(selectedRequest)"
              class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
            >
              Create Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/config/axios'

const router = useRouter()

// Reactive data
const requests = ref([])
const selectedRequest = ref(null)
const loading = ref(false)

const filters = reactive({
  status: '',
  source: '',
  type: '',
  search: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
  start: 0,
  end: 0
})

const statistics = reactive({
  total: 0,
  qualified: 0,
  converted: 0,
  newToday: 0
})

// Computed properties
const filteredRequests = computed(() => {
  let filtered = requests.value

  if (filters.status) {
    filtered = filtered.filter(req => req.status === filters.status)
  }

  if (filters.source) {
    filtered = filtered.filter(req => req.source === filters.source)
  }

  if (filters.type) {
    filtered = filtered.filter(req => {
      if (filters.type === 'subscription') return req.source === 'website'
      if (filters.type === 'white_label') return req.source === 'demo_request'
      if (filters.type === 'demo') return req.source === 'demo_request'
      if (filters.type === 'inquiry') return req.source === 'contact_form'
      return true
    })
  }

  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(req => 
      req.firstName?.toLowerCase().includes(search) ||
      req.lastName?.toLowerCase().includes(search) ||
      req.email?.toLowerCase().includes(search) ||
      req.company?.toLowerCase().includes(search)
    )
  }

  return filtered
})

// Methods
const loadRequests = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/marketing/leads', {
      params: {
        page: pagination.page,
        limit: pagination.limit
      }
    })
    
    requests.value = response.data.data.leads
    pagination.total = response.data.data.pagination.total
    pagination.pages = response.data.data.pagination.pages
    pagination.start = (pagination.page - 1) * pagination.limit + 1
    pagination.end = Math.min(pagination.page * pagination.limit, pagination.total)
    
    // Calculate statistics
    calculateStatistics()
  } catch (error) {
    console.error('Error loading requests:', error)
  } finally {
    loading.value = false
  }
}

const calculateStatistics = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  statistics.total = requests.value.length
  statistics.qualified = requests.value.filter(req => req.status === 'qualified').length
  statistics.converted = requests.value.filter(req => req.status === 'converted').length
  statistics.newToday = requests.value.filter(req => {
    const requestDate = new Date(req.createdAt)
    return requestDate >= today
  }).length
}

const filterRequests = () => {
  pagination.page = 1
  loadRequests()
}

const refreshRequests = () => {
  loadRequests()
}

const viewRequest = (request) => {
  selectedRequest.value = request
}

const updateStatus = async (request) => {
  try {
    const newStatus = prompt('Enter new status (new, contacted, qualified, converted, lost, nurturing):', request.status)
    if (newStatus && newStatus !== request.status) {
      await axios.put(`/api/marketing/leads/${request._id}`, {
        status: newStatus
      })
      request.status = newStatus
      calculateStatistics()
    }
  } catch (error) {
    console.error('Error updating status:', error)
  }
}

const createVendorFromRequest = (request) => {
  // Navigate to create vendor page with pre-filled data
  router.push({
    name: 'CreateVendor',
    query: {
      fromRequest: request._id,
      companyName: request.company,
      email: request.email,
      contactPerson: `${request.firstName} ${request.lastName}`,
      phone: request.phone
    }
  })
}

const previousPage = () => {
  if (pagination.page > 1) {
    pagination.page--
    loadRequests()
  }
}

const nextPage = () => {
  if (pagination.page < pagination.pages) {
    pagination.page++
    loadRequests()
  }
}

// Utility methods
const getTypeClass = (source) => {
  const classes = {
    'website': 'bg-blue-100 text-blue-800',
    'demo_request': 'bg-purple-100 text-purple-800',
    'contact_form': 'bg-green-100 text-green-800',
    'referral': 'bg-yellow-100 text-yellow-800',
    'social': 'bg-pink-100 text-pink-800',
    'ads': 'bg-indigo-100 text-indigo-800',
    'email': 'bg-gray-100 text-gray-800'
  }
  return classes[source] || 'bg-gray-100 text-gray-800'
}

const getTypeLabel = (source) => {
  const labels = {
    'website': 'Subscription',
    'demo_request': 'White Label',
    'contact_form': 'Inquiry',
    'referral': 'Referral',
    'social': 'Social',
    'ads': 'Ads',
    'email': 'Email'
  }
  return labels[source] || 'Other'
}

const getSourceLabel = (source) => {
  const labels = {
    'website': 'Website',
    'demo_request': 'Demo Request',
    'contact_form': 'Contact Form',
    'referral': 'Referral',
    'social': 'Social Media',
    'ads': 'Ads',
    'email': 'Email'
  }
  return labels[source] || source
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadRequests()
})
</script> 