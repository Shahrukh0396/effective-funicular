const User = require('../models/User')
const Session = require('../models/Session')
const AuditLog = require('../models/AuditLog')
const securityService = require('./securityService')
const sessionService = require('./sessionService')
const ipRestrictionService = require('./ipRestrictionService')
const config = require('../config')

class MonitoringService {
  // Real-time system monitoring
  async monitorSystem() {
    try {
      const [
        securityStatus,
        sessionHealth,
        ipAnalytics,
        performanceMetrics
      ] = await Promise.all([
        this.getSecurityStatus(),
        this.getSessionHealth(),
        this.getIPAnalytics(),
        this.getPerformanceMetrics()
      ])
      
      return {
        timestamp: new Date(),
        security: securityStatus,
        sessions: sessionHealth,
        ips: ipAnalytics,
        performance: performanceMetrics,
        overallHealth: this.calculateOverallHealth(securityStatus, sessionHealth, ipAnalytics, performanceMetrics)
      }
    } catch (error) {
      console.error('System monitoring error:', error)
      throw error
    }
  }

  // Get comprehensive security status
  async getSecurityStatus() {
    try {
      const [
        securityStats,
        suspiciousActivities,
        lockedAccounts,
        expiredPasswords,
        mfaStats
      ] = await Promise.all([
        User.getSecurityStats(),
        AuditLog.findSuspiciousActivities(60 * 60 * 1000), // Last hour
        User.findLockedAccounts(),
        User.findExpiredPasswords(),
        this.getMFAStats()
      ])

      return {
        stats: securityStats[0] || {
          totalUsers: 0,
          lockedAccounts: 0,
          expiredPasswords: 0,
          suspiciousUsers: 0,
          mfaEnabled: 0,
          avgRiskScore: 0
        },
        suspiciousActivities: suspiciousActivities.length,
        lockedAccounts: lockedAccounts.length,
        expiredPasswords: expiredPasswords.length,
        mfa: mfaStats,
        riskLevel: this.calculateSecurityRiskLevel(securityStats[0], suspiciousActivities.length)
      }
    } catch (error) {
      console.error('Get security status error:', error)
      throw error
    }
  }

  // Get session health metrics
  async getSessionHealth() {
    try {
      const [
        sessionStats,
        suspiciousSessions,
        idleSessions,
        expiredSessions
      ] = await Promise.all([
        sessionService.getSessionStats(),
        sessionService.getSuspiciousSessions(10),
        sessionService.checkIdleSessions(),
        sessionService.checkExpiredSessions()
      ])

      return {
        stats: sessionStats,
        suspiciousSessions: suspiciousSessions.length,
        idleSessions: idleSessions.count,
        expiredSessions: expiredSessions.count,
        healthScore: this.calculateSessionHealthScore(sessionStats, suspiciousSessions.length)
      }
    } catch (error) {
      console.error('Get session health error:', error)
      throw error
    }
  }

  // Get IP analytics
  async getIPAnalytics() {
    try {
      const [
        ipAnalytics,
        suspiciousIPs
      ] = await Promise.all([
        ipRestrictionService.getIPAnalytics(),
        ipRestrictionService.getSuspiciousIPs(20)
      ])

      return {
        totalIPs: ipAnalytics.length,
        suspiciousIPs: suspiciousIPs.length,
        topIPs: ipAnalytics.slice(0, 10),
        suspiciousIPList: suspiciousIPs
      }
    } catch (error) {
      console.error('Get IP analytics error:', error)
      throw error
    }
  }

  // Get performance metrics
  async getPerformanceMetrics() {
    try {
      const metrics = {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage(),
        activeConnections: 0, // Would be tracked in production
        responseTime: 0, // Would be tracked in production
        errorRate: 0, // Would be tracked in production
        databaseConnections: 0 // Would be tracked in production
      }

      return metrics
    } catch (error) {
      console.error('Get performance metrics error:', error)
      throw error
    }
  }

  // Get MFA statistics
  async getMFAStats() {
    try {
      const mfaStats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            mfaEnabled: {
              $sum: { $cond: ['$security.mfaEnabled', 1, 0] }
            },
            mfaConfigured: {
              $sum: { $cond: [{ $ne: ['$security.mfaSecret', null] }, 1, 0] }
            },
            avgBackupCodes: {
              $avg: { $size: { $ifNull: ['$security.backupCodes', []] } }
            }
          }
        }
      ])

      const stats = mfaStats[0] || {
        totalUsers: 0,
        mfaEnabled: 0,
        mfaConfigured: 0,
        avgBackupCodes: 0
      }

      return {
        ...stats,
        mfaAdoptionRate: stats.totalUsers > 0 ? (stats.mfaEnabled / stats.totalUsers) * 100 : 0,
        mfaSetupRate: stats.totalUsers > 0 ? (stats.mfaConfigured / stats.totalUsers) * 100 : 0
      }
    } catch (error) {
      console.error('Get MFA stats error:', error)
      throw error
    }
  }

  // Calculate overall system health
  calculateOverallHealth(security, sessions, ips, performance) {
    let healthScore = 100

    // Deduct points for security issues
    if (security.suspiciousActivities > 5) healthScore -= 20
    if (security.lockedAccounts > 10) healthScore -= 15
    if (security.expiredPasswords > 20) healthScore -= 10

    // Deduct points for session issues
    if (sessions.suspiciousSessions > 5) healthScore -= 15
    if (sessions.idleSessions > 10) healthScore -= 5
    if (sessions.expiredSessions > 5) healthScore -= 5

    // Deduct points for IP issues
    if (ips.suspiciousIPs > 10) healthScore -= 20

    // Deduct points for performance issues
    const memoryUsage = performance.memoryUsage.heapUsed / performance.memoryUsage.heapTotal
    if (memoryUsage > 0.8) healthScore -= 10

    return Math.max(healthScore, 0)
  }

  // Calculate security risk level
  calculateSecurityRiskLevel(securityStats, suspiciousActivities) {
    let riskScore = 0

    if (securityStats) {
      const userRisk = (securityStats.lockedAccounts + securityStats.suspiciousUsers) / Math.max(securityStats.totalUsers, 1)
      riskScore += userRisk * 0.5
    }

    if (suspiciousActivities > 0) {
      riskScore += Math.min(suspiciousActivities * 0.1, 0.5)
    }

    if (riskScore >= 0.8) return 'critical'
    if (riskScore >= 0.6) return 'high'
    if (riskScore >= 0.4) return 'medium'
    if (riskScore >= 0.2) return 'low'
    return 'minimal'
  }

  // Calculate session health score
  calculateSessionHealthScore(sessionStats, suspiciousSessions) {
    let healthScore = 100

    if (sessionStats.total > 0) {
      const suspiciousRate = suspiciousSessions / sessionStats.total
      if (suspiciousRate > 0.1) healthScore -= 30
      if (suspiciousRate > 0.05) healthScore -= 15
    }

    if (sessionStats.active > 1000) healthScore -= 10
    if (sessionStats.blacklisted > sessionStats.active * 0.1) healthScore -= 20

    return Math.max(healthScore, 0)
  }

  // Generate alerts based on monitoring data
  async generateAlerts(monitoringData) {
    const alerts = []

    // Security alerts
    if (monitoringData.security.riskLevel === 'critical') {
      alerts.push({
        type: 'security_critical',
        severity: 'critical',
        message: 'System is at critical security risk level',
        timestamp: new Date()
      })
    }

    if (monitoringData.security.suspiciousActivities > 10) {
      alerts.push({
        type: 'high_suspicious_activity',
        severity: 'high',
        message: `${monitoringData.security.suspiciousActivities} suspicious activities detected`,
        timestamp: new Date()
      })
    }

    if (monitoringData.security.lockedAccounts > 20) {
      alerts.push({
        type: 'high_locked_accounts',
        severity: 'medium',
        message: `${monitoringData.security.lockedAccounts} accounts are currently locked`,
        timestamp: new Date()
      })
    }

    // Session alerts
    if (monitoringData.sessions.suspiciousSessions > 5) {
      alerts.push({
        type: 'suspicious_sessions',
        severity: 'high',
        message: `${monitoringData.sessions.suspiciousSessions} suspicious sessions detected`,
        timestamp: new Date()
      })
    }

    if (monitoringData.sessions.idleSessions > 20) {
      alerts.push({
        type: 'idle_sessions',
        severity: 'medium',
        message: `${monitoringData.sessions.idleSessions} sessions timed out due to inactivity`,
        timestamp: new Date()
      })
    }

    // IP alerts
    if (monitoringData.ips.suspiciousIPs > 15) {
      alerts.push({
        type: 'suspicious_ips',
        severity: 'high',
        message: `${monitoringData.ips.suspiciousIPs} suspicious IP addresses detected`,
        timestamp: new Date()
      })
    }

    // Performance alerts
    const memoryUsage = monitoringData.performance.memoryUsage.heapUsed / monitoringData.performance.memoryUsage.heapTotal
    if (memoryUsage > 0.9) {
      alerts.push({
        type: 'high_memory_usage',
        severity: 'high',
        message: 'High memory usage detected',
        timestamp: new Date()
      })
    }

    return alerts
  }

  // Get monitoring dashboard data
  async getDashboardData() {
    try {
      const monitoring = await this.monitorSystem()
      const alerts = await this.generateAlerts(monitoring)
      
      return {
        monitoring,
        alerts,
        summary: {
          overallHealth: monitoring.overallHealth,
          securityRisk: monitoring.security.riskLevel,
          sessionHealth: monitoring.sessions.healthScore,
          activeAlerts: alerts.length,
          criticalAlerts: alerts.filter(a => a.severity === 'critical').length
        }
      }
    } catch (error) {
      console.error('Get dashboard data error:', error)
      throw error
    }
  }

  // Get real-time metrics
  async getRealTimeMetrics() {
    try {
      const [
        activeSessions,
        recentLogins,
        recentFailures,
        suspiciousActivities
      ] = await Promise.all([
        Session.countDocuments({ isActive: true }),
        AuditLog.countDocuments({
          event: 'user.login.success',
          timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
        }),
        AuditLog.countDocuments({
          event: 'user.login.failed',
          timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
        }),
        AuditLog.countDocuments({
          'security.suspiciousActivity': true,
          timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
        })
      ])

      return {
        activeSessions,
        recentLogins,
        recentFailures,
        suspiciousActivities,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Get real-time metrics error:', error)
      throw error
    }
  }

  // Generate monitoring report
  async generateMonitoringReport(timeWindow = 24 * 60 * 60 * 1000) {
    try {
      const monitoring = await this.monitorSystem()
      const alerts = await this.generateAlerts(monitoring)
      
      return {
        reportId: require('crypto').randomBytes(16).toString('hex'),
        generatedAt: new Date(),
        timeWindow,
        monitoring,
        alerts,
        recommendations: this.generateRecommendations(monitoring, alerts)
      }
    } catch (error) {
      console.error('Generate monitoring report error:', error)
      throw error
    }
  }

  // Generate recommendations based on monitoring data
  generateRecommendations(monitoring, alerts) {
    const recommendations = []

    if (monitoring.overallHealth < 70) {
      recommendations.push({
        priority: 'high',
        action: 'Review system health issues',
        description: 'System health score is below acceptable threshold'
      })
    }

    if (monitoring.security.riskLevel === 'critical') {
      recommendations.push({
        priority: 'immediate',
        action: 'Implement emergency security measures',
        description: 'System is at critical security risk'
      })
    }

    if (monitoring.security.suspiciousActivities > 10) {
      recommendations.push({
        priority: 'high',
        action: 'Investigate suspicious activities',
        description: 'High number of suspicious activities detected'
      })
    }

    if (monitoring.sessions.suspiciousSessions > 5) {
      recommendations.push({
        priority: 'high',
        action: 'Review suspicious sessions',
        description: 'Multiple suspicious sessions detected'
      })
    }

    if (monitoring.ips.suspiciousIPs > 10) {
      recommendations.push({
        priority: 'medium',
        action: 'Review IP access patterns',
        description: 'Multiple suspicious IP addresses detected'
      })
    }

    return recommendations
  }
}

module.exports = new MonitoringService() 