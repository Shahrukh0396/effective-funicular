const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const config = require('../config')
const User = require('../models/User')
const Session = require('../models/Session')
const AuditLog = require('../models/AuditLog')
const Vendor = require('../models/Vendor')

class AuthService {
  // Generate access token
  generateAccessToken(user, vendor, portalType) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      vendorId: vendor._id,
      portalType: portalType,
      permissions: user.permissions,
      isSuperAccount: user.isSuperAccount,
      sessionId: crypto.randomBytes(32).toString('hex'),
      iat: Math.floor(Date.now() / 1000)
    }
    
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.tokens.accessToken.expiresIn,
      issuer: config.tokens.accessToken.issuer
    })
  }

  // Generate refresh token
  generateRefreshToken(user, vendor, portalType) {
    const payload = {
      userId: user._id,
      vendorId: vendor._id,
      portalType: portalType,
      sessionId: crypto.randomBytes(32).toString('hex'),
      iat: Math.floor(Date.now() / 1000)
    }
    
    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.tokens.refreshToken.expiresIn,
      issuer: config.tokens.refreshToken.issuer
    })
  }

  // Verify access token
  async verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret)
      
      // Check if token is blacklisted
      const session = await Session.findByToken(token, 'accessToken')
      if (!session) {
        throw new Error('Token is blacklisted or session not found')
      }
      
      return decoded
    } catch (error) {
      throw new Error('Invalid access token')
    }
  }

  // Verify refresh token
  async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret)
      
      // Check if token is blacklisted
      const session = await Session.findByToken(token, 'refreshToken')
      if (!session) {
        throw new Error('Refresh token is blacklisted or session not found')
      }
      
      return decoded
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  // Create session
  async createSession(user, vendor, portalType, accessToken, refreshToken, requestInfo) {
    // Check concurrent session limit
    const activeSessions = await Session.countActiveSessions(user._id, vendor._id)
    if (activeSessions >= config.session.maxConcurrentSessions) {
      // Deactivate oldest session
      const oldestSession = await Session.findActiveSessions(user._id, vendor._id)
      if (oldestSession.length > 0) {
        await oldestSession[0].deactivate()
      }
    }

    // Create new session
    const session = new Session({
      sessionId: require('crypto').randomBytes(32).toString('hex'),
      user: user._id,
      vendor: vendor._id,
      accessToken,
      refreshToken,
      portalType,
      deviceInfo: {
        userAgent: requestInfo.userAgent,
        ipAddress: requestInfo.ipAddress,
        location: requestInfo.location,
        deviceType: this.detectDeviceType(requestInfo.userAgent)
      },
      metadata: {
        browser: this.detectBrowser(requestInfo.userAgent),
        os: this.detectOS(requestInfo.userAgent),
        screenResolution: requestInfo.screenResolution,
        timezone: requestInfo.timezone,
        language: requestInfo.language
      }
    })

    await session.save()
    return session
  }

  // Refresh access token
  async refreshAccessToken(refreshToken, requestInfo) {
    try {
      const decoded = await this.verifyRefreshToken(refreshToken)
      
      // Get user and vendor
      const user = await User.findById(decoded.userId)
      const vendor = await Vendor.findById(decoded.vendorId)
      
      if (!user || !vendor) {
        throw new Error('User or vendor not found')
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('User account is deactivated')
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user, vendor, decoded.portalType)
      const newRefreshToken = this.generateRefreshToken(user, vendor, decoded.portalType)

      // Update session
      const session = await Session.findByToken(refreshToken, 'refreshToken')
      if (session) {
        session.accessToken = newAccessToken
        session.refreshToken = newRefreshToken
        session.lastActivity = new Date()
        await session.save()
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    } catch (error) {
      throw new Error('Token refresh failed')
    }
  }

  // Logout user
  async logout(accessToken, refreshToken) {
    try {
      // Blacklist both tokens
      await Session.blacklistToken(accessToken, 'accessToken')
      await Session.blacklistToken(refreshToken, 'refreshToken')
      
      return true
    } catch (error) {
      throw new Error('Logout failed')
    }
  }

  // Log authentication event
  async logAuthEvent(eventData) {
    try {
      await AuditLog.logAuthEvent(eventData)
    } catch (error) {
      console.error('Failed to log auth event:', error)
      // Don't throw error to avoid breaking auth flow
    }
  }

  // Calculate risk score
  calculateRiskScore(user, requestInfo, loginHistory) {
    let riskScore = 0

    // Check for failed login attempts
    const recentFailedAttempts = loginHistory.filter(log => 
      log.event === 'user.login.failed' && 
      Date.now() - log.timestamp < 15 * 60 * 1000
    ).length
    
    if (recentFailedAttempts > 0) {
      riskScore += recentFailedAttempts * 0.2
    }

    // Check for unusual location
    const lastLoginLocation = loginHistory.find(log => 
      log.event === 'user.login.success'
    )?.location
    
    if (lastLoginLocation && lastLoginLocation !== requestInfo.location) {
      riskScore += 0.3
    }

    // Check for unusual device
    const lastLoginDevice = loginHistory.find(log => 
      log.event === 'user.login.success'
    )?.device
    
    if (lastLoginDevice && lastLoginDevice.type !== this.detectDeviceType(requestInfo.userAgent)) {
      riskScore += 0.2
    }

    // Check for unusual time
    const hour = new Date().getHours()
    if (hour < 6 || hour > 22) {
      riskScore += 0.1
    }

    return Math.min(riskScore, 1)
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

  // Detect browser
  detectBrowser(userAgent) {
    if (!userAgent) return 'Unknown'
    
    const ua = userAgent.toLowerCase()
    
    if (ua.includes('chrome')) return 'Chrome'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('safari')) return 'Safari'
    if (ua.includes('edge')) return 'Edge'
    if (ua.includes('opera')) return 'Opera'
    
    return 'Unknown'
  }

  // Detect OS
  detectOS(userAgent) {
    if (!userAgent) return 'Unknown'
    
    const ua = userAgent.toLowerCase()
    
    if (ua.includes('windows')) return 'Windows'
    if (ua.includes('mac')) return 'macOS'
    if (ua.includes('linux')) return 'Linux'
    if (ua.includes('android')) return 'Android'
    if (ua.includes('ios')) return 'iOS'
    
    return 'Unknown'
  }

  // Validate portal access
  validatePortalAccess(user, vendor, portalType) {
    // Super admin can access all portals
    if (user.role === 'super_admin' || user.isSuperAccount) {
      return true
    }

    // Check if user belongs to vendor
    if (user.vendorId) {
      const userVendorId = user.vendorId._id ? user.vendorId._id.toString() : user.vendorId.toString()
      if (userVendorId !== vendor._id.toString()) {
        return false
      }
    }

    // Portal-specific role validation
    switch (portalType) {
      case 'client':
        return user.role === 'client'
      case 'employee':
        return user.role === 'employee' || user.role === 'vendor_admin'
      case 'admin':
        return user.role === 'admin' || user.role === 'vendor_admin'
      case 'super_admin':
        return user.role === 'super_admin'
      default:
        return false
    }
  }

  // Get user permissions for portal
  getUserPermissions(user, portalType) {
    const basePermissions = user.permissions || []
    
    // Add role-based permissions
    switch (user.role) {
      case 'super_admin':
        return ['*'] // All permissions
      case 'admin':
        return [...basePermissions, 'manage_users', 'view_analytics', 'manage_projects']
      case 'employee':
        return [...basePermissions, 'read_projects', 'write_tasks', 'view_analytics']
      case 'client':
        return [...basePermissions, 'read_projects', 'create_projects', 'view_analytics']
      default:
        return basePermissions
    }
  }
}

module.exports = new AuthService() 