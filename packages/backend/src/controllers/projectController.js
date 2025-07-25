const Project = require('../models/Project')
const Task = require('../models/Task')
const User = require('../models/User')
const Vendor = require('../models/Vendor')

// Get all projects with role-based access control
const getProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query
    const skip = (page - 1) * limit

    // Build filter based on user role and access
    let filter = {}
    
    // Add vendor filter for multi-tenancy
    if (req.vendorFilter) {
      // Fix: Use vendorId instead of vendor to match Project model
      filter.vendorId = req.vendorFilter.vendor
    } else if (req.user.vendorId) {
      // Fallback: use user's vendorId if vendorFilter not set
      filter.vendorId = req.user.vendorId
    }
    
    if (req.user.role === 'client') {
      // Clients can only see their own projects
      filter.clientId = req.user._id
    } else if (req.user.role === 'employee') {
      // Employees can see projects they're involved in
      filter.$or = [
        { clientId: req.user._id },
        { 'team.user': req.user._id },
        { projectManager: req.user._id }
      ]
    }
    // Admin and super_admin can see all projects (filtered by vendor)

    // Add status filter
    if (status) {
      filter.status = status
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const projects = await Project.find(filter)
      .populate('clientId', 'firstName lastName email company')
      .populate('team.projectManager', 'firstName lastName email')
      .populate('team.members.user', 'firstName lastName email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Project.countDocuments(filter)

    res.json({
      success: true,
      data: {
        projects: projects
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching projects' 
    })
  }
}

// Get project by ID with access control
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'firstName lastName email company')
      .populate('team.projectManager', 'firstName lastName email avatar')
      .populate('team.members.user', 'firstName lastName email avatar role')
      .populate('documents.uploadedBy', 'firstName lastName email')
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      })
    }

    // Check access permissions
    const canAccess = req.user.role === 'admin' ||
                     project.clientId._id.toString() === req.user._id.toString() ||
                     project.team.members.some(member => member.user._id.toString() === req.user._id.toString()) ||
                     project.team.projectManager?._id.toString() === req.user._id.toString()

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this project.'
      })
    }

    // Get project statistics
    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const totalTasks = await Task.countDocuments({ project: project._id })
    const completedTasks = await Task.countDocuments({ 
      project: project._id, 
      status: 'done' 
    })

    const projectData = project.toObject()
    projectData.statistics = {
      totalTasks,
      completedTasks,
      taskStatusBreakdown: taskStats,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }

    res.json({ 
      success: true, 
      data: projectData 
    })
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching project' 
    })
  }
}

// Create project with permission checks
const createProject = async (req, res) => {
  try {
    const { name, description, client, startDate, endDate, budget, team } = req.body

    // Check if client exists
    const clientUser = await User.findById(client)
    if (!clientUser) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      })
    }

    console.log('Create project - User role:', req.user.role)
    console.log('Create project - User ID:', req.user._id)
    console.log('Create project - User email:', req.user.email)
    
    // Only admins, employees, and clients can create projects
    if (!['admin', 'employee', 'client', 'super_admin'].includes(req.user.role)) {
      console.log('Create project - Access denied for role:', req.user.role)
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins, employees, clients, and super admins can create projects.'
      })
    }

    const projectData = {
      name,
      description,
      clientId: client, // Fix: use clientId instead of client
      startDate,
      endDate,
      budget,
      team: team || [],
      projectManager: req.user._id,
      createdBy: req.user._id
    }

    // Add vendor for multi-tenancy
    if (req.user.vendorId) {
      projectData.vendorId = req.user.vendorId // Fix: use vendorId instead of vendor
    } else if (req.vendorFilter && req.vendorFilter.vendor) {
      projectData.vendorId = req.vendorFilter.vendor // Fix: use vendorId instead of vendor
    } else if (req.user.role === 'super_admin') {
      // For super admin, try to find a vendor from the request context
      const vendor = await Vendor.findOne({ domain: req.body.vendorDomain || 'test-vendor' })
      if (vendor) {
        projectData.vendorId = vendor._id // Fix: use vendorId instead of vendor
      }
    }

    const project = new Project(projectData)
    
    const savedProject = await project.save()
    await savedProject.populate('clientId', 'firstName lastName email company') // Fix: use clientId
    await savedProject.populate('projectManager', 'firstName lastName email')
    await savedProject.populate('team.user', 'firstName lastName email')
    
    res.status(201).json({ 
      success: true, 
      message: 'Project created successfully',
      data: savedProject 
    })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating project' 
    })
  }
}

// Update project with access control
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'firstName lastName email')
      .populate('team.user', 'firstName lastName email')

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      })
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' ||
                   project.projectManager?.toString() === req.user._id.toString() ||
                   project.team.some(member => 
                     member.user._id.toString() === req.user._id.toString() && 
                     member.role === 'manager'
                   )

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project managers or admins can edit projects.'
      })
    }

    // Define allowed updates based on user role
    const allowedUpdates = ['name', 'description', 'status', 'startDate', 'endDate', 'budget', 'team']
    const updates = {}
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('client', 'firstName lastName email company')
    .populate('projectManager', 'firstName lastName email')
    .populate('team.user', 'firstName lastName email')
    
    res.json({ 
      success: true, 
      message: 'Project updated successfully',
      data: updatedProject 
    })
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating project' 
    })
  }
}

// Delete project with access control
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'firstName lastName email')

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      })
    }

    // Only admins can delete projects
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can delete projects.'
      })
    }

    // Check if project has tasks
    const taskCount = await Task.countDocuments({ project: project._id })
    if (taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete project with existing tasks. Please delete all tasks first.'
      })
    }

    await Project.findByIdAndDelete(req.params.id)
    
    res.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting project' 
    })
  }
}

// Get project analytics
const getProjectAnalytics = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'firstName lastName email')

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    // Check permissions
    const canViewAnalytics = req.user.role === 'admin' ||
                            project.client._id.toString() === req.user._id.toString() ||
                            project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                            project.projectManager?.toString() === req.user._id.toString()

    if (!canViewAnalytics) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$actualHours' }
        }
      }
    ])

    // Get time tracking data
    const timeStats = await Task.aggregate([
      { $match: { project: project._id } },
      { $unwind: '$timeEntries' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timeEntries.startTime' }
          },
          totalHours: { $sum: '$timeEntries.duration' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Calculate project progress
    const totalTasks = await Task.countDocuments({ project: project._id })
    const completedTasks = await Task.countDocuments({ 
      project: project._id, 
      status: 'done' 
    })
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Check if project is overdue
    const isOverdue = project.endDate && new Date() > new Date(project.endDate) && progress < 100

    res.json({
      success: true,
      data: {
        projectMetrics: project.metrics,
        taskStats,
        timeStats,
        progress,
        isOverdue,
        totalTasks,
        completedTasks,
        remainingTasks: totalTasks - completedTasks
      }
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    })
  }
}

// Get project timeline
const getProjectTimeline = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'firstName lastName email')

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    // Check permissions
    const canViewTimeline = req.user.role === 'admin' ||
                           project.client._id.toString() === req.user._id.toString() ||
                           project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                           project.projectManager?.toString() === req.user._id.toString()

    if (!canViewTimeline) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Get tasks with timeline data
    const tasks = await Task.find({ project: project._id })
      .select('title status priority dueDate startedAt completedAt')
      .populate('assignedTo', 'firstName lastName')
      .sort({ dueDate: 1 })

    // Create timeline events
    const timeline = [
      {
        type: 'project_start',
        date: project.startDate,
        title: 'Project Started',
        description: `Project "${project.name}" began`,
        status: 'completed'
      },
      {
        type: 'project_end',
        date: project.endDate,
        title: 'Project Deadline',
        description: `Project "${project.name}" due date`,
        status: new Date() > new Date(project.endDate) ? 'overdue' : 'pending'
      }
    ]

    // Add task events
    tasks.forEach(task => {
      if (task.startedAt) {
        timeline.push({
          type: 'task_started',
          date: task.startedAt,
          title: `Task Started: ${task.title}`,
          description: `Task assigned to ${task.assignedTo?.firstName} ${task.assignedTo?.lastName}`,
          status: 'completed',
          taskId: task._id
        })
      }

      if (task.completedAt) {
        timeline.push({
          type: 'task_completed',
          date: task.completedAt,
          title: `Task Completed: ${task.title}`,
          description: `Task completed by ${task.assignedTo?.firstName} ${task.assignedTo?.lastName}`,
          status: 'completed',
          taskId: task._id
        })
      }

      if (task.dueDate && !task.completedAt) {
        timeline.push({
          type: 'task_due',
          date: task.dueDate,
          title: `Task Due: ${task.title}`,
          description: `Task due date for ${task.assignedTo?.firstName} ${task.assignedTo?.lastName}`,
          status: new Date() > new Date(task.dueDate) ? 'overdue' : 'pending',
          taskId: task._id
        })
      }
    })

    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date))

    res.json({
      success: true,
      data: {
        timeline,
        project: {
          name: project.name,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status
        }
      }
    })
  } catch (error) {
    console.error('Get timeline error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching timeline'
    })
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectAnalytics,
  getProjectTimeline
} 