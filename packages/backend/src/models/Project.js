const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Project description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: [
      'web_development',
      'mobile_app',
      'consulting',
      'design',
      'marketing',
      'ecommerce',
      'saas_development',
      'maintenance',
      'support',
      'training',
      'other'
    ],
    required: [true, 'Project type is required']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  budget: {
    estimated: {
      type: Number,
      required: [true, 'Estimated budget is required'],
      min: [0, 'Estimated budget cannot be negative']
    },
    actual: {
      type: Number,
      default: 0,
      min: [0, 'Actual budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    billingType: {
      type: String,
      enum: ['fixed', 'hourly', 'monthly', 'milestone'],
      default: 'fixed'
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative']
    }
  },
  timeline: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    actualStartDate: {
      type: Date
    },
    actualEndDate: {
      type: Date
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative']
    },
    actualHours: {
      type: Number,
      default: 0,
      min: [0, 'Actual hours cannot be negative']
    }
  },
  requirements: {
    business: [{
      type: String,
      trim: true,
      maxlength: [500, 'Business requirement cannot exceed 500 characters']
    }],
    functional: [{
      type: String,
      trim: true,
      maxlength: [500, 'Functional requirement cannot exceed 500 characters']
    }],
    nonFunctional: [{
      type: String,
      trim: true,
      maxlength: [500, 'Non-functional requirement cannot exceed 500 characters']
    }],
    technical: [{
      type: String,
      trim: true,
      maxlength: [500, 'Technical requirement cannot exceed 500 characters']
    }]
  },
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    size: {
      type: Number,
      required: true,
      min: [0, 'File size cannot be negative']
    },
    type: {
      type: String,
      enum: ['document', 'image', 'video', 'archive', 'other'],
      default: 'document'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Document description cannot exceed 200 characters']
    }
  }],
  team: {
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project manager is required']
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['developer', 'designer', 'tester', 'analyst', 'consultant', 'other'],
        required: true
      },
      assignedAt: {
        type: Date,
        default: Date.now
      },
      hourlyRate: {
        type: Number,
        min: [0, 'Hourly rate cannot be negative']
      }
    }],
    stakeholders: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['client', 'sponsor', 'reviewer', 'approver', 'other'],
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  milestones: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Milestone name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Milestone description cannot exceed 500 characters']
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'overdue'],
      default: 'pending'
    },
    completedAt: {
      type: Date
    },
    deliverables: [{
      name: String,
      description: String,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      }
    }],
    budget: {
      estimated: Number,
      actual: Number
    }
  }],
  progress: {
    overall: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100']
    },
    phases: [{
      name: String,
      progress: {
        type: Number,
        min: 0,
        max: 100
      },
      startDate: Date,
      endDate: Date
    }]
  },
  risks: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    probability: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    mitigation: String,
    status: {
      type: String,
      enum: ['open', 'mitigated', 'closed'],
      default: 'open'
    },
    identifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    identifiedAt: {
      type: Date,
      default: Date.now
    }
  }],
  communication: {
    clientUpdates: [{
      title: String,
      content: String,
      sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      readBy: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: Date
      }]
    }],
    internalNotes: [{
      content: String,
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      isPrivate: {
        type: Boolean,
        default: false
      }
    }]
  },
  settings: {
    allowClientComments: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoArchive: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: {
        milestoneUpdates: { type: Boolean, default: true },
        taskAssignments: { type: Boolean, default: true },
        budgetAlerts: { type: Boolean, default: true }
      },
      push: {
        milestoneUpdates: { type: Boolean, default: true },
        taskAssignments: { type: Boolean, default: true }
      }
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
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

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (!this.timeline.startDate || !this.timeline.endDate) return 0
  return Math.ceil((this.timeline.endDate - this.timeline.startDate) / (1000 * 60 * 60 * 24))
})

// Virtual for actual duration
projectSchema.virtual('actualDuration').get(function() {
  if (!this.timeline.actualStartDate) return 0
  const endDate = this.timeline.actualEndDate || new Date()
  return Math.ceil((endDate - this.timeline.actualStartDate) / (1000 * 60 * 60 * 24))
})

// Virtual for budget variance
projectSchema.virtual('budgetVariance').get(function() {
  if (!this.budget) return 0
  return (this.budget.actual || 0) - (this.budget.estimated || 0)
})

// Virtual for budget variance percentage
projectSchema.virtual('budgetVariancePercentage').get(function() {
  if (!this.budget || this.budget.estimated === 0) return 0
  return (((this.budget.actual || 0) - (this.budget.estimated || 0)) / this.budget.estimated) * 100
})

// Virtual for overdue status
projectSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false
  return this.timeline.endDate < new Date()
})

// Virtual for team size
projectSchema.virtual('teamSize').get(function() {
  return this.team?.members?.length || 0
})

// Virtual for completed milestones
projectSchema.virtual('completedMilestones').get(function() {
  return this.milestones?.filter(m => m.status === 'completed')?.length || 0
})

// Virtual for total milestones
projectSchema.virtual('totalMilestones').get(function() {
  return this.milestones?.length || 0
})

// Indexes for performance
projectSchema.index({ vendorId: 1 })
projectSchema.index({ clientId: 1 })
projectSchema.index({ status: 1 })
projectSchema.index({ priority: 1 })
projectSchema.index({ 'team.projectManager': 1 })
projectSchema.index({ 'team.members.user': 1 })
projectSchema.index({ createdAt: 1 })
projectSchema.index({ 'timeline.endDate': 1 })

// Pre-save middleware to update timestamps
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Instance method to check if user is team member
projectSchema.methods.isTeamMember = function(userId) {
  return this.team?.members?.some(member => 
    member.user.toString() === userId.toString()
  ) || false
}

// Instance method to check if user is stakeholder
projectSchema.methods.isStakeholder = function(userId) {
  return this.team?.stakeholders?.some(stakeholder => 
    stakeholder.user.toString() === userId.toString()
  ) || false
}

// Instance method to check if user can access project
projectSchema.methods.canUserAccess = function(userId, userRole) {
  // Super admin and marketing admin can access all projects
  if (userRole === 'super_admin' || userRole === 'vendor_admin') {
    return true
  }
  
  // Project manager can always access
  if (this.team?.projectManager?.toString() === userId.toString()) {
    return true
  }
  
  // Team members can access
  if (this.isTeamMember(userId)) {
    return true
  }
  
  // Stakeholders can access
  if (this.isStakeholder(userId)) {
    return true
  }
  
  // Client can access their own projects
  if (this.clientId.toString() === userId.toString()) {
    return true
  }
  
  return false
}

// Instance method to add team member
projectSchema.methods.addTeamMember = function(userId, role, hourlyRate = 0) {
  // Ensure team structure exists
  if (!this.team) {
    this.team = { members: [], stakeholders: [] }
  }
  if (!this.team.members) {
    this.team.members = []
  }
  
  const existingMember = this.team.members.find(member => 
    member.user.toString() === userId.toString()
  )
  
  if (existingMember) {
    throw new Error('User is already a team member')
  }
  
  this.team.members.push({
    user: userId,
    role,
    assignedAt: new Date(),
    hourlyRate
  })
  
  return this.save()
}

// Instance method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  if (!this.team?.members) {
    return this.save()
  }
  
  this.team.members = this.team.members.filter(member => 
    member.user.toString() !== userId.toString()
  )
  
  return this.save()
}

// Instance method to add milestone
projectSchema.methods.addMilestone = function(milestoneData) {
  if (!this.milestones) {
    this.milestones = []
  }
  
  this.milestones.push({
    ...milestoneData,
    status: 'pending'
  })
  
  return this.save()
}

// Instance method to update progress
projectSchema.methods.updateProgress = function(progress) {
  if (!this.progress) {
    this.progress = { overall: 0 }
  }
  
  this.progress.overall = Math.max(0, Math.min(100, progress))
  
  if (this.progress.overall === 100 && this.status === 'active') {
    this.status = 'completed'
    if (!this.timeline) {
      this.timeline = {}
    }
    this.timeline.actualEndDate = new Date()
  }
  
  return this.save()
}

// Static method to find projects by vendor
projectSchema.statics.findByVendor = function(vendorId, options = {}) {
  const query = { vendorId }
  
  if (options.status) query.status = options.status
  if (options.priority) query.priority = options.priority
  if (options.clientId) query.clientId = options.clientId
  
  return this.find(query)
    .populate('clientId', 'firstName lastName email')
    .populate('team.projectManager', 'firstName lastName email')
    .populate('team.members.user', 'firstName lastName email')
    .sort({ createdAt: -1 })
}

// Static method to get project statistics
projectSchema.statics.getProjectStats = async function(vendorId) {
  const stats = await this.aggregate([
    { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        activeProjects: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedProjects: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalBudget: { $sum: '$budget.estimated' },
        actualBudget: { $sum: '$budget.actual' },
        averageDuration: { $avg: '$duration' }
      }
    }
  ])
  
  return stats[0] || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    actualBudget: 0,
    averageDuration: 0
  }
}

module.exports = mongoose.model('Project', projectSchema) 