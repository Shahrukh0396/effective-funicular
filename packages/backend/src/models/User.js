const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['super_admin', 'marketing_admin', 'vendor_admin', 'employee', 'client'],
    required: [true, 'Role is required'],
    default: 'client'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: function() {
      // Super admin and marketing admin don't need vendorId
      return !['super_admin', 'marketing_admin'].includes(this.role)
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_projects',
      'manage_tasks',
      'view_analytics',
      'manage_billing',
      'manage_vendors',
      'manage_platform',
      'time_tracking',
      'file_upload',
      'chat_access'
    ]
  }],
  profileImage: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    lastPasswordChange: { type: Date, default: Date.now },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.email
})

// Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ vendorId: 1, role: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Pre-save middleware to update lastPasswordChange
userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.security.lastPasswordChange = new Date()
  }
  next()
})

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Instance method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission)
}

// Instance method to check if user can access vendor
userSchema.methods.canAccessVendor = function(vendorId) {
  if (this.role === 'super_admin' || this.role === 'marketing_admin') {
    return true
  }
  return this.vendorId && this.vendorId.toString() === vendorId.toString()
}

// Static method to get users by vendor
userSchema.statics.findByVendor = function(vendorId, options = {}) {
  const query = { vendorId }
  if (options.role) query.role = options.role
  if (options.isActive !== undefined) query.isActive = options.isActive
  
  return this.find(query).populate('vendorId')
}

// Static method to get active users count by vendor
userSchema.statics.getActiveUserCount = function(vendorId) {
  return this.countDocuments({ vendorId, isActive: true })
}

module.exports = mongoose.model('User', userSchema) 