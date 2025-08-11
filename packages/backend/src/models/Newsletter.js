const mongoose = require('mongoose')

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed', 'pending', 'bounced'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: ['website', 'popup', 'landing_page', 'blog', 'social', 'referral'],
    default: 'website'
  },
  interests: [{
    type: String,
    enum: [
      'product_updates',
      'industry_news',
      'case_studies',
      'tutorials',
      'webinars',
      'white_papers',
      'company_news'
    ]
  }],
  preferences: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    },
    format: {
      type: String,
      enum: ['html', 'text'],
      default: 'html'
    },
    timezone: String,
    language: {
      type: String,
      default: 'en'
    }
  },
  marketingData: {
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,
    referrer: String,
    landingPage: String,
    userAgent: String,
    ipAddress: String
  },
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
      }
    },
    consentDate: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  },
  emailService: {
    provider: {
      type: String,
      enum: ['sendgrid', 'mailchimp', 'convertkit', 'custom'],
      default: 'sendgrid'
    },
    subscriberId: String,
    listId: String,
    tags: [String]
  },
  engagement: {
    totalOpens: {
      type: Number,
      default: 0
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    lastOpenDate: Date,
    lastClickDate: Date,
    openRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    clickRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  subscriptionHistory: [{
    action: {
      type: String,
      enum: ['subscribed', 'unsubscribed', 'resubscribed', 'bounced', 'complained'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    reason: String,
    ipAddress: String,
    userAgent: String
  }],
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

// Virtual for full name
newsletterSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`
  }
  return this.firstName || this.lastName || 'Unknown'
})

// Virtual for subscription age in days
newsletterSchema.virtual('subscriptionAge').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24))
})

// Virtual for engagement score
newsletterSchema.virtual('engagementScore').get(function() {
  const score = (this.engagement.openRate * 0.6) + (this.engagement.clickRate * 0.4)
  return Math.round(score)
})

// Indexes for performance
newsletterSchema.index({ email: 1 })
newsletterSchema.index({ status: 1 })
newsletterSchema.index({ source: 1 })
newsletterSchema.index({ createdAt: 1 })
newsletterSchema.index({ 'engagement.openRate': -1 })

// Pre-save middleware to update timestamps
newsletterSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Instance method to subscribe
newsletterSchema.methods.subscribe = function() {
  this.status = 'subscribed'
  this.subscriptionHistory.push({
    action: 'subscribed',
    date: new Date()
  })
  return this.save()
}

// Instance method to unsubscribe
newsletterSchema.methods.unsubscribe = function(reason = '') {
  this.status = 'unsubscribed'
  this.subscriptionHistory.push({
    action: 'unsubscribed',
    reason,
    date: new Date()
  })
  return this.save()
}

// Instance method to update engagement
newsletterSchema.methods.updateEngagement = function(type, count = 1) {
  if (type === 'open') {
    this.engagement.totalOpens += count
    this.engagement.lastOpenDate = new Date()
  } else if (type === 'click') {
    this.engagement.totalClicks += count
    this.engagement.lastClickDate = new Date()
  }
  
  // Calculate rates (simplified - in real app, this would be more complex)
  if (this.engagement.totalOpens > 0) {
    this.engagement.openRate = Math.min(100, (this.engagement.totalOpens / 10) * 100)
  }
  if (this.engagement.totalClicks > 0) {
    this.engagement.clickRate = Math.min(100, (this.engagement.totalClicks / this.engagement.totalOpens) * 100)
  }
  
  return this.save()
}

// Static method to find active subscribers
newsletterSchema.statics.findActive = function() {
  return this.find({ status: 'subscribed' }).sort({ createdAt: -1 })
}

// Static method to find engaged subscribers
newsletterSchema.statics.findEngaged = function(minOpenRate = 20) {
  return this.find({
    status: 'subscribed',
    'engagement.openRate': { $gte: minOpenRate }
  }).sort({ 'engagement.openRate': -1 })
}

// Static method to get subscription statistics
newsletterSchema.statics.getSubscriptionStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSubscribers: { $sum: 1 },
        activeSubscribers: {
          $sum: { $cond: [{ $eq: ['$status', 'subscribed'] }, 1, 0] }
        },
        unsubscribed: {
          $sum: { $cond: [{ $eq: ['$status', 'unsubscribed'] }, 1, 0] }
        },
        averageOpenRate: { $avg: '$engagement.openRate' },
        averageClickRate: { $avg: '$engagement.clickRate' }
      }
    }
  ])
  
  return stats[0] || {
    totalSubscribers: 0,
    activeSubscribers: 0,
    unsubscribed: 0,
    averageOpenRate: 0,
    averageClickRate: 0
  }
}

// Static method to find subscribers by source
newsletterSchema.statics.findBySource = function(source) {
  return this.find({ source, status: 'subscribed' }).sort({ createdAt: -1 })
}

// Static method to find inactive subscribers
newsletterSchema.statics.findInactive = function(days = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return this.find({
    status: 'subscribed',
    $or: [
      { 'engagement.lastOpenDate': { $lt: cutoffDate } },
      { 'engagement.lastOpenDate': { $exists: false } }
    ]
  })
}

module.exports = mongoose.model('Newsletter', newsletterSchema) 