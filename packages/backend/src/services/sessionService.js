const Session = require('../models/Session')
const AuditLog = require('../models/AuditLog')
const User = require('../models/User')
const config = require('../config')

class SessionService {
  // Clean up expired sessions
  async cleanupExpiredSessions() {
    try {
      const sessionTimeout = config.session.sessionTimeout
      const expiredSessions = await Session.findExpiredSessions(sessionTimeout)
      
      for (const session of expiredSessions) {
        await session.deactivate()
        
        // Log session timeout
        await AuditLog.logAuthEvent({
          event: 'user.session.timeout',
          userId: session.user,
          vendorId: session.vendor,
          portalType: session.portalType,
          sessionId: session.sessionId,
          request: {
            ipAddress: session.deviceInfo.ipAddress,
            userAgent: session.deviceInfo.userAgent
          }
        })
      }
      
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`)
      return expiredSessions.length
    } catch (error) {
      console.error('Session cleanup error:', error)
      throw error
    }
  }

  // Clean up old sessions (older than specified days)
  async cleanupOldSessions(daysOld = 30) {
    try {
      const result = await Session.cleanupOldSessions(daysOld)
      console.log(`Cleaned up old sessions: ${result.deletedCount} deleted`)
      return result.deletedCount
    } catch (error) {
      console.error('Old session cleanup error:', error)
      throw error
    }
  }

  // Get session statistics
  async getSessionStats() {
    try {
      const totalSessions = await Session.countDocuments()
      const activeSessions = await Session.countDocuments({ isActive: true })
      const blacklistedSessions = await Session.countDocuments({ isBlacklisted: true })
      
      // Get sessions by portal type
      const portalStats = await Session.aggregate([
        {
          $group: {
            _id: '$portalType',
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: ['$isActive', 1, 0] }
            }
          }
        }
      ])
      
      // Get sessions by device type
      const deviceStats = await Session.aggregate([
        {
          $group: {
            _id: '$deviceInfo.deviceType',
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: ['$isActive', 1, 0] }
            }
          }
        }
      ])
      
      return {
        total: totalSessions,
        active: activeSessions,
        blacklisted: blacklistedSessions,
        portalStats,
        deviceStats
      }
    } catch (error) {
      console.error('Get session stats error:', error)
      throw error
    }
  }

  // Get user session activity
  async getUserSessionActivity(userId, vendorId, limit = 50) {
    try {
      const sessions = await Session.find({
        user: userId,
        vendor: vendorId
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'firstName lastName email')
      
      return sessions
    } catch (error) {
      console.error('Get user session activity error:', error)
      throw error
    }
  }

  // Force logout all sessions for a user
  async forceLogoutUser(userId, vendorId, reason = 'Admin action') {
    try {
      const sessions = await Session.find({
        user: userId,
        vendor: vendorId,
        isActive: true
      })
      
      for (const session of sessions) {
        await session.blacklist()
        
        // Log forced logout
        await AuditLog.logAuthEvent({
          event: 'user.logout.forced',
          userId: userId,
          vendorId: vendorId,
          portalType: session.portalType,
          sessionId: session.sessionId,
          metadata: {
            reason: reason,
            success: true
          }
        })
      }
      
      console.log(`Forced logout for user ${userId}: ${sessions.length} sessions terminated`)
      return sessions.length
    } catch (error) {
      console.error('Force logout error:', error)
      throw error
    }
  }

  // Get suspicious sessions
  async getSuspiciousSessions(limit = 50) {
    try {
      const sessions = await Session.find({
        'security.suspiciousActivity': true,
        isActive: true
      })
      .sort({ 'security.riskScore': -1 })
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .populate('vendor', 'name domain')
      
      return sessions
    } catch (error) {
      console.error('Get suspicious sessions error:', error)
      throw error
    }
  }

  // Monitor session health
  async monitorSessionHealth() {
    try {
      const stats = await this.getSessionStats()
      const suspiciousSessions = await this.getSuspiciousSessions(10)
      
      // Check for potential issues
      const issues = []
      
      if (stats.active > 1000) {
        issues.push('High number of active sessions detected')
      }
      
      if (suspiciousSessions.length > 5) {
        issues.push('Multiple suspicious sessions detected')
      }
      
      if (stats.blacklisted > stats.active * 0.1) {
        issues.push('High number of blacklisted sessions')
      }
      
      return {
        stats,
        suspiciousSessions,
        issues,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Session health monitoring error:', error)
      throw error
    }
  }

  // Validate session security
  async validateSessionSecurity(sessionId) {
    try {
      const session = await Session.findOne({ sessionId })
      
      if (!session) {
        return { valid: false, reason: 'Session not found' }
      }
      
      if (!session.isActive) {
        return { valid: false, reason: 'Session inactive' }
      }
      
      if (session.isBlacklisted) {
        return { valid: false, reason: 'Session blacklisted' }
      }
      
      // Check session timeout
      const sessionTimeout = config.session.sessionTimeout
      const lastActivity = new Date(session.lastActivity)
      const now = new Date()
      
      if (now - lastActivity > sessionTimeout) {
        await session.deactivate()
        return { valid: false, reason: 'Session expired' }
      }
      
      // Check risk score
      if (session.security.riskScore > 0.8) {
        return { valid: false, reason: 'High risk session' }
      }
      
      return { valid: true }
    } catch (error) {
      console.error('Session security validation error:', error)
      return { valid: false, reason: 'Validation error' }
    }
  }

  // Get session analytics
  async getSessionAnalytics(timeWindow = 24 * 60 * 60 * 1000) {
    try {
      const cutoffTime = new Date(Date.now() - timeWindow)
      
      const analytics = await Session.aggregate([
        {
          $match: {
            createdAt: { $gte: cutoffTime }
          }
        },
        {
          $group: {
            _id: {
              portalType: '$portalType',
              deviceType: '$deviceInfo.deviceType',
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              }
            },
            count: { $sum: 1 },
            avgRiskScore: { $avg: '$security.riskScore' },
            suspiciousCount: {
              $sum: { $cond: ['$security.suspiciousActivity', 1, 0] }
            }
          }
        },
        {
          $sort: { '_id.date': -1 }
        }
      ])
      
      return analytics
    } catch (error) {
      console.error('Get session analytics error:', error)
      throw error
    }
  }
}

module.exports = new SessionService() 