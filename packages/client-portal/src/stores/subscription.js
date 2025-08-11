import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '@/services/authService'
import { config } from '@/config'

export const useSubscriptionStore = defineStore('subscription', () => {
  const currentPlan = ref(null)
  const paymentMethod = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchCurrentSubscription() {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(`${config.apiUrl}/api/subscriptions/current`, {
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch subscription')
      }
      
      currentPlan.value = data.data.subscription
      paymentMethod.value = data.data.paymentMethod
      
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSubscription(priceId) {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(`${config.apiUrl}/api/subscriptions/update`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priceId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update subscription')
      }
      
      currentPlan.value = data.data.subscription
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelSubscription() {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(`${config.apiUrl}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription')
      }
      
      currentPlan.value = null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    currentPlan,
    paymentMethod,
    loading,
    error,
    fetchCurrentSubscription,
    updateSubscription,
    cancelSubscription
  }
}) 