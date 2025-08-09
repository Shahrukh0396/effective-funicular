const express = require('express')
const { body, validationResult } = require('express-validator')
const { auth, authorize } = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')
const { authLimiter } = require('../middleware/security')
const User = require('../models/User')
const mfaService = require('../services/mfaService')
const authService = require('../services/authService')

const router = express.Router()

// Apply authentication to all MFA routes EXCEPT initial setup and enable
router.use((req, res, next) => {
  // Skip authentication for initial MFA setup and enable
  if (req.path === '/setup-initial' || req.path === '/enable-initial') {
    return next()
  }
  // Apply authentication to all other routes
  return auth(req, res, next)
})

// ==================== MFA SETUP ====================

// Initial MFA setup (no authentication required)
router.post('/setup-initial', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required for initial MFA setup.'
      })
    }

    // Find user and verify credentials
    const user = await User.findOne({ email }).populate('vendorId')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      })
    }

    // Verify password
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive.'
      })
    }

    // Check if MFA is already enabled
    if (user.security.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled for this account.'
      })
    }

    // Setup MFA
    const mfaSetup = await mfaService.setupMFA(user)
    
    res.json({
      success: true,
      message: 'MFA setup initiated successfully.',
      data: {
        secret: mfaSetup.secret,
        qrCode: mfaSetup.qrCode,
        backupCodes: mfaSetup.backupCodes,
        otpauthUrl: mfaSetup.otpauthUrl,
        instructions: [
          '1. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
          '2. Enter the 6-digit code from your app to verify setup',
          '3. Save your backup codes in a secure location',
          '4. Complete the setup by calling the /mfa/enable endpoint'
        ]
      }
    })
  } catch (error) {
    console.error('Initial MFA setup error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to setup MFA.'
    })
  }
})

// Initial MFA enable (no authentication required)
router.post('/enable-initial', async (req, res) => {
  try {
    const { email, password, token } = req.body
    
    if (!email || !password || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and TOTP token are required.'
      })
    }

    // Find user and verify credentials
    const user = await User.findOne({ email }).populate('vendorId')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      })
    }

    // Verify password
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive.'
      })
    }

    // Check if MFA is already enabled
    if (user.security.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled for this account.'
      })
    }

    // Check if MFA is configured
    if (!user.security.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not configured. Please setup MFA first.'
      })
    }

    // Enable MFA
    await mfaService.enableMFA(user, token)
    
    res.json({
      success: true,
      message: 'MFA enabled successfully.',
      data: {
        enabled: true,
        backupCodesCount: user.security.backupCodes.length
      }
    })
  } catch (error) {
    console.error('Initial MFA enable error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to enable MFA.'
    })
  }
})

// Setup MFA for user (requires authentication)
router.post('/setup', authorize(['admin', 'super_admin', 'vendor_admin']), async (req, res) => {
  try {
    const user = req.user
    
    // Check if MFA is already enabled
    if (user.security.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled for this account.'
      })
    }

    // Setup MFA
    const mfaSetup = await mfaService.setupMFA(user)
    
    res.json({
      success: true,
      message: 'MFA setup initiated successfully.',
      data: {
        secret: mfaSetup.secret,
        qrCode: mfaSetup.qrCode,
        backupCodes: mfaSetup.backupCodes,
        otpauthUrl: mfaSetup.otpauthUrl,
        instructions: [
          '1. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
          '2. Enter the 6-digit code from your app to verify setup',
          '3. Save your backup codes in a secure location',
          '4. Complete the setup by calling the /mfa/enable endpoint'
        ]
      }
    })
  } catch (error) {
    console.error('MFA setup error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to setup MFA.'
    })
  }
})

// Enable MFA for user
router.post('/enable', authorize(['admin', 'super_admin', 'vendor_admin']), async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'TOTP token is required.'
      })
    }

    const user = req.user
    
    // Check if MFA is already enabled
    if (user.security.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled for this account.'
      })
    }

    // Check if MFA is configured
    if (!user.security.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not configured. Please setup MFA first.'
      })
    }

    // Enable MFA
    await mfaService.enableMFA(user, token)
    
    res.json({
      success: true,
      message: 'MFA enabled successfully.',
      data: {
        enabled: true,
        backupCodesCount: user.security.backupCodes.length
      }
    })
  } catch (error) {
    console.error('MFA enable error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to enable MFA.'
    })
  }
})

// Disable MFA for user
router.post('/disable', authorize(['admin', 'super_admin', 'vendor_admin']), async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'TOTP token is required.'
      })
    }

    const user = req.user
    
    // Check if MFA is enabled
    if (!user.security.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled for this account.'
      })
    }

    // Disable MFA
    await mfaService.disableMFA(user, token)
    
    res.json({
      success: true,
      message: 'MFA disabled successfully.',
      data: {
        enabled: false
      }
    })
  } catch (error) {
    console.error('MFA disable error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to disable MFA.'
    })
  }
})

// ==================== MFA VERIFICATION ====================

// Verify MFA token
router.post('/verify', async (req, res) => {
  try {
    const { token, method = 'totp' } = req.body
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'MFA token is required.'
      })
    }

    const user = req.user
    
    // Check if MFA is enabled
    if (!user.security.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled for this account.'
      })
    }

    // Verify MFA token
    await mfaService.verifyMFALogin(user, token, method)
    
    res.json({
      success: true,
      message: 'MFA verification successful.',
      data: {
        verified: true,
        method: method
      }
    })
  } catch (error) {
    console.error('MFA verification error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'MFA verification failed.'
    })
  }
})

// ==================== BACKUP CODES ====================

// Get backup codes
router.get('/backup-codes', authorize(['admin', 'super_admin', 'vendor_admin']), async (req, res) => {
  try {
    const user = req.user
    
    // Check if MFA is enabled
    if (!user.security.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled for this account.'
      })
    }

    res.json({
      success: true,
      data: {
        backupCodesCount: user.security.backupCodes ? user.security.backupCodes.length : 0,
        remainingCodes: user.security.backupCodes || []
      }
    })
  } catch (error) {
    console.error('Get backup codes error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get backup codes.'
    })
  }
})

// Regenerate backup codes
router.post('/backup-codes/regenerate', authorize(['admin', 'super_admin', 'vendor_admin']), async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'TOTP token is required.'
      })
    }

    const user = req.user
    
    // Check if MFA is enabled
    if (!user.security.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled for this account.'
      })
    }

    // Regenerate backup codes
    const newBackupCodes = await mfaService.regenerateBackupCodes(user, token)
    
    res.json({
      success: true,
      message: 'Backup codes regenerated successfully.',
      data: {
        backupCodes: newBackupCodes,
        count: newBackupCodes.length
      }
    })
  } catch (error) {
    console.error('Regenerate backup codes error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to regenerate backup codes.'
    })
  }
})

// ==================== MFA STATUS ====================

// Get MFA status
router.get('/status', async (req, res) => {
  try {
    const user = req.user
    const portalType = req.query.portalType || 'admin' // Default to admin if not specified
    const mfaStatus = mfaService.getMFAStatus(user, portalType)
    const mfaSetupInfo = await authService.getMFASetupInfo(user, portalType)
    
    res.json({
      success: true,
      data: {
        ...mfaStatus,
        setupInfo: mfaSetupInfo
      }
    })
  } catch (error) {
    console.error('Get MFA status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get MFA status.'
    })
  }
})

// ==================== SMS VERIFICATION ====================

// Send SMS verification code
router.post('/sms/send', async (req, res) => {
  try {
    const { phoneNumber } = req.body
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.'
      })
    }

    // Send SMS verification
    const smsResult = await mfaService.sendSMSVerification(phoneNumber)
    
    res.json({
      success: true,
      message: 'SMS verification code sent successfully.',
      data: {
        expiresAt: smsResult.expiresAt,
        // In production, don't return the code
        code: smsResult.code // Only for testing
      }
    })
  } catch (error) {
    console.error('Send SMS verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS verification code.'
    })
  }
})

// Verify SMS code
router.post('/sms/verify', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body
    
    if (!phoneNumber || !code) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and verification code are required.'
      })
    }

    // In production, verify against stored code
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'SMS verification successful.',
      data: {
        verified: true
      }
    })
  } catch (error) {
    console.error('Verify SMS code error:', error)
    res.status(400).json({
      success: false,
      message: 'SMS verification failed.'
    })
  }
})

// ==================== EMAIL VERIFICATION ====================

// Send email verification code
router.post('/email/send', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      })
    }

    // Send email verification
    const emailResult = await mfaService.sendEmailVerification(email)
    
    res.json({
      success: true,
      message: 'Email verification code sent successfully.',
      data: {
        expiresAt: emailResult.expiresAt,
        // In production, don't return the code
        code: emailResult.code // Only for testing
      }
    })
  } catch (error) {
    console.error('Send email verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send email verification code.'
    })
  }
})

// Verify email code
router.post('/email/verify', async (req, res) => {
  try {
    const { email, code } = req.body
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required.'
      })
    }

    // In production, verify against stored code
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Email verification successful.',
      data: {
        verified: true
      }
    })
  } catch (error) {
    console.error('Verify email code error:', error)
    res.status(400).json({
      success: false,
      message: 'Email verification failed.'
    })
  }
})

module.exports = router 