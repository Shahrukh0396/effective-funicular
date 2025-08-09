import { io } from 'socket.io-client'
import axios from 'axios'

class WebSocketAuthService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.pendingMFAToken = null
    this.resolveMFAToken = null
    this.rejectMFAToken = null
  }

  connect() {
    if (this.socket) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this.socket = io(axios.defaults.baseURL, {
        transports: ['websocket', 'polling'],
        withCredentials: true
      })

      this.socket.on('connect', () => {
        console.log('🔌 WebSocket connected:', this.socket.id)
        this.isConnected = true
        resolve()
      })

      this.socket.on('disconnect', () => {
        console.log('🔌 WebSocket disconnected')
        this.isConnected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('🔌 WebSocket connection error:', error)
        reject(error)
      })

      // Handle MFA token response
      this.socket.on('auth:mfa-success', (data) => {
        console.log('🔌 MFA token accepted:', data)
        if (this.resolveMFAToken) {
          this.resolveMFAToken(data)
          this.resolveMFAToken = null
          this.rejectMFAToken = null
        }
      })

      this.socket.on('auth:mfa-error', (data) => {
        console.log('🔌 MFA token rejected:', data)
        if (this.rejectMFAToken) {
          this.rejectMFAToken(new Error(data.message))
          this.resolveMFAToken = null
          this.rejectMFAToken = null
        }
      })
    })
  }

  async submitMFAToken(email, password, mfaToken) {
    if (!this.isConnected) {
      await this.connect()
    }

    return new Promise((resolve, reject) => {
      this.resolveMFAToken = resolve
      this.rejectMFAToken = reject

      console.log('🔌 Submitting MFA token via WebSocket:', { email, mfaToken: '***' })
      
      // Auto-detect MFA method: 6 digits = TOTP, anything else = backup
      const mfaMethod = /^\d{6}$/.test(mfaToken) ? 'totp' : 'backup'
      
      this.socket.emit('auth:mfa-token', {
        email,
        password,
        mfaToken,
        mfaMethod: mfaMethod
      })

      // Add timeout
      setTimeout(() => {
        if (this.rejectMFAToken) {
          this.rejectMFAToken(new Error('MFA token submission timeout'))
          this.resolveMFAToken = null
          this.rejectMFAToken = null
        }
      }, 10000) // 10 second timeout
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }
}

export default new WebSocketAuthService() 