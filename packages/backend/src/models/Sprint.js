const mongoose = require('mongoose')

const sprintSchema = new mongoose.Schema({
  // Basic sprint information
  name: {
    type: String,
    required: [true, 'Sprint name is required'],
    trim: true,
    maxlength: [100, 'Sprint name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Sprint description cannot exceed 500 characters']
  },
  
  // Sprint details
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
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
  
  // Sprint goals and objectives
  goals: [{
    description: {
      type: String,
      required: true,
      maxlength: [300, 'Goal description cannot exceed 300 characters']
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Capacity and velocity
  capacity: {
    plannedHours: {
      type: Number,
      min: 0,
      default: 0
    },
    actualHours: {
      type: Number,
      min: 0,
      default: 0
    },
    teamSize: {
      type: Number,
      min: 1,
      default: 1
    }
  },
  
  // Sprint metrics
  metrics: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    inProgressTasks: {
      type: Number,
      default: 0
    },
    blockedTasks: {
      type: Number,
      default: 0
    },
    totalStoryPoints: {
      type: Number,
      default: 0
    },
    completedStoryPoints: {
      type: Number,
      default: 0
    },
    velocity: {
      type: Number,
      default: 0
    }
  },
  
  // Sprint team
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['developer', 'designer', 'tester', 'analyst', 'scrum-master', 'product-owner'],
      default: 'developer'
    },
    capacity: {
      type: Number,
      min: 0,
      default: 40 // hours per sprint
    }
  }],
  
  // Sprint ceremonies
  ceremonies: {
    planning: {
      scheduled: Date,
      completed: Date,
      notes: String
    },
    dailyStandup: {
      time: String, // e.g., "09:00"
      duration: {
        type: Number,
        default: 15 // minutes
      },
      notes: String
    },
    review: {
      scheduled: Date,
      completed: Date,
      notes: String
    },
    retrospective: {
      scheduled: Date,
      completed: Date,
      notes: String
    }
  },
  
  // Sprint backlog
  backlog: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    priority: {
      type: Number,
      min: 1
    },
    storyPoints: {
      type: Number,
      min: 0
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Sprint notes and documentation
  notes: {
    planning: String,
    daily: [{
      date: Date,
      notes: String,
      blockers: [String],
      achievements: [String]
    }],
    review: String,
    retrospective: {
      whatWentWell: [String],
      whatWentWrong: [String],
      improvements: [String],
      actionItems: [{
        description: String,
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        dueDate: Date,
        isCompleted: {
          type: Boolean,
          default: false
        }
      }]
    }
  },
  
  // Sprint settings
  settings: {
    autoCloseTasks: {
      type: Boolean,
      default: false
    },
    allowTaskAddition: {
      type: Boolean,
      default: true
    },
    requireStoryPoints: {
      type: Boolean,
      default: false
    }
  },
  
  // Multi-tenant support
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  }
}, {
  timestamps: true
})

// Indexes
sprintSchema.index({ project: 1 })
sprintSchema.index({ status: 1 })
sprintSchema.index({ startDate: 1, endDate: 1 })
sprintSchema.index({ 'team.user': 1 })
sprintSchema.index({ vendor: 1 })

// Virtual for isActive
sprintSchema.virtual('isActive').get(function() {
  return this.status === 'active'
})

// Virtual for isOverdue
sprintSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false
  return new Date() > this.endDate
})

// Virtual for completion percentage
sprintSchema.virtual('completionPercentage').get(function() {
  if (this.metrics.totalTasks === 0) return 0
  return Math.round((this.metrics.completedTasks / this.metrics.totalTasks) * 100)
})

// Virtual for velocity
sprintSchema.virtual('currentVelocity').get(function() {
  if (this.metrics.completedStoryPoints === 0) return 0
  const daysElapsed = Math.max(1, Math.ceil((new Date() - this.startDate) / (1000 * 60 * 60 * 24)))
  return Math.round(this.metrics.completedStoryPoints / daysElapsed)
})

// Pre-save middleware to update metrics
sprintSchema.pre('save', function(next) {
  // Update metrics based on backlog
  this.metrics.totalTasks = this.backlog.length
  this.metrics.totalStoryPoints = this.backlog.reduce((total, item) => total + (item.storyPoints || 0), 0)
  
  // Calculate velocity
  if (this.status === 'completed' && this.actualEndDate) {
    const sprintDuration = Math.ceil((this.actualEndDate - this.startDate) / (1000 * 60 * 60 * 24))
    this.metrics.velocity = sprintDuration > 0 ? Math.round(this.metrics.completedStoryPoints / sprintDuration) : 0
  }
  
  next()
})

// Static method to find active sprints
sprintSchema.statics.findActive = function() {
  return this.find({ status: 'active' })
    .populate('project', 'name status')
    .populate('team.user', 'firstName lastName email avatar')
}

// Static method to find sprints by project
sprintSchema.statics.findByProject = function(projectId) {
  return this.find({ project: projectId })
    .populate('team.user', 'firstName lastName email avatar')
    .populate('backlog.task', 'title status priority')
}

// Static method to find current sprint for a project
sprintSchema.statics.findCurrentSprint = function(projectId) {
  const now = new Date()
  return this.findOne({
    project: projectId,
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  })
}

// Instance method to add task to backlog
sprintSchema.methods.addTask = function(taskId, priority = 1, storyPoints = 0) {
  const existingTask = this.backlog.find(item => item.task.toString() === taskId.toString())
  if (existingTask) {
    existingTask.priority = priority
    existingTask.storyPoints = storyPoints
  } else {
    this.backlog.push({
      task: taskId,
      priority,
      storyPoints
    })
  }
  
  // Sort backlog by priority
  this.backlog.sort((a, b) => a.priority - b.priority)
  
  return this.save()
}

// Instance method to remove task from backlog
sprintSchema.methods.removeTask = function(taskId) {
  this.backlog = this.backlog.filter(item => item.task.toString() !== taskId.toString())
  return this.save()
}

// Instance method to start sprint
sprintSchema.methods.startSprint = function() {
  this.status = 'active'
  this.actualStartDate = new Date()
  return this.save()
}

// Instance method to complete sprint
sprintSchema.methods.completeSprint = function() {
  this.status = 'completed'
  this.actualEndDate = new Date()
  
  // Update metrics
  this.metrics.completedTasks = this.backlog.filter(item => 
    item.task && item.task.status === 'done'
  ).length
  
  this.metrics.completedStoryPoints = this.backlog
    .filter(item => item.task && item.task.status === 'done')
    .reduce((total, item) => total + (item.storyPoints || 0), 0)
  
  return this.save()
}

// Instance method to add team member
sprintSchema.methods.addTeamMember = function(userId, role = 'developer', capacity = 40) {
  const existingMember = this.team.find(member => member.user.toString() === userId.toString())
  if (existingMember) {
    existingMember.role = role
    existingMember.capacity = capacity
  } else {
    this.team.push({ user: userId, role, capacity })
  }
  
  // Update team size
  this.capacity.teamSize = this.team.length
  
  return this.save()
}

// Instance method to remove team member
sprintSchema.methods.removeTeamMember = function(userId) {
  this.team = this.team.filter(member => member.user.toString() !== userId.toString())
  this.capacity.teamSize = this.team.length
  return this.save()
}

module.exports = mongoose.model('Sprint', sprintSchema) 