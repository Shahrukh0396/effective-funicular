const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const userSchema = new mongoose.Schema({
  // Basic information
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
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Multi-tenant vendor association
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  
  // Role and permissions
  role: {
    type: String,
    enum: ['client', 'employee', 'admin', 'super_admin'],
    default: 'client'
  },
  isSuperAccount: {
    type: Boolean,
    default: false
  },
  superAccountCreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  superAccountCreatedAt: {
    type: Date
  },
  permissions: [{
    type: String,
    enum: [
      'read_projects',
      'write_projects',
      'delete_projects',
      'read_tasks',
      'write_tasks',
      'delete_tasks',
      'manage_users',
      'manage_billing',
      'view_analytics'
    ]
  }],
  
  // Profile information
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Subscription and billing
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'inactive'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // GDPR Compliance Fields
  gdpr: {
    consent: {
      marketing: {
        type: Boolean,
        default: false,
        required: true
      },
      analytics: {
        type: Boolean,
        default: false,
        required: true
      },
      necessary: {
        type: Boolean,
        default: true,
        required: true
      },
      thirdParty: {
        type: Boolean,
        default: false,
        required: true
      }
    },
    consentHistory: [{
      type: {
        type: String,
        enum: ['marketing', 'analytics', 'necessary', 'thirdParty']
      },
      granted: Boolean,
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String
    }],
    dataRetention: {
      marketingData: {
        type: Date,
        default: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years
      },
      analyticsData: {
        type: Date,
        default: () => new Date(Date.now() + 1 * 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    },
    rightToBeForgotten: {
      requested: {
        type: Boolean,
        default: false
      },
      requestedAt: Date,
      processedAt: Date,
      dataAnonymized: {
        type: Boolean,
        default: false
      }
    },
    dataPortability: {
      requested: {
        type: Boolean,
        default: false
      },
      requestedAt: Date,
      processedAt: Date,
      downloadUrl: String,
      downloadExpires: Date
    }
  },
  
  // Timestamps
  lastLogin: Date,
  lastActivity: Date
}, {
  timestamps: true
})

// Indexes
userSchema.index({ vendor: 1 })
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ 'subscription.status': 1 })
userSchema.index({ 'gdpr.rightToBeForgotten.requested': 1 })

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for isSubscribed
userSchema.virtual('isSubscribed').get(function() {
  return this.subscription.status === 'active'
})

// Virtual for isSuperAccount
userSchema.virtual('isSuperUser').get(function() {
  return this.role === 'super_admin' || this.isSuperAccount
})

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

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate auth token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      role: this.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

// Instance method to get public profile (GDPR compliant)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.emailVerificationToken
  delete userObject.emailVerificationExpires
  delete userObject.passwordResetToken
  delete userObject.passwordResetExpires
  delete userObject.gdpr
  return userObject
}

// GDPR: Method to update consent
userSchema.methods.updateConsent = function(consentType, granted, ipAddress, userAgent) {
  this.gdpr.consent[consentType] = granted
  this.gdpr.consentHistory.push({
    type: consentType,
    granted,
    ipAddress,
    userAgent,
    timestamp: new Date()
  })
  return this.save()
}

// GDPR: Method to request data portability
userSchema.methods.requestDataPortability = function() {
  this.gdpr.dataPortability.requested = true
  this.gdpr.dataPortability.requestedAt = new Date()
  return this.save()
}

// GDPR: Method to request right to be forgotten
userSchema.methods.requestRightToBeForgotten = function() {
  this.gdpr.rightToBeForgotten.requested = true
  this.gdpr.rightToBeForgotten.requestedAt = new Date()
  return this.save()
}

// GDPR: Method to anonymize data
userSchema.methods.anonymizeData = function() {
  this.firstName = 'Anonymous'
  this.lastName = 'User'
  this.email = `anonymous_${this._id}@deleted.com`
  this.phone = null
  this.company = null
  this.position = null
  this.bio = null
  this.avatar = null
  this.gdpr.rightToBeForgotten.processedAt = new Date()
  this.gdpr.rightToBeForgotten.dataAnonymized = true
  this.isActive = false
  return this.save()
}

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Static method to find users with expired data retention
userSchema.statics.findExpiredData = function() {
  const now = new Date()
  return this.find({
    $or: [
      { 'gdpr.dataRetention.marketingData': { $lt: now } },
      { 'gdpr.dataRetention.analyticsData': { $lt: now } }
    ]
  })
}

module.exports = mongoose.model('User', userSchema) 