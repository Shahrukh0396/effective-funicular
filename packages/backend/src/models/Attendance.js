const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
  // Employee reference
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  
  // Date information
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  
  // Check-in and check-out times
  checkIn: {
    type: Date,
    required: [true, 'Check-in time is required']
  },
  checkOut: {
    type: Date
  },
  
  // Calculated hours
  totalHours: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Break times (optional)
  breaks: [{
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
    reason: {
      type: String,
      maxlength: [200, 'Break reason cannot exceed 200 characters']
    }
  }],
  
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
  
  // Status and notes
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'early-leave', 'half-day'],
    default: 'present'
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
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
      }
    },
    dataRetention: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years
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
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true })
attendanceSchema.index({ date: 1 })
attendanceSchema.index({ employee: 1, createdAt: -1 })

// Pre-save middleware to update total hours
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    this.totalHours = (this.checkOut - this.checkIn) / (1000 * 60 * 60)
  }
  this.updatedAt = new Date()
  next()
})

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString()
})

// Virtual for formatted check-in time
attendanceSchema.virtual('formattedCheckIn').get(function() {
  return this.checkIn ? this.checkIn.toLocaleTimeString() : null
})

// Virtual for formatted check-out time
attendanceSchema.virtual('formattedCheckOut').get(function() {
  return this.checkOut ? this.checkOut.toLocaleTimeString() : null
})

// Method to calculate total break time
attendanceSchema.methods.getTotalBreakTime = function() {
  return this.breaks.reduce((total, break_) => {
    return total + (break_.duration || 0)
  }, 0)
}

// Method to get net working hours (total hours minus breaks)
attendanceSchema.methods.getNetWorkingHours = function() {
  const breakTime = this.getTotalBreakTime()
  return Math.max(0, this.totalHours - breakTime)
}

// Static method to get attendance summary for an employee
attendanceSchema.statics.getEmployeeSummary = async function(employeeId, startDate, endDate) {
  const query = { employee: employeeId }
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }
  
  const attendance = await this.find(query)
  
  const summary = {
    totalDays: attendance.length,
    presentDays: attendance.filter(a => a.status === 'present').length,
    absentDays: attendance.filter(a => a.status === 'absent').length,
    lateDays: attendance.filter(a => a.status === 'late').length,
    totalHours: attendance.reduce((sum, a) => sum + a.totalHours, 0),
    averageHoursPerDay: 0
  }
  
  if (summary.presentDays > 0) {
    summary.averageHoursPerDay = summary.totalHours / summary.presentDays
  }
  
  return summary
}

// Static method to anonymize old attendance data for GDPR compliance
attendanceSchema.statics.anonymizeOldData = async function() {
  const cutoffDate = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) // 2 years ago
  
  const result = await this.updateMany(
    {
      date: { $lt: cutoffDate },
      'gdpr.anonymized': false
    },
    {
      $set: {
        'gdpr.anonymized': true,
        location: null,
        deviceInfo: null,
        notes: null,
        approvalNotes: null
      }
    }
  )
  
  return result
}

module.exports = mongoose.model('Attendance', attendanceSchema) 