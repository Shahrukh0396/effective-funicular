const Vendor = require('../models/Vendor')
const User = require('../models/User')
const Project = require('../models/Project')
const Task = require('../models/Task')

// Get all vendors (super admin only)
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .select('-password -emailVerificationToken -emailVerificationExpires')
      .populate('parentVendor', 'companyName domain')
      .populate('whiteLabelSettings.whiteLabelCreatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: vendors
    })
  } catch (error) {
    console.error('Get all vendors error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    })
  }
}

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select('-password -emailVerificationToken -emailVerificationExpires')
      .populate('parentVendor', 'companyName domain')
      .populate('whiteLabelSettings.whiteLabelCreatedBy', 'firstName lastName email')

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
    console.error('Get vendor by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor'
    })
  }
}

// Create white-label vendor
const createWhiteLabelVendor = async (req, res) => {
  try {
    const {
      name,
      domain,
      email,
      password,
      contactPerson,
      industry,
      companySize,
      website,
      description,
      branding,
      subscription,
      whiteLabelSettings
    } = req.body

    // Check if domain already exists
    const existingVendor = await Vendor.findOne({ domain })
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor domain already exists'
      })
    }

    // Check if email already exists
    const existingEmail = await Vendor.findOne({ email })
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      })
    }

    // Create white-label vendor
    const whiteLabelVendor = new Vendor({
      name,
      domain,
      email,
      password,
      contactPerson,
      industry,
      companySize,
      website,
      description,
      branding: {
        ...branding,
        whiteLabel: true
      },
      subscription: {
        ...subscription,
        plan: 'white-label',
        status: 'active'
      },
      clientType: 'white-label-client',
      whiteLabelSettings: {
        isWhiteLabelClient: true,
        whiteLabelCreatedBy: req.user._id,
        whiteLabelCreatedAt: new Date(),
        whiteLabelStatus: 'active'
      }
    })

    await whiteLabelVendor.save()

    res.status(201).json({
      success: true,
      message: 'White-label vendor created successfully',
      data: whiteLabelVendor.getPublicProfile()
    })
  } catch (error) {
    console.error('Create white-label vendor error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating white-label vendor'
    })
  }
}

// Update vendor
const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    // Update allowed fields
    const allowedFields = [
      'companyName', 'contactPerson', 'industry', 'companySize',
      'website', 'description', 'branding', 'subscription',
      'limits', 'settings', 'whiteLabelSettings'
    ]

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field]
      }
    })

    await vendor.save()

    res.json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor.getPublicProfile()
    })
  } catch (error) {
    console.error('Update vendor error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating vendor'
    })
  }
}

// Delete vendor
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    // Check if vendor has associated data
    const [userCount, projectCount, taskCount] = await Promise.all([
      User.countDocuments({ vendor: vendor._id }),
      Project.countDocuments({ vendor: vendor._id }),
      Task.countDocuments({ vendor: vendor._id })
    ])

    if (userCount > 0 || projectCount > 0 || taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vendor with associated data. Please delete all associated data first.'
      })
    }

    await Vendor.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    })
  } catch (error) {
    console.error('Delete vendor error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor'
    })
  }
}

// Get vendor statistics
const getVendorStats = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    const [userCount, projectCount, taskCount, activeProjects] = await Promise.all([
      User.countDocuments({ vendor: vendor._id }),
      Project.countDocuments({ vendor: vendor._id }),
      Task.countDocuments({ vendor: vendor._id }),
      Project.countDocuments({ 
        vendor: vendor._id, 
        status: { $in: ['active', 'in_progress'] } 
      })
    ])

    const stats = {
      users: userCount,
      projects: projectCount,
      tasks: taskCount,
      activeProjects,
      subscription: vendor.subscription,
      usage: vendor.usage,
      limits: vendor.limits
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Get vendor stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor statistics'
    })
  }
}

// Update vendor subscription
const updateVendorSubscription = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    const { plan, status, currentPeriodStart, currentPeriodEnd } = req.body

    if (plan) vendor.subscription.plan = plan
    if (status) vendor.subscription.status = status
    if (currentPeriodStart) vendor.subscription.currentPeriodStart = currentPeriodStart
    if (currentPeriodEnd) vendor.subscription.currentPeriodEnd = currentPeriodEnd

    await vendor.save()

    res.json({
      success: true,
      message: 'Vendor subscription updated successfully',
      data: vendor.subscription
    })
  } catch (error) {
    console.error('Update vendor subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating vendor subscription'
    })
  }
}

// Get white-label vendors only
const getWhiteLabelVendors = async (req, res) => {
  try {
    const whiteLabelVendors = await Vendor.find({
      'whiteLabelSettings.isWhiteLabelClient': true
    })
      .select('-password -emailVerificationToken -emailVerificationExpires')
      .populate('whiteLabelSettings.whiteLabelCreatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: whiteLabelVendors
    })
  } catch (error) {
    console.error('Get white-label vendors error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching white-label vendors'
    })
  }
}

// Get Linton-Tech clients only
const getLintonTechClients = async (req, res) => {
  try {
    const lintonTechClients = await Vendor.find({
      clientType: 'linton-tech-client'
    })
      .select('-password -emailVerificationToken -emailVerificationExpires')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: lintonTechClients
    })
  } catch (error) {
    console.error('Get Linton-Tech clients error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching Linton-Tech clients'
    })
  }
}

module.exports = {
  getAllVendors,
  getVendorById,
  createWhiteLabelVendor,
  updateVendor,
  deleteVendor,
  getVendorStats,
  updateVendorSubscription,
  getWhiteLabelVendors,
  getLintonTechClients
} 