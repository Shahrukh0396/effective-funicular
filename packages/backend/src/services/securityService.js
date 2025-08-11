const User = require('../models/User')
const Session = require('../models/Session')
const AuditLog = require('../models/AuditLog')
const config = require('../config')

class SecurityService {
  // Monitor system security health
  async monitorSystemSecurity() {
    try {
      const stats = await this.getSecurityStats()
      const alerts = await this.checkSecurityAlerts()
      const threats = await this.detectThreats()
      
      return {
        timestamp: new Date(),
        stats,
        alerts,
        threats,
        overallRisk: this.calculateOverallRisk(stats, alerts, threats)
      }
    } catch (error) {
      console.error('Security monitoring error:', error)
      throw error
    }
  }

  // Get comprehensive security statistics
  async getSecurityStats(timeWindow = 24 * 60 * 60 * 1000) {
    const cutoffTime = new Date(Date.now() - timeWindow)
    
    const [
      userStats,
      sessionStats,
      auditStats,
      suspiciousActivities
    ] = await Promise.all([
      User.getSecurityStats(),
      Session.aggregate([
        {
          $match: {
            createdAt: { $gte: cutoffTime }
          }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            activeSessions: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            suspiciousSessions: {
              $sum: { $cond: ['$security.suspiciousActivity', 1, 0] }
            },
            avgRiskScore: { $avg: '$security.riskScore' }
          }
        }
      ]),
      AuditLog.getSecurityStats(timeWindow),
      AuditLog.findSuspiciousActivities(timeWindow)
    ])

    return {
      users: userStats[0] || {
        totalUsers: 0,
        lockedAccounts: 0,
        expiredPasswords: 0,
        suspiciousUsers: 0,
        mfaEnabled: 0,
        avgRiskScore: 0
      },
      sessions: sessionStats[0] || {
        totalSessions: 0,
        activeSessions: 0,
        suspiciousSessions: 0,
        avgRiskScore: 0
      },
      audit: auditStats,
      suspiciousActivities: suspiciousActivities.length
    }
  }

  // Check for security alerts
  async checkSecurityAlerts() {
    const alerts = []

    // Check for multiple failed logins
    const failedLogins = await AuditLog.find({
      event: 'user.login.failed',
      timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
    })

    const failedLoginCounts = {}
    failedLogins.forEach(log => {
      const email = log.userId ? log.userId.email : 'unknown'
      failedLoginCounts[email] = (failedLoginCounts[email] || 0) + 1
    })

    Object.entries(failedLoginCounts).forEach(([email, count]) => {
      if (count >= 5) {
        alerts.push({
          type: 'multiple_failed_logins',
          severity: 'high',
          message: `Multiple failed login attempts for ${email}`,
          count,
          email,
          timestamp: new Date()
        })
      }
    })

    // Check for suspicious activities
    const suspiciousActivities = await AuditLog.findSuspiciousActivities(60 * 60 * 1000) // Last hour
    if (suspiciousActivities.length > 0) {
      alerts.push({
        type: 'suspicious_activity',
        severity: 'medium',
        message: `${suspiciousActivities.length} suspicious activities detected`,
        count: suspiciousActivities.length,
        timestamp: new Date()
      })
    }

    // Check for locked accounts
    const lockedAccounts = await User.findLockedAccounts()
    if (lockedAccounts.length > 10) {
      alerts.push({
        type: 'high_locked_accounts',
        severity: 'medium',
        message: `${lockedAccounts.length} accounts are currently locked`,
        count: lockedAccounts.length,
        timestamp: new Date()
      })
    }

    // Check for expired passwords
    const expiredPasswords = await User.findExpiredPasswords()
    if (expiredPasswords.length > 20) {
      alerts.push({
        type: 'high_expired_passwords',
        severity: 'low',
        message: `${expiredPasswords.length} passwords have expired`,
        count: expiredPasswords.length,
        timestamp: new Date()
      })
    }

    return alerts
  }

  // Detect potential threats
  async detectThreats() {
    const threats = []

    // Detect brute force attempts
    const bruteForceAttempts = await this.detectBruteForceAttempts()
    if (bruteForceAttempts.length > 0) {
      threats.push({
        type: 'brute_force',
        severity: 'critical',
        attempts: bruteForceAttempts,
        timestamp: new Date()
      })
    }

    // Detect unusual login patterns
    const unusualPatterns = await this.detectUnusualPatterns()
    if (unusualPatterns.length > 0) {
      threats.push({
        type: 'unusual_patterns',
        severity: 'high',
        patterns: unusualPatterns,
        timestamp: new Date()
      })
    }

    // Detect potential token compromise
    const tokenCompromise = await this.detectTokenCompromise()
    if (tokenCompromise.length > 0) {
      threats.push({
        type: 'token_compromise',
        severity: 'critical',
        sessions: tokenCompromise,
        timestamp: new Date()
      })
    }

    return threats
  }

  // Detect brute force attempts
  async detectBruteForceAttempts() {
    const timeWindow = 15 * 60 * 1000 // 15 minutes
    const cutoffTime = new Date(Date.now() - timeWindow)
    
    const failedLogins = await AuditLog.find({
      event: 'user.login.failed',
      timestamp: { $gte: cutoffTime }
    })

    const attemptsByIP = {}
    failedLogins.forEach(log => {
      const ip = log.request?.ipAddress || 'unknown'
      attemptsByIP[ip] = (attemptsByIP[ip] || 0) + 1
    })

    return Object.entries(attemptsByIP)
      .filter(([ip, count]) => count >= 10)
      .map(([ip, count]) => ({
        ip,
        count,
        timeWindow: '15 minutes'
      }))
  }

  // Detect unusual login patterns
  async detectUnusualPatterns() {
    const patterns = []

    // Check for logins from unusual locations
    const recentLogins = await AuditLog.find({
      event: 'user.login.success',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })

    const locationCounts = {}
    recentLogins.forEach(log => {
      const location = log.location?.country || 'unknown'
      locationCounts[location] = (locationCounts[location] || 0) + 1
    })

    // If more than 50% of logins are from a single location, it might be unusual
    const totalLogins = recentLogins.length
    Object.entries(locationCounts).forEach(([location, count]) => {
      if (count > totalLogins * 0.5 && totalLogins > 10) {
        patterns.push({
          type: 'unusual_location_concentration',
          location,
          count,
          percentage: (count / totalLogins) * 100
        })
      }
    })

    return patterns
  }

  // Detect potential token compromise
  async detectTokenCompromise() {
    const suspiciousSessions = await Session.find({
      'security.suspiciousActivity': true,
      isActive: true
    }).populate('user', 'email firstName lastName')

    return suspiciousSessions.map(session => ({
      sessionId: session.sessionId,
      user: session.user,
      riskScore: session.security.riskScore,
      lastActivity: session.lastActivity
    }))
  }

  // Calculate overall system risk
  calculateOverallRisk(stats, alerts, threats) {
    let riskScore = 0

    // Factor in user security stats
    if (stats.users) {
      const userRisk = (stats.users.lockedAccounts + stats.users.suspiciousUsers) / Math.max(stats.users.totalUsers, 1)
      riskScore += userRisk * 0.3
    }

    // Factor in session security
    if (stats.sessions) {
      const sessionRisk = stats.sessions.suspiciousSessions / Math.max(stats.sessions.totalSessions, 1)
      riskScore += sessionRisk * 0.3
    }

    // Factor in alerts
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length
    const highAlerts = alerts.filter(alert => alert.severity === 'high').length
    riskScore += (criticalAlerts * 0.2) + (highAlerts * 0.1)

    // Factor in threats
    const criticalThreats = threats.filter(threat => threat.severity === 'critical').length
    const highThreats = threats.filter(threat => threat.severity === 'high').length
    riskScore += (criticalThreats * 0.2) + (highThreats * 0.1)

    return Math.min(riskScore, 1)
  }

  // Generate security report
  async generateSecurityReport(timeWindow = 24 * 60 * 60 * 1000) {
    const monitoring = await this.monitorSystemSecurity()
    
    return {
      reportId: require('crypto').randomBytes(16).toString('hex'),
      generatedAt: new Date(),
      timeWindow,
      summary: {
        overallRisk: monitoring.overallRisk,
        riskLevel: this.getRiskLevel(monitoring.overallRisk),
        totalAlerts: monitoring.alerts.length,
        totalThreats: monitoring.threats.length
      },
      details: monitoring,
      recommendations: this.generateRecommendations(monitoring)
    }
  }

  // Get risk level description
  getRiskLevel(riskScore) {
    if (riskScore >= 0.8) return 'critical'
    if (riskScore >= 0.6) return 'high'
    if (riskScore >= 0.4) return 'medium'
    if (riskScore >= 0.2) return 'low'
    return 'minimal'
  }

  // Generate security recommendations
  generateRecommendations(monitoring) {
    const recommendations = []

    if (monitoring.overallRisk >= 0.8) {
      recommendations.push({
        priority: 'immediate',
        action: 'Enable emergency security measures',
        description: 'System is at critical risk level'
      })
    }

    if (monitoring.alerts.some(alert => alert.type === 'multiple_failed_logins')) {
      recommendations.push({
        priority: 'high',
        action: 'Review and strengthen password policies',
        description: 'Multiple failed login attempts detected'
      })
    }

    if (monitoring.alerts.some(alert => alert.type === 'suspicious_activity')) {
      recommendations.push({
        priority: 'high',
        action: 'Investigate suspicious activities',
        description: 'Suspicious login patterns detected'
      })
    }

    if (monitoring.stats.users && monitoring.stats.users.mfaEnabled / monitoring.stats.users.totalUsers < 0.5) {
      recommendations.push({
        priority: 'medium',
        action: 'Enforce MFA for all users',
        description: 'Low MFA adoption rate'
      })
    }

    return recommendations
  }
}

module.exports = new SecurityService() 