import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { config } from '@/config'
import { useAuthStore } from './auth'

export const useSubscriptionStore = defineStore('subscription', () => {
  const authStore = useAuthStore()
  const currentPlan = ref(null)
  const paymentMethod = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchCurrentSubscription() {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.get(`${config.apiUrl}/api/subscriptions/current`, {
        headers: {
          Authorization: `Bearer ${await authStore.user.getIdToken()}`
        }
      })
      
      currentPlan.value = response.data.subscription
      paymentMethod.value = response.data.paymentMethod
      
      return response.data
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
      
      const response = await axios.post(
        `${config.apiUrl}/api/subscriptions/update`,
        { priceId },
        {
          headers: {
            Authorization: `Bearer ${await authStore.user.getIdToken()}`
          }
        }
      )
      
      currentPlan.value = response.data.subscription
      return response.data
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
      
      await axios.post(
        `${config.apiUrl}/api/subscriptions/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await authStore.user.getIdToken()}`
          }
        }
      )
      
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