const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  // Basic task information
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    maxlength: [2000, 'Task description cannot exceed 2000 characters']
  },
  
  // Task details
  type: {
    type: String,
    enum: ['feature', 'bug', 'improvement', 'task', 'story', 'epic'],
    default: 'task'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'testing', 'done', 'blocked'],
    default: 'todo'
  },
  
  // Project and sprint association
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  
  // Assignment and ownership
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timeline
  dueDate: Date,
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  startedAt: Date,
  completedAt: Date,
  
  // Task relationships
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'related'],
      default: 'blocks'
    }
  }],
  
  // Labels and tags
  labels: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Comments and discussions
  comments: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  
  // Attachments
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
  
  // Time tracking
  timeEntries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      maxlength: [500, 'Time entry description cannot exceed 500 characters']
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    duration: {
      type: Number,
      min: 0,
      default: 0
    },
    isRunning: {
      type: Boolean,
      default: false
    }
  }],
  
  // Acceptance criteria and testing
  acceptanceCriteria: [{
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Acceptance criteria cannot exceed 500 characters']
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Custom fields
  customFields: [{
    name: String,
    value: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select'],
      default: 'text'
    }
  }],
  
  // Metrics
  metrics: {
    totalComments: {
      type: Number,
      default: 0
    },
    totalAttachments: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    }
  },
  
  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Multi-tenant support
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  }
}, {
  timestamps: true
})

// Indexes
taskSchema.index({ project: 1 })
taskSchema.index({ assignedTo: 1 })
taskSchema.index({ status: 1 })
taskSchema.index({ sprint: 1 })
taskSchema.index({ dueDate: 1 })
taskSchema.index({ priority: 1 })
taskSchema.index({ labels: 1 })
taskSchema.index({ tags: 1 })
taskSchema.index({ vendorId: 1 })

// Virtual for isOverdue
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'done' || !this.dueDate) return false
  return new Date() > this.dueDate
})

// Virtual for isActive
taskSchema.virtual('isActive').get(function() {
  return ['todo', 'in-progress', 'review', 'testing'].includes(this.status)
})

// Virtual for total time spent
taskSchema.virtual('totalTimeSpent').get(function() {
  return this.timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0)
})

// Pre-save middleware to update metrics
taskSchema.pre('save', function(next) {
  this.lastActivity = new Date()
  this.metrics.totalComments = this.comments.length
  this.metrics.totalAttachments = this.attachments.length
  this.metrics.totalTimeSpent = this.totalTimeSpent
  
  // Update project metrics when task status changes
  if (this.isModified('status')) {
    this.constructor.updateProjectMetrics(this.project)
  }
  
  next()
})

// Static method to find tasks by project
taskSchema.statics.findByProject = function(projectId) {
  return this.find({ project: projectId })
    .populate('assignedTo', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar')
    .populate('comments.author', 'firstName lastName email avatar')
}

// Static method to find tasks by assignee
taskSchema.statics.findByAssignee = function(userId) {
  return this.find({ assignedTo: userId })
    .populate('project', 'name status')
    .populate('sprint', 'name')
}

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['done', 'cancelled'] }
  })
}

// Static method to update project metrics
taskSchema.statics.updateProjectMetrics = async function(projectId) {
  const Project = mongoose.model('Project')
  const stats = await this.aggregate([
    { $match: { project: projectId } },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
      }
    }
  ])
  
  if (stats.length > 0) {
    await Project.findByIdAndUpdate(projectId, {
      'metrics.totalTasks': stats[0].totalTasks,
      'metrics.completedTasks': stats[0].completedTasks
    })
  }
}

// Instance method to add comment
taskSchema.methods.addComment = function(content, authorId) {
  this.comments.push({
    content,
    author: authorId
  })
  return this.save()
}

// Instance method to add time entry
taskSchema.methods.addTimeEntry = function(userId, description, startTime, endTime = null) {
  const duration = endTime ? (endTime - startTime) / (1000 * 60 * 60) : 0 // hours
  
  this.timeEntries.push({
    user: userId,
    description,
    startTime,
    endTime,
    duration,
    isRunning: !endTime
  })
  
  return this.save()
}

// Instance method to start time tracking
taskSchema.methods.startTimeTracking = function(userId, description) {
  this.timeEntries.push({
    user: userId,
    description,
    startTime: new Date(),
    isRunning: true
  })
  
  return this.save()
}

// Instance method to stop time tracking
taskSchema.methods.stopTimeTracking = function(userId) {
  const runningEntry = this.timeEntries.find(entry => 
    entry.user.toString() === userId.toString() && entry.isRunning
  )
  
  if (runningEntry) {
    runningEntry.endTime = new Date()
    runningEntry.duration = (runningEntry.endTime - runningEntry.startTime) / (1000 * 60 * 60)
    runningEntry.isRunning = false
  }
  
  return this.save()
}

module.exports = mongoose.model('Task', taskSchema) 