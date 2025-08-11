import { config } from '../config'
import { useAuthStore } from '../stores/authStore'

// API functions
export const attendanceService = {

  async getAttendanceStatus() {
    const authStore = useAuthStore()
    try {
      const headers = authStore.getAuthHeaders()
      console.log('🔍 Attendance Service - Getting attendance status...')
      console.log('🔍 Attendance Service - API URL:', config.apiUrl)
      console.log('🔍 Attendance Service - Headers:', headers)
      
      const response = await fetch(`${config.apiUrl}/api/employee/attendance/status`, {
        headers: {
          ...headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      console.log('🔍 Attendance Service - Response status:', response.status)
      const data = await response.json()
      console.log('🔍 Attendance Service - Status response:', data)
      console.log('🔍 Attendance Service - Response structure:', {
        checkedIn: data.checkedIn,
        checkedOut: data.checkedOut,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        totalHours: data.totalHours
      })
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get attendance status')
      }

      return data
    } catch (error) {
      console.error('Error getting attendance status:', error)
      throw error
    }
  },

  async checkIn() {
    const authStore = useAuthStore()
    try {
      const headers = authStore.getAuthHeaders()
      console.log('🔍 Attendance Service - Checking in...')
      
      const response = await fetch(`${config.apiUrl}/api/employee/attendance/check-in`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log('🔍 Attendance Service - Check-in response:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check in')
      }

      return data
    } catch (error) {
      console.error('Error checking in:', error)
      throw error
    }
  },

  async checkOut() {
    const authStore = useAuthStore()
    try {
      const headers = authStore.getAuthHeaders()
      console.log('🔍 Attendance Service - Checking out...')
      
      const response = await fetch(`${config.apiUrl}/api/employee/attendance/check-out`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log('🔍 Attendance Service - Check-out response:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check out')
      }

      return data
    } catch (error) {
      console.error('Error checking out:', error)
      throw error
    }
  },

  async getAttendanceHistory(filters = {}) {
    const authStore = useAuthStore()
    try {
      const headers = authStore.getAuthHeaders()
      console.log('🔍 Attendance Service - Getting attendance history...')
      
      const queryParams = new URLSearchParams(filters)
      const response = await fetch(`${config.apiUrl}/api/employee/attendance/history?${queryParams}`, {
        headers: {
          ...headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      const data = await response.json()
      console.log('🔍 Attendance Service - History response:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get attendance history')
      }

      return data
    } catch (error) {
      console.error('Error getting attendance history:', error)
      throw error
    }
  },

  async startBreak(reason = 'other', notes = '') {
    const authStore = useAuthStore()
    try {
      const headers = authStore.getAuthHeaders()
      console.log('🔍 Attendance Service - Starting break...')
      
      const response = await fetch(`${config.apiUrl}/api/employee/attendance/pause`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason, notes })
      })
      
      const data = await response.json()
      console.log('🔍 Attendance Service - Start break response:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to start break')
      }

      return data
    } catch (error) {
      console.error('Error starting break:', error)
      throw error
    }
  },

  async endBreak(notes = '') {
    const authStore = useAuthStore()
    try {
      const headers = authStore.getAuthHeaders()
      console.log('🔍 Attendance Service - Ending break...')
      
      const response = await fetch(`${config.apiUrl}/api/employee/attendance/resume`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      })
      
      const data = await response.json()
      console.log('🔍 Attendance Service - End break response:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to end break')
      }

      return data
    } catch (error) {
      console.error('Error ending break:', error)
      throw error
    }
  }
} 