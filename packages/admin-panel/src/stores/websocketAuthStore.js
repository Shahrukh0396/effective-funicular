import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io } from 'socket.io-client'
import { useRouter } from 'vue-router'

export const useWebSocketAuthStore = defineStore('websocketAuth', () => {
  const router = useRouter()
  
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('admin_token'))
  const loading = ref(false)
  const error = ref(null)
  const socket = ref(null)
  const isConnected = ref(false)
  
  // MFA state
  const mfaSetupRequired = ref(false)
  const mfaTokenRequired = ref(false)
  const mfaSetupData = ref(null)
  const mfaToken = ref('')
  
  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')
  
  // Initialize WebSocket connection
  const initSocket = () => {
    if (socket.value) {
      socket.value.disconnect()
    }
    
    socket.value = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    })
    
    socket.value.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.value.id)
      isConnected.value = true
    })
    
    socket.value.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected')
      isConnected.value = false
    })
    
    // Auth event handlers
    socket.value.on('auth:success', (data) => {
      console.log('🔐 WebSocket auth success:', data)
      handleAuthSuccess(data)
    })
    
    socket.value.on('auth:error', (data) => {
      console.log('🔐 WebSocket auth error:', data)
      handleAuthError(data)
    })
    
    socket.value.on('auth:mfa-setup-required', (data) => {
      console.log('🔐 WebSocket MFA setup required:', data)
      handleMFASetupRequired(data)
    })
    
    socket.value.on('auth:mfa-completion-required', (data) => {
      console.log('🔐 WebSocket MFA completion required:', data)
      handleMFACompletionRequired(data)
    })
    
    socket.value.on('auth:mfa-token-required', (data) => {
      console.log('🔐 WebSocket MFA token required:', data)
      handleMFATokenRequired(data)
    })
    
    socket.value.on('auth:mfa-setup-success', (data) => {
      console.log('🔐 WebSocket MFA setup success:', data)
      handleMFASetupSuccess(data)
    })
    
    socket.value.on('auth:mfa-enable-success', (data) => {
      console.log('🔐 WebSocket MFA enable success:', data)
      handleMFAEnableSuccess(data)
    })
    
    socket.value.on('auth:logout-success', (data) => {
      console.log('🔐 WebSocket logout success:', data)
      handleLogoutSuccess(data)
    })
  }
  
  // Auth success handler
  const handleAuthSuccess = (data) => {
    console.log('🔐 ===== AUTH SUCCESS HANDLER =====')
    console.log('🔐 Auth success data:', data)
    
    loading.value = false
    error.value = null
    mfaSetupRequired.value = false
    mfaTokenRequired.value = false
    mfaSetupData.value = null
    mfaToken.value = ''
    
    if (data.data) {
      user.value = data.data.user
      token.value = data.data.tokens.accessToken
      localStorage.setItem('admin_token', data.data.tokens.accessToken)
      localStorage.setItem('admin_refresh_token', data.data.tokens.refreshToken)
      
      console.log('🔐 User set to:', user.value)
      console.log('🔐 Token set to:', !!token.value)
      console.log('🔐 Tokens stored in localStorage:', {
        admin_token: !!localStorage.getItem('admin_token'),
        admin_refresh_token: !!localStorage.getItem('admin_refresh_token')
      })
      console.log('🔐 isAuthenticated computed:', isAuthenticated.value)
    }
    
    console.log('🔐 Navigating to dashboard...')
    router.push('/dashboard')
  }
  
  // Auth error handler
  const handleAuthError = (data) => {
    loading.value = false
    error.value = data.message
    mfaSetupRequired.value = false
    mfaTokenRequired.value = false
  }
  
  // MFA setup required handler
  const handleMFASetupRequired = (data) => {
    loading.value = false
    error.value = data.message
    mfaSetupRequired.value = true
    mfaSetupData.value = data.mfaStatus
  }
  
  // MFA completion required handler
  const handleMFACompletionRequired = (data) => {
    loading.value = false
    error.value = data.message
    mfaSetupRequired.value = true
    mfaSetupData.value = data.mfaStatus
  }
  
  // MFA token required handler
  const handleMFATokenRequired = (data) => {
    loading.value = false
    error.value = data.message
    mfaTokenRequired.value = true
  }
  
  // MFA setup success handler
  const handleMFASetupSuccess = (data) => {
    loading.value = false
    error.value = null
    mfaSetupData.value = data.data
  }
  
  // MFA enable success handler
  const handleMFAEnableSuccess = (data) => {
    loading.value = false
    error.value = null
    mfaSetupRequired.value = false
    mfaSetupData.value = null
    
    // Redirect to login to complete the flow
    router.push('/login')
  }
  
  // Logout success handler
  const handleLogoutSuccess = (data) => {
    logout()
  }
  
  // Login function
  const login = async (email, password, portalType = 'admin') => {
    if (!socket.value || !isConnected.value) {
      initSocket()
    }
    
    try {
      loading.value = true
      error.value = null
      mfaSetupRequired.value = false
      mfaTokenRequired.value = false
      
      console.log('🔐 WebSocket login attempt:', { email, portalType })
      
      socket.value.emit('auth:login', {
        email,
        password,
        portalType
      })
      
    } catch (err) {
      console.error('🔐 WebSocket login error:', err)
      loading.value = false
      error.value = 'Connection error'
    }
  }
  
  // Submit MFA token
  const submitMFAToken = async (email, password, mfaToken, portalType = 'admin') => {
    if (!socket.value || !isConnected.value) {
      initSocket()
    }
    
    try {
      loading.value = true
      error.value = null
      
      console.log('🔐 WebSocket MFA token submission:', { email, mfaToken })
      
      socket.value.emit('auth:mfa-token', {
        email,
        password,
        mfaToken,
        portalType
      })
      
    } catch (err) {
      console.error('🔐 WebSocket MFA token error:', err)
      loading.value = false
      error.value = 'Connection error'
    }
  }
  
  // Setup MFA
  const setupMFA = async (email, password) => {
    if (!socket.value || !isConnected.value) {
      initSocket()
    }
    
    try {
      loading.value = true
      error.value = null
      
      console.log('🔐 WebSocket MFA setup request:', { email })
      
      socket.value.emit('auth:mfa-setup', {
        email,
        password
      })
      
    } catch (err) {
      console.error('🔐 WebSocket MFA setup error:', err)
      loading.value = false
      error.value = 'Connection error'
    }
  }
  
  // Enable MFA
  const enableMFA = async (email, password, token) => {
    if (!socket.value || !isConnected.value) {
      initSocket()
    }
    
    try {
      loading.value = true
      error.value = null
      
      console.log('🔐 WebSocket MFA enable request:', { email })
      
      socket.value.emit('auth:mfa-enable', {
        email,
        password,
        token
      })
      
    } catch (err) {
      console.error('🔐 WebSocket MFA enable error:', err)
      loading.value = false
      error.value = 'Connection error'
    }
  }
  
  // Logout function
  const logout = () => {
    if (socket.value && isConnected.value) {
      const accessToken = localStorage.getItem('admin_token')
      const refreshToken = localStorage.getItem('admin_refresh_token')
      
      if (accessToken && refreshToken) {
        socket.value.emit('auth:logout', {
          accessToken,
          refreshToken
        })
      }
    }
    
    // Clear local state
    user.value = null
    token.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_refresh_token')
    
    // Clear MFA state
    mfaSetupRequired.value = false
    mfaTokenRequired.value = false
    mfaSetupData.value = null
    mfaToken.value = ''
    
    router.push('/login')
  }
  
  // Clear MFA state
  const clearMFAState = () => {
    mfaSetupRequired.value = false
    mfaTokenRequired.value = false
    mfaSetupData.value = null
    mfaToken.value = ''
    error.value = null
  }
  
  // Get auth headers for API requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  
  // Initialize on store creation
  initSocket()
  
  return {
    // State
    user,
    token,
    loading,
    error,
    isConnected,
    mfaSetupRequired,
    mfaTokenRequired,
    mfaSetupData,
    mfaToken,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    
    // Actions
    login,
    submitMFAToken,
    setupMFA,
    enableMFA,
    logout,
    clearMFAState,
    initSocket,
    getAuthHeaders
  }
}) 