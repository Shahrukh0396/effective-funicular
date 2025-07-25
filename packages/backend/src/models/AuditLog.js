const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  // Event identification
  event: {
    type: String,
    required: true,
    enum: [
      // Authentication events
      'user.login.success',
      'user.login.failed',
      'user.login.locked',
      'user.logout.success',
      'user.logout.timeout',
      'user.logout.forced',
      
      // User management events
      'user.created',
      'user.updated',
      'user.deleted',
      'user.activated',
      'user.deactivated',
      
      // Password events
      'user.password.change',
      'user.password.reset',
      'user.password.reset.request',
      'user.password.expired',
      
      // MFA events
      'user.mfa.enable',
      'user.mfa.disable',
      'user.mfa.verify',
      'user.mfa.failed',
      
      // Session events
      'user.session.create',
      'user.session.destroy',
      'user.session.timeout',
      'user.session.invalidate',
      
      // Security events
      'security.suspicious.activity',
      'security.brute_force.attempt',
      'security.token.compromise',
      'security.account.locked',
      'security.account.unlocked',
      
      // Portal access events
      'portal.access.granted',
      'portal.access.denied',
      'portal.switch',
      
      // Vendor events
      'vendor.access.granted',
      'vendor.access.denied',
      'vendor.context.detected'
    ]
  },
  
  // User and vendor context
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // userId is not required for failed login events where user doesn't exist
      return this.event !== 'user.login.failed'
    }
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: function() {
      // vendorId is not required for failed login events where user doesn't exist
      return this.event !== 'user.login.failed'
    }
  },
  
  // Portal context
  portalType: {
    type: String,
    enum: ['client', 'employee', 'admin', 'super_admin'],
    required: true
  },
  
  // Session information
  sessionId: String,
  
  // Request information
  request: {
    ipAddress: String,
    userAgent: String,
    method: String,
    url: String,
    headers: mongoose.Schema.Types.Mixed
  },
  
  // Location information
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  
  // Device information
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    browser: String,
    os: String,
    screenResolution: String
  },
  
  // Security metadata
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
    },
    failedAttempts: {
      type: Number,
      default: 0
    }
  },
  
  // Event metadata
  metadata: {
    reason: String,
    details: mongoose.Schema.Types.Mixed,
    errorCode: String,
    errorMessage: String,
    duration: Number, // milliseconds
    success: {
      type: Boolean,
      default: true
    }
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for performance and querying
auditLogSchema.index({ event: 1, timestamp: -1 })
auditLogSchema.index({ userId: 1, timestamp: -1 })
auditLogSchema.index({ vendorId: 1, timestamp: -1 })
auditLogSchema.index({ portalType: 1, timestamp: -1 })
auditLogSchema.index({ 'request.ipAddress': 1, timestamp: -1 })
auditLogSchema.index({ 'security.riskScore': 1, timestamp: -1 })
auditLogSchema.index({ 'security.suspiciousActivity': 1, timestamp: -1 })

// Static method to log authentication event
auditLogSchema.statics.logAuthEvent = function(data) {
  return this.create({
    event: data.event,
    userId: data.userId,
    vendorId: data.vendorId,
    portalType: data.portalType,
    sessionId: data.sessionId,
    request: data.request,
    location: data.location,
    device: data.device,
    security: data.security,
    metadata: data.metadata
  })
}

// Static method to find suspicious activities
auditLogSchema.statics.findSuspiciousActivities = function(timeWindow = 24 * 60 * 60 * 1000) {
  const cutoffTime = new Date(Date.now() - timeWindow)
  return this.find({
    timestamp: { $gte: cutoffTime },
    'security.suspiciousActivity': true
  }).sort({ timestamp: -1 })
}

// Static method to find failed login attempts
auditLogSchema.statics.findFailedLogins = function(userId, timeWindow = 15 * 60 * 1000) {
  const cutoffTime = new Date(Date.now() - timeWindow)
  return this.find({
    userId: userId,
    event: 'user.login.failed',
    timestamp: { $gte: cutoffTime }
  }).sort({ timestamp: -1 })
}

// Static method to find user activity
auditLogSchema.statics.findUserActivity = function(userId, limit = 100) {
  return this.find({
    userId: userId
  })
  .sort({ timestamp: -1 })
  .limit(limit)
}

// Static method to find vendor activity
auditLogSchema.statics.findVendorActivity = function(vendorId, limit = 100) {
  return this.find({
    vendorId: vendorId
  })
  .sort({ timestamp: -1 })
  .limit(limit)
}

// Static method to get security statistics
auditLogSchema.statics.getSecurityStats = function(timeWindow = 24 * 60 * 60 * 1000) {
  const cutoffTime = new Date(Date.now() - timeWindow)
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoffTime }
      }
    },
    {
      $group: {
        _id: '$event',
        count: { $sum: 1 },
        avgRiskScore: { $avg: '$security.riskScore' },
        suspiciousCount: {
          $sum: { $cond: ['$security.suspiciousActivity', 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ])
}

// Static method to clean up old audit logs
auditLogSchema.statics.cleanupOldLogs = function(daysOld = 90) {
  const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000))
  return this.deleteMany({
    timestamp: { $lt: cutoffDate }
  })
}

// Instance method to mark as suspicious
auditLogSchema.methods.markAsSuspicious = function(reason) {
  this.security.suspiciousActivity = true
  this.metadata.reason = reason
  return this.save()
}

module.exports = mongoose.model('AuditLog', auditLogSchema) 