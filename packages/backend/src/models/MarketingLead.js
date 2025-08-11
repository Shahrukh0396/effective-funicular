const mongoose = require('mongoose')

const marketingLeadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
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
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social', 'ads', 'email', 'demo_request', 'contact_form'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost', 'nurturing'],
    default: 'new'
  },
  interests: [{
    type: String,
    enum: [
      'white_label',
      'project_management',
      'time_tracking',
      'billing',
      'analytics',
      'api_access',
      'custom_development',
      'consulting',
      'training'
    ]
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  convertedToVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  leadScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  contactHistory: [{
    method: {
      type: String,
      enum: ['email', 'phone', 'meeting', 'demo'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    outcome: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    }
  }],
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
  preferences: {
    contactMethod: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'email'
    },
    timezone: String,
    language: {
      type: String,
      default: 'en'
    },
    newsletter: {
      type: Boolean,
      default: false
    }
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
marketingLeadSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for lead age in days
marketingLeadSchema.virtual('leadAge').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24))
})

// Virtual for last contact age
marketingLeadSchema.virtual('lastContactAge').get(function() {
  if (!this.contactHistory || this.contactHistory.length === 0) return null
  const lastContact = this.contactHistory[this.contactHistory.length - 1]
  return Math.floor((new Date() - lastContact.date) / (1000 * 60 * 60 * 24))
})

// Indexes for performance
marketingLeadSchema.index({ email: 1 })
marketingLeadSchema.index({ status: 1 })
marketingLeadSchema.index({ source: 1 })
marketingLeadSchema.index({ assignedTo: 1 })
marketingLeadSchema.index({ createdAt: 1 })
marketingLeadSchema.index({ leadScore: -1 })

// Pre-save middleware to update timestamps
marketingLeadSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Instance method to add contact history
marketingLeadSchema.methods.addContactHistory = function(method, notes, outcome = 'neutral') {
  this.contactHistory.push({
    method,
    notes,
    outcome,
    date: new Date()
  })
  return this.save()
}

// Instance method to update lead score
marketingLeadSchema.methods.updateLeadScore = function(score) {
  this.leadScore = Math.max(0, Math.min(100, score))
  return this.save()
}

// Instance method to convert to vendor
marketingLeadSchema.methods.convertToVendor = function(vendorId) {
  this.status = 'converted'
  this.convertedToVendor = vendorId
  return this.save()
}

// Static method to find qualified leads
marketingLeadSchema.statics.findQualified = function() {
  return this.find({
    status: { $in: ['new', 'contacted', 'nurturing'] },
    leadScore: { $gte: 50 }
  }).sort({ leadScore: -1 })
}

// Static method to get lead statistics
marketingLeadSchema.statics.getLeadStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalLeads: { $sum: 1 },
        newLeads: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        },
        qualifiedLeads: {
          $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] }
        },
        convertedLeads: {
          $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
        },
        averageLeadScore: { $avg: '$leadScore' }
      }
    }
  ])
  
  return stats[0] || {
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    averageLeadScore: 0
  }
}

// Static method to find leads by source
marketingLeadSchema.statics.findBySource = function(source) {
  return this.find({ source }).sort({ createdAt: -1 })
}

// Static method to find leads needing follow-up
marketingLeadSchema.statics.findNeedingFollowUp = function(days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return this.find({
    status: { $in: ['new', 'contacted', 'nurturing'] },
    $or: [
      { contactHistory: { $size: 0 } },
      { 'contactHistory.date': { $lt: cutoffDate } }
    ]
  }).sort({ leadScore: -1 })
}

module.exports = mongoose.model('MarketingLead', marketingLeadSchema) 