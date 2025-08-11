import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import websocketAuthService from '../services/websocketAuthService'
import tokenRefreshService from '../services/tokenRefreshService'

console.log('🔐 Token refresh service imported:', !!tokenRefreshService)

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('admin_token'))
  const refreshToken = ref(localStorage.getItem('admin_refresh_token'))
  const loading = ref(false)
  const error = ref(null)
  // Initialize MFA state - don't clear on page load to prevent flashing
  const mfaSetupRequired = ref(localStorage.getItem('mfa_setup_required') === 'true')
  const mfaStatus = ref(localStorage.getItem('mfa_status') ? JSON.parse(localStorage.getItem('mfa_status')) : null)
  
  console.log('🔐 Initial MFA state loaded:', { 
    mfaSetupRequired: mfaSetupRequired.value, 
    mfaStatus: mfaStatus.value 
  })

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isSuperAdmin = computed(() => 
    user.value?.role === 'super_admin' || user.value?.isSuperAccount
  )

  const setToken = (newToken, newRefreshToken = null) => {
    console.log('🔐 Setting tokens:', {
      accessToken: !!newToken,
      refreshToken: !!newRefreshToken
    })
    console.log('🔐 Token details:', {
      accessTokenLength: newToken ? newToken.length : 0,
      refreshTokenLength: newRefreshToken ? newRefreshToken.length : 0
    })
    
    token.value = newToken
    if (newToken) {
      localStorage.setItem('admin_token', newToken)
      console.log('🔐 Access token stored in localStorage')
    } else {
      localStorage.removeItem('admin_token')
      console.log('🔐 Access token removed from localStorage')
    }
    
    if (newRefreshToken) {
      refreshToken.value = newRefreshToken
      localStorage.setItem('admin_refresh_token', newRefreshToken)
      console.log('🔐 Refresh token stored in localStorage')
    } else {
      refreshToken.value = null
      localStorage.removeItem('admin_refresh_token')
      console.log('🔐 Refresh token removed from localStorage')
    }
    
    // Initialize or stop token refresh service
    if (newToken && newRefreshToken) {
      console.log('🔐 Initializing token refresh service...')
      tokenRefreshService.init()
    } else {
      console.log('🔐 Stopping token refresh service...')
      tokenRefreshService.stop()
    }
  }

  const setMFAState = (setupRequired, status = null) => {
    console.log('🔐 Setting MFA state:', { setupRequired, status })
    mfaSetupRequired.value = setupRequired
    mfaStatus.value = status
    
    if (setupRequired) {
      localStorage.setItem('mfa_setup_required', 'true')
      if (status) {
        localStorage.setItem('mfa_status', JSON.stringify(status))
      }
      console.log('🔐 MFA state saved to localStorage')
    } else {
      localStorage.removeItem('mfa_setup_required')
      localStorage.removeItem('mfa_status')
      console.log('🔐 MFA state cleared from localStorage')
    }
    
    console.log('🔐 MFA state after setting:', { 
      mfaSetupRequired: mfaSetupRequired.value, 
      mfaStatus: mfaStatus.value 
    })
  }

  const login = async (email, password, mfaToken = null) => {
    try {
      loading.value = true
      error.value = null
      setMFAState(false) // Ensure MFA state is reset for login
      
      console.log('🔐 ===== LOGIN START =====')
      console.log('🔐 Starting login request to:', axios.defaults.baseURL)
      console.log('🔐 Login payload:', { email, password, portalType: 'admin' })
      console.log('🔐 Current MFA state before login:', { 
        mfaSetupRequired: mfaSetupRequired.value, 
        mfaStatus: mfaStatus.value,
        error: error.value 
      })
      
      // Add a small delay to prevent rapid requests
      await new Promise(resolve => setTimeout(resolve, 200))
      
      console.log('🔐 Making API request...')
      const loginPayload = { 
        email, 
        password,
        portalType: 'admin'
      }
      
      // If MFA token is provided, use WebSocket instead of HTTP
      if (mfaToken) {
        console.log('🔐 Using WebSocket for MFA token submission')
        try {
          const result = await websocketAuthService.submitMFAToken(email, password, mfaToken)
          console.log('🔐 WebSocket MFA result:', result)
          
          if (result.success) {
            setToken(result.data.tokens.accessToken)
            user.value = result.data.user
            loading.value = false
            return { success: true }
          } else {
            error.value = result.message
            loading.value = false
            return { success: false, error: result.message }
          }
        } catch (wsError) {
          console.error('🔐 WebSocket MFA error:', wsError)
          error.value = wsError.message
          loading.value = false
          return { success: false, error: wsError.message }
        }
      }
      
      // Regular HTTP login (without MFA token)
      const response = await axios.post('/api/auth/login', loginPayload)
      
      console.log('🔐 ===== SUCCESS RESPONSE =====')
      console.log('🔐 Response status:', response.status)
      console.log('🔐 Response data:', response.data)
      console.log('🔐 Response data structure:', {
        hasData: !!response.data.data,
        hasTokens: !!response.data.data?.tokens,
        hasAccessToken: !!response.data.data?.tokens?.accessToken,
        hasRefreshToken: !!response.data.data?.tokens?.refreshToken
      })
      console.log('🔐 requiresMFASetup:', response.data.requiresMFASetup)
      console.log('🔐 requiresMFACompletion:', response.data.requiresMFACompletion)
      console.log('🔐 mfaStatus:', response.data.mfaStatus)
      
      // Check if MFA setup is required
      if (response.data.requiresMFASetup) {
        console.log('🔐 MFA setup required, setting state...')
        setMFAState(true, response.data.mfaStatus)
        error.value = response.data.message
        loading.value = false
        console.log('🔐 MFA state after setting:', { 
          mfaSetupRequired: mfaSetupRequired.value, 
          mfaStatus: mfaStatus.value,
          error: error.value 
        })
        return { success: false, requiresMFASetup: true, mfaStatus: response.data.mfaStatus }
      }
      
      // Check if MFA completion is required
      if (response.data.requiresMFACompletion) {
        console.log('🔐 MFA completion required, setting state...')
        setMFAState(true, response.data.mfaStatus)
        error.value = response.data.message
        loading.value = false
        return { success: false, requiresMFACompletion: true, mfaStatus: response.data.mfaStatus }
      }
      
      // Check if MFA token is required (MFA is enabled)
      if (response.data.requiresMFA) {
        console.log('🔐 MFA token required, setting state...')
        setMFAState(false) // Clear MFA setup state since MFA is already enabled
        error.value = response.data.message
        loading.value = false
        return { success: false, requiresMFA: true, mfaMethod: response.data.mfaMethod }
      }
      
      console.log('🔐 No MFA requirements, proceeding with normal login...')
      
      // Normal successful login - only destructure data for successful logins
      const { data } = response.data
      console.log('🔐 Login successful, tokens:', {
        accessToken: !!data.tokens.accessToken,
        refreshToken: !!data.tokens.refreshToken
      })
      console.log('🔐 Token details:', {
        accessTokenLength: data.tokens.accessToken ? data.tokens.accessToken.length : 0,
        refreshTokenLength: data.tokens.refreshToken ? data.tokens.refreshToken.length : 0
      })
      console.log('🔐 About to call setToken with:', {
        accessToken: data.tokens.accessToken ? data.tokens.accessToken.substring(0, 20) + '...' : 'null',
        refreshToken: data.tokens.refreshToken ? data.tokens.refreshToken.substring(0, 20) + '...' : 'null'
      })
      setToken(data.tokens.accessToken, data.tokens.refreshToken)
      user.value = data.user
      loading.value = false
      
      // Verify token was stored
      console.log('🔐 After setToken:', {
        tokenInStore: !!token.value,
        tokenInStorage: !!localStorage.getItem('admin_token'),
        refreshTokenInStore: !!refreshToken.value,
        refreshTokenInStorage: !!localStorage.getItem('admin_refresh_token')
      })
      
      return { success: true }
      
    } catch (err) {
      console.log('🔐 ===== ERROR RESPONSE =====')
      console.error('🔐 Login error:', err.response?.data || err.message)
      console.error('🔐 Full error object:', err)
      console.log('🔐 Error status:', err.response?.status)
      console.log('🔐 Error data:', err.response?.data)
      console.log('🔐 requiresMFASetup in error:', err.response?.data?.requiresMFASetup)
      console.log('🔐 requiresMFACompletion in error:', err.response?.data?.requiresMFACompletion)
      
      // Check if this is an MFA setup requirement error
      if (err.response?.status === 401 && err.response?.data?.requiresMFASetup) {
        console.log('🔐 MFA setup required (from error), setting state...')
        setMFAState(true, err.response.data.mfaStatus)
        error.value = err.response.data.message
        loading.value = false
        
        // Save credentials for MFA setup
        localStorage.setItem('mfa_setup_email', email)
        localStorage.setItem('mfa_setup_password', password)
        console.log('🔐 Credentials saved for MFA setup')
        
        console.log('🔐 MFA state after setting:', { 
          mfaSetupRequired: mfaSetupRequired.value, 
          mfaStatus: mfaStatus.value,
          error: error.value 
        })
        
        // Add a delay to prevent immediate state changes
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log('🔐 Returning MFA setup requirement...')
        return { success: false, requiresMFASetup: true, mfaStatus: err.response.data.mfaStatus }
      }
      
      // Check if this is an MFA completion requirement error
      if (err.response?.status === 401 && err.response?.data?.requiresMFACompletion) {
        console.log('🔐 MFA completion required (from error), setting state...')
        setMFAState(true, err.response.data.mfaStatus)
        error.value = err.response.data.message
        loading.value = false
        return { success: false, requiresMFACompletion: true, mfaStatus: err.response.data.mfaStatus }
      }
      
      // Check if this is an MFA token requirement error (MFA is enabled)
      if (err.response?.status === 401 && err.response?.data?.requiresMFA) {
        console.log('🔐 MFA token required (from error), setting state...')
        setMFAState(false) // Clear MFA setup state since MFA is already enabled
        error.value = err.response.data.message
        loading.value = false
        return { success: false, requiresMFA: true, mfaMethod: err.response.data.mfaMethod }
      }
      
      // Other errors
      error.value = err.response?.data?.message || 'Login failed'
      loading.value = false
      return { success: false, error: error.value }
    }
  }

  const logout = () => {
    user.value = null
    setToken(null)
    setMFAState(false)
    websocketAuthService.disconnect()
  }

  const refreshTokenIfNeeded = async () => {
    if (!refreshToken.value) {
      return false
    }
    
    try {
      const response = await axios.post('/api/auth/refresh', {
        refreshToken: refreshToken.value
      })
      
      if (response.data.success) {
        setToken(response.data.data.accessToken, response.data.data.refreshToken)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      setToken(null) // Clear tokens on refresh failure
    }
    
    return false
  }

  const ensureValidToken = async () => {
    console.log('🔐 ensureValidToken called')
    console.log('🔐 Token value:', !!token.value)
    
    if (!token.value) {
      console.log('🔐 No token available')
      return false
    }
    
    // Check if token is expiring soon
    const isExpiringSoon = tokenRefreshService.isTokenExpiringSoon()
    console.log('🔐 Token expiring soon:', isExpiringSoon)
    
    if (isExpiringSoon) {
      console.log('🔐 Token expiring soon, refreshing...')
      const refreshed = await refreshTokenIfNeeded()
      console.log('🔐 Token refresh result:', refreshed)
      return refreshed
    }
    
    console.log('🔐 Token is valid')
    return true
  }

  const checkAuth = async () => {
    if (!token.value) return false
    
    try {
      loading.value = true
      const response = await axios.get('/api/auth/me')
      user.value = response.data.data.user
      return true
    } catch (err) {
      setToken(null)
      return false
    } finally {
      loading.value = false
    }
  }

  const getAuthHeaders = () => {
    console.log('🔐 Getting auth headers, token:', token.value ? 'present' : 'missing')
    return {
      'Authorization': `Bearer ${token.value}`,
      'Content-Type': 'application/json'
    }
  }

  const clearMFAState = () => {
    console.log('🔐 Clearing MFA state manually...')
    setMFAState(false)
    error.value = null
    console.log('🔐 MFA state cleared')
  }

  return {
    user,
    token,
    refreshToken,
    loading,
    error,
    mfaSetupRequired,
    mfaStatus,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    login,
    logout,
    refreshTokenIfNeeded,
    ensureValidToken,
    checkAuth,
    getAuthHeaders,
    clearMFAState
  }
}) 