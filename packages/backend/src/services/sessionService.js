const Session = require('../models/Session')
const User = require('../models/User')
const AuditLog = require('../models/AuditLog')
const config = require('../config')

class SessionService {
  // Get session statistics
  async getSessionStats() {
    try {
      const stats = await Session.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            blacklisted: {
              $sum: { $cond: ['$isBlacklisted', 1, 0] }
            },
            suspicious: {
              $sum: { $cond: ['$security.suspiciousActivity', 1, 0] }
            },
            avgRiskScore: { $avg: '$security.riskScore' }
          }
        }
      ])

      return stats[0] || {
        total: 0,
        active: 0,
        blacklisted: 0,
        suspicious: 0,
        avgRiskScore: 0
      }
    } catch (error) {
      console.error('Get session stats error:', error)
      throw error
    }
  }

  // NEW: Enhanced session management features

  // Check for idle sessions and timeout them
  async checkIdleSessions() {
    try {
      const idleTimeout = config.session.idleTimeout || 4 * 60 * 60 * 1000 // 4 hours
      const cutoffTime = new Date(Date.now() - idleTimeout)
      
      // Use a simpler query approach to avoid date casting issues
      const allActiveSessions = await Session.find({
        isActive: true
      }).populate('user', 'email firstName lastName')

      const idleSessions = allActiveSessions.filter(session => {
        return session.lastActivity && session.lastActivity < cutoffTime
      })

      const timeoutPromises = idleSessions.map(async (session) => {
        await session.deactivate()
        
        // Log session timeout
        await AuditLog.logAuthEvent({
          event: 'user.session.timeout',
          userId: session.user._id,
          vendorId: session.vendor,
          portalType: session.portalType,
          sessionId: session.sessionId,
          security: {
            riskScore: session.security.riskScore,
            suspiciousActivity: session.security.suspiciousActivity
          },
          metadata: {
            reason: 'Session timed out due to inactivity',
            idleDuration: Date.now() - session.lastActivity.getTime()
          }
        })

        return session
      })

      const timedOutSessions = await Promise.all(timeoutPromises)
      
      return {
        count: timedOutSessions.length,
        sessions: timedOutSessions.map(s => ({
          sessionId: s.sessionId,
          user: s.user.email,
          portalType: s.portalType,
          lastActivity: s.lastActivity
        }))
      }
    } catch (error) {
      console.error('Check idle sessions error:', error)
      throw error
    }
  }

  // Check for expired sessions
  async checkExpiredSessions() {
    try {
      const sessionTimeout = config.session.sessionTimeout || 24 * 60 * 60 * 1000 // 24 hours
      const cutoffTime = new Date(Date.now() - sessionTimeout)
      
      // Use a simpler query approach to avoid date casting issues
      const allActiveSessions = await Session.find({
        isActive: true
      }).populate('user', 'email firstName lastName')

      const expiredSessions = allActiveSessions.filter(session => {
        return session.loginTime && session.loginTime < cutoffTime
      })

      const expirePromises = expiredSessions.map(async (session) => {
        await session.deactivate()
        
        // Log session expiration
        await AuditLog.logAuthEvent({
          event: 'user.session.timeout',
          userId: session.user._id,
          vendorId: session.vendor,
          portalType: session.portalType,
          sessionId: session.sessionId,
          security: {
            riskScore: session.security.riskScore,
            suspiciousActivity: session.security.suspiciousActivity
          },
          metadata: {
            reason: 'Session expired due to time limit',
            sessionDuration: Date.now() - session.loginTime.getTime()
          }
        })

        return session
      })

      const expiredSessionsList = await Promise.all(expirePromises)
      
      return {
        count: expiredSessionsList.length,
        sessions: expiredSessionsList.map(s => ({
          sessionId: s.sessionId,
          user: s.user.email,
          portalType: s.portalType,
          loginTime: s.loginTime
        }))
      }
    } catch (error) {
      console.error('Check expired sessions error:', error)
      throw error
    }
  }

  // Handle cross-portal sessions for super accounts
  async handleCrossPortalSessions(user, vendor, portalType, requestInfo) {
    try {
      // For super accounts, allow cross-portal sessions
      if (user.role === 'super_admin' || user.isSuperAccount) {
        // Check if user already has a session for this portal
        const existingSession = await Session.findOne({
          user: user._id,
          portalType: portalType,
          isActive: true,
          isBlacklisted: false
        })

        if (existingSession) {
          // Update existing session
          existingSession.lastActivity = new Date()
          existingSession.deviceInfo = {
            userAgent: requestInfo.userAgent,
            ipAddress: requestInfo.ipAddress,
            location: requestInfo.location,
            deviceType: this.detectDeviceType(requestInfo.userAgent)
          }
          await existingSession.save()
          
          return existingSession
        }
      }

      return null // Let the normal session creation handle it
    } catch (error) {
      console.error('Handle cross-portal sessions error:', error)
      throw error
    }
  }

  // Detect device type
  detectDeviceType(userAgent) {
    if (!userAgent) return 'unknown'
    
    const ua = userAgent.toLowerCase()
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile'
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet'
    } else if (ua.includes('windows') || ua.includes('mac') || ua.includes('linux')) {
      return 'desktop'
    }
    
    return 'unknown'
  }

  // Get user session activity
  async getUserSessionActivity(userId, vendorId, limit = 50) {
    try {
      const sessions = await Session.find({
        user: userId,
        vendor: vendorId
      })
      .sort({ lastActivity: -1 })
      .limit(limit)
      .populate('user', 'email firstName lastName')

      return sessions.map(session => ({
        sessionId: session.sessionId,
        portalType: session.portalType,
        deviceInfo: session.deviceInfo,
        lastActivity: session.lastActivity,
        loginTime: session.loginTime,
        isActive: session.isActive,
        riskScore: session.security.riskScore,
        suspiciousActivity: session.security.suspiciousActivity
      }))
    } catch (error) {
      console.error('Get user session activity error:', error)
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
      const idleSessions = await this.checkIdleSessions()
      const expiredSessions = await this.checkExpiredSessions()
      
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

      if (idleSessions.count > 10) {
        issues.push(`${idleSessions.count} sessions timed out due to inactivity`)
      }

      if (expiredSessions.count > 5) {
        issues.push(`${expiredSessions.count} sessions expired`)
      }
      
      return {
        stats,
        suspiciousSessions,
        idleSessions,
        expiredSessions,
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

      // Check idle timeout
      const idleTimeout = config.session.idleTimeout
      if (now - lastActivity > idleTimeout) {
        await session.deactivate()
        return { valid: false, reason: 'Session timed out due to inactivity' }
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

  // Clean up old sessions
  async cleanupOldSessions(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000))
      const result = await Session.deleteMany({
        createdAt: { $lt: cutoffDate },
        isActive: false
      })
      
      return {
        deletedCount: result.deletedCount,
        cutoffDate: cutoffDate
      }
    } catch (error) {
      console.error('Cleanup old sessions error:', error)
      throw error
    }
  }

  // Clean up expired sessions (for scheduler compatibility)
  async cleanupExpiredSessions() {
    try {
      // Check for expired sessions (24 hours)
      const sessionTimeout = config.session.sessionTimeout || 24 * 60 * 60 * 1000
      const cutoffTime = new Date(Date.now() - sessionTimeout)
      
      // Use a simpler query approach to avoid date casting issues
      const allActiveSessions = await Session.find({
        isActive: true
      })

      const expiredSessions = allActiveSessions.filter(session => {
        return session.loginTime && session.loginTime < cutoffTime
      })

      // Deactivate expired sessions
      const deactivatePromises = expiredSessions.map(async (session) => {
        await session.deactivate()
        
        // Log session expiration
        await AuditLog.logAuthEvent({
          event: 'user.session.timeout',
          userId: session.user,
          vendorId: session.vendor,
          portalType: session.portalType,
          sessionId: session.sessionId,
          security: {
            riskScore: session.security.riskScore,
            suspiciousActivity: session.security.suspiciousActivity
          },
          metadata: {
            reason: 'Session expired due to time limit',
            sessionDuration: Date.now() - session.loginTime.getTime()
          }
        })

        return session
      })

      const deactivatedSessions = await Promise.all(deactivatePromises)
      
      return deactivatedSessions.length
    } catch (error) {
      console.error('Cleanup expired sessions error:', error)
      throw error
    }
  }

  // Force logout all sessions for a user
  async forceLogoutUser(userId, reason = 'Admin action') {
    try {
      const sessions = await Session.find({
        user: userId,
        isActive: true
      })

      const logoutPromises = sessions.map(async (session) => {
        await session.blacklist()
        
        // Log force logout
        await AuditLog.logAuthEvent({
          event: 'user.session.destroy',
          userId: userId,
          vendorId: session.vendor,
          portalType: session.portalType,
          sessionId: session.sessionId,
          security: {
            riskScore: session.security.riskScore,
            suspiciousActivity: session.security.suspiciousActivity
          },
          metadata: {
            reason: reason,
            action: 'force_logout'
          }
        })

        return session
      })

      const loggedOutSessions = await Promise.all(logoutPromises)
      
      return {
        count: loggedOutSessions.length,
        sessions: loggedOutSessions.map(s => ({
          sessionId: s.sessionId,
          portalType: s.portalType
        }))
      }
    } catch (error) {
      console.error('Force logout user error:', error)
      throw error
    }
  }
}

module.exports = new SessionService() 