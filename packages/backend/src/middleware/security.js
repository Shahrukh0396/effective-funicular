const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const { body, validationResult } = require('express-validator')
const xss = require('xss-clean')
const hpp = require('hpp')

// Rate limiting
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
}

// Specific rate limiters
const authLimiter = createRateLimiter(15 * 60 * 1000, 5) // 5 attempts per 15 minutes
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100) // 100 requests per 15 minutes
const uploadLimiter = createRateLimiter(60 * 60 * 1000, 10) // 10 uploads per hour

// Input validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  next()
}

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
]

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('role').optional().isIn(['client', 'employee', 'admin']).withMessage('Invalid role'),
  validate
]

const projectValidation = [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Project name must be 3-100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validate
]

const taskValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Task title must be 3-200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('storyPoints').optional().isInt({ min: 1, max: 100 }).withMessage('Story points must be 1-100'),
  validate
]

// Request sanitization
const sanitizeRequest = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim()
      }
    })
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim()
      }
    })
  }

  next()
}

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: [
        "'self'",
        "http://localhost:*",
        "http://127.0.0.1:*",
        "http://192.168.*.*:*",
        "http://10.*.*.*:*",
        "http://172.16.*.*:*",
        "http://172.17.*.*:*",
        "http://172.18.*.*:*",
        "http://172.19.*.*:*",
        "http://172.20.*.*:*",
        "http://172.21.*.*:*",
        "http://172.22.*.*:*",
        "http://172.23.*.*:*",
        "http://172.24.*.*:*",
        "http://172.25.*.*:*",
        "http://172.26.*.*:*",
        "http://172.27.*.*:*",
        "http://172.28.*.*:*",
        "http://172.29.*.*:*",
        "http://172.30.*.*:*",
        "http://172.31.*.*:*"
      ],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  strictTransportSecurity: false, // Disable HSTS for local development
  referrerPolicy: { policy: "no-referrer-when-downgrade" }
})

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173', // Client portal
      'http://localhost:5174', // Employee portal
      'http://localhost:5175', // Admin panel
      // Allow local network access (192.168.x.x)
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // 192.168.x.x with any port
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,  // 10.x.x.x with any port
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/ // 172.16-31.x.x with any port
    ]
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin)
      }
      return false
    })
    
    if (isAllowed) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    })
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
}

// Not found middleware
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
}

module.exports = {
  createRateLimiter,
  authLimiter,
  generalLimiter,
  uploadLimiter,
  loginValidation,
  registerValidation,
  projectValidation,
  taskValidation,
  sanitizeRequest,
  securityHeaders,
  corsOptions,
  errorHandler,
  notFound
} 