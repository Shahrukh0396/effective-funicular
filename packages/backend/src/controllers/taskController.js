const Task = require('../models/Task')
const Project = require('../models/Project')
const User = require('../models/User')

// Get all tasks with role-based access control
const getTasks = async (req, res) => {
  try {
    const { 
      project, 
      status, 
      priority, 
      assignedTo, 
      sprint, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query
    const skip = (page - 1) * limit

    // Build filter based on user role and access
    let filter = {}
    
    // Add vendor filtering
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    if (req.user.role === 'client') {
      // Clients can only see tasks from their projects
      const userProjects = await Project.find({ client: req.user._id }).select('_id')
      filter.project = { $in: userProjects.map(p => p._id) }
    } else if (req.user.role === 'employee') {
      // Employees can see tasks from projects they're involved in
      const userProjects = await Project.find({
        $or: [
          { client: req.user._id },
          { 'team.user': req.user._id },
          { projectManager: req.user._id }
        ]
      }).select('_id')
      filter.project = { $in: userProjects.map(p => p._id) }
    }
    // Admin can see all tasks

    // Add additional filters
    if (project) filter.project = project
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (assignedTo) filter.assignedTo = assignedTo
    if (sprint) filter.sprint = sprint

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const tasks = await Task.find(filter)
      .populate('project', 'name status client')
      .populate('sprint', 'name status')
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('comments.author', 'firstName lastName email avatar')
      .sort(sort)
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
    console.error('Get tasks error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    })
  }
}

// Get task by ID with access control
const getTaskById = async (req, res) => {
  try {
    // Add vendor filtering
    const filter = { _id: req.params.id }
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    const task = await Task.findOne(filter)
      .populate('project', 'name status client team projectManager')
      .populate('sprint', 'name status')
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('reviewedBy', 'firstName lastName email avatar')
      .populate('comments.author', 'firstName lastName email avatar')
      .populate('attachments.uploadedBy', 'firstName lastName email avatar')
      .populate('timeEntries.user', 'firstName lastName email avatar')
      .populate('dependencies.task', 'title status priority')
      .populate('parentTask', 'title status')
      .populate('subtasks', 'title status')

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check access permissions
    const project = task.project
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    const canAccess = req.user.role === 'admin' ||
                     project.client.toString() === req.user._id.toString() ||
                     project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                     project.projectManager.toString() === req.user._id.toString()

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      data: {
        task
      }
    })
  } catch (error) {
    console.error('Get task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    })
  }
}

// Create task with permission checks
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      type,
      priority,
      assignedTo,
      dueDate,
      estimatedHours,
      sprint,
      labels,
      tags,
      acceptanceCriteria,
      parentTask
    } = req.body

    // Verify project access
    const projectDoc = await Project.findById(project)
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    // Check permissions
    const canCreateTask = req.user.role === 'admin' ||
                         projectDoc.client.toString() === req.user._id.toString() ||
                         projectDoc.team.some(member => member.user.toString() === req.user._id.toString()) ||
                         projectDoc.projectManager.toString() === req.user._id.toString()

    if (!canCreateTask) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project team members can create tasks.'
      })
    }

    // Verify assignee if provided
    if (assignedTo) {
      const assignee = await User.findById(assignedTo)
      if (!assignee) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found'
        })
      }
    }

    const task = new Task({
      title,
      description,
      project,
      type,
      priority,
      assignedTo,
      dueDate,
      estimatedHours,
      sprint,
      labels,
      tags,
      acceptanceCriteria,
      parentTask,
      createdBy: req.user._id,
      vendor: req.user.vendor
    })

    await task.save()

    // Update project metrics
    await Task.updateProjectMetrics(project)

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('sprint', 'name status')
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('comments.author', 'firstName lastName email avatar')

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task: populatedTask
      }
    })
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    })
  }
}

// Update task with access control
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status client team projectManager')

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check permissions
    const project = task.project
    const canEdit = req.user.role === 'admin' ||
                   task.createdBy.toString() === req.user._id.toString() ||
                   task.assignedTo?.toString() === req.user._id.toString() ||
                   project.client.toString() === req.user._id.toString() ||
                   project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                   project.projectManager.toString() === req.user._id.toString()

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only task assignee, creator, or project team members can edit this task.'
      })
    }

    const allowedUpdates = [
      'title', 'description', 'status', 'priority', 'assignedTo', 'dueDate',
      'estimatedHours', 'labels', 'tags', 'acceptanceCriteria'
    ]

    const updates = {}
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    // Handle status change
    if (updates.status === 'in-progress' && task.status === 'todo') {
      updates.startedAt = new Date()
    } else if (updates.status === 'done' && task.status !== 'done') {
      updates.completedAt = new Date()
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('project', 'name status')
    .populate('sprint', 'name status')
    .populate('assignedTo', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar')
    .populate('comments.author', 'firstName lastName email avatar')

    // Update project metrics
    await Task.updateProjectMetrics(task.project._id)

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task: updatedTask
      }
    })
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    })
  }
}

// Delete task with access control
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status client team projectManager')

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check permissions
    const project = task.project
    const canDelete = req.user.role === 'admin' ||
                     task.createdBy.toString() === req.user._id.toString() ||
                     project.projectManager.toString() === req.user._id.toString()

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only task creator, project manager, or admin can delete this task.'
      })
    }

    await Task.findByIdAndDelete(req.params.id)

    // Update project metrics
    await Task.updateProjectMetrics(task.project._id)

    res.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    })
  }
}

// Add comment to task
const addComment = async (req, res) => {
  try {
    const { content } = req.body

    const task = await Task.findById(req.params.id)
      .populate('project', 'name status client team projectManager')

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check permissions
    const project = task.project
    const canComment = req.user.role === 'admin' ||
                      project.client.toString() === req.user._id.toString() ||
                      project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                      project.projectManager.toString() === req.user._id.toString()

    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project team members can add comments.'
      })
    }

    await task.addComment(content, req.user._id)

    const updatedTask = await Task.findById(req.params.id)
      .populate('comments.author', 'firstName lastName email avatar')

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: updatedTask.comments[updatedTask.comments.length - 1]
      }
    })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    })
  }
}

// Start time tracking for task
const startTimeTracking = async (req, res) => {
  try {
    const { description } = req.body

    const task = await Task.findById(req.params.id)
      .populate('project', 'name status client team projectManager')

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check permissions
    const project = task.project
    const canTrackTime = req.user.role === 'admin' ||
                        task.assignedTo?.toString() === req.user._id.toString() ||
                        project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                        project.projectManager.toString() === req.user._id.toString()

    if (!canTrackTime) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only task assignee or project team members can track time.'
      })
    }

    // Check if already tracking time
    const runningEntry = task.timeEntries.find(entry => 
      entry.user.toString() === req.user._id.toString() && entry.isRunning
    )

    if (runningEntry) {
      return res.status(400).json({
        success: false,
        message: 'Time tracking is already running for this task'
      })
    }

    await task.startTimeTracking(req.user._id, description)

    res.json({
      success: true,
      message: 'Time tracking started successfully'
    })
  } catch (error) {
    console.error('Start time tracking error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while starting time tracking'
    })
  }
}

// Stop time tracking for task
const stopTimeTracking = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status client team projectManager')

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check permissions
    const project = task.project
    const canTrackTime = req.user.role === 'admin' ||
                        task.assignedTo?.toString() === req.user._id.toString() ||
                        project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                        project.projectManager.toString() === req.user._id.toString()

    if (!canTrackTime) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only task assignee or project team members can track time.'
      })
    }

    await task.stopTimeTracking(req.user._id)

    res.json({
      success: true,
      message: 'Time tracking stopped successfully'
    })
  } catch (error) {
    console.error('Stop time tracking error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while stopping time tracking'
    })
  }
}

// Get time entries for task
const getTimeEntries = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status client team projectManager')
      .populate('timeEntries.user', 'firstName lastName email avatar')

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Check permissions
    const project = task.project
    const canViewTime = req.user.role === 'admin' ||
                       project.client.toString() === req.user._id.toString() ||
                       project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                       project.projectManager.toString() === req.user._id.toString()

    if (!canViewTime) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      data: {
        timeEntries: task.timeEntries
      }
    })
  } catch (error) {
    console.error('Get time entries error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching time entries'
    })
  }
}

// Get task statistics
const getTaskStatistics = async (req, res) => {
  try {
    const { project, startDate, endDate } = req.query

    // Build filter based on user role and access
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

    if (project) filter.project = project
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    // Get task statistics
    const statusStats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const priorityStats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ])

    const totalTasks = await Task.countDocuments(filter)
    const completedTasks = await Task.countDocuments({ ...filter, status: 'done' })
    const overdueTasks = await Task.countDocuments({
      ...filter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    })

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        overdueTasks,
        statusBreakdown: statusStats,
        priorityBreakdown: priorityStats,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    })
  } catch (error) {
    console.error('Get task statistics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task statistics'
    })
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  startTimeTracking,
  stopTimeTracking,
  getTimeEntries,
  getTaskStatistics
} 