import { useAuthStore } from '../stores/authStore'
import axios from 'axios'

class TokenRefreshService {
  constructor() {
    this.refreshTimer = null
    this.authStore = null
  }

  // Initialize the service
  init() {
    console.log('🔐 Initializing token refresh service...')
    this.authStore = useAuthStore()
    console.log('🔐 Auth store initialized:', !!this.authStore)
    console.log('🔐 Auth store token:', !!this.authStore?.token)
    this.scheduleRefresh()
  }

  // Schedule token refresh
  scheduleRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    if (!this.authStore.token) {
      return
    }

    try {
      // Decode the token to get expiration time
      const tokenParts = this.authStore.token.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))
        const expTime = payload.exp * 1000 // Convert to milliseconds
        const now = Date.now()
        const timeUntilExpiry = expTime - now

        // Refresh token 5 minutes before expiry
        const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000) // At least 1 minute

        console.log('🔐 Scheduling token refresh in', Math.round(refreshTime / 1000), 'seconds')

        this.refreshTimer = setTimeout(() => {
          this.refreshToken()
        }, refreshTime)
      }
    } catch (error) {
      console.error('🔐 Error scheduling token refresh:', error)
    }
  }

  // Refresh the token
  async refreshToken() {
    if (!this.authStore.refreshToken) {
      console.log('🔐 No refresh token available')
      return false
    }

    try {
      console.log('🔐 Proactively refreshing token...')
      const response = await axios.post('/api/auth/refresh', {
        refreshToken: this.authStore.refreshToken
      })

      if (response.data.success) {
        console.log('🔐 Token refresh successful')
        this.authStore.setToken(
          response.data.data.accessToken,
          response.data.data.refreshToken
        )
        
        // Schedule next refresh
        this.scheduleRefresh()
        return true
      }
    } catch (error) {
      console.error('🔐 Token refresh failed:', error)
      // Clear tokens on refresh failure
      this.authStore.setToken(null)
      return false
    }

    return false
  }

  // Stop the refresh service
  stop() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  // Check if token is about to expire (within 10 minutes)
  isTokenExpiringSoon() {
    console.log('🔐 isTokenExpiringSoon called')
    console.log('🔐 Auth store token:', !!this.authStore?.token)
    
    if (!this.authStore?.token) {
      console.log('🔐 No token in auth store')
      return false
    }

    try {
      const tokenParts = this.authStore.token.split('.')
      console.log('🔐 Token parts length:', tokenParts.length)
      
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))
        const expTime = payload.exp * 1000
        const now = Date.now()
        const timeUntilExpiry = expTime - now

        console.log('🔐 Token expiry check:', {
          expTime: new Date(expTime),
          now: new Date(now),
          timeUntilExpiry: Math.round(timeUntilExpiry / 1000 / 60) + ' minutes',
          isExpiringSoon: timeUntilExpiry < (10 * 60 * 1000)
        })

        return timeUntilExpiry < (10 * 60 * 1000) // 10 minutes
      }
    } catch (error) {
      console.error('🔐 Error checking token expiry:', error)
    }

    console.log('🔐 Token expiry check failed')
    return false
  }
}

// Create singleton instance
const tokenRefreshService = new TokenRefreshService()

export default tokenRefreshService 