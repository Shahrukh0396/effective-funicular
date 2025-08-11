const express = require('express')
const bcrypt = require('bcryptjs')
const rateLimit = require('express-rate-limit')
const User = require('../models/User')
const Vendor = require('../models/Vendor')
const Session = require('../models/Session')
const AuditLog = require('../models/AuditLog')
const authService = require('../services/authService')
const sessionService = require('../services/sessionService')
const { 
  auth, 
  authorize, 
  hasPermission, 
  requirePortalAccess,
  superAdminOnly,
  employeeOrAdmin,
  clientOnly,
  validateSession 
} = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')
const config = require('../config')

const router = express.Router()

// Rate limiting for user operations
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
})

// Apply rate limiting to all user routes
router.use(userLimiter)

// ==================== USER CRUD OPERATIONS ====================

// Get all users (with role-based filtering)
router.get('/', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      search, 
      status,
      vendorId = req.vendorId 
    } = req.query

    const query = { vendor: vendorId }

    // Role-based filtering
    if (role) {
      query.role = role
    }

    // Status filtering
    if (status) {
      query.isActive = status === 'active'
    }

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ]
    }

    // Super admin can see all users across vendors
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendor
    }

    const users = await User.find(query)
      .select('-password')
      .populate('vendor', 'name domain')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get user by ID
router.get('/:id', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params
    const vendorId = req.user.role === 'super_admin' || req.user.isSuperAccount 
      ? req.query.vendorId || req.vendorId 
      : req.vendorId

    const query = { _id: id }
    if (!req.user.isSuperAccount) {
      query.vendor = vendorId
    }

    const user = await User.findOne(query)
      .select('-password')
      .populate('vendor', 'name domain')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    // Get user sessions
    const sessions = await Session.findActiveSessions(user._id, user.vendor)

    // Get recent activity
    const recentActivity = await AuditLog.findUserActivity(user._id, 10)

    res.json({
      success: true,
      data: {
        user,
        sessions: sessions.length,
        recentActivity: recentActivity.length
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Create new user
router.post('/', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      company,
      position,
      department,
      employeeId,
      portalAccess,
      permissions,
      vendorId = req.vendorId
    } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, password, and role are required.'
      })
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists.'
      })
    }

    // Validate role permissions
    if (!req.user.isSuperAccount) {
      // Regular admins can only create users with roles below their own
      const roleHierarchy = ['client', 'employee', 'admin', 'super_admin']
      const userRoleIndex = roleHierarchy.indexOf(req.user.role)
      const newRoleIndex = roleHierarchy.indexOf(role)
      
      if (newRoleIndex >= userRoleIndex) {
        return res.status(403).json({
          success: false,
          message: 'You can only create users with roles below your own.'
        })
      }
    }

    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role,
      vendor: vendorId,
      company,
      position,
      department,
      employeeId,
      portalAccess,
      permissions: permissions || []
    }

    const user = new User(userData)
    await user.save()

    // Log user creation
    await authService.logAuthEvent({
      event: 'user.created',
      userId: req.user._id,
      vendorId: req.vendorId,
      portalType: req.portalType,
      request: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl
      },
      metadata: {
        createdUserId: user._id,
        role: role,
        success: true
      }
    })

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          company: user.company,
          position: user.position,
          isActive: user.isActive
        }
      }
    })

  } catch (error) {
    console.error('Create user error:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', '),
        errors: validationErrors
      })
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Update user
router.put('/:id', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params
    const {
      firstName,
      lastName,
      email,
      role,
      company,
      position,
      department,
      employeeId,
      portalAccess,
      permissions,
      isActive
    } = req.body

    const query = { _id: id }
    if (!req.user.isSuperAccount) {
      query.vendor = req.vendorId
    }

    const user = await User.findOne(query)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    // Check if trying to update super admin
    if (user.role === 'super_admin' && !req.user.isSuperAccount) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify super admin accounts.'
      })
    }

    // Update fields
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists.'
        })
      }
      user.email = email
    }
    if (role) user.role = role
    if (company !== undefined) user.company = company
    if (position !== undefined) user.position = position
    if (department !== undefined) user.department = department
    if (employeeId !== undefined) user.employeeId = employeeId
    if (portalAccess) user.portalAccess = portalAccess
    if (permissions) user.permissions = permissions
    if (isActive !== undefined) user.isActive = isActive

    await user.save()

    // Log user update
    await authService.logAuthEvent({
      event: 'user.updated',
      userId: req.user._id,
      vendorId: req.vendorId,
      portalType: req.portalType,
      request: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl
      },
      metadata: {
        updatedUserId: user._id,
        success: true
      }
    })

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          company: user.company,
          position: user.position,
          isActive: user.isActive
        }
      }
    })

  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Delete user
router.delete('/:id', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params

    const query = { _id: id }
    if (!req.user.isSuperAccount) {
      query.vendor = req.vendorId
    }

    const user = await User.findOne(query)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account.'
      })
    }

    // Check if trying to delete super admin
    if (user.role === 'super_admin' && !req.user.isSuperAccount) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin accounts.'
      })
    }

    // Terminate all user sessions
    await sessionService.forceLogoutUser(user._id, user.vendor, 'Account deleted')

    // Soft delete - deactivate user
    user.isActive = false
    await user.save()

    // Log user deletion
    await authService.logAuthEvent({
      event: 'user.deleted',
      userId: req.user._id,
      vendorId: req.vendorId,
      portalType: req.portalType,
      request: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl
      },
      metadata: {
        deletedUserId: user._id,
        success: true
      }
    })

    res.json({
      success: true,
      message: 'User deleted successfully.'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== PASSWORD MANAGEMENT ====================

// Change password
router.post('/:id/change-password', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword, currentPassword } = req.body

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required.'
      })
    }

    const query = { _id: id }
    if (!req.user.isSuperAccount) {
      query.vendor = req.vendorId
    }

    const user = await User.findOne(query).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    // If changing own password, require current password
    if (user._id.toString() === req.user._id.toString()) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required.'
        })
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.'
        })
      }
    }

    // Validate password strength
    if (newPassword.length < config.security.passwordMinLength) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${config.security.passwordMinLength} characters long.`
      })
    }

    // Check if password was recently used
    if (user.isPasswordRecentlyUsed(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password was recently used. Please choose a different password.'
      })
    }

    // Update password
    await user.updatePassword(newPassword)

    // Terminate all user sessions to force re-login
    await sessionService.forceLogoutUser(user._id, user.vendor, 'Password changed')

    // Log password change
    await authService.logAuthEvent({
      event: 'user.password.change',
      userId: req.user._id,
      vendorId: req.vendorId,
      portalType: req.portalType,
      request: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl
      },
      metadata: {
        targetUserId: user._id,
        success: true
      }
    })

    res.json({
      success: true,
      message: 'Password changed successfully. User will need to login again.'
    })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== SESSION MANAGEMENT ====================

// Get user sessions
router.get('/:id/sessions', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params
    const vendorId = req.user.isSuperAccount ? req.query.vendorId || req.vendorId : req.vendorId

    const query = { _id: id }
    if (!req.user.isSuperAccount) {
      query.vendor = req.vendorId
    }

    const user = await User.findOne(query)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    const sessions = await sessionService.getUserSessionActivity(user._id, vendorId)

    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.sessionId,
          portalType: session.portalType,
          deviceInfo: session.deviceInfo,
          lastActivity: session.lastActivity,
          loginTime: session.loginTime,
          isActive: session.isActive,
          riskScore: session.security.riskScore,
          suspiciousActivity: session.security.suspiciousActivity
        }))
      }
    })

  } catch (error) {
    console.error('Get user sessions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Force logout user from all sessions
router.post('/:id/force-logout', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params
    const { reason = 'Admin action' } = req.body

    const query = { _id: id }
    if (!req.user.isSuperAccount) {
      query.vendor = req.vendorId
    }

    const user = await User.findOne(query)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    const terminatedCount = await sessionService.forceLogoutUser(user._id, user.vendor, reason)

    res.json({
      success: true,
      message: `User logged out from ${terminatedCount} sessions.`,
      data: {
        terminatedSessions: terminatedCount
      }
    })

  } catch (error) {
    console.error('Force logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== SECURITY MANAGEMENT ====================

// Get user security info
router.get('/:id/security', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params

    const query = { _id: id }
    if (!req.user.isSuperAccount) {
      query.vendor = req.vendorId
    }

    const user = await User.findOne(query)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    // Get recent login attempts
    const recentActivity = await AuditLog.findUserActivity(user._id, 20)

    res.json({
      success: true,
      data: {
        security: {
          twoFactorEnabled: user.security.twoFactorEnabled,
          failedAttempts: user.security.failedAttempts,
          accountLockedUntil: user.security.accountLockedUntil,
          passwordExpiresAt: user.security.passwordExpiresAt,
          riskScore: user.security.riskScore,
          suspiciousActivity: user.security.suspiciousActivity,
          lastSuspiciousActivity: user.security.lastSuspiciousActivity
        },
        recentActivity: recentActivity.filter(log => 
          log.event.includes('login') || log.event.includes('security')
        )
      }
    })

  } catch (error) {
    console.error('Get user security error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Unlock user account
router.post('/:id/unlock', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params

    const query = { _id: id }
    if (!req.user.isSuperAccount) {
      query.vendor = req.vendorId
    }

    const user = await User.findOne(query)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    if (!user.isAccountLocked()) {
      return res.status(400).json({
        success: false,
        message: 'User account is not locked.'
      })
    }

    await user.resetFailedAttempts()

    // Log account unlock
    await authService.logAuthEvent({
      event: 'security.account.unlocked',
      userId: req.user._id,
      vendorId: req.vendorId,
      portalType: req.portalType,
      request: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl
      },
      metadata: {
        targetUserId: user._id,
        success: true
      }
    })

    res.json({
      success: true,
      message: 'User account unlocked successfully.'
    })

  } catch (error) {
    console.error('Unlock user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== ROLE-SPECIFIC ENDPOINTS ====================

// Get users by role
router.get('/role/:role', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { role } = req.params
    const { page = 1, limit = 10, search } = req.query

    const query = { 
      role,
      vendor: req.vendorId
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Super admin can see all users across vendors
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendor
    }

    const users = await User.find(query)
      .select('-password')
      .populate('vendor', 'name domain')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        users,
        role,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get users by role error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get current user profile
router.get('/profile/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('vendor', 'name domain')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    // Get user sessions
    const sessions = await Session.findActiveSessions(user._id, user.vendor)

    res.json({
      success: true,
      data: {
        user,
        activeSessions: sessions.length
      }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Update current user profile
router.put('/profile/me', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      company,
      position,
      department,
      phone,
      preferences
    } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (company !== undefined) user.company = company
    if (position !== undefined) user.position = position
    if (department !== undefined) user.department = department
    if (phone !== undefined) user.phone = phone
    if (preferences) user.preferences = { ...user.preferences, ...preferences }

    await user.save()

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          company: user.company,
          position: user.position,
          department: user.department,
          phone: user.phone,
          preferences: user.preferences
        }
      }
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

module.exports = router 