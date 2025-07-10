const jwt = require('jsonwebtoken')
const User = require('../models/User')
const config = require('../config')

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
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret)
    
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
    
    // Add user to request object
    req.user = user
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
        message: 'Token expired. Please login again.'
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
    

    
    // Super accounts have access to all roles
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      console.log('Super account access granted')
      return next()
    }
    
    if (!roles.includes(req.user.role)) {
      console.log('Access denied - role not in allowed list')
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      })
    }
    
    console.log('Access granted')
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
    const hasAllPermissions = permissions.every(permission => 
      req.user.permissions.includes(permission)
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

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret)
      const user = await User.findById(decoded.userId).select('-password')
      
      if (user && user.isActive) {
        req.user = user
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

// Employee-specific authorization (employees and admins can access)
const employeeOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    })
  }
  
  if (!['employee', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Employee or admin access only.'
    })
  }
  
  next()
}

module.exports = {
  auth,
  authorize,
  hasPermission,
  optionalAuth,
  clientOnly,
  employeeOrAdmin
} 