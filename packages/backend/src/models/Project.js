const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  // Multi-tenant vendor association
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  
  // Basic project information
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [1000, 'Project description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  
  // Project details
  category: {
    type: String,
    enum: ['web-development', 'mobile-app', 'design', 'consulting', 'maintenance', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'review', 'testing', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  },
  
  // Timeline
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  actualStartDate: Date,
  actualEndDate: Date,
  
  // Progress tracking
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Budget and billing
  budget: {
    type: Number,
    min: 0,
    default: 0
  },
  actualCost: {
    type: Number,
    min: 0,
    default: 0
  },
  billingType: {
    type: String,
    enum: ['fixed', 'hourly', 'monthly'],
    default: 'fixed'
  },
  hourlyRate: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Team and client
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['developer', 'designer', 'tester', 'analyst', 'manager'],
      default: 'developer'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Project settings
  settings: {
    allowClientComments: {
      type: Boolean,
      default: true
    },
    allowClientFileUploads: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoNotifyClient: {
      type: Boolean,
      default: true
    }
  },
  
  // Files and attachments
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tags and labels
  tags: [{
    type: String,
    trim: true
  }],
  
  // Custom fields
  customFields: [{
    name: String,
    value: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean'],
      default: 'text'
    }
  }],
  
  // Metrics and analytics
  metrics: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    }
  },
  
  // Timestamps
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes
projectSchema.index({ vendor: 1 })
projectSchema.index({ client: 1 })
projectSchema.index({ status: 1 })
projectSchema.index({ 'team.user': 1 })
projectSchema.index({ startDate: 1, endDate: 1 })
projectSchema.index({ tags: 1 })

// Virtual for isOverdue
projectSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false
  return new Date() > this.endDate
})

// Virtual for isActive
projectSchema.virtual('isActive').get(function() {
  return ['planning', 'in-progress', 'review', 'testing'].includes(this.status)
})

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (this.metrics.totalTasks === 0) return 0
  return Math.round((this.metrics.completedTasks / this.metrics.totalTasks) * 100)
})

// Pre-save middleware to update metrics
projectSchema.pre('save', function(next) {
  this.lastActivity = new Date()
  next()
})

// Static method to find active projects
projectSchema.statics.findActive = function() {
  return this.find({
    status: { $in: ['planning', 'in-progress', 'review', 'testing'] }
  })
}

// Static method to find projects by client
projectSchema.statics.findByClient = function(clientId) {
  return this.find({ client: clientId }).populate('team.user', 'firstName lastName email avatar')
}

// Instance method to add team member
projectSchema.methods.addTeamMember = function(userId, role = 'developer') {
  const existingMember = this.team.find(member => member.user.toString() === userId.toString())
  if (existingMember) {
    existingMember.role = role
  } else {
    this.team.push({ user: userId, role })
  }
  return this.save()
}

// Instance method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  this.team = this.team.filter(member => member.user.toString() !== userId.toString())
  return this.save()
}

// Instance method to update progress
projectSchema.methods.updateProgress = function() {
  if (this.metrics.totalTasks > 0) {
    this.progress = Math.round((this.metrics.completedTasks / this.metrics.totalTasks) * 100)
  }
  return this.save()
}

module.exports = mongoose.model('Project', projectSchema) 