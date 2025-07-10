const Vendor = require('../models/Vendor')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { sendEmail } = require('../services/emailService')
const crypto = require('crypto')

// Vendor registration
const registerVendor = async (req, res) => {
  try {
    const {
      companyName,
      slug,
      email,
      password,
      contactPerson,
      industry,
      companySize,
      website,
      description
    } = req.body

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({
      $or: [{ email: email.toLowerCase() }, { slug: slug.toLowerCase() }]
    })

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor with this email or slug already exists'
      })
    }

    // Create vendor
    const vendor = new Vendor({
      companyName,
      slug: slug.toLowerCase(),
      email: email.toLowerCase(),
      password,
      contactPerson,
      industry,
      companySize,
      website,
      description
    })

    await vendor.save()

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    vendor.emailVerificationToken = verificationToken
    vendor.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    await vendor.save()

    // Send verification email
    const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: vendor.email,
      subject: 'Welcome to Linton Portals - Verify Your Email',
      template: 'vendor-welcome',
      data: {
        companyName: vendor.companyName,
        contactName: vendor.contactFullName,
        verificationUrl,
        trialDays: vendor.trialDaysLeft
      }
    })

    // Generate auth token
    const token = vendor.generateAuthToken()

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully',
      data: {
        vendor: vendor.getPublicProfile(),
        token
      }
    })
  } catch (error) {
    console.error('Vendor registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Error registering vendor',
      error: error.message
    })
  }
}

// Vendor login
const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find vendor by email
    const vendor = await Vendor.findOne({ email: email.toLowerCase() })

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if vendor is active
    if (!vendor.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // Verify password
    const isPasswordValid = await vendor.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update last login
    vendor.lastLogin = new Date()
    vendor.lastActivity = new Date()
    await vendor.save()

    // Generate auth token
    const token = vendor.generateAuthToken()

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        vendor: vendor.getPublicProfile(),
        token
      }
    })
  } catch (error) {
    console.error('Vendor login error:', error)
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    })
  }
}

// Get vendor profile
const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)
      .select('-password -emailVerificationToken -emailVerificationExpires')

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    res.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Get vendor profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor profile',
      error: error.message
    })
  }
}

// Update vendor profile
const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    // Update allowed fields
    const allowedUpdates = [
      'companyName',
      'contactPerson',
      'industry',
      'companySize',
      'website',
      'description',
      'branding',
      'settings'
    ]

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field]
      }
    })

    vendor.lastActivity = new Date()
    await vendor.save()

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: vendor.getPublicProfile()
    })
  } catch (error) {
    console.error('Update vendor profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating vendor profile',
      error: error.message
    })
  }
}

// Get vendor dashboard stats
const getVendorDashboard = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    // Get user counts
    const agentCount = await User.countDocuments({
      vendor: req.vendorId,
      role: 'employee'
    })

    const contractorCount = await User.countDocuments({
      vendor: req.vendorId,
      role: 'client'
    })

    // Get project stats
    const Project = require('../models/Project')
    const projectStats = await Project.aggregate([
      { $match: { vendor: vendor._id } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: {
              $cond: [
                { $in: ['$status', ['planning', 'in-progress', 'review', 'testing']] },
                1,
                0
              ]
            }
          },
          completedProjects: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ])

    const stats = projectStats[0] || {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0
    }

    // Calculate revenue (placeholder for now)
    const revenue = vendor.metrics.totalRevenue

    res.json({
      success: true,
      data: {
        vendor: vendor.getPublicProfile(),
        stats: {
          agents: agentCount,
          contractors: contractorCount,
          projects: stats.totalProjects,
          activeProjects: stats.activeProjects,
          completedProjects: stats.completedProjects,
          revenue,
          trialDaysLeft: vendor.trialDaysLeft,
          usage: vendor.usagePercentage
        }
      }
    })
  } catch (error) {
    console.error('Get vendor dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    })
  }
}

// Verify vendor email
const verifyVendorEmail = async (req, res) => {
  try {
    const { token } = req.body

    const vendor = await Vendor.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    })

    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      })
    }

    vendor.isEmailVerified = true
    vendor.emailVerificationToken = undefined
    vendor.emailVerificationExpires = undefined
    await vendor.save()

    res.json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    console.error('Verify vendor email error:', error)
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    })
  }
}

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    if (vendor.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      })
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    vendor.emailVerificationToken = verificationToken
    vendor.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    await vendor.save()

    // Send verification email
    const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: vendor.email,
      subject: 'Verify Your Email - Linton Portals',
      template: 'vendor-verification',
      data: {
        companyName: vendor.companyName,
        contactName: vendor.contactFullName,
        verificationUrl
      }
    })

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    })
  } catch (error) {
    console.error('Resend verification email error:', error)
    res.status(500).json({
      success: false,
      message: 'Error sending verification email',
      error: error.message
    })
  }
}

// Check vendor slug availability
const checkSlugAvailability = async (req, res) => {
  try {
    const { slug } = req.params

    const existingVendor = await Vendor.findOne({ slug: slug.toLowerCase() })

    res.json({
      success: true,
      data: {
        available: !existingVendor,
        slug: slug.toLowerCase()
      }
    })
  } catch (error) {
    console.error('Check slug availability error:', error)
    res.status(500).json({
      success: false,
      message: 'Error checking slug availability',
      error: error.message
    })
  }
}

// Get vendor branding
const getVendorBranding = async (req, res) => {
  try {
    const { slug } = req.params

    const vendor = await Vendor.findOne({ slug: slug.toLowerCase() })
      .select('companyName branding')

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    res.json({
      success: true,
      data: {
        companyName: vendor.branding.companyName || vendor.companyName,
        branding: vendor.branding
      }
    })
  } catch (error) {
    console.error('Get vendor branding error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor branding',
      error: error.message
    })
  }
}

module.exports = {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  verifyVendorEmail,
  resendVerificationEmail,
  checkSlugAvailability,
  getVendorBranding
} 