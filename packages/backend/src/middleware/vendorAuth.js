const jwt = require('jsonwebtoken')
const Vendor = require('../models/Vendor')
const config = require('../config')

// Vendor authentication middleware
const vendorAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    const decoded = jwt.verify(token, config.jwtSecret)
    
    // Check if token is for a vendor
    if (decoded.role !== 'vendor') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Vendor token required.'
      })
    }

    const vendor = await Vendor.findById(decoded.vendorId)
      .select('-password')

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Vendor not found.'
      })
    }

    if (!vendor.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      })
    }

    // Check subscription status
    if (vendor.subscription.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact support.'
      })
    }

    // Add vendor info to request
    req.vendorId = vendor._id
    req.vendor = vendor
    req.vendorSlug = vendor.domain

    next()
  } catch (error) {
    console.error('Vendor auth error:', error)
    
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

    res.status(500).json({
      success: false,
      message: 'Authentication error.',
      error: error.message
    })
  }
}

// Optional vendor auth (doesn't fail if no token)
const optionalVendorAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return next()
    }

    const decoded = jwt.verify(token, config.jwtSecret)
    
    if (decoded.role !== 'vendor') {
      return next()
    }

    const vendor = await Vendor.findById(decoded.vendorId)
      .select('-password')

    if (!vendor || !vendor.isActive) {
      return next()
    }

    req.vendorId = vendor._id
    req.vendor = vendor
    req.vendorSlug = vendor.domain

    next()
  } catch (error) {
    // Don't fail on token errors for optional auth
    next()
  }
}

// Check vendor subscription status
const checkVendorSubscription = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(401).json({
        success: false,
        message: 'Vendor authentication required.'
      })
    }

    const vendor = req.vendor

    // Allow trial and active subscriptions
    if (vendor.subscription.status === 'trial' || vendor.subscription.status === 'active') {
      return next()
    }

    // Check if trial has expired
    if (vendor.subscription.status === 'trial' && vendor.subscription.trialEndsAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Trial period has expired. Please upgrade your subscription.',
        data: {
          trialExpired: true,
          trialEndsAt: vendor.subscription.trialEndsAt
        }
      })
    }

    // Check for past due or cancelled subscriptions
    if (vendor.subscription.status === 'past_due' || vendor.subscription.status === 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Subscription is not active. Please update your payment method.',
        data: {
          subscriptionStatus: vendor.subscription.status
        }
      })
    }

    next()
  } catch (error) {
    console.error('Check vendor subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Error checking subscription status.',
      error: error.message
    })
  }
}

// Check vendor usage limits
const checkVendorLimits = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.vendor) {
        return res.status(401).json({
          success: false,
          message: 'Vendor authentication required.'
        })
      }

      const vendor = req.vendor

      // Check if usage limit is exceeded
      if (vendor.isLimitExceeded(resourceType)) {
        return res.status(403).json({
          success: false,
          message: `Usage limit exceeded for ${resourceType}. Please upgrade your plan.`,
          data: {
            resourceType,
            currentUsage: vendor.usage[resourceType],
            limit: vendor.limits[resourceType]
          }
        })
      }

      next()
    } catch (error) {
      console.error('Check vendor limits error:', error)
      res.status(500).json({
        success: false,
        message: 'Error checking usage limits.',
        error: error.message
      })
    }
  }
}

module.exports = {
  vendorAuth,
  optionalVendorAuth,
  checkVendorSubscription,
  checkVendorLimits
} 