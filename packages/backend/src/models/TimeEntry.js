const mongoose = require('mongoose')

const timeEntrySchema = new mongoose.Schema({
  // User and task references
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task is required']
  },
  
  // Time tracking
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number,
    min: 0,
    default: 0 // in hours
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  
  // Description and details
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Activity type
  activityType: {
    type: String,
    enum: ['development', 'testing', 'review', 'meeting', 'research', 'documentation', 'other'],
    default: 'development'
  },
  
  // Billable information
  isBillable: {
    type: Boolean,
    default: true
  },
  billableRate: {
    type: Number,
    min: 0,
    default: 0
  },
  billableAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Location tracking (optional, with GDPR compliance)
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    ipAddress: String
  },
  
  // Device information
  deviceInfo: {
    userAgent: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    browser: String,
    os: String
  },
  
  // Screenshots and activity tracking (optional)
  screenshots: [{
    filename: String,
    path: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // Activity logs
  activityLog: [{
    action: {
      type: String,
      enum: ['start', 'pause', 'resume', 'stop', 'break', 'return'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Approval workflow
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalNotes: {
    type: String,
    maxlength: [500, 'Approval notes cannot exceed 500 characters']
  },
  
  // Tags and categories
  tags: [{
    type: String,
    trim: true
  }],
  
  // GDPR Compliance Fields
  gdpr: {
    consent: {
      locationTracking: {
        type: Boolean,
        default: false,
        required: true
      },
      deviceTracking: {
        type: Boolean,
        default: true,
        required: true
      },
      activityTracking: {
        type: Boolean,
        default: true,
        required: true
      },
      screenshotTracking: {
        type: Boolean,
        default: false,
        required: true
      }
    },
    dataRetention: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000) // 3 years
    },
    anonymized: {
      type: Boolean,
      default: false
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for performance
timeEntrySchema.index({ user: 1, task: 1, startTime: -1 })
timeEntrySchema.index({ user: 1, isRunning: 1 })
timeEntrySchema.index({ task: 1, startTime: -1 })
timeEntrySchema.index({ startTime: 1 })

// Pre-save middleware to calculate duration and billable amount
timeEntrySchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = (this.endTime - this.startTime) / (1000 * 60 * 60) // Convert to hours
    this.isRunning = false
  }
  
  if (this.isBillable && this.billableRate > 0) {
    this.billableAmount = this.duration * this.billableRate
  }
  
  this.updatedAt = new Date()
  next()
})

// Virtual for formatted start time
timeEntrySchema.virtual('formattedStartTime').get(function() {
  return this.startTime ? this.startTime.toLocaleTimeString() : null
})

// Virtual for formatted end time
timeEntrySchema.virtual('formattedEndTime').get(function() {
  return this.endTime ? this.endTime.toLocaleTimeString() : null
})

// Virtual for formatted duration
timeEntrySchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0h 0m'
  
  const hours = Math.floor(this.duration)
  const minutes = Math.round((this.duration - hours) * 60)
  return `${hours}h ${minutes}m`
})

// Method to pause time entry
timeEntrySchema.methods.pause = function() {
  if (!this.isRunning) {
    throw new Error('Time entry is not running')
  }
  
  this.endTime = new Date()
  this.isRunning = false
  
  this.activityLog.push({
    action: 'pause',
    timestamp: new Date(),
    description: 'Time entry paused'
  })
  
  return this.save()
}

// Method to resume time entry
timeEntrySchema.methods.resume = function() {
  if (this.isRunning) {
    throw new Error('Time entry is already running')
  }
  
  this.startTime = new Date()
  this.isRunning = true
  
  this.activityLog.push({
    action: 'resume',
    timestamp: new Date(),
    description: 'Time entry resumed'
  })
  
  return this.save()
}

// Method to stop time entry
timeEntrySchema.methods.stop = function(description = '') {
  if (!this.isRunning) {
    throw new Error('Time entry is not running')
  }
  
  this.endTime = new Date()
  this.isRunning = false
  this.description = description
  
  this.activityLog.push({
    action: 'stop',
    timestamp: new Date(),
    description: 'Time entry stopped'
  })
  
  return this.save()
}

// Static method to get running time entry for a user
timeEntrySchema.statics.getRunningEntry = async function(userId) {
  return await this.findOne({
    user: userId,
    isRunning: true
  }).populate('task', 'title project')
}

// Static method to get time entries for a task
timeEntrySchema.statics.getTaskEntries = async function(taskId, startDate, endDate) {
  const query = { task: taskId }
  
  if (startDate && endDate) {
    query.startTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }
  
  return await this.find(query)
    .populate('user', 'firstName lastName')
    .sort({ startTime: -1 })
}

// Static method to get user time summary
timeEntrySchema.statics.getUserSummary = async function(userId, startDate, endDate) {
  const query = { user: userId }
  
  if (startDate && endDate) {
    query.startTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }
  
  const entries = await this.find(query)
  
  const summary = {
    totalEntries: entries.length,
    totalHours: entries.reduce((sum, entry) => sum + entry.duration, 0),
    billableHours: entries.filter(e => e.isBillable).reduce((sum, entry) => sum + entry.duration, 0),
    billableAmount: entries.filter(e => e.isBillable).reduce((sum, entry) => sum + entry.billableAmount, 0),
    averageHoursPerDay: 0,
    activityBreakdown: {}
  }
  
  // Calculate activity breakdown
  entries.forEach(entry => {
    const activity = entry.activityType || 'other'
    summary.activityBreakdown[activity] = (summary.activityBreakdown[activity] || 0) + entry.duration
  })
  
  // Calculate average hours per day
  if (startDate && endDate) {
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    if (days > 0) {
      summary.averageHoursPerDay = summary.totalHours / days
    }
  }
  
  return summary
}

// Static method to anonymize old time entries for GDPR compliance
timeEntrySchema.statics.anonymizeOldData = async function() {
  const cutoffDate = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) // 3 years ago
  
  const result = await this.updateMany(
    {
      startTime: { $lt: cutoffDate },
      'gdpr.anonymized': false
    },
    {
      $set: {
        'gdpr.anonymized': true,
        location: null,
        deviceInfo: null,
        screenshots: [],
        activityLog: [],
        description: null,
        approvalNotes: null
      }
    }
  )
  
  return result
}

module.exports = mongoose.model('TimeEntry', timeEntrySchema) 