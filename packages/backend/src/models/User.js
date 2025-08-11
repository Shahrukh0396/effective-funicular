const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['super_admin', 'marketing_admin', 'vendor_admin', 'employee', 'client'],
    required: [true, 'Role is required'],
    default: 'client'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: function() {
      // Super admin and marketing admin don't need vendorId
      return !['super_admin', 'marketing_admin'].includes(this.role)
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_projects',
      'manage_tasks',
      'view_analytics',
      'manage_billing',
      'manage_vendors',
      'manage_platform',
      'time_tracking',
      'file_upload',
      'chat_access'
    ]
  }],
  profileImage: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    lastPasswordChange: { type: Date, default: Date.now },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    // NEW: Enhanced security fields from specification
    accountLockedUntil: Date,
    passwordExpiresAt: Date,
    passwordHistory: [String], // Store hashed passwords to prevent reuse
    mfaSecret: String,
    mfaEnabled: { type: Boolean, default: false },
    backupCodes: [String], // For MFA backup
    riskScore: { type: Number, default: 0, min: 0, max: 1 },
    suspiciousActivity: { type: Boolean, default: false },
    lastSuspiciousActivity: Date,
    ipWhitelist: [String], // Allowed IP addresses
    lastLoginLocation: String,
    lastLoginDevice: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.email
})

// Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ vendorId: 1, role: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Pre-save middleware to update lastPasswordChange
userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.security.lastPasswordChange = new Date()
  }
  next()
})

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate auth token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken')
  const config = require('../config')
  const crypto = require('crypto')
  
  const payload = {
    userId: this._id,
    email: this.email,
    role: this.role,
    vendorId: this.vendorId,
    portalType: 'employee',
    permissions: this.permissions || [],
    isSuperAccount: this.isSuperAccount || false,
    sessionId: crypto.randomBytes(32).toString('hex'),
    iat: Math.floor(Date.now() / 1000)
  }
  
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.tokens.accessToken.expiresIn,
    issuer: config.tokens.accessToken.issuer
  })
}

// Instance method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission)
}

// Instance method to check if user can access vendor
userSchema.methods.canAccessVendor = function(vendorId) {
  if (this.role === 'super_admin' || this.role === 'marketing_admin') {
    return true
  }
  return this.vendorId && this.vendorId.toString() === vendorId.toString()
}

// NEW: Password security methods
userSchema.methods.isPasswordExpired = function() {
  if (!this.security.passwordExpiresAt) return false
  return new Date() > this.security.passwordExpiresAt
}

userSchema.methods.isAccountLocked = function() {
  if (!this.security.accountLockedUntil) return false
  return new Date() < this.security.accountLockedUntil
}

userSchema.methods.canChangePassword = function(newPassword) {
  // Check password history (prevent reuse of last 5 passwords)
  const config = require('../config')
  const maxHistory = config.security.passwordHistoryCount || 5
  
  if (this.security.passwordHistory && this.security.passwordHistory.length >= maxHistory) {
    // Remove oldest password from history
    this.security.passwordHistory.shift()
  }
  
  // Check if new password matches any in history
  for (const oldPassword of this.security.passwordHistory || []) {
    if (bcrypt.compareSync(newPassword, oldPassword)) {
      return { allowed: false, reason: 'Password has been used recently' }
    }
  }
  
  return { allowed: true }
}

userSchema.methods.updatePasswordHistory = function(newHashedPassword) {
  if (!this.security.passwordHistory) {
    this.security.passwordHistory = []
  }
  
  this.security.passwordHistory.push(newHashedPassword)
  this.security.lastPasswordChange = new Date()
  
  // Set password expiration (90 days from now)
  const config = require('../config')
  const expirationDays = config.security.passwordExpirationDays || 90
  this.security.passwordExpiresAt = new Date(Date.now() + (expirationDays * 24 * 60 * 60 * 1000))
}

userSchema.methods.lockAccount = function(durationMinutes = 15) {
  this.security.accountLockedUntil = new Date(Date.now() + (durationMinutes * 60 * 1000))
  this.security.failedLoginAttempts = 0
  return this.save()
}

userSchema.methods.unlockAccount = function() {
  this.security.accountLockedUntil = null
  this.security.failedLoginAttempts = 0
  return this.save()
}

userSchema.methods.incrementFailedAttempts = function() {
  this.security.failedLoginAttempts = (this.security.failedLoginAttempts || 0) + 1
  
  const config = require('../config')
  const maxAttempts = config.security.maxLoginAttempts || 5
  
  if (this.security.failedLoginAttempts >= maxAttempts) {
    const lockoutDuration = config.security.accountLockoutDuration || 15
    return this.lockAccount(lockoutDuration)
  }
  
  return this.save()
}

userSchema.methods.resetFailedAttempts = function() {
  this.security.failedLoginAttempts = 0
  this.security.accountLockedUntil = null
  return this.save()
}

// Static method to get users by vendor
userSchema.statics.findByVendor = function(vendorId, options = {}) {
  const query = { vendorId }
  if (options.role) query.role = options.role
  if (options.isActive !== undefined) query.isActive = options.isActive
  
  return this.find(query).populate('vendorId')
}

// Static method to get active users count by vendor
userSchema.statics.getActiveUserCount = function(vendorId) {
  return this.countDocuments({ vendorId, isActive: true })
}

// NEW: Security-related static methods
userSchema.statics.findLockedAccounts = function() {
  return this.find({
    'security.accountLockedUntil': { $gt: new Date() }
  }).select('email firstName lastName role vendorId security.accountLockedUntil')
}

userSchema.statics.findExpiredPasswords = function() {
  return this.find({
    'security.passwordExpiresAt': { $lt: new Date() },
    isActive: true
  }).select('email firstName lastName role vendorId security.passwordExpiresAt')
}

userSchema.statics.findSuspiciousUsers = function() {
  return this.find({
    'security.suspiciousActivity': true,
    isActive: true
  }).select('email firstName lastName role vendorId security.riskScore security.lastSuspiciousActivity')
}

userSchema.statics.findUsersNeedingPasswordChange = function(daysWarning = 7) {
  const warningDate = new Date(Date.now() + (daysWarning * 24 * 60 * 60 * 1000))
  return this.find({
    'security.passwordExpiresAt': { $lt: warningDate },
    'security.passwordExpiresAt': { $gt: new Date() },
    isActive: true
  }).select('email firstName lastName role vendorId security.passwordExpiresAt')
}

userSchema.statics.getSecurityStats = function(vendorId = null) {
  const match = { isActive: true }
  if (vendorId) match.vendorId = vendorId
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        lockedAccounts: {
          $sum: {
            $cond: [
              { $gt: ['$security.accountLockedUntil', new Date()] },
              1,
              0
            ]
          }
        },
        expiredPasswords: {
          $sum: {
            $cond: [
              { $lt: ['$security.passwordExpiresAt', new Date()] },
              1,
              0
            ]
          }
        },
        suspiciousUsers: {
          $sum: {
            $cond: ['$security.suspiciousActivity', 1, 0]
          }
        },
        mfaEnabled: {
          $sum: {
            $cond: ['$security.mfaEnabled', 1, 0]
          }
        },
        avgRiskScore: { $avg: '$security.riskScore' }
      }
    }
  ])
}

module.exports = mongoose.model('User', userSchema) 