<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Setup Multi-Factor Authentication
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Secure your account with two-factor authentication
        </p>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-2 text-sm text-gray-600">Setting up MFA...</p>
        </div>

        <div v-else-if="qrCode" class="space-y-4">
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900">Scan QR Code</h3>
            <p class="text-sm text-gray-600 mt-1">
              Scan this QR code with your authenticator app
            </p>
          </div>

          <div class="flex justify-center">
            <img :src="qrCode" alt="QR Code" class="w-48 h-48" />
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Or enter this code manually: <code class="bg-gray-100 px-2 py-1 rounded">{{ secret }}</code>
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label for="totp" class="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="totp"
                v-model="totpCode"
                type="text"
                placeholder="Enter 6-digit code"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                maxlength="6"
              />
            </div>

            <button
              @click="verifyAndEnableMFA"
              :disabled="!totpCode || totpCode.length !== 6 || verifying"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ verifying ? 'Verifying...' : 'Enable MFA' }}
            </button>
          </div>
        </div>

        <div v-else class="text-center">
          <button
            @click="setupMFA"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Start MFA Setup
          </button>
        </div>

        <div v-if="error" class="mt-4 text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div v-if="success" class="mt-4 text-green-600 text-sm text-center">
          {{ success }}
        </div>
      </div>

      <div class="text-center">
        <button
          @click="goBack"
          class="text-indigo-600 hover:text-indigo-500 text-sm"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const verifying = ref(false)
const qrCode = ref(null)
const secret = ref(null)
const totpCode = ref('')
const error = ref(null)
const success = ref(null)

const setupMFA = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Get credentials from localStorage or prompt user
    const email = localStorage.getItem('mfa_setup_email') || 'admin@acmecorp.com'
    const password = localStorage.getItem('mfa_setup_password') || 'TestPass123!'
    
    console.log('🔐 Setting up MFA with credentials:', { email, password: '***' })
    
    const response = await axios.post('/api/mfa/setup-initial', {
      email,
      password
    })
    
    if (response.data.success) {
      qrCode.value = response.data.data.qrCode
      secret.value = response.data.data.secret
      console.log('🔐 MFA setup successful, QR code generated')
    }
  } catch (err) {
    console.error('🔐 MFA setup error:', err.response?.data || err.message)
    error.value = err.response?.data?.message || 'Failed to setup MFA'
  } finally {
    loading.value = false
  }
}

const verifyAndEnableMFA = async () => {
  try {
    verifying.value = true
    error.value = null
    
    // Get credentials from localStorage
    const email = localStorage.getItem('mfa_setup_email') || 'admin@acmecorp.com'
    const password = localStorage.getItem('mfa_setup_password') || 'TestPass123!'
    
    console.log('🔐 Enabling MFA with token:', totpCode.value)
    
    const response = await axios.post('/api/mfa/enable-initial', {
      email,
      password,
      token: totpCode.value
    })
    
    if (response.data.success) {
      success.value = 'MFA enabled successfully!'
      console.log('🔐 MFA enabled successfully, redirecting to login...')
      
      // Clear stored credentials
      localStorage.removeItem('mfa_setup_email')
      localStorage.removeItem('mfa_setup_password')
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (err) {
    console.error('🔐 MFA enable error:', err.response?.data || err.message)
    error.value = err.response?.data?.message || 'Failed to enable MFA'
  } finally {
    verifying.value = false
  }
}

const goBack = () => {
  authStore.clearMFAState()
  router.push('/login')
}
</script> 