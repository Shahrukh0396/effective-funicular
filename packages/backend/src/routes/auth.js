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
  max: process.env.NODE_ENV === 'test' ? 1000 : 5, // Higher limit for tests
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
    const { email, password, vendorDomain } = req.body

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

    // Check if account is locked
    if (user.security?.accountLockedUntil && new Date() < user.security.accountLockedUntil) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.'
      })
    }

    // Check if password is expired
    if (user.security?.passwordExpiresAt && new Date() > user.security.passwordExpiresAt) {
      await logFailedLogin(email, req, 'Password expired')
      return res.status(401).json({
        success: false,
        message: 'Password has expired. Please reset your password.'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      await handleFailedLogin(user, req)
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

    // Get request information
    const requestInfo = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      location: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      screenResolution: req.headers['x-screen-resolution'],
      timezone: req.headers['x-timezone'],
      language: req.headers['accept-language']
    }

    // Generate tokens
    let accessToken, refreshToken, session
    try {
      accessToken = authService.generateAccessToken(user, vendor, requestedPortalType)
      refreshToken = authService.generateRefreshToken(user, vendor, requestedPortalType)

      // Create session
      session = await authService.createSession(
        user, 
        vendor, 
        requestedPortalType, 
        accessToken, 
        refreshToken, 
        requestInfo
      )
    } catch (error) {
      console.error('Token/Session creation error:', error)
      return res.status(500).json({
        success: false,
        message: 'Server error during authentication.'
      })
    }

    // Reset failed login attempts
    if (user.security?.failedAttempts > 0) {
      user.security.failedAttempts = 0
      user.security.accountLockedUntil = null
      await user.save()
    }

    // Log successful login
    try {
      await authService.logAuthEvent({
        event: 'user.login.success',
        userId: user._id,
        vendorId: vendor._id,
        portalType: requestedPortalType,
        sessionId: session.sessionId,
        request: {
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          method: req.method,
          url: req.originalUrl
        },
        location: {
          country: requestInfo.location,
          timezone: requestInfo.timezone
        },
        device: {
          type: authService.detectDeviceType(requestInfo.userAgent),
          browser: authService.detectBrowser(requestInfo.userAgent),
          os: authService.detectOS(requestInfo.userAgent),
          screenResolution: requestInfo.screenResolution
        },
        security: {
          riskScore: 0,
          suspiciousActivity: false,
          mfaUsed: false,
          loginMethod: 'email_password',
          failedAttempts: 0
        },
        metadata: {
          success: true,
          duration: req.startTime ? Date.now() - req.startTime : 0
        }
      })
    } catch (error) {
      console.error('Audit logging error:', error)
      // Don't fail the login for audit logging errors
    }

    // Return response
    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions,
          isSuperAccount: user.isSuperAccount
        },
        vendor: {
          id: vendor._id,
          name: vendor.name,
          domain: vendor.domain
        },
        session: {
          id: session.sessionId,
          portalType: requestedPortalType
        },
        accessToken,
        refreshToken,
        expiresIn: config.tokens.accessToken.expiresIn
      }
    })

  } catch (error) {
    console.error('❌ Login error:', error)
    console.error('❌ Error stack:', error.stack)
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
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

    const decoded = require('jsonwebtoken').verify(token, config.jwtSecret)
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
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      })
    }
    
    console.error('Auth error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
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