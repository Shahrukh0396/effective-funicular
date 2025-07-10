const User = require('../models/User')
const Project = require('../models/Project')
const Task = require('../models/Task')

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: {
        user
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    })
  }
}

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, company, position, bio, avatar } = req.body

    // Define allowed updates
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'company', 'position', 'bio', 'avatar']
    const updates = {}

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    })
  }
}

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    })
  }
}

// Get user dashboard data
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id

    // Get user's projects
    let projectFilter = {}
    if (req.user.role === 'client') {
      projectFilter = { client: userId }
    } else if (req.user.role === 'employee') {
      projectFilter = {
        $or: [
          { client: userId },
          { 'team.user': userId },
          { projectManager: userId }
        ]
      }
    }

    const projects = await Project.find(projectFilter)
      .populate('client', 'firstName lastName email company')
      .populate('projectManager', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .limit(5)

    // Get user's tasks
    let taskFilter = {}
    if (req.user.role === 'client') {
      const userProjects = await Project.find({ client: userId }).select('_id')
      taskFilter.project = { $in: userProjects.map(p => p._id) }
    } else if (req.user.role === 'employee') {
      const userProjects = await Project.find({
        $or: [
          { client: userId },
          { 'team.user': userId },
          { projectManager: userId }
        ]
      }).select('_id')
      taskFilter.project = { $in: userProjects.map(p => p._id) }
    }

    const tasks = await Task.find(taskFilter)
      .populate('project', 'name status')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ dueDate: 1 })
      .limit(10)

    // Get statistics
    const totalProjects = await Project.countDocuments(projectFilter)
    const totalTasks = await Task.countDocuments(taskFilter)
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'done' })
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    })

    // Get recent activity
    const recentTasks = await Task.find(taskFilter)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(5)

    res.json({
      success: true,
      data: {
        projects,
        tasks,
        statistics: {
          totalProjects,
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        },
        recentActivity: recentTasks
      }
    })
  } catch (error) {
    console.error('Get dashboard data error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    })
  }
}

// Get user's projects
const getUserProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    let filter = {}
    if (req.user.role === 'client') {
      filter.client = req.user._id
    } else if (req.user.role === 'employee') {
      filter.$or = [
        { client: req.user._id },
        { 'team.user': req.user._id },
        { projectManager: req.user._id }
      ]
    }

    if (status) {
      filter.status = status
    }

    const projects = await Project.find(filter)
      .populate('client', 'firstName lastName email company')
      .populate('projectManager', 'firstName lastName email')
      .populate('team.user', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Project.countDocuments(filter)

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get user projects error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    })
  }
}

// Get user's tasks
const getUserTasks = async (req, res) => {
  try {
    const { status, priority, project, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    let filter = {}
    if (req.user.role === 'client') {
      const userProjects = await Project.find({ client: req.user._id }).select('_id')
      filter.project = { $in: userProjects.map(p => p._id) }
    } else if (req.user.role === 'employee') {
      const userProjects = await Project.find({
        $or: [
          { client: req.user._id },
          { 'team.user': req.user._id },
          { projectManager: req.user._id }
        ]
      }).select('_id')
      filter.project = { $in: userProjects.map(p => p._id) }
    }

    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (project) filter.project = project

    const tasks = await Task.find(filter)
      .populate('project', 'name status')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Task.countDocuments(filter)

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get user tasks error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    })
  }
}

// Update GDPR consent
const updateConsent = async (req, res) => {
  try {
    const { consentType, granted } = req.body

    if (!['marketing', 'analytics', 'necessary', 'thirdParty'].includes(consentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid consent type'
      })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await user.updateConsent(consentType, granted, req.ip, req.get('User-Agent'))

    res.json({
      success: true,
      message: 'Consent updated successfully'
    })
  } catch (error) {
    console.error('Update consent error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating consent'
    })
  }
}

// Request data portability
const requestDataPortability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await user.requestDataPortability()

    res.json({
      success: true,
      message: 'Data portability request submitted successfully. You will receive an email with your data within 30 days.'
    })
  } catch (error) {
    console.error('Request data portability error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while requesting data portability'
    })
  }
}

// Request right to be forgotten
const requestRightToBeForgotten = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await user.requestRightToBeForgotten()

    res.json({
      success: true,
      message: 'Right to be forgotten request submitted successfully. Your data will be anonymized within 30 days.'
    })
  } catch (error) {
    console.error('Request right to be forgotten error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while requesting right to be forgotten'
    })
  }
}

// Get user statistics
const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user._id
    const { startDate, endDate } = req.query

    // Build date filter
    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate)
    }

    // Get project statistics
    let projectFilter = { ...dateFilter }
    if (req.user.role === 'client') {
      projectFilter.client = userId
    } else if (req.user.role === 'employee') {
      projectFilter.$or = [
        { client: userId },
        { 'team.user': userId },
        { projectManager: userId }
      ]
    }

    const projectStats = await Project.aggregate([
      { $match: projectFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get task statistics
    let taskFilter = { ...dateFilter }
    if (req.user.role === 'client') {
      const userProjects = await Project.find({ client: userId }).select('_id')
      taskFilter.project = { $in: userProjects.map(p => p._id) }
    } else if (req.user.role === 'employee') {
      const userProjects = await Project.find({
        $or: [
          { client: userId },
          { 'team.user': userId },
          { projectManager: userId }
        ]
      }).select('_id')
      taskFilter.project = { $in: userProjects.map(p => p._id) }
    }

    const taskStats = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const totalProjects = await Project.countDocuments(projectFilter)
    const totalTasks = await Task.countDocuments(taskFilter)
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'done' })
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    })

    res.json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        projectStatusBreakdown: projectStats,
        taskStatusBreakdown: taskStats
      }
    })
  } catch (error) {
    console.error('Get user statistics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    })
  }
}

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword,
  getDashboardData,
  getUserProjects,
  getUserTasks,
  updateConsent,
  requestDataPortability,
  requestRightToBeForgotten,
  getUserStatistics
} 