<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-gray-200 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Create New Vendor</h1>
          <p class="mt-2 text-sm text-gray-600">Add a new vendor to the ecosystem.</p>
        </div>
        <router-link
          to="/vendors"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Vendors
        </router-link>
      </div>
    </div>

    <div class="max-w-4xl mx-auto">
      <form @submit.prevent="createVendor" class="space-y-8">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                v-model="vendor.companyName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <select
                v-model="vendor.businessType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select business type</option>
                <option value="technology">Technology</option>
                <option value="consulting">Consulting</option>
                <option value="marketing">Marketing</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="vendor.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                v-model="vendor.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                v-model="vendor.website"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input
                v-model="vendor.contactPerson"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact person name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Title</label>
              <input
                v-model="vendor.contactTitle"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., CEO, Manager"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                v-model="vendor.address"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full address"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Business Details -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Business Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
              <input
                v-model="vendor.taxId"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tax identification number"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select
                v-model="vendor.companySize"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
              <input
                v-model="vendor.foundedYear"
                type="number"
                min="1900"
                max="2024"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2020"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Annual Revenue</label>
              <select
                v-model="vendor.annualRevenue"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select revenue range</option>
                <option value="0-100k">$0 - $100k</option>
                <option value="100k-500k">$100k - $500k</option>
                <option value="500k-1m">$500k - $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="5m-10m">$5M - $10M</option>
                <option value="10m+">$10M+</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="vendor.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the vendor's business and services"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- White-Label Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">White-Label Settings</h3>
          <div class="space-y-4">
            <div class="flex items-center">
              <input
                v-model="vendor.isWhiteLabel"
                type="checkbox"
                id="whiteLabel"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="whiteLabel" class="ml-2 block text-sm text-gray-900">
                Enable White-Label Services
              </label>
            </div>
            <div v-if="vendor.isWhiteLabel" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">White-Label Brand Name</label>
                <input
                  v-model="vendor.whiteLabelBrand"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                <input
                  v-model="vendor.commissionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 15.0"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3">
          <router-link
            to="/vendors"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {{ loading ? 'Creating...' : 'Create Vendor' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/config/axios'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const vendor = ref({
  companyName: '',
  businessType: '',
  email: '',
  phone: '',
  website: '',
  contactPerson: '',
  contactTitle: '',
  address: '',
  taxId: '',
  companySize: '',
  foundedYear: '',
  annualRevenue: '',
  description: '',
  isWhiteLabel: false,
  whiteLabelBrand: '',
  commissionRate: '',
  clientType: 'linton-tech' // Default to linton-tech client
})

// Load pre-filled data from query parameters (when coming from client request)
onMounted(() => {
  if (route.query.fromRequest) {
    // Pre-fill data from client request
    vendor.value.companyName = route.query.companyName || ''
    vendor.value.email = route.query.email || ''
    vendor.value.contactPerson = route.query.contactPerson || ''
    vendor.value.phone = route.query.phone || ''
    
    // If it's a demo request, likely a white-label client
    if (route.query.source === 'demo_request') {
      vendor.value.isWhiteLabel = true
      vendor.value.clientType = 'white-label'
    }
  }
})

const createVendor = async () => {
  try {
    loading.value = true
    
    // Validate required fields
    if (!vendor.value.companyName || !vendor.value.email) {
      alert('Company name and email are required')
      return
    }

    // Prepare vendor data
    const vendorData = {
      name: vendor.value.companyName,
      email: vendor.value.email,
      phone: vendor.value.phone,
      website: vendor.value.website,
      contactPerson: vendor.value.contactPerson,
      contactTitle: vendor.value.contactTitle,
      address: vendor.value.address,
      businessType: vendor.value.businessType,
      companySize: vendor.value.companySize,
      foundedYear: vendor.value.foundedYear,
      annualRevenue: vendor.value.annualRevenue,
      description: vendor.value.description,
      clientType: vendor.value.isWhiteLabel ? 'white-label' : 'linton-tech',
      whiteLabelSettings: vendor.value.isWhiteLabel ? {
        brandName: vendor.value.whiteLabelBrand,
        commissionRate: parseFloat(vendor.value.commissionRate) || 0
      } : null,
      status: 'active'
    }

    // Create vendor via API
    const response = await axios.post('/api/vendors', vendorData)
    
    if (response.data.success) {
      alert('Vendor created successfully!')
      router.push('/vendors')
    } else {
      alert('Error creating vendor: ' + response.data.message)
    }
  } catch (error) {
    console.error('Error creating vendor:', error)
    alert('Error creating vendor: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}
</script> 