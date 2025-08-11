<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-gray-200 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Vendor Details</h1>
          <p class="mt-2 text-sm text-gray-600">View and manage vendor information.</p>
        </div>
        <div class="flex space-x-3">
          <router-link
            to="/vendors"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Vendors
          </router-link>
          <button
            @click="editVendor"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit Vendor
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Vendor Information -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Company Name</label>
              <p class="text-sm text-gray-900">{{ vendor.companyName || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Business Type</label>
              <p class="text-sm text-gray-900">{{ vendor.businessType || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p class="text-sm text-gray-900">{{ vendor.email || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Phone</label>
              <p class="text-sm text-gray-900">{{ vendor.phone || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Website</label>
              <p class="text-sm text-gray-900">
                <a v-if="vendor.website" :href="vendor.website" target="_blank" class="text-blue-600 hover:text-blue-800">
                  {{ vendor.website }}
                </a>
                <span v-else>N/A</span>
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Contact Person</label>
              <p class="text-sm text-gray-900">{{ vendor.contactPerson || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Contact Title</label>
              <p class="text-sm text-gray-900">{{ vendor.contactTitle || 'N/A' }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-500 mb-1">Address</label>
              <p class="text-sm text-gray-900">{{ vendor.address || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Business Details -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Business Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Tax ID</label>
              <p class="text-sm text-gray-900">{{ vendor.taxId || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Company Size</label>
              <p class="text-sm text-gray-900">{{ vendor.companySize || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Founded Year</label>
              <p class="text-sm text-gray-900">{{ vendor.foundedYear || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Annual Revenue</label>
              <p class="text-sm text-gray-900">{{ vendor.annualRevenue || 'N/A' }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-500 mb-1">Description</label>
              <p class="text-sm text-gray-900">{{ vendor.description || 'No description available.' }}</p>
            </div>
          </div>
        </div>

        <!-- White-Label Information -->
        <div v-if="vendor.isWhiteLabel" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">White-Label Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">White-Label Brand</label>
              <p class="text-sm text-gray-900">{{ vendor.whiteLabelBrand || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Commission Rate</label>
              <p class="text-sm text-gray-900">{{ vendor.commissionRate ? `${vendor.commissionRate}%` : 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Vendor Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Vendor Statistics</h3>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Total Revenue</span>
              <span class="text-sm font-medium text-gray-900">$125,430</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Active Projects</span>
              <span class="text-sm font-medium text-gray-900">8</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Completed Projects</span>
              <span class="text-sm font-medium text-gray-900">24</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Client Satisfaction</span>
              <span class="text-sm font-medium text-gray-900">4.8/5.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Member Since</span>
              <span class="text-sm font-medium text-gray-900">March 2023</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="suspendVendor"
              class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Suspend Vendor
            </button>
            <button
              @click="approveVendor"
              class="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
            >
              Approve Vendor
            </button>
            <button
              @click="viewProjects"
              class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              View Projects
            </button>
            <button
              @click="viewRevenue"
              class="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            >
              View Revenue
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const vendor = ref({
  companyName: 'Tech Solutions Inc.',
  businessType: 'Technology',
  email: 'contact@techsolutions.com',
  phone: '+1 (555) 123-4567',
  website: 'https://techsolutions.com',
  contactPerson: 'John Smith',
  contactTitle: 'CEO',
  address: '123 Business Ave, Tech City, TC 12345',
  taxId: '12-3456789',
  companySize: '11-50',
  foundedYear: '2020',
  annualRevenue: '1m-5m',
  description: 'Leading technology solutions provider specializing in custom software development and digital transformation services.',
  isWhiteLabel: true,
  whiteLabelBrand: 'TechPro Solutions',
  commissionRate: '15.0'
})

onMounted(() => {
  // Load vendor data based on route parameter
  const vendorId = route.params.id
  // Implement API call to load vendor data
})

const editVendor = () => {
  // Implement edit functionality
  alert('Edit vendor functionality')
}

const suspendVendor = () => {
  if (confirm('Are you sure you want to suspend this vendor?')) {
    alert('Vendor suspended successfully')
  }
}

const approveVendor = () => {
  alert('Vendor approved successfully')
}

const viewProjects = () => {
  alert('View projects functionality')
}

const viewRevenue = () => {
  alert('View revenue functionality')
}
</script> 