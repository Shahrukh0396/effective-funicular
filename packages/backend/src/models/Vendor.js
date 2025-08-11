const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters']
  },
  domain: {
    type: String,
    unique: true,
    required: [true, 'Domain is required'],
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/, 'Please enter a valid subdomain']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    default: function() {
      return this.domain
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subscriptionTier: {
    type: String,
    enum: ['starter', 'professional', 'enterprise', 'custom'],
    default: 'starter',
    required: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'suspended', 'cancelled', 'trial', 'pending'],
    default: 'trial'
  },
  billingInfo: {
    stripeCustomerId: {
      type: String,
      sparse: true
    },
    subscriptionId: {
      type: String,
      sparse: true
    },
    nextBillingDate: {
      type: Date
    },
    monthlyRevenue: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'invoice', 'bank-transfer'],
      default: 'stripe'
    },
    invoiceNumber: {
      type: String,
      sparse: true
    },
    contractLength: {
      type: String,
      enum: ['monthly', 'annual', 'biennial'],
      default: 'monthly'
    }
  },
  settings: {
    branding: {
      logo: {
        type: String,
        default: null
      },
      primaryColor: {
        type: String,
        default: '#3B82F6',
        match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
      },
      secondaryColor: {
        type: String,
        default: '#8B5CF6',
        match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
      },
      companyName: {
        type: String,
        default: null
      },
      customDomain: {
        type: String,
        default: null
      },
      whiteLabel: {
        type: Boolean,
        default: false
      }
    },
    features: [{
      type: String,
      enum: [
        'projects',
        'tasks',
        'time_tracking',
        'chat',
        'file_upload',
        'analytics',
        'billing',
        'white_label',
        'api_access',
        'custom_branding',
        'dedicated_support',
        'custom_development'
      ]
    }],
    integrations: {
      slack: {
        enabled: { type: Boolean, default: false },
        webhookUrl: String,
        channel: String
      },
      github: {
        enabled: { type: Boolean, default: false },
        accessToken: String,
        repositories: [String]
      },
      jira: {
        enabled: { type: Boolean, default: false },
        baseUrl: String,
        username: String,
        apiToken: String
      },
      zapier: {
        enabled: { type: Boolean, default: false },
        webhookUrl: String
      }
    },
    notifications: {
      email: {
        projectUpdates: { type: Boolean, default: true },
        taskAssignments: { type: Boolean, default: true },
        billingAlerts: { type: Boolean, default: true },
        systemMaintenance: { type: Boolean, default: true }
      },
      push: {
        enabled: { type: Boolean, default: true },
        projectUpdates: { type: Boolean, default: true },
        taskAssignments: { type: Boolean, default: true }
      }
    },
    security: {
      twoFactorRequired: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 24 }, // hours
      maxLoginAttempts: { type: Number, default: 5 },
      passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireUppercase: { type: Boolean, default: true },
        requireLowercase: { type: Boolean, default: true },
        requireNumbers: { type: Boolean, default: true },
        requireSpecialChars: { type: Boolean, default: true }
      }
    }
  },
  contactInfo: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    primaryContact: {
      name: String,
      email: String,
      phone: String,
      position: String
    }
  },
  limits: {
    maxUsers: {
      type: Number,
      default: 10,
      min: 1
    },
    maxProjects: {
      type: Number,
      default: 5,
      min: 1
    },
    maxStorage: {
      type: Number,
      default: 10, // GB
      min: 1
    },
    maxApiCalls: {
      type: Number,
      default: 1000,
      min: 0
    }
  },
  usage: {
    currentUsers: {
      type: Number,
      default: 0,
      min: 0
    },
    currentProjects: {
      type: Number,
      default: 0,
      min: 0
    },
    currentStorage: {
      type: Number,
      default: 0, // GB
      min: 0
    },
    apiCallsThisMonth: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  analytics: {
    totalRevenue: {
      type: Number,
      default: 0
    },
    activeProjects: {
      type: Number,
      default: 0
    },
    completedProjects: {
      type: Number,
      default: 0
    },
    averageProjectDuration: {
      type: Number,
      default: 0 // days
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  onboarding: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending'
    },
    completedSteps: [{
      step: String,
      completedAt: Date
    }],
    currentStep: {
      type: String,
      default: 'company_info'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trialEndsAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for full domain
vendorSchema.virtual('fullDomain').get(function() {
  return `${this.domain}.linton.com`
})

// Virtual for custom domain or subdomain
vendorSchema.virtual('displayDomain').get(function() {
  return this.settings.branding.customDomain || this.fullDomain
})

// Virtual for subscription status
vendorSchema.virtual('isSubscriptionActive').get(function() {
  return ['active', 'trial'].includes(this.subscriptionStatus)
})

// Virtual for trial status
vendorSchema.virtual('isInTrial').get(function() {
  return this.subscriptionStatus === 'trial' && this.trialEndsAt > new Date()
})

// Virtual for usage percentage
vendorSchema.virtual('usagePercentage').get(function() {
  const usersPercent = (this.usage.currentUsers / this.limits.maxUsers) * 100
  const projectsPercent = (this.usage.currentProjects / this.limits.maxProjects) * 100
  const storagePercent = (this.usage.currentStorage / this.limits.maxStorage) * 100
  
  return {
    users: Math.min(usersPercent, 100),
    projects: Math.min(projectsPercent, 100),
    storage: Math.min(storagePercent, 100)
  }
})

// Indexes for performance
vendorSchema.index({ domain: 1 })
vendorSchema.index({ subscriptionStatus: 1 })
vendorSchema.index({ subscriptionTier: 1 })
vendorSchema.index({ isActive: 1 })
vendorSchema.index({ 'billingInfo.stripeCustomerId': 1 })
vendorSchema.index({ createdAt: 1 })

// Pre-save middleware to update timestamps
vendorSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Instance method to check if vendor can add user
vendorSchema.methods.canAddUser = function() {
  return this.usage.currentUsers < this.limits.maxUsers
}

// Instance method to check if vendor can add project
vendorSchema.methods.canAddProject = function() {
  return this.usage.currentProjects < this.limits.maxProjects
}

// Instance method to check if vendor can use storage
vendorSchema.methods.canUseStorage = function(sizeInGB) {
  return (this.usage.currentStorage + sizeInGB) <= this.limits.maxStorage
}

// Instance method to check if vendor has feature
vendorSchema.methods.hasFeature = function(feature) {
  return this.settings.features.includes(feature)
}

// Instance method to check if vendor is white-label
vendorSchema.methods.isWhiteLabel = function() {
  return this.settings.branding.whiteLabel
}

// Instance method to get subscription price
vendorSchema.methods.getSubscriptionPrice = function() {
  const prices = {
    starter: 49,
    professional: 99,
    enterprise: 199,
    custom: 0 // Custom pricing
  }
  
  const basePrice = prices[this.subscriptionTier]
  const multiplier = this.billingInfo.contractLength === 'annual' ? 0.8 : 1
  const multiplier2 = this.billingInfo.contractLength === 'biennial' ? 0.7 : 1
  
  return Math.round(basePrice * multiplier * multiplier2)
}

// Static method to find active vendors
vendorSchema.statics.findActive = function() {
  return this.find({ 
    isActive: true, 
    subscriptionStatus: { $in: ['active', 'trial'] } 
  })
}

// Static method to find vendors by tier
vendorSchema.statics.findByTier = function(tier) {
  return this.find({ subscriptionTier: tier, isActive: true })
}

// Static method to get platform metrics
vendorSchema.statics.getPlatformMetrics = async function() {
  const metrics = await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
        totalRevenue: { $sum: '$analytics.totalRevenue' },
        activeVendors: {
          $sum: {
            $cond: [
              { $in: ['$subscriptionStatus', ['active', 'trial']] },
              1,
              0
            ]
          }
        },
        averageSatisfaction: { $avg: '$analytics.customerSatisfaction' }
      }
    }
  ])
  
  return metrics[0] || {
    totalVendors: 0,
    totalRevenue: 0,
    activeVendors: 0,
    averageSatisfaction: 0
  }
}

// Static method to find vendors with expiring trials
vendorSchema.statics.findExpiringTrials = function(days = 3) {
  const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return this.find({
    subscriptionStatus: 'trial',
    trialEndsAt: { $lte: threshold },
    isActive: true
  })
}

module.exports = mongoose.model('Vendor', vendorSchema) 