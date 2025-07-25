const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  // User and vendor association
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  
  // Session identification
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  
  // Portal context
  portalType: {
    type: String,
    enum: ['client', 'employee', 'admin', 'super_admin'],
    required: true
  },
  
  // Session status
  isActive: {
    type: Boolean,
    default: true
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  
  // Device and location information
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    location: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    }
  },
  
  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: Date,
  
  // Security information
  security: {
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    suspiciousActivity: {
      type: Boolean,
      default: false
    },
    mfaUsed: {
      type: Boolean,
      default: false
    },
    loginMethod: {
      type: String,
      enum: ['email_password', 'sso', 'api_key'],
      default: 'email_password'
    }
  },
  
  // Metadata
  metadata: {
    browser: String,
    os: String,
    screenResolution: String,
    timezone: String,
    language: String
  }
}, {
  timestamps: true
})

// Indexes for performance
sessionSchema.index({ user: 1, vendor: 1 })
sessionSchema.index({ sessionId: 1 })
sessionSchema.index({ accessToken: 1 })
sessionSchema.index({ refreshToken: 1 })
sessionSchema.index({ isActive: 1, lastActivity: 1 })
sessionSchema.index({ isBlacklisted: 1 })

// Virtual for session duration
sessionSchema.virtual('duration').get(function() {
  if (this.logoutTime) {
    return this.logoutTime - this.loginTime
  }
  return Date.now() - this.loginTime
})

// Virtual for session age
sessionSchema.virtual('age').get(function() {
  return Date.now() - this.loginTime
})

// Instance method to update last activity
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date()
  return this.save()
}

// Instance method to deactivate session
sessionSchema.methods.deactivate = function() {
  this.isActive = false
  this.logoutTime = new Date()
  return this.save()
}

// Instance method to blacklist session
sessionSchema.methods.blacklist = function() {
  this.isActive = false
  this.isBlacklisted = true
  this.logoutTime = new Date()
  return this.save()
}

// Static method to find active sessions for user
sessionSchema.statics.findActiveSessions = function(userId, vendorId) {
  return this.find({
    user: userId,
    vendor: vendorId,
    isActive: true,
    isBlacklisted: false
  }).sort({ lastActivity: -1 })
}

// Static method to find expired sessions
sessionSchema.statics.findExpiredSessions = function(timeoutMs) {
  const cutoffTime = new Date(Date.now() - timeoutMs)
  return this.find({
    isActive: true,
    lastActivity: { $lt: cutoffTime }
  })
}

// Static method to clean up old sessions
sessionSchema.statics.cleanupOldSessions = function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000))
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isActive: false
  })
}

// Static method to count active sessions for user
sessionSchema.statics.countActiveSessions = function(userId, vendorId) {
  return this.countDocuments({
    user: userId,
    vendor: vendorId,
    isActive: true,
    isBlacklisted: false
  })
}

// Static method to find session by token
sessionSchema.statics.findByToken = function(token, tokenType = 'accessToken') {
  const query = {}
  query[tokenType] = token
  
  return this.findOne({
    ...query,
    isActive: true,
    isBlacklisted: false
  })
}

// Static method to blacklist token
sessionSchema.statics.blacklistToken = function(token, tokenType = 'accessToken') {
  const query = {}
  query[tokenType] = token
  
  return this.updateMany(
    { ...query },
    { 
      isBlacklisted: true,
      isActive: false,
      logoutTime: new Date()
    }
  )
}

// Pre-save middleware to generate session ID if not provided
sessionSchema.pre('save', function(next) {
  if (!this.sessionId) {
    this.sessionId = require('crypto').randomBytes(32).toString('hex')
  }
  next()
})

module.exports = mongoose.model('Session', sessionSchema) 