const express = require('express')
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
  validateSession 
} = require('../middleware/auth')
const config = require('../config')

const router = express.Router()

// Rate limiting for admin operations
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many admin requests. Please try again later.'
  }
})

// Apply rate limiting to all admin routes (disabled for tests)
if (process.env.NODE_ENV !== 'test') {
  router.use(adminLimiter)
}

// ==================== ADMIN DASHBOARD ====================

// Get admin dashboard data
router.get('/dashboard', auth, employeeOrAdmin, async (req, res) => {
  try {
    const vendorId = req.vendorId

    // Get user statistics
    const userStats = await User.aggregate([
      { $match: { vendor: vendorId } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ])

    // Get session statistics
    const sessionStats = await sessionService.getSessionStats()

    // Get recent activity
    const recentActivity = await AuditLog.findVendorActivity(vendorId, 20)

    // Get security alerts
    const suspiciousSessions = await sessionService.getSuspiciousSessions(5)

    // Get locked accounts
    const lockedAccounts = await User.findLockedAccounts()

    res.json({
      success: true,
      data: {
        userStats,
        sessionStats,
        recentActivity: recentActivity.length,
        suspiciousSessions: suspiciousSessions.length,
        lockedAccounts: lockedAccounts.length,
        timestamp: new Date()
      }
    })

  } catch (error) {
    console.error('Get admin dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== USER MANAGEMENT ====================

// Get all users for admin
router.get('/users', auth, employeeOrAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const query = { vendor: req.vendorId }

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

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const users = await User.find(query)
      .select('-password')
      .populate('vendor', 'name domain')
      .sort(sortOptions)
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
    console.error('Get admin users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Bulk user operations
router.post('/users/bulk', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { action, userIds, data } = req.body

    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and user IDs are required.'
      })
    }

    const query = { 
      _id: { $in: userIds },
      vendor: req.vendorId 
    }

    // Super admin can operate on any vendor
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendor
    }

    let result

    switch (action) {
      case 'activate':
        result = await User.updateMany(query, { isActive: true })
        break
      
      case 'deactivate':
        result = await User.updateMany(query, { isActive: false })
        break
      
      case 'delete':
        // Soft delete - deactivate users
        result = await User.updateMany(query, { isActive: false })
        break
      
      case 'changeRole':
        if (!data.role) {
          return res.status(400).json({
            success: false,
            message: 'Role is required for role change action.'
          })
        }
        result = await User.updateMany(query, { role: data.role })
        break
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action.'
        })
    }

    // Log bulk operation
    await authService.logAuthEvent({
      event: 'admin.bulk_operation',
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
        action,
        affectedUsers: userIds.length,
        success: true
      }
    })

    res.json({
      success: true,
      message: `Bulk operation '${action}' completed successfully.`,
      data: {
        modifiedCount: result.modifiedCount
      }
    })

  } catch (error) {
    console.error('Bulk user operation error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== SESSION MANAGEMENT ====================

// Get all active sessions
router.get('/sessions', auth, employeeOrAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      portalType, 
      deviceType,
      suspiciousOnly = false
    } = req.query

    const query = { 
      vendor: req.vendorId,
      isActive: true 
    }

    if (portalType) {
      query.portalType = portalType
    }

    if (deviceType) {
      query['deviceInfo.deviceType'] = deviceType
    }

    if (suspiciousOnly === 'true') {
      query['security.suspiciousActivity'] = true
    }

    // Super admin can see all sessions
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendor
    }

    const sessions = await Session.find(query)
      .populate('user', 'firstName lastName email')
      .populate('vendor', 'name domain')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Session.countDocuments(query)

    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.sessionId,
          user: session.user,
          vendor: session.vendor,
          portalType: session.portalType,
          deviceInfo: session.deviceInfo,
          lastActivity: session.lastActivity,
          loginTime: session.loginTime,
          riskScore: session.security.riskScore,
          suspiciousActivity: session.security.suspiciousActivity
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get admin sessions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Force logout multiple sessions
router.post('/sessions/bulk-logout', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { sessionIds, reason = 'Admin action' } = req.body

    if (!sessionIds || !Array.isArray(sessionIds)) {
      return res.status(400).json({
        success: false,
        message: 'Session IDs are required.'
      })
    }

    const query = { 
      sessionId: { $in: sessionIds },
      vendor: req.vendorId 
    }

    // Super admin can operate on any vendor
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendor
    }

    const sessions = await Session.find(query)
    
    for (const session of sessions) {
      await session.blacklist()
      
      // Log session termination
      await authService.logAuthEvent({
        event: 'user.session.destroy',
        userId: req.user._id,
        vendorId: req.vendorId,
        portalType: req.portalType,
        sessionId: session.sessionId,
        request: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          url: req.originalUrl
        },
        metadata: {
          reason,
          success: true
        }
      })
    }

    res.json({
      success: true,
      message: `Terminated ${sessions.length} sessions.`,
      data: {
        terminatedCount: sessions.length
      }
    })

  } catch (error) {
    console.error('Bulk session logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== SECURITY MANAGEMENT ====================

// Get security overview
router.get('/security', auth, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const vendorId = req.vendorId

    // Get security statistics
    const securityStats = await AuditLog.getSecurityStats(24 * 60 * 60 * 1000) // Last 24 hours

    // Get suspicious activities
    const suspiciousActivities = await AuditLog.findSuspiciousActivities()

    // Get locked accounts
    const lockedAccounts = await User.findLockedAccounts()

    // Get users with expired passwords
    const expiredPasswords = await User.findExpiredPasswords()

    // Get session health
    const sessionHealth = await sessionService.monitorSessionHealth()

    res.json({
      success: true,
      data: {
        securityStats,
        suspiciousActivities: suspiciousActivities.length,
        lockedAccounts: lockedAccounts.length,
        expiredPasswords: expiredPasswords.length,
        sessionHealth,
        timestamp: new Date()
      }
    })

  } catch (error) {
    console.error('Get security overview error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get suspicious activities
router.get('/security/suspicious', auth, employeeOrAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query

    const suspiciousActivities = await AuditLog.findSuspiciousActivities()
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName email')
      .populate('vendorId', 'name domain')

    res.json({
      success: true,
      data: {
        suspiciousActivities
      }
    })

  } catch (error) {
    console.error('Get suspicious activities error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Unlock all accounts
router.post('/security/unlock-all', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const query = { 
      'security.accountLockedUntil': { $gt: new Date() },
      vendor: req.vendorId 
    }

    // Super admin can unlock any vendor
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendor
    }

    const result = await User.updateMany(query, {
      'security.accountLockedUntil': null,
      'security.failedAttempts': 0
    })

    // Log bulk unlock
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
        unlockedCount: result.modifiedCount,
        success: true
      }
    })

    res.json({
      success: true,
      message: `Unlocked ${result.modifiedCount} accounts.`,
      data: {
        unlockedCount: result.modifiedCount
      }
    })

  } catch (error) {
    console.error('Unlock all accounts error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== ANALYTICS ====================

// Get user analytics
router.get('/analytics/users', auth, employeeOrAdmin, async (req, res) => {
  try {
    const { timeWindow = '30d' } = req.query
    const vendorId = req.vendorId

    // Convert time window to milliseconds
    const timeWindowMs = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    }[timeWindow] || 30 * 24 * 60 * 60 * 1000

    const cutoffDate = new Date(Date.now() - timeWindowMs)

    // User registration trends
    const registrationTrends = await User.aggregate([
      { $match: { vendor: vendorId, createdAt: { $gte: cutoffDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])

    // Role distribution
    const roleDistribution = await User.aggregate([
      { $match: { vendor: vendorId } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ])

    // Login activity
    const loginActivity = await AuditLog.aggregate([
      { 
        $match: { 
          vendorId: vendorId,
          event: { $in: ['user.login.success', 'user.login.failed'] },
          timestamp: { $gte: cutoffDate }
        } 
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            event: '$event'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])

    res.json({
      success: true,
      data: {
        registrationTrends,
        roleDistribution,
        loginActivity,
        timeWindow
      }
    })

  } catch (error) {
    console.error('Get user analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get session analytics
router.get('/analytics/sessions', auth, employeeOrAdmin, async (req, res) => {
  try {
    const { timeWindow = '24h' } = req.query
    const vendorId = req.vendorId

    const sessionAnalytics = await sessionService.getSessionAnalytics(
      timeWindow === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    )

    res.json({
      success: true,
      data: {
        sessionAnalytics,
        timeWindow
      }
    })

  } catch (error) {
    console.error('Get session analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== SYSTEM MAINTENANCE ====================

// Run system maintenance tasks
router.post('/maintenance', auth, superAdminOnly, async (req, res) => {
  try {
    const { tasks } = req.body

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required.'
      })
    }

    const results = {}

    for (const task of tasks) {
      try {
        switch (task) {
          case 'session-cleanup':
            results[task] = await sessionService.cleanupExpiredSessions()
            break
          
          case 'audit-log-cleanup':
            results[task] = await AuditLog.cleanupOldLogs(90)
            break
          
          case 'password-expiration-check':
            results[task] = await User.findExpiredPasswords()
            break
          
          case 'account-lockout-cleanup':
            const now = new Date()
            const lockedUsers = await User.find({
              'security.accountLockedUntil': { $lt: now }
            })
            for (const user of lockedUsers) {
              user.security.accountLockedUntil = null
              user.security.failedAttempts = 0
              await user.save()
            }
            results[task] = lockedUsers.length
            break
          
          case 'session-health-monitoring':
            results[task] = await sessionService.monitorSessionHealth()
            break
          
          default:
            results[task] = { error: 'Unknown task' }
        }
      } catch (error) {
        results[task] = { error: error.message }
      }
    }

    res.json({
      success: true,
      message: 'Maintenance tasks completed.',
      data: {
        results
      }
    })

  } catch (error) {
    console.error('System maintenance error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get system status
router.get('/status', auth, employeeOrAdmin, async (req, res) => {
  try {
    const vendorId = req.vendorId

    // Get various system metrics
    const userCount = await User.countDocuments({ vendor: vendorId })
    const activeUserCount = await User.countDocuments({ vendor: vendorId, isActive: true })
    const sessionCount = await Session.countDocuments({ vendor: vendorId, isActive: true })
    const lockedAccountCount = await User.countDocuments({ 
      vendor: vendorId,
      'security.accountLockedUntil': { $gt: new Date() }
    })

    // Get recent audit logs
    const recentLogs = await AuditLog.findVendorActivity(vendorId, 10)

    // Get session health
    const sessionHealth = await sessionService.monitorSessionHealth()

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers: userCount,
          activeUsers: activeUserCount,
          activeSessions: sessionCount,
          lockedAccounts: lockedAccountCount
        },
        recentActivity: recentLogs.length,
        sessionHealth,
        timestamp: new Date()
      }
    })

  } catch (error) {
    console.error('Get system status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

module.exports = router 