const express = require('express')
const rateLimit = require('express-rate-limit')
const { body, query } = require('express-validator')
const { auth, authorize, hasPermission, superAdminOnly, employeeOrAdmin, validateSession } = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')
const { generalLimiter } = require('../middleware/security')
const User = require('../models/User')
const Vendor = require('../models/Vendor')
const Session = require('../models/Session')
const AuditLog = require('../models/AuditLog')
const Attendance = require('../models/Attendance')
const Project = require('../models/Project')
const Task = require('../models/Task')
const authService = require('../services/authService')
const sessionService = require('../services/sessionService')
const securityService = require('../services/securityService')
const config = require('../config')
const ipRestrictionService = require('../services/ipRestrictionService')
const monitoringService = require('../services/monitoringService')

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

// Apply authentication to all admin routes
router.use(auth)

// ==================== SECURITY MONITORING ====================

// Get comprehensive security overview
router.get('/security/overview', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const monitoring = await securityService.monitorSystemSecurity()
    
    res.json({
      success: true,
      data: monitoring
    })
  } catch (error) {
    console.error('Get security overview error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get security report
router.get('/security/report', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { timeWindow = 24 * 60 * 60 * 1000 } = req.query
    const report = await securityService.generateSecurityReport(parseInt(timeWindow))
    
    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Generate security report error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get security alerts
router.get('/security/alerts', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const alerts = await securityService.checkSecurityAlerts()
    
    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Get security alerts error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get detected threats
router.get('/security/threats', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const threats = await securityService.detectThreats()
    
    res.json({
      success: true,
      data: {
        threats,
        count: threats.length,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Get security threats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get locked accounts
router.get('/security/locked-accounts', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const lockedAccounts = await User.findLockedAccounts()
    
    res.json({
      success: true,
      data: {
        accounts: lockedAccounts,
        count: lockedAccounts.length,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Get locked accounts error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Unlock user account
router.post('/security/unlock-account/:userId', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { userId } = req.params
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }
    
    await user.unlockAccount()
    
    // Log the unlock action
    await AuditLog.logAuthEvent({
      event: 'security.account.unlocked',
      userId: user._id,
      vendorId: user.vendorId,
      portalType: 'admin',
      request: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl
      },
      security: {
        riskScore: 0,
        suspiciousActivity: false
      },
      metadata: {
        reason: 'Manual unlock by admin',
        unlockedBy: req.user._id
      }
    })
    
    res.json({
      success: true,
      message: 'Account unlocked successfully.',
      data: {
        userId: user._id,
        email: user.email,
        unlockedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Unlock account error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get users with expired passwords
router.get('/security/expired-passwords', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const expiredPasswords = await User.findExpiredPasswords()
    
    res.json({
      success: true,
      data: {
        users: expiredPasswords,
        count: expiredPasswords.length,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Get expired passwords error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get users needing password change
router.get('/security/password-warnings', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { daysWarning = 7 } = req.query
    const usersNeedingChange = await User.findUsersNeedingPasswordChange(parseInt(daysWarning))
    
    res.json({
      success: true,
      data: {
        users: usersNeedingChange,
        count: usersNeedingChange.length,
        warningDays: parseInt(daysWarning),
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Get password warnings error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get suspicious users
router.get('/security/suspicious-users', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const suspiciousUsers = await User.findSuspiciousUsers()
    
    res.json({
      success: true,
      data: {
        users: suspiciousUsers,
        count: suspiciousUsers.length,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Get suspicious users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== SESSION MANAGEMENT ====================

// Get session statistics
router.get('/sessions/stats', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const stats = await sessionService.getSessionStats()
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Get session stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get session health
router.get('/sessions/health', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const health = await sessionService.monitorSessionHealth()
    
    res.json({
      success: true,
      data: health
    })
  } catch (error) {
    console.error('Get session health error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get suspicious sessions
router.get('/sessions/suspicious', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { limit = 50 } = req.query
    const sessions = await sessionService.getSuspiciousSessions(parseInt(limit))
    
    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Get suspicious sessions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Force logout user
router.post('/sessions/force-logout/:userId', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { userId } = req.params
    const { reason = 'Admin action' } = req.body
    
    const result = await sessionService.forceLogoutUser(userId, reason)
    
    res.json({
      success: true,
      message: 'User logged out successfully.',
      data: result
    })
  } catch (error) {
    console.error('Force logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get user session activity
router.get('/sessions/user/:userId', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 50 } = req.query
    
    const activity = await sessionService.getUserSessionActivity(userId, null, parseInt(limit))
    
    res.json({
      success: true,
      data: {
        activity,
        count: activity.length,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Get user session activity error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Clean up old sessions
router.post('/sessions/cleanup', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { daysOld = 30 } = req.body
    const result = await sessionService.cleanupOldSessions(parseInt(daysOld))
    
    res.json({
      success: true,
      message: 'Session cleanup completed.',
      data: result
    })
  } catch (error) {
    console.error('Session cleanup error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== IP RESTRICTIONS ====================

// Get IP analytics
router.get('/ip-restrictions/analytics', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const analytics = await ipRestrictionService.getIPAnalytics()
    
    res.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Get IP analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get suspicious IPs
router.get('/ip-restrictions/suspicious', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { limit = 50 } = req.query
    const ips = await ipRestrictionService.getSuspiciousIPs(parseInt(limit))
    
    res.json({
      success: true,
      data: {
        ips,
        count: ips.length,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Get suspicious IPs error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Add IP to user whitelist
router.post('/ip-restrictions/whitelist/:userId', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { userId } = req.params
    const { ipAddress } = req.body
    
    if (!ipAddress) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required.'
      })
    }
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }
    
    await ipRestrictionService.addIPToWhitelist(user, ipAddress)
    
    res.json({
      success: true,
      message: 'IP added to whitelist successfully.',
      data: {
        userId: user._id,
        ipAddress,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Add IP to whitelist error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Remove IP from user whitelist
router.delete('/ip-restrictions/whitelist/:userId', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { userId } = req.params
    const { ipAddress } = req.body
    
    if (!ipAddress) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required.'
      })
    }
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }
    
    await ipRestrictionService.removeIPFromWhitelist(user, ipAddress)
    
    res.json({
      success: true,
      message: 'IP removed from whitelist successfully.',
      data: {
        userId: user._id,
        ipAddress,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Remove IP from whitelist error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Block IP globally
router.post('/ip-restrictions/block', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { ipAddress, reason = 'Suspicious activity' } = req.body
    
    if (!ipAddress) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required.'
      })
    }
    
    await ipRestrictionService.blockIP(ipAddress, reason)
    
    res.json({
      success: true,
      message: 'IP blocked successfully.',
      data: {
        ipAddress,
        reason,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Block IP error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Unblock IP globally
router.post('/ip-restrictions/unblock', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { ipAddress, reason = 'Manual unblock' } = req.body
    
    if (!ipAddress) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required.'
      })
    }
    
    await ipRestrictionService.unblockIP(ipAddress, reason)
    
    res.json({
      success: true,
      message: 'IP unblocked successfully.',
      data: {
        ipAddress,
        reason,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Unblock IP error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

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

    const query = { vendorId: req.vendorId }

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
      delete query.vendorId
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
      vendorId: req.vendorId 
    }

    // Super admin can operate on any vendor
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendorId
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

// ==================== EMPLOYEE MANAGEMENT ====================

// Get all employees for admin
router.get('/employees', auth, employeeOrAdmin, async (req, res) => {
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

    const query = { 
      vendorId: req.vendorId,
      role: { $in: ['employee', 'senior', 'lead', 'admin'] }
    }

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
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Super admin can see all employees across vendors
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendorId
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const employees = await User.find(query)
      .select('-password')
      .populate('vendor', 'name domain')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get admin employees error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get employee details
router.get('/employees/:employeeId/details', auth, employeeOrAdmin, async (req, res) => {
  try {
    const { employeeId } = req.params

    const employee = await User.findOne({
      _id: employeeId,
      vendorId: req.vendorId,
      role: { $in: ['employee', 'senior', 'lead', 'admin'] }
    }).select('-password')

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      })
    }

    // Get employee's recent activity
    const recentActivity = await AuditLog.find({
      userId: employeeId,
      vendorId: req.vendorId
    })
    .sort({ timestamp: -1 })
    .limit(10)

    // Get employee's attendance data
    const attendanceData = await Attendance.find({
      userId: employeeId,
      vendorId: req.vendorId
    })
    .sort({ date: -1 })
    .limit(30)

    res.json({
      success: true,
      data: {
        employee,
        recentActivity,
        attendanceData
      }
    })

  } catch (error) {
    console.error('Get employee details error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== ADMIN ATTENDANCE ENDPOINTS ====================

/**
 * @swagger
 * /api/admin/attendance/overview:
 *   get:
 *     summary: Get attendance overview for admin
 *     description: Get attendance statistics and current status for all employees
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance overview retrieved successfully
 */
router.get('/attendance/overview', authorize(['admin', 'super_admin', 'vendor_admin']), async (req, res) => {
  try {
    console.log('🔍 Admin Attendance - Request received')
    console.log('🔍 Admin Attendance - User:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      vendorId: req.vendorId
    })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get all employees for this vendor
    const employees = await User.find({
      vendorId: req.vendorId,
      role: { $in: ['employee', 'senior', 'lead', 'admin'] }
    }).select('firstName lastName email role isActive')
    
    // Get today's attendance for all employees
    const todayAttendance = await Attendance.find({
      employee: { $in: employees.map(emp => emp._id) },
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('employee', 'firstName lastName email')
    
    // Calculate statistics
    const totalEmployees = employees.length
    const presentToday = todayAttendance.filter(a => a.checkIn).length
    const absentToday = totalEmployees - presentToday
    const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0
    
    // Get current status for each employee
    const employeeStatus = employees.map(employee => {
      const attendance = todayAttendance.find(a => a.employee._id.toString() === employee._id.toString())
      return {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        isActive: employee.isActive,
        checkedIn: !!attendance?.checkIn,
        checkedOut: !!attendance?.checkOut,
        onBreak: !!attendance?.currentBreak?.isActive,
        checkInTime: attendance?.checkIn,
        checkOutTime: attendance?.checkOut,
        breakStartTime: attendance?.currentBreak?.startTime,
        breakReason: attendance?.currentBreak?.reason,
        totalHours: attendance?.totalHours || 0,
        status: attendance ? 
          (attendance.checkOut ? 'checked_out' : 
           attendance.currentBreak?.isActive ? 'on_break' : 'checked_in') 
          : 'not_checked_in'
      }
    })
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        employeeStatus
      }
    })
  } catch (error) {
    console.error('Get attendance overview error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

/**
 * @swagger
 * /api/admin/attendance/employee/:employeeId:
 *   get:
 *     summary: Get employee attendance history
 *     description: Get detailed attendance history for a specific employee
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Employee attendance history retrieved successfully
 */
router.get('/attendance/employee/:employeeId', authorize(['admin', 'super_admin', 'vendor_admin']), async (req, res) => {
  try {
    const { employeeId } = req.params
    const { startDate, endDate } = req.query
    
    // Verify employee belongs to this vendor
    const employee = await User.findOne({
      _id: employeeId,
      vendorId: req.vendorId,
      role: { $in: ['employee', 'senior', 'lead', 'admin'] }
    })
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      })
    }
    
    // Build query
    const query = { employee: employeeId }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }
    
    // Get attendance history
    const attendanceHistory = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100)
    
    // Calculate summary statistics
    const totalDays = attendanceHistory.length
    const presentDays = attendanceHistory.filter(a => a.checkIn).length
    const totalHours = attendanceHistory.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    const averageHoursPerDay = presentDays > 0 ? totalHours / presentDays : 0
    
    res.json({
      success: true,
      data: {
        employee: {
          _id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          role: employee.role
        },
        attendanceHistory,
        summary: {
          totalDays,
          presentDays,
          absentDays: totalDays - presentDays,
          totalHours,
          averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100
        }
      }
    })
  } catch (error) {
    console.error('Get employee attendance history error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

/**
 * @swagger
 * /api/admin/attendance/report:
 *   get:
 *     summary: Generate attendance report
 *     description: Generate comprehensive attendance report for all employees
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance report generated successfully
 */
router.get('/attendance/report', authorize(['admin', 'super_admin', 'vendor_admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required.'
      })
    }
    
    // Get all employees for this vendor
    const employees = await User.find({
      vendorId: req.vendorId,
      role: { $in: ['employee', 'senior', 'lead', 'admin'] }
    }).select('firstName lastName email role')
    
    // Get attendance data for all employees in the date range
    const attendanceData = await Attendance.find({
      employee: { $in: employees.map(emp => emp._id) },
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('employee', 'firstName lastName email role')
    
    // Generate report data
    const report = employees.map(employee => {
      const employeeAttendance = attendanceData.filter(a => 
        a.employee._id.toString() === employee._id.toString()
      )
      
      const totalDays = employeeAttendance.length
      const presentDays = employeeAttendance.filter(a => a.checkIn).length
      const totalHours = employeeAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
      const averageHoursPerDay = presentDays > 0 ? totalHours / presentDays : 0
      
      return {
        employee: {
          _id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          role: employee.role
        },
        attendance: {
          totalDays,
          presentDays,
          absentDays: totalDays - presentDays,
          totalHours,
          averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
          attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0
        }
      }
    })
    
    // Calculate overall statistics
    const totalEmployees = employees.length
    const totalDaysInRange = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
    const totalExpectedDays = totalEmployees * totalDaysInRange
    const totalPresentDays = report.reduce((sum, r) => sum + r.attendance.presentDays, 0)
    const overallAttendanceRate = totalExpectedDays > 0 ? (totalPresentDays / totalExpectedDays) * 100 : 0
    
    res.json({
      success: true,
      data: {
        dateRange: {
          startDate,
          endDate,
          totalDays: totalDaysInRange
        },
        overallStats: {
          totalEmployees,
          totalExpectedDays,
          totalPresentDays,
          overallAttendanceRate: Math.round(overallAttendanceRate * 100) / 100
        },
        employeeReports: report
      }
    })
  } catch (error) {
    console.error('Generate attendance report error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Add new employee
router.post('/employees', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, position } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided.'
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

    // Create new employee
    const employee = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      position,
      vendorId: req.vendorId,
      isActive: true
    })

    await employee.save()

    // Log employee creation
    await authService.logAuthEvent({
      event: 'admin.employee.created',
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
        createdEmployeeId: employee._id,
        createdEmployeeEmail: employee.email,
        role: employee.role
      }
    })

    res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      data: {
        employee: {
          _id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          role: employee.role,
          position: employee.position,
          isActive: employee.isActive
        }
      }
    })

  } catch (error) {
    console.error('Create employee error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Toggle employee status
router.put('/employees/:employeeId/toggle-status', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { employeeId } = req.params

    const employee = await User.findOne({
      _id: employeeId,
      vendorId: req.vendorId,
      role: { $in: ['employee', 'senior', 'lead', 'admin'] }
    })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      })
    }

    // Toggle active status
    employee.isActive = !employee.isActive
    await employee.save()

    // Log status change
    await authService.logAuthEvent({
      event: 'admin.employee.status_changed',
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
        employeeId: employee._id,
        employeeEmail: employee.email,
        newStatus: employee.isActive ? 'active' : 'inactive'
      }
    })

    res.json({
      success: true,
      message: `Employee ${employee.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        employee: {
          _id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          isActive: employee.isActive
        }
      }
    })

  } catch (error) {
    console.error('Toggle employee status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== CLIENT MANAGEMENT ====================

// Get all clients for admin
router.get('/clients', auth, employeeOrAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const query = { 
      vendorId: req.vendorId,
      role: 'client'
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

    // Super admin can see all clients across vendors
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendorId
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const clients = await User.find(query)
      .select('-password')
      .populate('vendorId', 'name domain')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get admin clients error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Add new client
router.post('/clients', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, company, phone } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required.'
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

    // Create new client
    const client = new User({
      firstName,
      lastName,
      email,
      password,
      role: 'client',
      company,
      phone,
      vendorId: req.vendorId,
      isActive: true
    })

    await client.save()

    // Log client creation
    await authService.logAuthEvent({
      event: 'admin.client.created',
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
        createdClientId: client._id,
        createdClientEmail: client.email,
        company: client.company
      }
    })

    res.status(201).json({
      success: true,
      message: 'Client created successfully.',
      data: {
        client: {
          _id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          company: client.company,
          phone: client.phone,
          isActive: client.isActive
        }
      }
    })

  } catch (error) {
    console.error('Create client error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Toggle client status
router.put('/clients/:clientId/toggle-status', auth, hasPermission('manage_users'), async (req, res) => {
  try {
    const { clientId } = req.params

    const client = await User.findOne({
      _id: clientId,
      vendorId: req.vendorId,
      role: 'client'
    })

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.'
      })
    }

    // Toggle active status
    client.isActive = !client.isActive
    await client.save()

    // Log status change
    await authService.logAuthEvent({
      event: 'admin.client.status_changed',
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
        clientId: client._id,
        clientEmail: client.email,
        newStatus: client.isActive ? 'active' : 'inactive'
      }
    })

    res.json({
      success: true,
      message: `Client ${client.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        client: {
          _id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          company: client.company,
          isActive: client.isActive
        }
      }
    })

  } catch (error) {
    console.error('Toggle client status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== PROJECT MANAGEMENT ====================

// Get all projects for admin
router.get('/projects', auth, employeeOrAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const query = { vendorId: req.vendorId }

    // Status filtering
    if (status) {
      query.status = status
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'client.firstName': { $regex: search, $options: 'i' } },
        { 'client.lastName': { $regex: search, $options: 'i' } }
      ]
    }

    // Super admin can see all projects across vendors
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendorId
    }
    
    // For vendor_admin, show all projects for the vendor (not just filtered ones)
    // This ensures admin sees all projects that employees can see

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Debug: Check all projects for this vendor
    const allProjectsForVendor = await Project.find({ vendorId: req.vendorId })
    console.log('🔍 Admin Projects - All projects for vendor:', allProjectsForVendor.length)
    console.log('🔍 Admin Projects - Project IDs:', allProjectsForVendor.map(p => ({ id: p._id, name: p.name, vendorId: p.vendorId })))

    const projects = await Project.find(query)
      .populate('clientId', 'firstName lastName email company')
      .populate('team.projectManager', 'firstName lastName email')
      .populate('team.members.user', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Project.countDocuments(query)
    console.log('🔍 Admin Projects - Filtered projects count:', projects.length)
    console.log('🔍 Admin Projects - Query used:', query)

    // Get project statistics
    const stats = await Project.aggregate([
      { $match: { vendorId: req.vendorId } },
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
          actualBudget: { $sum: '$budget.actual' }
        }
      }
    ])

    const projectStats = stats[0] || {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalBudget: 0,
      actualBudget: 0
    }

    res.json({
      success: true,
      data: {
        projects,
        stats: projectStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get admin projects error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Create new project
router.post('/projects', auth, hasPermission('manage_projects'), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      clientId, 
      status, 
      budget, 
      deadline,
      teamMembers,
      projectManager
    } = req.body

    // Validate required fields
    if (!name || !description || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and client are required.'
      })
    }

    // Check if client exists
    const client = await User.findOne({
      _id: clientId,
      vendorId: req.vendorId,
      role: 'client'
    })

    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Client not found.'
      })
    }

    // Create new project
    const project = new Project({
      name,
      description,
      clientId,
      status: status || 'planning',
      budget: {
        estimated: budget?.estimated || 0,
        actual: budget?.actual || 0
      },
      timeline: {
        startDate: new Date(),
        endDate: deadline ? new Date(deadline) : null
      },
      team: {
        projectManager: projectManager || req.user._id,
        members: teamMembers || []
      },
      vendorId: req.vendorId
    })

    await project.save()

    // Log project creation
    await authService.logAuthEvent({
      event: 'admin.project.created',
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
        projectId: project._id,
        projectName: project.name,
        clientId: project.clientId
      }
    })

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: {
        project: {
          _id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          budget: project.budget,
          timeline: project.timeline
        }
      }
    })

  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Update project
router.put('/projects/:projectId', auth, hasPermission('manage_projects'), async (req, res) => {
  try {
    const { projectId } = req.params
    const updateData = req.body

    const project = await Project.findOne({
      _id: projectId,
      vendorId: req.vendorId
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      })
    }

    // Update project fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'vendor') {
        project[key] = updateData[key]
      }
    })

    await project.save()

    // Log project update
    await authService.logAuthEvent({
      event: 'admin.project.updated',
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
        projectId: project._id,
        projectName: project.name,
        updatedFields: Object.keys(updateData)
      }
    })

    res.json({
      success: true,
      message: 'Project updated successfully.',
      data: {
        project: {
          _id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          budget: project.budget,
          timeline: project.timeline
        }
      }
    })

  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Delete project
router.delete('/projects/:projectId', auth, hasPermission('manage_projects'), async (req, res) => {
  try {
    const { projectId } = req.params

    const project = await Project.findOne({
      _id: projectId,
      vendorId: req.vendorId
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      })
    }

    // Soft delete - mark as deleted
    project.isDeleted = true
    project.deletedAt = new Date()
    await project.save()

    // Log project deletion
    await authService.logAuthEvent({
      event: 'admin.project.deleted',
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
        projectId: project._id,
        projectName: project.name
      }
    })

    res.json({
      success: true,
      message: 'Project deleted successfully.'
    })

  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// ==================== TASK MANAGEMENT ====================

// Get all tasks for admin
router.get('/tasks', auth, employeeOrAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const query = { vendor: req.vendorId }

    // Status filtering
    if (status) {
      query.status = status
    }

    // Priority filtering
    if (priority) {
      query.priority = priority
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Super admin can see all tasks across vendors
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendor
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Task.countDocuments(query)

    // Get task statistics
    const stats = await Task.aggregate([
      { $match: { vendor: req.vendorId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: { $cond: [{ $lt: ['$dueDate', new Date()] }, 1, 0] }
          }
        }
      }
    ])

    const taskStats = stats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0
    }

    res.json({
      success: true,
      data: {
        tasks,
        stats: taskStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get admin tasks error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Create new task
router.post('/tasks', auth, hasPermission('manage_tasks'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      projectId, 
      assignedTo, 
      priority, 
      dueDate,
      estimatedHours
    } = req.body

    // Validate required fields
    if (!title || !description || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and project are required.'
      })
    }

    // Check if project exists
    const project = await Project.findOne({
      _id: projectId,
      vendorId: req.vendorId
    })

    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'Project not found.'
      })
    }

    // Create new task
    const task = new Task({
      title,
      description,
      projectId,
      assignedTo,
      priority: priority || 'medium',
      status: 'todo',
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours || 0,
      createdBy: req.user._id,
      vendor: req.vendorId
    })

    await task.save()

    // Log task creation
    await authService.logAuthEvent({
      event: 'admin.task.created',
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
        taskId: task._id,
        taskTitle: task.title,
        projectId: task.projectId
      }
    })

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: {
        task: {
          _id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate
        }
      }
    })

  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Update task
router.put('/tasks/:taskId', auth, hasPermission('manage_tasks'), async (req, res) => {
  try {
    const { taskId } = req.params
    const updateData = req.body

    const task = await Task.findOne({
      _id: taskId,
      vendor: req.vendorId
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      })
    }

    // Update task fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'vendor') {
        task[key] = updateData[key]
      }
    })

    await task.save()

    // Log task update
    await authService.logAuthEvent({
      event: 'admin.task.updated',
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
        taskId: task._id,
        taskTitle: task.title,
        updatedFields: Object.keys(updateData)
      }
    })

    res.json({
      success: true,
      message: 'Task updated successfully.',
      data: {
        task: {
          _id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate
        }
      }
    })

  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Delete task
router.delete('/tasks/:taskId', auth, hasPermission('manage_tasks'), async (req, res) => {
  try {
    const { taskId } = req.params

    const task = await Task.findOne({
      _id: taskId,
      vendor: req.vendorId
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      })
    }

    // Soft delete - mark as deleted
    task.isDeleted = true
    task.deletedAt = new Date()
    await task.save()

    // Log task deletion
    await authService.logAuthEvent({
      event: 'admin.task.deleted',
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
        taskId: task._id,
        taskTitle: task.title
      }
    })

    res.json({
      success: true,
      message: 'Task deleted successfully.'
    })

  } catch (error) {
    console.error('Delete task error:', error)
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
      vendorId: req.vendorId 
    }

    // Super admin can unlock any vendor
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      delete query.vendorId
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
      { $match: { vendorId: vendorId, createdAt: { $gte: cutoffDate } } },
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
      { $match: { vendorId: vendorId } },
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

// ==================== ADVANCED MONITORING ====================

// Get monitoring dashboard
router.get('/monitoring/dashboard', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const dashboard = await monitoringService.getDashboardData()
    
    res.json({
      success: true,
      data: dashboard
    })
  } catch (error) {
    console.error('Get monitoring dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get real-time metrics
router.get('/monitoring/realtime', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const metrics = await monitoringService.getRealTimeMetrics()
    
    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Get real-time metrics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Generate monitoring report
router.get('/monitoring/report', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { timeWindow = 24 * 60 * 60 * 1000 } = req.query
    const report = await monitoringService.generateMonitoringReport(parseInt(timeWindow))
    
    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Generate monitoring report error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

// Get system health
router.get('/monitoring/health', authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const monitoring = await monitoringService.monitorSystem()
    
    res.json({
      success: true,
      data: {
        overallHealth: monitoring.overallHealth,
        security: monitoring.security,
        sessions: monitoring.sessions,
        ips: monitoring.ips,
        performance: monitoring.performance,
        timestamp: monitoring.timestamp
      }
    })
  } catch (error) {
    console.error('Get system health error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
})

module.exports = router 