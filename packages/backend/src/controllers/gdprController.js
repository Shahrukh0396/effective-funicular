const User = require('../models/User')
const Project = require('../models/Project')
const Task = require('../models/Task')
const fs = require('fs').promises
const path = require('path')
const archiver = require('archiver')
const { createWriteStream } = require('fs')

// Update user consent
const updateConsent = async (req, res) => {
  try {
    const { consentType, granted } = req.body
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.get('User-Agent')

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await user.updateConsent(consentType, granted, ipAddress, userAgent)

    res.json({
      success: true,
      message: 'Consent updated successfully',
      data: {
        consent: user.gdpr.consent
      }
    })
  } catch (error) {
    console.error('Update consent error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update consent'
    })
  }
}

// Get user consent status
const getConsentStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: {
        consent: user.gdpr.consent,
        consentHistory: user.gdpr.consentHistory
      }
    })
  } catch (error) {
    console.error('Get consent status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get consent status'
    })
  }
}

// Request data portability
const requestDataPortability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await user.requestDataPortability()

    // Generate data export
    const exportData = await generateDataExport(user._id)

    // Create download URL (in production, store in cloud storage)
    const downloadUrl = `/api/gdpr/download/${user._id}`
    const downloadExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    user.gdpr.dataPortability.downloadUrl = downloadUrl
    user.gdpr.dataPortability.downloadExpires = downloadExpires
    user.gdpr.dataPortability.processedAt = new Date()
    await user.save()

    res.json({
      success: true,
      message: 'Data portability request processed',
      data: {
        downloadUrl,
        downloadExpires
      }
    })
  } catch (error) {
    console.error('Data portability error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process data portability request'
    })
  }
}

// Generate data export
const generateDataExport = async (userId) => {
  const user = await User.findById(userId)
  const projects = await Project.find({ client: userId })
  const tasks = await Task.find({ 
    $or: [
      { assignedTo: userId },
      { createdBy: userId }
    ]
  })

  const exportData = {
    user: {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        position: user.position,
        phone: user.phone,
        bio: user.bio
      },
      preferences: user.preferences,
      subscription: user.subscription
    },
    projects: projects.map(project => ({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      createdAt: project.createdAt
    })),
    tasks: tasks.map(task => ({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      completedAt: task.completedAt
    })),
    exportDate: new Date().toISOString()
  }

  return exportData
}

// Download data export
const downloadDataExport = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if download is still valid
    if (!user.gdpr.dataPortability.downloadUrl || 
        user.gdpr.dataPortability.downloadExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Download link expired or invalid'
      })
    }

    const exportData = await generateDataExport(userId)

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.json"`)
    res.json(exportData)
  } catch (error) {
    console.error('Download data export error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to download data export'
    })
  }
}

// Request right to be forgotten
const requestRightToBeForgotten = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await user.requestRightToBeForgotten()

    res.json({
      success: true,
      message: 'Right to be forgotten request submitted. Your data will be processed within 30 days.'
    })
  } catch (error) {
    console.error('Right to be forgotten error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process right to be forgotten request'
    })
  }
}

// Process right to be forgotten (admin only)
const processRightToBeForgotten = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!user.gdpr.rightToBeForgotten.requested) {
      return res.status(400).json({
        success: false,
        message: 'User has not requested right to be forgotten'
      })
    }

    // Anonymize user data
    await user.anonymizeData()

    // Anonymize related data
    await Project.updateMany(
      { client: userId },
      { 
        client: null,
        $set: { 
          'gdpr.anonymized': true,
          'gdpr.anonymizedAt': new Date()
        }
      }
    )

    await Task.updateMany(
      { 
        $or: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      },
      { 
        $set: { 
          'gdpr.anonymized': true,
          'gdpr.anonymizedAt': new Date()
        }
      }
    )

    res.json({
      success: true,
      message: 'Right to be forgotten processed successfully'
    })
  } catch (error) {
    console.error('Process right to be forgotten error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process right to be forgotten'
    })
  }
}

// Get pending right to be forgotten requests (admin only)
const getPendingForgottenRequests = async (req, res) => {
  try {
    const users = await User.find({
      'gdpr.rightToBeForgotten.requested': true,
      'gdpr.rightToBeForgotten.processedAt': { $exists: false }
    }).select('firstName lastName email gdpr.rightToBeForgotten.requestedAt')

    res.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Get pending forgotten requests error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get pending requests'
    })
  }
}

// Clean up expired data (cron job)
const cleanupExpiredData = async (req, res) => {
  try {
    const expiredUsers = await User.findExpiredData()
    
    for (const user of expiredUsers) {
      // Remove marketing data if consent expired
      if (user.gdpr.dataRetention.marketingData < new Date()) {
        user.gdpr.consent.marketing = false
        user.preferences.notifications.email = false
        user.preferences.notifications.push = false
      }

      // Remove analytics data if consent expired
      if (user.gdpr.dataRetention.analyticsData < new Date()) {
        user.gdpr.consent.analytics = false
      }

      await user.save()
    }

    res.json({
      success: true,
      message: `Cleaned up data for ${expiredUsers.length} users`
    })
  } catch (error) {
    console.error('Cleanup expired data error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired data'
    })
  }
}

module.exports = {
  updateConsent,
  getConsentStatus,
  requestDataPortability,
  downloadDataExport,
  requestRightToBeForgotten,
  processRightToBeForgotten,
  getPendingForgottenRequests,
  cleanupExpiredData
} 