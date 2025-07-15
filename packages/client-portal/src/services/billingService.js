import { ref } from 'vue'
import { config } from '@/config'
import { authStore } from '@/stores/authStore'

const billingData = ref({
  subscription: null,
  invoices: [],
  paymentMethods: [],
  transactions: []
})

export const billingService = {
  billingData,

  async fetchBillingData() {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/overview`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch billing data')
      }

      if (data.success) {
        billingData.value = data.data
      }

      return data
    } catch (error) {
      console.error('Error fetching billing data:', error)
      throw error
    }
  },

  async fetchInvoices(filters = {}) {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/invoices?${new URLSearchParams(filters)}`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch invoices')
      }

      return data
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw error
    }
  },

  async fetchTransactions(filters = {}) {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/transactions?${new URLSearchParams(filters)}`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transactions')
      }

      return data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  },

  async fetchPaymentMethods() {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/payment-methods`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment methods')
      }

      return data
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      throw error
    }
  },

  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/create-payment-intent`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, currency })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment intent')
      }

      return data
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  },

  async addPaymentMethod(paymentMethodData) {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/payment-methods`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentMethodData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add payment method')
      }

      return data
    } catch (error) {
      console.error('Error adding payment method:', error)
      throw error
    }
  },

  async removePaymentMethod(paymentMethodId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove payment method')
      }

      return data
    } catch (error) {
      console.error('Error removing payment method:', error)
      throw error
    }
  },

  async updateSubscription(subscriptionData) {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/subscription`, {
        method: 'PATCH',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update subscription')
      }

      return data
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  },

  async cancelSubscription() {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/subscription/cancel`, {
        method: 'POST',
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription')
      }

      return data
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  },

  async downloadInvoice(invoiceId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/invoices/${invoiceId}/download`, {
        headers: authStore.getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      throw error
    }
  },

  async generateInvoice(projectId, amount, description) {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/invoices`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          amount,
          description,
          currency: 'usd'
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate invoice')
      }

      return data
    } catch (error) {
      console.error('Error generating invoice:', error)
      throw error
    }
  },

  async getBillingAnalytics(period = 'month') {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/analytics?period=${period}`, {
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch billing analytics')
      }

      return data
    } catch (error) {
      console.error('Error fetching billing analytics:', error)
      throw error
    }
  },

  // Stripe-specific methods
  async createStripeSetupIntent() {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/stripe/setup-intent`, {
        method: 'POST',
        headers: authStore.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create setup intent')
      }

      return data
    } catch (error) {
      console.error('Error creating setup intent:', error)
      throw error
    }
  },

  async confirmStripePayment(paymentIntentId, paymentMethodId) {
    try {
      const response = await fetch(`${config.apiUrl}/api/billing/stripe/confirm-payment`, {
        method: 'POST',
        headers: {
          ...authStore.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm payment')
      }

      return data
    } catch (error) {
      console.error('Error confirming payment:', error)
      throw error
    }
  }
} 