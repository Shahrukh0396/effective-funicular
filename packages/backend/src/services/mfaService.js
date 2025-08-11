const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const crypto = require('crypto')
const User = require('../models/User')
const AuditLog = require('../models/AuditLog')
const config = require('../config')

class MFAService {
  // Generate TOTP secret for user
  generateTOTPSecret(user) {
    const secret = speakeasy.generateSecret({
      name: `${user.email}`,
      issuer: 'Linton Tech Platform',
      length: 32
    })
    
    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url
    }
  }

  // Generate QR code for TOTP setup
  async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl)
      return qrCodeDataURL
    } catch (error) {
      console.error('QR code generation error:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  // Verify TOTP token
  verifyTOTP(token, secret, window = 2) {
    try {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: window // Allow 2 time steps before and after
      })
    } catch (error) {
      console.error('TOTP verification error:', error)
      return false
    }
  }

  // Generate backup codes
  generateBackupCodes(count = 10) {
    const codes = []
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      codes.push(code)
    }
    return codes
  }

  // Verify backup code
  verifyBackupCode(code, backupCodes) {
    if (!backupCodes || !Array.isArray(backupCodes)) {
      return false
    }
    
    const index = backupCodes.indexOf(code)
    if (index === -1) {
      return false
    }
    
    // Remove used backup code
    backupCodes.splice(index, 1)
    return true
  }

  // Setup MFA for user
  async setupMFA(user) {
    try {
      // Generate TOTP secret
      const totpSecret = this.generateTOTPSecret(user)
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes()
      
      // Generate QR code
      const qrCode = await this.generateQRCode(totpSecret.otpauth_url)
      
      // Update user with MFA secret (not enabled yet)
      user.security.mfaSecret = totpSecret.secret
      user.security.backupCodes = backupCodes
      await user.save()
      
      return {
        secret: totpSecret.secret,
        qrCode: qrCode,
        backupCodes: backupCodes,
        otpauthUrl: totpSecret.otpauth_url
      }
    } catch (error) {
      console.error('MFA setup error:', error)
      throw new Error('Failed to setup MFA')
    }
  }

  // Enable MFA for user
  async enableMFA(user, token) {
    try {
      // Verify the provided token
      if (!this.verifyTOTP(token, user.security.mfaSecret)) {
        throw new Error('Invalid TOTP token')
      }
      
      // Enable MFA
      user.security.mfaEnabled = true
      await user.save()
      
      // Log MFA enable event
      await AuditLog.logAuthEvent({
        event: 'user.mfa.enable',
        userId: user._id,
        vendorId: user.vendorId || null, // Handle super admin case
        portalType: 'admin',
        security: {
          riskScore: 0,
          suspiciousActivity: false,
          mfaUsed: true
        },
        metadata: {
          reason: 'MFA enabled by user',
          method: 'totp'
        }
      })
      
      return true
    } catch (error) {
      console.error('MFA enable error:', error)
      throw error
    }
  }

  // Disable MFA for user
  async disableMFA(user, token) {
    try {
      // Verify the provided token
      if (!this.verifyTOTP(token, user.security.mfaSecret)) {
        throw new Error('Invalid TOTP token')
      }
      
      // Disable MFA
      user.security.mfaEnabled = false
      user.security.mfaSecret = null
      user.security.backupCodes = []
      await user.save()
      
      // Log MFA disable event
      await AuditLog.logAuthEvent({
        event: 'user.mfa.disable',
        userId: user._id,
        vendorId: user.vendorId || null, // Handle super admin case
        portalType: 'admin',
        security: {
          riskScore: 0,
          suspiciousActivity: false,
          mfaUsed: true
        },
        metadata: {
          reason: 'MFA disabled by user',
          method: 'totp'
        }
      })
      
      return true
    } catch (error) {
      console.error('MFA disable error:', error)
      throw error
    }
  }

  // Verify MFA during login
  async verifyMFALogin(user, token, method = 'totp') {
    try {
      let isValid = false
      
      if (method === 'totp') {
        isValid = this.verifyTOTP(token, user.security.mfaSecret)
      } else if (method === 'backup') {
        isValid = this.verifyBackupCode(token, user.security.backupCodes)
        if (isValid) {
          // Update user with new backup codes (remove used one)
          await user.save()
        }
      }
      
      if (!isValid) {
        // Log failed MFA attempt
        await AuditLog.logAuthEvent({
          event: 'user.mfa.failed',
          userId: user._id,
          vendorId: user.vendorId || null, // Handle super admin case
          portalType: 'admin',
          security: {
            riskScore: 0.5,
            suspiciousActivity: true,
            mfaUsed: true
          },
          metadata: {
            reason: 'Invalid MFA token',
            method: method
          }
        })
        
        throw new Error('Invalid MFA token')
      }
      
      // Log successful MFA verification
      await AuditLog.logAuthEvent({
        event: 'user.mfa.verify',
        userId: user._id,
        vendorId: user.vendorId || null, // Handle super admin case
        portalType: 'admin',
        security: {
          riskScore: 0,
          suspiciousActivity: false,
          mfaUsed: true
        },
        metadata: {
          reason: 'MFA verification successful',
          method: method
        }
      })
      
      return true
    } catch (error) {
      console.error('MFA verification error:', error)
      throw error
    }
  }

  // Generate new backup codes
  async regenerateBackupCodes(user, token) {
    try {
      // Verify the provided token
      if (!this.verifyTOTP(token, user.security.mfaSecret)) {
        throw new Error('Invalid TOTP token')
      }
      
      // Generate new backup codes
      const newBackupCodes = this.generateBackupCodes()
      user.security.backupCodes = newBackupCodes
      await user.save()
      
      return newBackupCodes
    } catch (error) {
      console.error('Backup codes regeneration error:', error)
      throw error
    }
  }

  // Check if MFA is required for user
  isMFARequired(user, portalType) {
    // Super admin and admin users require MFA
    if (user.role === 'super_admin' || user.role === 'admin') {
      return true
    }
    
    // Check if user has MFA enabled
    if (user.security.mfaEnabled) {
      return true
    }
    
    // Check portal-specific requirements
    if (portalType === 'admin' || portalType === 'super_admin') {
      return true
    }
    
    return false
  }

  // Send SMS verification code
  async sendSMSVerification(phoneNumber) {
    try {
      // Generate 6-digit SMS code
      const smsCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log(`SMS verification code for ${phoneNumber}: ${smsCode}`)
      
      // Store code temporarily (in production, use Redis or similar)
      // For now, we'll return the code for testing
      return {
        code: smsCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    } catch (error) {
      console.error('SMS verification error:', error)
      throw new Error('Failed to send SMS verification')
    }
  }

  // Send email verification code
  async sendEmailVerification(email) {
    try {
      // Generate 6-digit email code
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // In production, integrate with email service
      console.log(`Email verification code for ${email}: ${emailCode}`)
      
      return {
        code: emailCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    } catch (error) {
      console.error('Email verification error:', error)
      throw new Error('Failed to send email verification')
    }
  }

  // Get MFA status for user
  getMFAStatus(user, portalType = 'admin') {
    return {
      enabled: user.security.mfaEnabled || false,
      secret: user.security.mfaSecret ? 'configured' : 'not_configured',
      backupCodesCount: user.security.backupCodes ? user.security.backupCodes.length : 0,
      required: this.isMFARequired(user, portalType)
    }
  }
}

module.exports = new MFAService() 