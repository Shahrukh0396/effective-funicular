import { ref } from 'vue'
import { config } from '@/config'

const user = ref(null)
const token = ref(localStorage.getItem('token'))
const isAuthenticated = ref(!!token.value)

// Set auth token
const setToken = (newToken) => {
  token.value = newToken
  isAuthenticated.value = !!newToken
  if (newToken) {
    localStorage.setItem('token', newToken)
  } else {
    localStorage.removeItem('token')
  }
}

// Set user data
const setUser = (userData) => {
  user.value = userData
}

// Get auth headers
const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  }
  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`
  }
  return headers
}

// API functions
export const authService = {
  user,
  token,
  isAuthenticated,

  async register(userData) {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)
      }

      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  async logout() {
    try {
      if (token.value) {
        await fetch(`${config.apiUrl}/api/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders()
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setToken(null)
      setUser(null)
    }
  },

  async getMe() {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/profile`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user data')
      }

      if (data.success) {
        setUser(data.data.user)
      }

      return data
    } catch (error) {
      console.error('Get me error:', error)
      // If token is invalid, logout
      if (error.message.includes('token')) {
        this.logout()
      }
      throw error
    }
  },

  async updateProfile(updates) {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      if (data.success) {
        setUser(data.data.user)
      }

      return data
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  },

  async changePassword(passwords) {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwords)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }

      return data
    } catch (error) {
      console.error('Change password error:', error)
      throw error
    }
  },

  async forgotPassword(email) {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email')
      }

      return data
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }

      return data
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  },

  async verifyEmail(token) {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/verify-email/${token}`, {
        method: 'GET'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify email')
      }

      return data
    } catch (error) {
      console.error('Email verification error:', error)
      throw error
    }
  },

  // GDPR Compliance Methods
  async updateConsent(consentType, granted) {
    try {
      const response = await fetch(`${config.apiUrl}/api/gdpr/consent`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ consentType, granted })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update consent')
      }

      return data
    } catch (error) {
      console.error('Update consent error:', error)
      throw error
    }
  },

  async getConsentStatus() {
    try {
      const response = await fetch(`${config.apiUrl}/api/gdpr/consent`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get consent status')
      }

      return data
    } catch (error) {
      console.error('Get consent status error:', error)
      throw error
    }
  },

  async requestDataPortability() {
    try {
      const response = await fetch(`${config.apiUrl}/api/gdpr/data-portability`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request data portability')
      }

      return data
    } catch (error) {
      console.error('Data portability error:', error)
      throw error
    }
  },

  async requestRightToBeForgotten() {
    try {
      const response = await fetch(`${config.apiUrl}/api/gdpr/forgotten`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request right to be forgotten')
      }

      return data
    } catch (error) {
      console.error('Right to be forgotten error:', error)
      throw error
    }
  },

  // Utility methods
  getAuthHeaders,
  setToken,
  setUser
} 