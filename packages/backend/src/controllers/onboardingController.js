const Vendor = require('../models/Vendor')
const User = require('../models/User')
const Project = require('../models/Project')
const { sendEmail } = require('../services/emailService')

// Get onboarding progress
const getOnboardingProgress = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    res.json({
      success: true,
      data: {
        currentStep: vendor.onboarding.step,
        completedSteps: vendor.onboarding.completedSteps,
        isCompleted: vendor.onboarding.isCompleted,
        progress: Math.round((vendor.onboarding.completedSteps.length / 5) * 100)
      }
    })
  } catch (error) {
    console.error('Get onboarding progress error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching onboarding progress',
      error: error.message
    })
  }
}

// Update company information
const updateCompanyInfo = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    const { companyName, industry, companySize, website, description } = req.body

    // Update company information
    vendor.companyName = companyName
    vendor.industry = industry
    vendor.companySize = companySize
    vendor.website = website
    vendor.description = description

    // Update onboarding progress
    if (!vendor.onboarding.completedSteps.includes('company-info')) {
      vendor.onboarding.completedSteps.push('company-info')
    }
    vendor.onboarding.step = 'branding'

    await vendor.save()

    res.json({
      success: true,
      message: 'Company information updated successfully',
      data: {
        currentStep: vendor.onboarding.step,
        completedSteps: vendor.onboarding.completedSteps
      }
    })
  } catch (error) {
    console.error('Update company info error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating company information',
      error: error.message
    })
  }
}

// Update branding
const updateBranding = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    const { branding } = req.body

    // Update branding
    vendor.branding = { ...vendor.branding, ...branding }

    // Update onboarding progress
    if (!vendor.onboarding.completedSteps.includes('branding')) {
      vendor.onboarding.completedSteps.push('branding')
    }
    vendor.onboarding.step = 'team-setup'

    await vendor.save()

    res.json({
      success: true,
      message: 'Branding updated successfully',
      data: {
        currentStep: vendor.onboarding.step,
        completedSteps: vendor.onboarding.completedSteps
      }
    })
  } catch (error) {
    console.error('Update branding error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating branding',
      error: error.message
    })
  }
}

// Add team members
const addTeamMembers = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    const { teamMembers } = req.body

    // Check usage limits
    const currentAgentCount = await User.countDocuments({
      vendor: req.vendorId,
      role: 'employee'
    })

    if (currentAgentCount + teamMembers.length > vendor.limits.agents) {
      return res.status(403).json({
        success: false,
        message: `Cannot add ${teamMembers.length} team members. Limit is ${vendor.limits.agents} agents.`
      })
    }

    // Create team members
    const createdMembers = []
    for (const member of teamMembers) {
      const user = new User({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        password: member.password || 'tempPassword123', // They'll reset it
        role: 'employee',
        vendor: req.vendorId,
        company: vendor.companyName,
        position: member.position || 'Team Member'
      })

      await user.save()
      createdMembers.push(user)
    }

    // Update vendor usage
    vendor.usage.agents = currentAgentCount + teamMembers.length
    await vendor.save()

    // Update onboarding progress
    if (!vendor.onboarding.completedSteps.includes('team-setup')) {
      vendor.onboarding.completedSteps.push('team-setup')
    }
    vendor.onboarding.step = 'first-project'

    await vendor.save()

    res.json({
      success: true,
      message: `${teamMembers.length} team members added successfully`,
      data: {
        createdMembers: createdMembers.map(member => ({
          id: member._id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          position: member.position
        })),
        currentStep: vendor.onboarding.step,
        completedSteps: vendor.onboarding.completedSteps
      }
    })
  } catch (error) {
    console.error('Add team members error:', error)
    res.status(500).json({
      success: false,
      message: 'Error adding team members',
      error: error.message
    })
  }
}

// Create first project
const createFirstProject = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    const { projectName, projectDescription, clientEmail, clientName } = req.body

    // Check if client exists or create new one
    let client = await User.findOne({ email: clientEmail, vendor: req.vendorId })

    if (!client) {
      // Create new client
      client = new User({
        firstName: clientName.split(' ')[0] || 'Client',
        lastName: clientName.split(' ').slice(1).join(' ') || 'User',
        email: clientEmail,
        password: 'tempPassword123', // They'll reset it
        role: 'client',
        vendor: req.vendorId,
        company: vendor.companyName
      })
      await client.save()

      // Update vendor usage
      vendor.usage.contractors += 1
      await vendor.save()
    }

    // Create project
    const project = new Project({
      name: projectName,
      description: projectDescription,
      client: client._id,
      vendor: req.vendorId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'planning',
      createdBy: req.vendorId // Vendor ID as creator
    })

    await project.save()

    // Update vendor usage
    vendor.usage.projects += 1
    await vendor.save()

    // Update onboarding progress
    if (!vendor.onboarding.completedSteps.includes('first-project')) {
      vendor.onboarding.completedSteps.push('first-project')
    }
    vendor.onboarding.step = 'completed'
    vendor.onboarding.isCompleted = true

    await vendor.save()

    // Send welcome emails
    await sendEmail({
      to: client.email,
      subject: `Welcome to ${vendor.companyName} - Your Project Portal`,
      template: 'client-welcome',
      data: {
        clientName: client.fullName,
        companyName: vendor.companyName,
        projectName: project.name,
        loginUrl: `${req.protocol}://${req.get('host')}/login`
      }
    })

    res.json({
      success: true,
      message: 'First project created successfully',
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          client: {
            id: client._id,
            name: client.fullName,
            email: client.email
          }
        },
        currentStep: vendor.onboarding.step,
        completedSteps: vendor.onboarding.completedSteps,
        isCompleted: vendor.onboarding.isCompleted
      }
    })
  } catch (error) {
    console.error('Create first project error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating first project',
      error: error.message
    })
  }
}

// Skip onboarding step
const skipOnboardingStep = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    const { step } = req.body

    // Add step to completed steps
    if (!vendor.onboarding.completedSteps.includes(step)) {
      vendor.onboarding.completedSteps.push(step)
    }

    // Move to next step
    const steps = ['company-info', 'branding', 'team-setup', 'first-project']
    const currentIndex = steps.indexOf(vendor.onboarding.step)
    const nextStep = steps[currentIndex + 1] || 'completed'

    vendor.onboarding.step = nextStep

    if (nextStep === 'completed') {
      vendor.onboarding.isCompleted = true
    }

    await vendor.save()

    res.json({
      success: true,
      message: 'Step skipped successfully',
      data: {
        currentStep: vendor.onboarding.step,
        completedSteps: vendor.onboarding.completedSteps,
        isCompleted: vendor.onboarding.isCompleted
      }
    })
  } catch (error) {
    console.error('Skip onboarding step error:', error)
    res.status(500).json({
      success: false,
      message: 'Error skipping onboarding step',
      error: error.message
    })
  }
}

module.exports = {
  getOnboardingProgress,
  updateCompanyInfo,
  updateBranding,
  addTeamMembers,
  createFirstProject,
  skipOnboardingStep
} 