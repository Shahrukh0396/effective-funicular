<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Portal Login
        </h2>
      </div>
      
      <!-- MFA Setup Required -->
      <div v-if="authStore.mfaSetupRequired" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              Multi-Factor Authentication Required
            </h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>{{ authStore.error }}</p>
              <p class="mt-2">
                <button 
                  @click="setupMFA"
                  class="text-yellow-800 underline hover:text-yellow-900"
                >
                  Setup MFA now
                </button>
              </p>
            </div>
          </div>
        </div>
        
        <!-- Debug Info (remove in production) -->
        <div class="bg-gray-100 p-2 text-xs mt-2">
          <p>Debug: MFA Setup Required: {{ authStore.mfaSetupRequired }}</p>
          <p>Debug: Error: {{ authStore.error }}</p>
          <p>Debug: Loading: {{ authStore.loading }}</p>
        </div>
      </div>

      <!-- MFA Token Required -->
      <div v-if="showMFATokenInput" class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 8A6 6 0 00 6 8c0 7-3 9-3 9s3 2 3 9a6 6 0 0012 0c0-7 3-9 3-9s-3-2-3-9zM8 8a2 2 0 114 0 2 2 0 01-4 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              Multi-Factor Authentication Required
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>{{ authStore.error }}</p>
              <div class="mt-4">
                <label for="mfaToken" class="block text-sm font-medium text-blue-800">Enter your 6-digit code</label>
                <input
                  id="mfaToken"
                  v-model="mfaToken"
                  type="text"
                  maxlength="20"
                  @keyup="onMFAInput"
                  @keydown="onMFAKeydown"
                  class="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter 6-digit code or backup code"
                />
                <button 
                  @click.prevent="submitMFA"
                  type="button"
                  :disabled="authStore.loading || !mfaToken || mfaToken.length < 6"
                  class="mt-2 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {{ authStore.loading ? 'Verifying...' : 'Verify MFA' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info (remove in production) -->
      <div class="bg-gray-100 p-2 text-xs">
        <p>Debug: MFA Setup Required: {{ authStore.mfaSetupRequired }}</p>
        <p>Debug: Error: {{ authStore.error }}</p>
        <p>Debug: Loading: {{ authStore.loading }}</p>
        <p>Debug: Mount Count: {{ mountCount }}</p>
        <button @click="authStore.clearMFAState()" class="bg-red-500 text-white px-2 py-1 rounded text-xs">
          Clear MFA State
        </button>
      </div>

      <!-- Regular Login Form -->
      <form v-if="!authStore.mfaSetupRequired && !authStore.mfaTokenRequired" class="mt-8 space-y-6" @submit.prevent="handleSubmit" @submit="preventRefresh">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="authStore.error && !authStore.mfaSetupRequired" class="text-red-600 text-sm text-center">
          {{ authStore.error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWebSocketAuthStore } from '../stores/websocketAuthStore'

const router = useRouter()
const authStore = useWebSocketAuthStore()

const email = ref('')
const password = ref('')
const mfaToken = ref('')
const mountCount = ref(0)

// Computed property for MFA display
const showMFATokenInput = computed(() => {
  const shouldShow = authStore.mfaTokenRequired && !authStore.loading
  console.log('🔐 Computed showMFATokenInput:', { 
    mfaTokenRequired: authStore.mfaTokenRequired, 
    loading: authStore.loading, 
    shouldShow 
  })
  return shouldShow
})

// Watch for MFA state changes
watch(() => authStore.mfaSetupRequired, (newVal, oldVal) => {
  console.log('🔐 ===== MFA STATE CHANGED =====')
  console.log('🔐 MFA setup required changed:', { oldVal, newVal })
  console.log('🔐 Current URL:', window.location.href)
  console.log('🔐 Router current route:', router.currentRoute.value.path)
})

// Watch for auth success to clear local MFA state
watch(() => authStore.isAuthenticated, (newVal, oldVal) => {
  console.log('🔐 ===== AUTHENTICATION STATE CHANGED =====')
  console.log('🔐 Is authenticated changed:', { oldVal, newVal })
  if (newVal && !oldVal) {
    // User just got authenticated, clear local MFA state
    mfaToken.value = ''
    console.log('🔐 Cleared local MFA state after successful authentication')
  }
})

watch(() => authStore.error, (newVal, oldVal) => {
  console.log('🔐 ===== ERROR STATE CHANGED =====')
  console.log('🔐 Error changed:', { oldVal, newVal })
  console.log('🔐 Current URL:', window.location.href)
})

watch(() => authStore.mfaTokenRequired, (newVal, oldVal) => {
  console.log('🔐 ===== MFA TOKEN REQUIRED STATE CHANGED =====')
  console.log('🔐 MFA Token Required changed:', { oldVal, newVal })
  console.log('🔐 Current URL:', window.location.href)
  console.log('🔐 AuthStore state at change:', {
    mfaSetupRequired: authStore.mfaSetupRequired,
    mfaTokenRequired: authStore.mfaTokenRequired,
    error: authStore.error,
    loading: authStore.loading
  })
})

const handleSubmit = async () => {
  console.log('🔐 ===== FORM SUBMITTED =====')
  console.log('🔐 Email:', email.value)
  console.log('🔐 Password length:', password.value.length)
  console.log('🔐 AuthStore loading:', authStore.loading)
  
  if (authStore.loading) {
    console.log('🔐 Login already in progress, skipping...')
    return
  }
  
  console.log('🔐 Calling authStore.login...')
  const result = await authStore.login(email.value, password.value)
  console.log('🔐 Login result:', result)
  
  if (result.success) {
    console.log('🔐 Login successful, navigating to dashboard...')
    router.push('/')
  } else if (result.requiresMFASetup || result.requiresMFACompletion) {
    console.log('🔐 ===== MFA SETUP REQUIRED =====')
    console.log('🔐 MFA setup required, state:', {
      mfaSetupRequired: authStore.mfaSetupRequired,
      mfaStatus: authStore.mfaStatus,
      error: authStore.error
    })
    console.log('🔐 Current URL before navigation:', window.location.href)
    console.log('🔐 Router current route:', router.currentRoute.value.path)
    // MFA setup is handled by the UI above
    console.log('🔐 Staying on login page for MFA setup...')
  } else if (result.requiresMFA) {
    console.log('🔐 ===== MFA TOKEN REQUIRED =====')
    console.log('🔐 MFA token required, method:', result.mfaMethod)
    console.log('🔐 This should be handled by WebSocket auth:mfa-token-required event')
  } else if (result.error) {
    console.log('🔐 Login error:', result.error)
  }
}

const setupMFA = () => {
  console.log('🔐 Navigating to MFA setup')
  // Navigate to MFA setup page or show MFA setup modal
  router.push('/mfa-setup')
}

const submitMFA = async (event) => {
  try {
    console.log('🔐 ===== SUBMITTING MFA TOKEN =====')
    console.log('🔐 Event:', event)
    console.log('🔐 MFA Token:', mfaToken.value)
    console.log('🔐 AuthStore loading:', authStore.loading)
    console.log('🔐 Current mfaTokenRequired state:', authStore.mfaTokenRequired)
    
    // Prevent any default behavior
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    if (authStore.loading) {
      console.log('🔐 Already loading, skipping...')
      return
    }
    
    if (!mfaToken.value || mfaToken.value.length < 6) {
      console.log('🔐 Invalid MFA token length')
      return
    }
    
    console.log('🔐 Calling authStore.submitMFAToken with MFA token...')
    // Call submitMFAToken with MFA token - this emits WebSocket event
    await authStore.submitMFAToken(email.value, password.value, mfaToken.value)
    
    // The result will be handled via WebSocket events (auth:success or auth:error)
    // We don't need to handle the result here as the auth store will handle it
    console.log('🔐 MFA token submitted via WebSocket, waiting for response...')
    
  } catch (error) {
    console.error('🔐 MFA submission error:', error)
    console.error('🔐 Error stack:', error.stack)
  }
}

const onMFAInput = (event) => {
  console.log('🔐 MFA Input event:', event.target.value)
  console.log('🔐 Current mfaTokenRequired state:', authStore.mfaTokenRequired)
  console.log('🔐 Current authStore loading:', authStore.loading)
}

const onMFAKeydown = (event) => {
  console.log('🔐 MFA Keydown event:', event.key)
  if (event.key === 'Enter') {
    console.log('🔐 Enter key pressed, preventing default...')
    event.preventDefault()
    event.stopPropagation()
  }
}

// Debug MFA state on mount
onMounted(() => {
  mountCount.value++
  console.log('🔐 ===== LOGIN COMPONENT MOUNTED =====')
  console.log('🔐 Mount count:', mountCount.value)
  console.log('🔐 Login component mounted, MFA state:', {
    mfaSetupRequired: authStore.mfaSetupRequired,
    mfaStatus: authStore.mfaStatus,
    error: authStore.error
  })
  console.log('🔐 localStorage mfa_setup_required:', localStorage.getItem('mfa_setup_required'))
  console.log('🔐 localStorage mfa_status:', localStorage.getItem('mfa_status'))
  console.log('🔐 Current URL:', window.location.href)
  console.log('🔐 Router current route:', router.currentRoute.value.path)
  console.log('🔐 ===== END MOUNT DEBUG =====')
  
  // Add beforeunload listener to detect page refreshes
  window.addEventListener('beforeunload', () => {
    console.log('🔐 ===== PAGE REFRESH DETECTED =====')
    console.log('🔐 Current state before refresh:', {
      mfaSetupRequired: authStore.mfaSetupRequired,
      mfaTokenRequired: authStore.mfaTokenRequired,
      error: authStore.error,
      loading: authStore.loading
    })
  })
  
  // Add global error handler
  window.addEventListener('error', (event) => {
    console.error('🔐 ===== GLOBAL ERROR DETECTED =====')
    console.error('🔐 Error message:', event.message)
    console.error('🔐 Error filename:', event.filename)
    console.error('🔐 Error line number:', event.lineno)
    console.error('🔐 Error column:', event.colno)
    console.error('🔐 Error object:', event.error)
  })
  
  // Add unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🔐 ===== UNHANDLED PROMISE REJECTION =====')
    console.error('🔐 Promise rejection:', event.reason)
  })
})

// Prevent page refresh on form submission
const preventRefresh = (event) => {
  console.log('🔐 Preventing form refresh...')
  event.preventDefault()
  return false
}
</script> 