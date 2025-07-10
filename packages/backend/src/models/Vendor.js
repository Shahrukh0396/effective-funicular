const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const vendorSchema = new mongoose.Schema({
  // Basic vendor information
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Company slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
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
    minlength: [8, 'Password must be at least 8 characters long']
  },
  
  // Contact information
  contactPerson: {
    firstName: {
      type: String,
      required: [true, 'Contact first name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Contact last name is required'],
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
  },
  
  // Company details
  industry: {
    type: String,
    enum: [
      'digital-marketing',
      'web-development',
      'design-agency',
      'consulting',
      'software-development',
      'content-creation',
      'seo-agency',
      'social-media',
      'ecommerce',
      'other'
    ],
    default: 'other'
  },
  companySize: {
    type: String,
    enum: ['1-5', '6-10', '11-25', '26-50', '51-100', '100+'],
    default: '1-5'
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // White-label branding
  branding: {
    logo: {
      type: String,
      default: null
    },
    logoDark: {
      type: String,
      default: null
    },
    favicon: {
      type: String,
      default: null
    },
    primaryColor: {
      type: String,
      default: '#3B82F6',
      match: [/^#[0-9A-F]{6}$/i, 'Primary color must be a valid hex color']
    },
    secondaryColor: {
      type: String,
      default: '#1F2937',
      match: [/^#[0-9A-F]{6}$/i, 'Secondary color must be a valid hex color']
    },
    companyName: {
      type: String,
      default: null // If null, use vendor.companyName
    },
    tagline: {
      type: String,
      maxlength: [200, 'Tagline cannot exceed 200 characters']
    },
    customDomain: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  
  // Subscription and billing
  subscription: {
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'starter'
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'past_due', 'cancelled', 'suspended'],
      default: 'trial'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
    }
  },
  
  // Usage limits and quotas
  limits: {
    agents: {
      type: Number,
      default: 5
    },
    contractors: {
      type: Number,
      default: 10
    },
    projects: {
      type: Number,
      default: 10
    },
    storage: {
      type: Number,
      default: 10 * 1024 * 1024 * 1024 // 10GB in bytes
    }
  },
  
  // Current usage
  usage: {
    agents: {
      type: Number,
      default: 0
    },
    contractors: {
      type: Number,
      default: 0
    },
    projects: {
      type: Number,
      default: 0
    },
    storage: {
      type: Number,
      default: 0
    }
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
  
  // Onboarding status
  onboarding: {
    step: {
      type: String,
      enum: ['company-info', 'branding', 'team-setup', 'first-project', 'completed'],
      default: 'company-info'
    },
    completedSteps: [{
      type: String
    }],
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  
  // Settings and preferences
  settings: {
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
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    }
  },
  
  // Analytics and metrics
  metrics: {
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalProjects: {
      type: Number,
      default: 0
    },
    totalClients: {
      type: Number,
      default: 0
    },
    averageProjectValue: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Timestamps
  lastLogin: Date,
  lastActivity: Date
}, {
  timestamps: true
})

// Indexes
vendorSchema.index({ slug: 1 })
vendorSchema.index({ email: 1 })
vendorSchema.index({ 'subscription.status': 1 })
vendorSchema.index({ 'onboarding.step': 1 })
vendorSchema.index({ industry: 1 })

// Virtual for full contact name
vendorSchema.virtual('contactFullName').get(function() {
  return `${this.contactPerson.firstName} ${this.contactPerson.lastName}`
})

// Virtual for isSubscribed
vendorSchema.virtual('isSubscribed').get(function() {
  return this.subscription.status === 'active'
})

// Virtual for isInTrial
vendorSchema.virtual('isInTrial').get(function() {
  return this.subscription.status === 'trial' && this.subscription.trialEndsAt > new Date()
})

// Virtual for trialDaysLeft
vendorSchema.virtual('trialDaysLeft').get(function() {
  if (!this.isInTrial) return 0
  const now = new Date()
  const trialEnd = this.subscription.trialEndsAt
  const diffTime = trialEnd - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for usage percentage
vendorSchema.virtual('usagePercentage').get(function() {
  return {
    agents: Math.round((this.usage.agents / this.limits.agents) * 100),
    contractors: Math.round((this.usage.contractors / this.limits.contractors) * 100),
    projects: Math.round((this.usage.projects / this.limits.projects) * 100),
    storage: Math.round((this.usage.storage / this.limits.storage) * 100)
  }
})

// Pre-save middleware to hash password
vendorSchema.pre('save', async function(next) {
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
vendorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate auth token
vendorSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken')
  const config = require('../config')
  
  return jwt.sign(
    { 
      vendorId: this._id,
      slug: this.slug,
      email: this.email,
      role: 'vendor'
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

// Instance method to get public profile
vendorSchema.methods.getPublicProfile = function() {
  const vendorObject = this.toObject()
  delete vendorObject.password
  delete vendorObject.emailVerificationToken
  delete vendorObject.emailVerificationExpires
  delete vendorObject.subscription.stripeCustomerId
  delete vendorObject.subscription.stripeSubscriptionId
  return vendorObject
}

// Instance method to check if usage limit exceeded
vendorSchema.methods.isLimitExceeded = function(resourceType) {
  return this.usage[resourceType] >= this.limits[resourceType]
}

// Instance method to increment usage
vendorSchema.methods.incrementUsage = function(resourceType, amount = 1) {
  this.usage[resourceType] += amount
  return this.save()
}

// Instance method to decrement usage
vendorSchema.methods.decrementUsage = function(resourceType, amount = 1) {
  this.usage[resourceType] = Math.max(0, this.usage[resourceType] - amount)
  return this.save()
}

// Static method to find by slug
vendorSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() })
}

// Static method to find by email
vendorSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Static method to find active vendors
vendorSchema.statics.findActive = function() {
  return this.find({ 
    isActive: true,
    'subscription.status': { $in: ['trial', 'active'] }
  })
}

module.exports = mongoose.model('Vendor', vendorSchema) 