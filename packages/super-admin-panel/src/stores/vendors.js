import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/config/axios'

export const useVendorsStore = defineStore('vendors', () => {
  const vendors = ref([])
  const loading = ref(false)
  const currentVendor = ref(null)

  const whiteLabelVendors = computed(() => 
    vendors.value.filter(vendor => vendor.clientType === 'white-label-client')
  )

  const lintonTechClients = computed(() => 
    vendors.value.filter(vendor => vendor.clientType === 'linton-tech-client')
  )

  const activeVendors = computed(() => 
    vendors.value.filter(vendor => vendor.isActive)
  )

  const suspendedVendors = computed(() => 
    vendors.value.filter(vendor => vendor.subscription.status === 'suspended')
  )

  const fetchAllVendors = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/vendors')
      vendors.value = response.data.data
      return { success: true }
    } catch (error) {
      console.error('Fetch vendors error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch vendors'
      }
    } finally {
      loading.value = false
    }
  }

  const fetchWhiteLabelVendors = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/vendors/white-label')
      vendors.value = response.data.data
      return { success: true }
    } catch (error) {
      console.error('Fetch white-label vendors error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch white-label vendors'
      }
    } finally {
      loading.value = false
    }
  }

  const fetchLintonTechClients = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/vendors/linton-tech')
      vendors.value = response.data.data
      return { success: true }
    } catch (error) {
      console.error('Fetch Linton-Tech clients error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch Linton-Tech clients'
      }
    } finally {
      loading.value = false
    }
  }

  const fetchVendorById = async (id) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/vendors/${id}`)
      currentVendor.value = response.data.data
      return { success: true }
    } catch (error) {
      console.error('Fetch vendor error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch vendor'
      }
    } finally {
      loading.value = false
    }
  }

  const createWhiteLabelVendor = async (vendorData) => {
    try {
      loading.value = true
      const response = await axios.post('/api/vendors', vendorData)
      vendors.value.unshift(response.data.data)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Create vendor error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create vendor'
      }
    } finally {
      loading.value = false
    }
  }

  const updateVendor = async (id, vendorData) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/vendors/${id}`, vendorData)
      
      const index = vendors.value.findIndex(v => v._id === id)
      if (index !== -1) {
        vendors.value[index] = response.data.data
      }
      
      if (currentVendor.value?._id === id) {
        currentVendor.value = response.data.data
      }
      
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Update vendor error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update vendor'
      }
    } finally {
      loading.value = false
    }
  }

  const deleteVendor = async (id) => {
    try {
      loading.value = true
      await axios.delete(`/api/vendors/${id}`)
      
      vendors.value = vendors.value.filter(v => v._id !== id)
      if (currentVendor.value?._id === id) {
        currentVendor.value = null
      }
      
      return { success: true }
    } catch (error) {
      console.error('Delete vendor error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete vendor'
      }
    } finally {
      loading.value = false
    }
  }

  const updateVendorSubscription = async (id, subscriptionData) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/vendors/${id}/subscription`, subscriptionData)
      
      const index = vendors.value.findIndex(v => v._id === id)
      if (index !== -1) {
        vendors.value[index].subscription = response.data.data
      }
      
      if (currentVendor.value?._id === id) {
        currentVendor.value.subscription = response.data.data
      }
      
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Update subscription error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update subscription'
      }
    } finally {
      loading.value = false
    }
  }

  const getVendorStats = async (id) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/vendors/${id}/stats`)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Get vendor stats error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get vendor stats'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    vendors,
    loading,
    currentVendor,
    whiteLabelVendors,
    lintonTechClients,
    activeVendors,
    suspendedVendors,
    fetchAllVendors,
    fetchWhiteLabelVendors,
    fetchLintonTechClients,
    fetchVendorById,
    createWhiteLabelVendor,
    updateVendor,
    deleteVendor,
    updateVendorSubscription,
    getVendorStats
  }
}) 