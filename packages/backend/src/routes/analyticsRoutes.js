const express = require('express')
const { auth, authorize } = require('../middleware/auth')
const Project = require('../models/Project')
const Task = require('../models/Task')
const User = require('../models/User')
const TimeEntry = require('../models/TimeEntry')
const Vendor = require('../models/Vendor')
const MarketingLead = require('../models/MarketingLead')
const { validateRequest } = require('../middleware/validation')

const router = express.Router()

// Apply authentication to all analytics routes
router.use(auth)

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     description: Retrieve comprehensive dashboard analytics for the current user/vendor
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: "30d"
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '30d' } = req.query
    const { user, vendorId } = req

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Build query based on user role
    const query = { vendor: vendorId }
    
    // Super admin can see all data
    if (user.role === 'super_admin' || user.isSuperAccount) {
      delete query.vendor
    }

    // Get project statistics
    const projectStats = await Project.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalBudget: { $sum: '$budget' }
        }
      }
    ])

    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          totalEstimatedHours: { $sum: '$estimatedHours' }
        }
      }
    ])

    // Get user statistics
    const userStats = await User.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ])

    // Get time tracking statistics
    const timeStats = await TimeEntry.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' },
          totalEntries: { $sum: 1 }
        }
      }
    ])

    // Get recent activity
    const recentActivity = await Task.find(query)
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName')

    const analytics = {
      period,
      dateRange: {
        start: startDate,
        end: endDate
      },
      projects: projectStats[0] || {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0
      },
      tasks: taskStats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        totalEstimatedHours: 0
      },
      users: userStats[0] || {
        totalUsers: 0,
        activeUsers: 0
      },
      timeTracking: timeStats[0] || {
        totalHours: 0,
        totalEntries: 0
      },
      recentActivity
    }

    res.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/analytics/projects:
 *   get:
 *     summary: Get project analytics
 *     description: Retrieve detailed project analytics and performance metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Specific project ID for detailed analytics
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Project analytics retrieved successfully
 */
router.get('/projects', async (req, res) => {
  try {
    const { projectId, period = '30d' } = req.query
    const { user, vendorId } = req

    const query = { vendor: vendorId }
    if (projectId) query._id = projectId

    // Super admin can see all data
    if (user.role === 'super_admin' || user.isSuperAccount) {
      delete query.vendor
    }

    if (projectId) {
      // Single project analytics
      const project = await Project.findById(projectId)
        .populate('client', 'firstName lastName company')
        .populate('team', 'firstName lastName')

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        })
      }

      // Get project tasks
      const tasks = await Task.find({ project: projectId })
        .populate('assignedTo', 'firstName lastName')

      // Calculate task statistics
      const taskStats = tasks.reduce((stats, task) => {
        stats.totalTasks++
        stats[task.status] = (stats[task.status] || 0) + 1
        stats.totalEstimatedHours += task.estimatedHours || 0
        return stats
      }, {
        totalTasks: 0,
        totalEstimatedHours: 0
      })

      // Get time entries for this project
      const timeEntries = await TimeEntry.find({ project: projectId })
      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)

      const projectAnalytics = {
        project,
        tasks,
        taskStats,
        timeTracking: {
          totalHours,
          totalEntries: timeEntries.length
        },
        progress: {
          completed: taskStats.done || 0,
          total: taskStats.totalTasks,
          percentage: taskStats.totalTasks > 0 ? 
            Math.round((taskStats.done || 0) / taskStats.totalTasks * 100) : 0
        }
      }

      res.json({
        success: true,
        data: projectAnalytics
      })
    } else {
      // All projects analytics
      const projects = await Project.find(query)
        .populate('client', 'firstName lastName company')
        .populate('team', 'firstName lastName')

      const projectAnalytics = projects.map(project => {
        return {
          id: project._id,
          name: project.name,
          description: project.description || '',
          status: project.status,
          progress: project.progress || 0,
          budget: project.budget?.estimated || project.budget || 0,
          deadline: project.endDate ? new Date(project.endDate).toLocaleDateString() : '',
          client: project.client?.company || project.client?.firstName + ' ' + project.client?.lastName || 'Unknown Client',
          teamSize: project.team?.length || 0
        }
      })

      res.json({
        success: true,
        data: projectAnalytics
      })
    }
  } catch (error) {
    console.error('Project analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/analytics/users:
 *   get:
 *     summary: Get user analytics
 *     description: Retrieve user performance and activity analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Specific user ID for detailed analytics
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 */
router.get('/users', async (req, res) => {
  try {
    const { userId } = req.query
    const { user, vendorId } = req

    const query = { vendor: vendorId }

    // Super admin can see all data
    if (user.role === 'super_admin' || user.isSuperAccount) {
      delete query.vendor
    }

    if (userId) {
      // Single user analytics
      const userData = await User.findById(userId)
        .select('-password')

      if (!userData) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Get user's tasks
      const tasks = await Task.find({ assignedTo: userId })
        .populate('project', 'name')

      // Get user's time entries
      const timeEntries = await TimeEntry.find({ user: userId })

      // Calculate user statistics
      const taskStats = tasks.reduce((stats, task) => {
        stats.totalTasks++
        stats[task.status] = (stats[task.status] || 0) + 1
        return stats
      }, { totalTasks: 0 })

      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)

      const userAnalytics = {
        user: userData,
        tasks,
        taskStats,
        timeTracking: {
          totalHours,
          totalEntries: timeEntries.length,
          averageHoursPerDay: timeEntries.length > 0 ? 
            totalHours / timeEntries.length : 0
        },
        performance: {
          completedTasks: taskStats.done || 0,
          totalTasks: taskStats.totalTasks,
          completionRate: taskStats.totalTasks > 0 ? 
            Math.round((taskStats.done || 0) / taskStats.totalTasks * 100) : 0
        }
      }

      res.json({
        success: true,
        data: userAnalytics
      })
    } else {
      // All users analytics
      const users = await User.find(query)
        .select('-password')
        .populate('vendor', 'name')

      const userAnalytics = await Promise.all(users.map(async (userData) => {
        const tasks = await Task.find({ assignedTo: userData._id })
        const timeEntries = await TimeEntry.find({ user: userData._id })

        const completedTasks = tasks.filter(task => task.status === 'done').length
        const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)

        return {
          id: userData._id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
          stats: {
            totalTasks: tasks.length,
            completedTasks,
            totalHours,
            completionRate: tasks.length > 0 ? 
              Math.round(completedTasks / tasks.length * 100) : 0
          }
        }
      }))

      res.json({
        success: true,
        data: userAnalytics
      })
    }
  } catch (error) {
    console.error('User analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     description: Retrieve revenue and billing analytics (super admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.get('/revenue', authorize(['super_admin']), async (req, res) => {
  try {
    const { period = '30d' } = req.query

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Get vendor statistics
    const vendorStats = await Vendor.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalVendors: { $sum: 1 },
          whiteLabelVendors: {
            $sum: { $cond: [{ $eq: ['$clientType', 'white-label'] }, 1, 0] }
          },
          lintonTechVendors: {
            $sum: { $cond: [{ $eq: ['$clientType', 'linton-tech'] }, 1, 0] }
          }
        }
      }
    ])

    // Get lead statistics
    const leadStats = await MarketingLead.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          qualifiedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] }
          },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
          }
        }
      }
    ])

    const revenueAnalytics = {
      period,
      dateRange: {
        start: startDate,
        end: endDate
      },
      vendors: vendorStats[0] || {
        totalVendors: 0,
        whiteLabelVendors: 0,
        lintonTechVendors: 0
      },
      leads: leadStats[0] || {
        totalLeads: 0,
        qualifiedLeads: 0,
        convertedLeads: 0
      },
      conversionRates: {
        leadToQualified: leadStats[0]?.totalLeads > 0 ? 
          Math.round((leadStats[0]?.qualifiedLeads || 0) / leadStats[0].totalLeads * 100) : 0,
        qualifiedToConverted: leadStats[0]?.qualifiedLeads > 0 ? 
          Math.round((leadStats[0]?.convertedLeads || 0) / leadStats[0].qualifiedLeads * 100) : 0
      }
    }

    res.json({
      success: true,
      data: revenueAnalytics
    })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/analytics/platform-overview:
 *   get:
 *     summary: Get platform overview analytics
 *     description: Retrieve comprehensive platform analytics (super admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform overview retrieved successfully
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.get('/platform-overview', authorize(['super_admin']), async (req, res) => {
  try {
    // Get overall statistics
    const totalVendors = await Vendor.countDocuments()
    const totalUsers = await User.countDocuments()
    const totalProjects = await Project.countDocuments()
    const totalTasks = await Task.countDocuments()
    const totalLeads = await MarketingLead.countDocuments()

    // Get active statistics
    const activeVendors = await Vendor.countDocuments({ status: 'active' })
    const activeUsers = await User.countDocuments({ isActive: true })
    const activeProjects = await Project.countDocuments({ status: 'active' })

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt')

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'firstName lastName company')

    const recentLeads = await MarketingLead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email company source status')

    const platformOverview = {
      totals: {
        vendors: totalVendors,
        users: totalUsers,
        projects: totalProjects,
        tasks: totalTasks,
        leads: totalLeads
      },
      active: {
        vendors: activeVendors,
        users: activeUsers,
        projects: activeProjects
      },
      recent: {
        users: recentUsers,
        projects: recentProjects,
        leads: recentLeads
      },
      health: {
        userGrowth: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
        projectSuccess: totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0,
        vendorRetention: totalVendors > 0 ? Math.round((activeVendors / totalVendors) * 100) : 0
      }
    }

    res.json({
      success: true,
      data: platformOverview
    })
  } catch (error) {
    console.error('Platform overview error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/analytics/vendor-performance:
 *   get:
 *     summary: Get vendor performance analytics
 *     description: Retrieve vendor performance metrics (super admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: string
 *         description: Specific vendor ID for detailed analytics
 *     responses:
 *       200:
 *         description: Vendor performance analytics retrieved successfully
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.get('/vendor-performance', authorize(['super_admin']), async (req, res) => {
  try {
    const { vendorId } = req.query

    if (vendorId) {
      // Single vendor performance
      const vendor = await Vendor.findById(vendorId)
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        })
      }

      // Get vendor's users
      const users = await User.find({ vendor: vendorId })
      const activeUsers = users.filter(user => user.isActive).length

      // Get vendor's projects
      const projects = await Project.find({ vendor: vendorId })
      const activeProjects = projects.filter(project => project.status === 'active').length

      // Get vendor's tasks
      const tasks = await Task.find({ vendor: vendorId })
      const completedTasks = tasks.filter(task => task.status === 'done').length

      const vendorPerformance = {
        vendor,
        users: {
          total: users.length,
          active: activeUsers,
          utilization: users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0
        },
        projects: {
          total: projects.length,
          active: activeProjects,
          success: projects.length > 0 ? Math.round((activeProjects / projects.length) * 100) : 0
        },
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          completion: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
        }
      }

      res.json({
        success: true,
        data: vendorPerformance
      })
    } else {
      // All vendors performance
      const vendors = await Vendor.find()
      const vendorPerformance = await Promise.all(vendors.map(async (vendor) => {
        const users = await User.find({ vendor: vendor._id })
        const projects = await Project.find({ vendor: vendor._id })
        const tasks = await Task.find({ vendor: vendor._id })

        const activeUsers = users.filter(user => user.isActive).length
        const activeProjects = projects.filter(project => project.status === 'active').length
        const completedTasks = tasks.filter(task => task.status === 'done').length

        return {
          id: vendor._id,
          name: vendor.name,
          clientType: vendor.clientType,
          status: vendor.status,
          performance: {
            users: {
              total: users.length,
              active: activeUsers,
              utilization: users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0
            },
            projects: {
              total: projects.length,
              active: activeProjects,
              success: projects.length > 0 ? Math.round((activeProjects / projects.length) * 100) : 0
            },
            tasks: {
              total: tasks.length,
              completed: completedTasks,
              completion: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
            }
          }
        }
      }))

      res.json({
        success: true,
        data: vendorPerformance
      })
    }
  } catch (error) {
    console.error('Vendor performance error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router 