const User = require('../models/User')
const authService = require('./authService')
const mfaService = require('./mfaService')
const AuditLog = require('../models/AuditLog')

class WebSocketAuthService {
  constructor(io) {
    this.io = io
    this.setupSocketHandlers()
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('🔌 WebSocket client connected:', socket.id)
      
      // Handle authentication requests
      socket.on('auth:login', async (data) => {
        await this.handleLogin(socket, data)
      })

      // Handle MFA token submission
      socket.on('auth:mfa-token', async (data) => {
        await this.handleMFAToken(socket, data)
      })

      // Handle MFA setup
      socket.on('auth:mfa-setup', async (data) => {
        await this.handleMFASetup(socket, data)
      })

      // Handle MFA enable
      socket.on('auth:mfa-enable', async (data) => {
        await this.handleMFAEnable(socket, data)
      })

      // Handle logout
      socket.on('auth:logout', async (data) => {
        await this.handleLogout(socket, data)
      })

      socket.on('disconnect', () => {
        console.log('🔌 WebSocket client disconnected:', socket.id)
      })
    })
  }

  async handleLogin(socket, data) {
    try {
      const { email, password, portalType = 'admin' } = data
      
      console.log('🔌 WebSocket login attempt:', { email, portalType })
      
      // Validate input
      if (!email || !password) {
        socket.emit('auth:error', {
          success: false,
          message: 'Email and password are required'
        })
        return
      }

      // Find user
      const user = await User.findOne({ email }).populate('vendorId')
      if (!user) {
        socket.emit('auth:error', {
          success: false,
          message: 'Invalid credentials'
        })
        return
      }

      // Verify password
      const bcrypt = require('bcryptjs')
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        await authService.handleFailedLogin(user, {
          ipAddress: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent'],
          method: 'POST',
          url: '/socket/auth/login'
        })
        
        socket.emit('auth:error', {
          success: false,
          message: 'Invalid credentials'
        })
        return
      }

      // Check if user is active
      if (!user.isActive) {
        socket.emit('auth:error', {
          success: false,
          message: 'Account is inactive'
        })
        return
      }

          // Check MFA requirements
    const mfaSetupInfo = await authService.getMFASetupInfo(user, portalType)
      
      if (mfaSetupInfo.status === 'not_configured' && mfaSetupInfo.required) {
        // MFA setup required
        socket.emit('auth:mfa-setup-required', {
          success: false,
          message: 'MFA is required for this account. Please setup MFA first.',
          mfaStatus: mfaSetupInfo
        })
        return
      }

      if (mfaSetupInfo.status === 'configured_not_enabled') {
        // MFA completion required
        socket.emit('auth:mfa-completion-required', {
          success: false,
          message: 'MFA setup is incomplete. Please complete MFA setup.',
          mfaStatus: mfaSetupInfo
        })
        return
      }

      if (mfaSetupInfo.status === 'enabled' && mfaSetupInfo.required) {
        // MFA token required
        socket.emit('auth:mfa-token-required', {
          success: false,
          message: 'MFA token is required for this account.',
          mfaMethod: 'totp'
        })
        return
      }

      // No MFA required, proceed with login
      const vendor = user.vendorId
      const requestInfo = {
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent'],
        method: 'POST',
        url: '/socket/auth/login'
      }

      // Generate tokens and create session
      const accessToken = authService.generateAccessToken(user, vendor, portalType)
      const refreshToken = authService.generateRefreshToken(user, vendor, portalType)
      const session = await authService.createSession(user, vendor, portalType, accessToken, refreshToken, requestInfo)

      // Handle successful login
      await authService.handleSuccessfulLogin(user, vendor, portalType, requestInfo, session)

      // Send success response
      socket.emit('auth:success', {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            vendorId: user.vendorId
          },
          tokens: {
            accessToken,
            refreshToken
          },
          sessionId: session.sessionId
        }
      })

    } catch (error) {
      console.error('🔌 WebSocket login error:', error)
      socket.emit('auth:error', {
        success: false,
        message: 'Server error during authentication'
      })
    }
  }

  async handleMFAToken(socket, data) {
    try {
      const { email, password, mfaToken, portalType = 'admin' } = data
      
      console.log('🔌 ===== MFA TOKEN HANDLER START =====')
      console.log('🔌 WebSocket MFA token submission:', { email, mfaToken, portalType })
      console.log('🔌 Socket ID:', socket.id)
      
      // Find user
      const user = await User.findOne({ email }).populate('vendorId')
      if (!user) {
        console.log('🔌 ❌ User not found:', email)
        socket.emit('auth:error', {
          success: false,
          message: 'Invalid credentials'
        })
        return
      }
      
      console.log('🔌 ✅ User found:', {
        id: user._id,
        email: user.email,
        role: user.role,
        mfaEnabled: user.security.mfaEnabled,
        hasMfaSecret: !!user.security.mfaSecret,
        backupCodesCount: user.security.backupCodes?.length || 0
      })

      // Verify password
      const bcrypt = require('bcryptjs')
      const isPasswordValid = await bcrypt.compare(password, user.password)
      console.log('🔌 Password validation:', { isValid: isPasswordValid })
      
      if (!isPasswordValid) {
        console.log('🔌 ❌ Password validation failed')
        socket.emit('auth:error', {
          success: false,
          message: 'Invalid credentials'
        })
        return
      }
      
      console.log('🔌 ✅ Password validation successful')

      // Validate MFA token
      console.log('🔌 Starting MFA validation...')
      console.log('🔌 MFA Token:', mfaToken)
      console.log('🔌 Portal Type:', portalType)
      
      try {
        const mfaValidation = await authService.validateMFAForLogin(user, portalType, mfaToken, 'auto')
        console.log('🔌 MFA validation result:', mfaValidation)
        
        if (!mfaValidation.valid) {
          console.log('🔌 ❌ MFA validation failed:', mfaValidation.error)
          socket.emit('auth:error', {
            success: false,
            message: mfaValidation.error
          })
          return
        }
        
        console.log('🔌 ✅ MFA validation successful')
      } catch (error) {
        console.log('🔌 ❌ MFA validation error:', error.message)
        socket.emit('auth:error', {
          success: false,
          message: error.message
        })
        return
      }

      // MFA validation successful, proceed with login
      console.log('🔌 ===== PROCEEDING WITH LOGIN =====')
      
      const vendor = user.vendorId
      const requestInfo = {
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent'],
        method: 'POST',
        url: '/socket/auth/mfa-token'
      }
      
      console.log('🔌 Request info:', requestInfo)

      // Generate tokens and create session
      console.log('🔌 Generating tokens...')
      const accessToken = authService.generateAccessToken(user, vendor, portalType)
      const refreshToken = authService.generateRefreshToken(user, vendor, portalType)
      console.log('🔌 Tokens generated:', { accessToken: !!accessToken, refreshToken: !!refreshToken })
      
      console.log('🔌 Creating session...')
      const session = await authService.createSession(user, vendor, portalType, accessToken, refreshToken, requestInfo)
      console.log('🔌 Session created:', { sessionId: session.sessionId })

      // Handle successful login
      console.log('🔌 Handling successful login...')
      await authService.handleSuccessfulLogin(user, vendor, portalType, requestInfo, session)
      console.log('🔌 Login handled successfully')

      // Send success response
      const successData = {
        success: true,
        message: 'MFA validation successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            vendorId: user.vendorId
          },
          tokens: {
            accessToken,
            refreshToken
          },
          sessionId: session.sessionId
        }
      }
      
      console.log('🔌 ===== SENDING SUCCESS RESPONSE =====')
      console.log('🔌 Success data:', successData)
      socket.emit('auth:success', successData)
      console.log('🔌 ✅ Success response sent to client')

    } catch (error) {
      console.error('🔌 ===== MFA TOKEN HANDLER ERROR =====')
      console.error('🔌 WebSocket MFA token error:', error)
      console.error('🔌 Error stack:', error.stack)
      socket.emit('auth:error', {
        success: false,
        message: 'Server error during MFA validation'
      })
      console.log('🔌 ❌ Error response sent to client')
    }
  }

  async handleMFASetup(socket, data) {
    try {
      const { email, password } = data
      
      console.log('🔌 WebSocket MFA setup request:', { email })
      
      // Find user and verify credentials
      const user = await User.findOne({ email }).populate('vendorId')
      if (!user) {
        socket.emit('auth:error', {
          success: false,
          message: 'Invalid credentials'
        })
        return
      }

      // Verify password
      const bcrypt = require('bcryptjs')
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        socket.emit('auth:error', {
          success: false,
          message: 'Invalid credentials'
        })
        return
      }

      // Check if MFA is already enabled
      if (user.security.mfaEnabled) {
        socket.emit('auth:error', {
          success: false,
          message: 'MFA is already enabled for this account'
        })
        return
      }

      // Setup MFA
      const mfaSetup = await mfaService.setupMFA(user)
      
      socket.emit('auth:mfa-setup-success', {
        success: true,
        message: 'MFA setup initiated successfully',
        data: {
          secret: mfaSetup.secret,
          qrCode: mfaSetup.qrCode,
          backupCodes: mfaSetup.backupCodes,
          otpauthUrl: mfaSetup.otpauthUrl,
          instructions: [
            '1. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
            '2. Enter the 6-digit code from your app to verify setup',
            '3. Save your backup codes in a secure location',
            '4. Complete the setup by calling the mfa-enable event'
          ]
        }
      })

    } catch (error) {
      console.error('🔌 WebSocket MFA setup error:', error)
      socket.emit('auth:error', {
        success: false,
        message: 'Failed to setup MFA'
      })
    }
  }

  async handleMFAEnable(socket, data) {
    try {
      const { email, password, token } = data
      
      console.log('🔌 WebSocket MFA enable request:', { email })
      
      // Find user and verify credentials
      const user = await User.findOne({ email }).populate('vendorId')
      if (!user) {
        socket.emit('auth:error', {
          success: false,
          message: 'Invalid credentials'
        })
        return
      }

      // Verify password
      const bcrypt = require('bcryptjs')
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        socket.emit('auth:error', {
          success: false,
          message: 'Invalid credentials'
        })
        return
      }

      // Check if MFA is already enabled
      if (user.security.mfaEnabled) {
        socket.emit('auth:error', {
          success: false,
          message: 'MFA is already enabled for this account'
        })
        return
      }

      // Check if MFA is configured
      if (!user.security.mfaSecret) {
        socket.emit('auth:error', {
          success: false,
          message: 'MFA is not configured. Please setup MFA first.'
        })
        return
      }

      // Enable MFA
      await mfaService.enableMFA(user, token)
      
      socket.emit('auth:mfa-enable-success', {
        success: true,
        message: 'MFA enabled successfully',
        data: {
          enabled: true,
          backupCodesCount: user.security.backupCodes.length
        }
      })

    } catch (error) {
      console.error('🔌 WebSocket MFA enable error:', error)
      socket.emit('auth:error', {
        success: false,
        message: error.message || 'Failed to enable MFA'
      })
    }
  }

  async handleLogout(socket, data) {
    try {
      const { accessToken, refreshToken } = data
      
      console.log('🔌 WebSocket logout request')
      
      await authService.logout(accessToken, refreshToken)
      
      socket.emit('auth:logout-success', {
        success: true,
        message: 'Logout successful'
      })

    } catch (error) {
      console.error('🔌 WebSocket logout error:', error)
      socket.emit('auth:error', {
        success: false,
        message: 'Failed to logout'
      })
    }
  }
}

module.exports = WebSocketAuthService 