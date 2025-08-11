const express = require('express')
const bcrypt = require('bcryptjs')
const rateLimit = require('express-rate-limit')
const User = require('../models/User')
const Vendor = require('../models/Vendor')
const Session = require('../models/Session')
const AuditLog = require('../models/AuditLog')
const authService = require('../services/authService')
const { auth, authorize, optionalAuth } = require('../middleware/auth')
const config = require('../config')
const mongoose = require('mongoose')

const router = express.Router()

// Rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 
       process.env.NODE_ENV === 'development' ? 50 : 5, // More lenient for development
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  }
})

// Middleware to set start time for audit logs
const setStartTime = (req, res, next) => {
  req.startTime = Date.now()
  next()
}

// Enhanced login endpoint
router.post('/login', setStartTime, authLimiter, async (req, res) => {
  try {
    const { email, password, vendorDomain, mfaToken, mfaMethod = 'totp' } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      })
    }

    // Find user
    const user = await User.findOne({ email }).populate('vendorId')
    
    if (!user) {
      await logFailedLogin(email, req, 'User not found')
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      await logFailedLogin(email, req, 'Account inactive')
      return res.status(401).json({
        success: false,
        message: 'Account is inactive.'
      })
    }

    // NEW: Enhanced security validation
    const requestInfo = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      location: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      screenResolution: req.headers['x-screen-resolution'],
      timezone: req.headers['x-timezone'],
      language: req.headers['accept-language']
    }

    const securityValidation = await authService.validateUserSecurity(user, requestInfo)
    
    if (!securityValidation.isValid) {
      const issue = securityValidation.issues[0]
      
      if (issue.type === 'account_locked') {
        return res.status(401).json({
          success: false,
          message: issue.message,
          unlockTime: issue.unlockTime
        })
      }
      
      if (issue.type === 'password_expired') {
        return res.status(401).json({
          success: false,
          message: issue.message,
          requiresPasswordReset: true
        })
      }
      
      if (issue.type === 'suspicious_activity') {
        return res.status(401).json({
          success: false,
          message: issue.message,
          requiresMFA: true
        })
      }
      
      if (issue.type === 'ip_not_whitelisted') {
        return res.status(403).json({
          success: false,
          message: issue.message
        })
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      await authService.handleFailedLogin(user, requestInfo)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      })
    }

    // Determine vendor context - simplified approach
    let vendor
    try {
      if (user.role === 'super_admin' || user.isSuperAccount) {
        // Super admin can access any vendor
        if (vendorDomain) {
          // Try to find vendor by domain directly
          vendor = await Vendor.findOne({ domain: vendorDomain })
        }
        if (!vendor) {
          // If no vendor with specified domain, try to find any vendor
          vendor = await Vendor.findOne()
        }
        // For super admin, if no vendor exists, we'll create a minimal vendor context
        if (!vendor) {
          vendor = {
            _id: new mongoose.Types.ObjectId(),
            name: 'System Default',
            domain: 'system-default',
            isActive: true
          }
        }
      } else {
        // Regular users must belong to a vendor - check if they're trying to access a different vendor
        if (vendorDomain) {
          // Check if the requested vendor domain matches the user's vendor
          const requestedVendor = await Vendor.findOne({ domain: vendorDomain })
          if (!requestedVendor || (user.vendorId && requestedVendor._id.toString() !== user.vendorId._id.toString())) {
            await logFailedLogin(email, req, 'User attempting to access different vendor')
            return res.status(401).json({
              success: false,
              message: 'Access denied. You can only access your assigned vendor.'
            })
          }
        }
        vendor = user.vendorId // Use the populated vendor object
        if (!vendor) {
          await logFailedLogin(email, req, 'User not associated with any vendor')
          return res.status(401).json({
            success: false,
            message: 'User not associated with any vendor.'
          })
        }
      }
    } catch (error) {
      console.error('Vendor lookup error:', error)
      return res.status(500).json({
        success: false,
        message: 'Server error during vendor lookup.'
      })
    }

    // Validate portal access if portalType is specified
    const requestedPortalType = req.body.portalType || 'client'
    
    // Portal validation is now enabled for tests
    if (!authService.validatePortalAccess(user, vendor, requestedPortalType)) {
      await logFailedLogin(email, req, `User attempting to access unauthorized portal: ${requestedPortalType}`)
      return res.status(403).json({
        success: false,
        message: `Access denied. You don't have permission to access the ${requestedPortalType} portal.`
      })
    }

    // NEW: Check MFA requirements
    const mfaSetupInfo = await authService.getMFASetupInfo(user, requestedPortalType)
    
    // If MFA is required but not configured, return setup info
    if (mfaSetupInfo.status === 'not_configured' && mfaSetupInfo.required) {
      return res.status(401).json({
        success: false,
        message: 'MFA is required for this account. Please setup MFA first.',
        requiresMFASetup: true,
        mfaStatus: mfaSetupInfo
      })
    }

    // If MFA is configured but not enabled, require completion
    if (mfaSetupInfo.status === 'configured_not_enabled') {
      return res.status(401).json({
        success: false,
        message: 'MFA setup is incomplete. Please complete MFA setup.',
        requiresMFACompletion: true,
        mfaStatus: mfaSetupInfo
      })
    }

    // If MFA is enabled, check if MFA token is provided
    if (mfaSetupInfo.status === 'enabled' && mfaSetupInfo.required) {
      if (!mfaToken) {
        return res.status(401).json({
          success: false,
          message: 'MFA token is required for this account.',
          requiresMFA: true,
          mfaMethod: 'totp'
        })
      }
      
      // Validate MFA token
      try {
        const mfaValidation = await authService.validateMFAForLogin(user, requestedPortalType, mfaToken, 'auto')
        if (!mfaValidation.valid) {
          return res.status(401).json({
            success: false,
            message: mfaValidation.error,
            requiresMFA: true,
            mfaMethod: mfaValidation.method || 'totp'
          })
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: error.message,
          requiresMFA: true,
          mfaMethod: 'totp'
        })
      }
    }

    // Generate tokens
    let accessToken, refreshToken, session
    try {
      accessToken = authService.generateAccessToken(user, vendor, requestedPortalType)
      refreshToken = authService.generateRefreshToken(user, vendor, requestedPortalType)

      // Create session
      console.log('🔐 About to create session for user:', user.email)
      session = await authService.createSession(
        user, 
        vendor, 
        requestedPortalType, 
        accessToken, 
        refreshToken, 
        requestInfo
      )
      console.log('🔐 Session created in login route:', {
        sessionId: session.sessionId,
        userId: session.user,
        vendorId: session.vendor,
        isActive: session.isActive
      })
    } catch (error) {
      console.error('Token/Session creation error:', error)
      return res.status(500).json({
        success: false,
        message: 'Server error during authentication.'
      })
    }

    // Handle successful login
    await authService.handleSuccessfulLogin(user, vendor, requestedPortalType, requestInfo, session)

    // Prepare response
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      isSuperAccount: user.isSuperAccount,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        domain: vendor.domain
      },
      portalType: requestedPortalType,
      security: {
        riskScore: securityValidation.riskScore,
        suspiciousActivity: securityValidation.riskScore > 0.7,
        mfaEnabled: user.security.mfaEnabled,
        passwordExpiresAt: user.security.passwordExpiresAt
      }
    }

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken
        },
        session: {
          id: session.sessionId,
          expiresAt: new Date(Date.now() + (15 * 60 * 1000)) // 15 minutes
        },
        mfa: {
          required: mfaSetupInfo.required,
          enabled: user.security.mfaEnabled,
          verified: true
        }
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    })
  }
})

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.'
      })
    }

    const decoded = await authService.verifyRefreshToken(refreshToken)
    const user = await User.findById(decoded.userId)
    const vendor = await Vendor.findById(decoded.vendorId)
    
    if (!user || !vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. User or vendor not found.'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      })
    }

    // Generate new tokens
    const newAccessToken = authService.generateAccessToken(user, vendor, decoded.portalType)
    const newRefreshToken = authService.generateRefreshToken(user, vendor, decoded.portalType)

    // Update session
    const session = await Session.findByToken(refreshToken, 'refreshToken')
    if (session) {
      session.accessToken = newAccessToken
      session.refreshToken = newRefreshToken
      session.lastActivity = new Date()
      await session.save()
    }

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token.'
    })
  }
})

// Simple logout endpoint
router.post('/logout', async (req, res) => {
  try {
    // For now, just return success - token invalidation can be added later
    res.json({
      success: true,
      message: 'Logout successful.'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    })
  }
})

// Debug endpoint to check sessions
router.get('/debug-sessions', async (req, res) => {
  try {
    const Session = require('../models/Session')
    const sessions = await Session.find({ isActive: true }).limit(10)
    res.json({
      success: true,
      data: {
        totalSessions: sessions.length,
        sessions: sessions.map(s => ({
          sessionId: s.sessionId,
          userId: s.user,
          vendorId: s.vendor,
          isActive: s.isActive,
          createdAt: s.createdAt
        }))
      }
    })
  } catch (error) {
    console.error('Debug sessions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    // Use auth service to verify token (includes session validation)
    const decoded = await authService.verifyAccessToken(token)
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions,
          isSuperAccount: user.isSuperAccount
        }
      }
    })
  } catch (error) {
    if (error.message === 'Invalid access token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    }
    
    console.error('Auth me error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    })
  }
})

// Helper function to log failed login
async function logFailedLogin(email, req, reason) {
  try {
    await authService.logAuthEvent({
      event: 'user.login.failed',
      userId: null,
      vendorId: null,
      portalType: 'client',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl
      },
      metadata: {
        email: email,
        reason: reason,
        success: false
      }
    })
  } catch (error) {
    console.error('Failed to log failed login:', error)
  }
}

// Helper function to handle failed login
async function handleFailedLogin(user, req) {
  try {
    // Update failed attempts
    if (!user.security) {
      user.security = {}
    }
    
    user.security.failedAttempts = (user.security.failedAttempts || 0) + 1
    user.security.lastFailedAttempt = new Date()
    
    // Lock account if max attempts reached
    if (user.security.failedAttempts >= (config.security?.maxLoginAttempts || 5)) {
      user.security.accountLockedUntil = new Date(
        Date.now() + ((config.security?.accountLockoutDuration || 15) * 60 * 1000)
      )
    }
    
    await user.save()
    
    // Log failed login
    await logFailedLogin(user.email, req, 'Invalid password')
  } catch (error) {
    console.error('Failed to handle failed login:', error)
  }
}

module.exports = router 