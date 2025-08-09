const User = require('../models/User')
const AuditLog = require('../models/AuditLog')
const config = require('../config')

class IPRestrictionService {
  // Check if IP is whitelisted for user
  async isIPWhitelisted(user, ipAddress) {
    try {
      // If user has IP whitelist configured
      if (user.security.ipWhitelist && user.security.ipWhitelist.length > 0) {
        return user.security.ipWhitelist.includes(ipAddress)
      }
      
      return true // No whitelist configured, allow access
    } catch (error) {
      console.error('IP whitelist check error:', error)
      return false // Fail secure
    }
  }

  // Check if IP is blacklisted globally
  async isIPBlacklisted(ipAddress) {
    try {
      // In production, this would check against a database of blacklisted IPs
      // For now, we'll implement basic blacklist logic
      const blacklistedIPs = [
        '192.168.1.100', // Example blacklisted IP
        '10.0.0.50'      // Example blacklisted IP
      ]
      
      return blacklistedIPs.includes(ipAddress)
    } catch (error) {
      console.error('IP blacklist check error:', error)
      return false
    }
  }

  // Check for suspicious IP patterns
  async isIPSuspicious(ipAddress, userAgent) {
    try {
      const suspiciousPatterns = [
        // Known VPN/proxy IP ranges
        /^192\.168\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        // Tor exit nodes (example patterns)
        /^185\.220\./,
        /^176\.10\./,
        // Known malicious IP patterns
        /^45\.95\./,
        /^185\.220\.101\./
      ]
      
      // Check if IP matches suspicious patterns
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(ipAddress)) {
          return true
        }
      }
      
      // Check for unusual user agent patterns
      if (userAgent) {
        const suspiciousUserAgents = [
          'bot',
          'crawler',
          'spider',
          'scraper',
          'headless'
        ]
        
        const lowerUserAgent = userAgent.toLowerCase()
        for (const suspicious of suspiciousUserAgents) {
          if (lowerUserAgent.includes(suspicious)) {
            return true
          }
        }
      }
      
      return false
    } catch (error) {
      console.error('Suspicious IP check error:', error)
      return false
    }
  }

  // Get geolocation data for IP (mock implementation)
  async getIPGeolocation(ipAddress) {
    try {
      // In production, integrate with a geolocation service like MaxMind, IP2Location, etc.
      // For now, return mock data
      const mockGeolocation = {
        country: 'US',
        region: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        latitude: 37.7749,
        longitude: -122.4194,
        isp: 'Cloudflare',
        isProxy: false,
        isVPN: false
      }
      
      return mockGeolocation
    } catch (error) {
      console.error('IP geolocation error:', error)
      return null
    }
  }

  // Check for unusual location access
  async isLocationUnusual(user, ipAddress) {
    try {
      const geolocation = await this.getIPGeolocation(ipAddress)
      if (!geolocation) return false
      
      // If user has last login location recorded
      if (user.security.lastLoginLocation) {
        const lastLocation = user.security.lastLoginLocation
        const currentLocation = geolocation.country
        
        // Check if location changed significantly
        if (lastLocation !== currentLocation) {
          // Log unusual location access
          await AuditLog.logAuthEvent({
            event: 'security.suspicious.activity',
            userId: user._id,
            vendorId: user.vendorId,
            portalType: 'system',
            security: {
              riskScore: 0.7,
              suspiciousActivity: true
            },
            metadata: {
              reason: 'Unusual location access',
              lastLocation: lastLocation,
              currentLocation: currentLocation,
              ipAddress: ipAddress
            }
          })
          
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Location unusual check error:', error)
      return false
    }
  }

  // Validate IP access for user
  async validateIPAccess(user, ipAddress, userAgent) {
    try {
      const validation = {
        allowed: true,
        reasons: [],
        riskScore: 0
      }
      
      // Check if IP is blacklisted
      if (await this.isIPBlacklisted(ipAddress)) {
        validation.allowed = false
        validation.reasons.push('IP is blacklisted')
        validation.riskScore = 1.0
        return validation
      }
      
      // Check if IP is whitelisted for user
      if (!(await this.isIPWhitelisted(user, ipAddress))) {
        validation.allowed = false
        validation.reasons.push('IP not in whitelist')
        validation.riskScore = 0.8
        return validation
      }
      
      // Check if IP is suspicious
      if (await this.isIPSuspicious(ipAddress, userAgent)) {
        validation.reasons.push('Suspicious IP detected')
        validation.riskScore += 0.5
      }
      
      // Check for unusual location
      if (await this.isLocationUnusual(user, ipAddress)) {
        validation.reasons.push('Unusual location access')
        validation.riskScore += 0.3
      }
      
      // If risk score is too high, deny access
      if (validation.riskScore >= 0.8) {
        validation.allowed = false
      }
      
      return validation
    } catch (error) {
      console.error('IP access validation error:', error)
      return {
        allowed: false,
        reasons: ['IP validation error'],
        riskScore: 1.0
      }
    }
  }

  // Add IP to user's whitelist
  async addIPToWhitelist(user, ipAddress) {
    try {
      if (!user.security.ipWhitelist) {
        user.security.ipWhitelist = []
      }
      
      if (!user.security.ipWhitelist.includes(ipAddress)) {
        user.security.ipWhitelist.push(ipAddress)
        await user.save()
        
        // Log IP whitelist addition
        await AuditLog.logAuthEvent({
          event: 'security.ip.whitelisted',
          userId: user._id,
          vendorId: user.vendorId,
          portalType: 'admin',
          security: {
            riskScore: 0,
            suspiciousActivity: false
          },
          metadata: {
            reason: 'IP added to whitelist',
            ipAddress: ipAddress
          }
        })
      }
      
      return true
    } catch (error) {
      console.error('Add IP to whitelist error:', error)
      throw error
    }
  }

  // Remove IP from user's whitelist
  async removeIPFromWhitelist(user, ipAddress) {
    try {
      if (user.security.ipWhitelist) {
        const index = user.security.ipWhitelist.indexOf(ipAddress)
        if (index > -1) {
          user.security.ipWhitelist.splice(index, 1)
          await user.save()
          
          // Log IP whitelist removal
          await AuditLog.logAuthEvent({
            event: 'security.ip.whitelist_removed',
            userId: user._id,
            vendorId: user.vendorId,
            portalType: 'admin',
            security: {
              riskScore: 0,
              suspiciousActivity: false
            },
            metadata: {
              reason: 'IP removed from whitelist',
              ipAddress: ipAddress
            }
          })
        }
      }
      
      return true
    } catch (error) {
      console.error('Remove IP from whitelist error:', error)
      throw error
    }
  }

  // Get IP analytics
  async getIPAnalytics(timeWindow = 24 * 60 * 60 * 1000) {
    try {
      const cutoffTime = new Date(Date.now() - timeWindow)
      
      const analytics = await AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: cutoffTime },
            'request.ipAddress': { $exists: true }
          }
        },
        {
          $group: {
            _id: '$request.ipAddress',
            count: { $sum: 1 },
            events: { $push: '$event' },
            users: { $addToSet: '$userId' },
            avgRiskScore: { $avg: '$security.riskScore' },
            suspiciousCount: {
              $sum: { $cond: ['$security.suspiciousActivity', 1, 0] }
            }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
      
      return analytics
    } catch (error) {
      console.error('Get IP analytics error:', error)
      throw error
    }
  }

  // Get suspicious IPs
  async getSuspiciousIPs(limit = 50) {
    try {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      
      const suspiciousIPs = await AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: cutoffTime },
            'security.suspiciousActivity': true,
            'request.ipAddress': { $exists: true }
          }
        },
        {
          $group: {
            _id: '$request.ipAddress',
            count: { $sum: 1 },
            events: { $push: '$event' },
            users: { $addToSet: '$userId' },
            avgRiskScore: { $avg: '$security.riskScore' },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: limit
        }
      ])
      
      return suspiciousIPs
    } catch (error) {
      console.error('Get suspicious IPs error:', error)
      throw error
    }
  }

  // Block IP globally
  async blockIP(ipAddress, reason = 'Suspicious activity') {
    try {
      // In production, this would add to a global blacklist database
      console.log(`IP ${ipAddress} blocked globally: ${reason}`)
      
      // Log IP blocking
      await AuditLog.logAuthEvent({
        event: 'security.ip.blocked',
        userId: null,
        vendorId: null,
        portalType: 'system',
        security: {
          riskScore: 1.0,
          suspiciousActivity: true
        },
        metadata: {
          reason: reason,
          ipAddress: ipAddress,
          action: 'global_block'
        }
      })
      
      return true
    } catch (error) {
      console.error('Block IP error:', error)
      throw error
    }
  }

  // Unblock IP globally
  async unblockIP(ipAddress, reason = 'Manual unblock') {
    try {
      // In production, this would remove from global blacklist database
      console.log(`IP ${ipAddress} unblocked globally: ${reason}`)
      
      // Log IP unblocking
      await AuditLog.logAuthEvent({
        event: 'security.ip.unblocked',
        userId: null,
        vendorId: null,
        portalType: 'system',
        security: {
          riskScore: 0,
          suspiciousActivity: false
        },
        metadata: {
          reason: reason,
          ipAddress: ipAddress,
          action: 'global_unblock'
        }
      })
      
      return true
    } catch (error) {
      console.error('Unblock IP error:', error)
      throw error
    }
  }
}

module.exports = new IPRestrictionService() 