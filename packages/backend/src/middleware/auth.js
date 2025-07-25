const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Session = require('../models/Session')
const AuditLog = require('../models/AuditLog')
const authService = require('../services/authService')
const config = require('../config')

// Enhanced authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }
    
    // Verify access token
    const decoded = await authService.verifyAccessToken(token)
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      })
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      })
    }

    // Check if account is locked
    if (user.security?.accountLockedUntil && new Date() < user.security.accountLockedUntil) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.'
      })
    }

    // Find session and update activity
    const session = await Session.findByToken(token, 'accessToken')
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session not found or expired.'
      })
    }

    // Update session activity
    await session.updateActivity()

    // Add user and session to request object
    req.user = user
    req.session = session
    req.vendorId = decoded.vendorId || user.vendor
    req.portalType = decoded.portalType || 'client'

    // Log activity (async, don't wait)
    authService.logAuthEvent({
      event: 'portal.access.granted',
      userId: user._id,
      vendorId: decoded.vendorId || user.vendor,
      portalType: decoded.portalType || 'client',
      sessionId: session.sessionId,
      request: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl
      },
      security: {
        riskScore: session.security?.riskScore || 0,
        suspiciousActivity: session.security?.suspiciousActivity || false
      }
    })

    next()
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
        message: 'Token expired. Please refresh your token.'
      })
    }
    
    console.error('Auth middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    })
  }
}

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }
    
    // Flatten the roles array in case it's nested
    const flatRoles = roles.flat()
    
    // Debug logging (can be removed in production)
    // console.log('🔍 Authorize middleware - User:', {
    //   email: req.user.email,
    //   role: req.user.role,
    //   isSuperAccount: req.user.isSuperAccount,
    //   isActive: req.user.isActive
    // })
    // console.log('🔍 Authorize middleware - Allowed roles:', flatRoles)
    
    // Super accounts have access to all roles
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      return next()
    }
    
    if (!flatRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      })
    }
    
    next()
  }
}

// Permission-based authorization middleware
const hasPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }
    
    // Super accounts and admins have all permissions
    if (req.user.role === 'super_admin' || req.user.isSuperAccount || req.user.role === 'admin') {
      return next()
    }
    
    // Check if user has required permissions
    const userPermissions = authService.getUserPermissions(req.user, req.portalType)
    const hasAllPermissions = permissions.every(permission => 
      userPermissions.includes(permission) || userPermissions.includes('*')
    )
    
    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      })
    }
    
    next()
  }
}

// Portal-specific authorization middleware
const requirePortalAccess = (portalType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }

    // Super admin can access all portals
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      return next()
    }

    // Check if user has access to the required portal
    const hasAccess = authService.validatePortalAccess(req.user, { _id: req.vendorId }, portalType)
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${portalType} portal access required.`
      })
    }

    next()
  }
}

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (token) {
      const decoded = await authService.verifyAccessToken(token)
      const user = await User.findById(decoded.userId).select('-password')
      
      if (user && user.isActive) {
        req.user = user
        req.vendorId = decoded.vendorId
        req.portalType = decoded.portalType
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication if token is invalid
    next()
  }
}

// Client-specific authorization (only clients can access)
const clientOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    })
  }
  
  if (req.user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Client access only.'
    })
  }
  
  next()
}

// Employee-specific authorization (employees, admins, and super admins can access)
const employeeOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    })
  }
  
  if (!['employee', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Employee, admin, or super admin access only.'
    })
  }
  
  next()
}

// Super admin only authorization
const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    })
  }
  
  if (req.user.role !== 'super_admin' && !req.user.isSuperAccount) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin access only.'
    })
  }
  
  next()
}

// Session validation middleware
const validateSession = async (req, res, next) => {
  if (!req.session) {
    return res.status(401).json({
      success: false,
      message: 'Session not found.'
    })
  }

  // Check if session is still active
  if (!req.session.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Session has expired.'
    })
  }

  // Check session timeout
  const sessionTimeout = config.session.sessionTimeout
  const lastActivity = new Date(req.session.lastActivity)
  const now = new Date()
  
  if (now - lastActivity > sessionTimeout) {
    await req.session.deactivate()
    return res.status(401).json({
      success: false,
      message: 'Session has timed out.'
    })
  }

  next()
}

module.exports = {
  auth,
  authorize,
  hasPermission,
  requirePortalAccess,
  optionalAuth,
  clientOnly,
  employeeOrAdmin,
  superAdminOnly,
  validateSession
} 