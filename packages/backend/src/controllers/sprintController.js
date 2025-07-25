const Sprint = require('../models/Sprint')
const Project = require('../models/Project')
const Task = require('../models/Task')

// Get all sprints
const getSprints = async (req, res) => {
  try {
    const { projectId, status } = req.query
    const filter = {}
    
    // Add vendor filtering
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    // Add role-based project filtering
    if (req.user.role === 'client') {
      // Clients can only see sprints from their projects
      const userProjects = await Project.find({ client: req.user._id }).select('_id')
      filter.project = { $in: userProjects.map(p => p._id) }
    } else if (req.user.role === 'employee') {
      // Employees can see sprints from projects they're involved in
      const userProjects = await Project.find({
        $or: [
          { client: req.user._id },
          { 'team.user': req.user._id },
          { projectManager: req.user._id }
        ]
      }).select('_id')
      filter.project = { $in: userProjects.map(p => p._id) }
    }
    // Admin can see all sprints
    
    if (projectId) filter.project = projectId
    if (status) filter.status = status
    
    const sprints = await Sprint.find(filter)
      .populate('project', 'name')
      .populate('backlog.task', 'title status priority')
      .populate('team.user', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
    console.log(sprints, "S")
    res.json({
      success: true,
      data: sprints
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new sprint
const createSprint = async (req, res) => {
  try {
    const { name, description, startDate, endDate, projectId, goal } = req.body
    
    // Validate project exists
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    
    const sprint = new Sprint({
      name,
      description,
      startDate,
      endDate,
      project: projectId,
      goal,
      createdBy: req.user.id,
      vendor: req.user.vendor
    })
    
    const savedSprint = await sprint.save()
    await savedSprint.populate('project', 'name')
    
    res.status(201).json(savedSprint)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update a sprint
const updateSprint = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    // Add vendor filtering
    const filter = { _id: id }
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    const sprint = await Sprint.findOne(filter).populate('project', 'name')
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' })
    }
    
    // Check access permissions
    const project = sprint.project
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    
    const canAccess = req.user.role === 'admin' ||
                     project.client.toString() === req.user._id.toString() ||
                     project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                     project.projectManager.toString() === req.user._id.toString()
    
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    const updatedSprint = await Sprint.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('project', 'name')
    
    res.json(updatedSprint)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete a sprint
const deleteSprint = async (req, res) => {
  try {
    const { id } = req.params
    
    // Add vendor filtering
    const filter = { _id: id }
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    const sprint = await Sprint.findOne(filter).populate('project', 'name')
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' })
    }
    
    // Check access permissions
    const project = sprint.project
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    
    const canAccess = req.user.role === 'admin' ||
                     project.client.toString() === req.user._id.toString() ||
                     project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                     project.projectManager.toString() === req.user._id.toString()
    
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    // Remove sprint reference from tasks
    await Task.updateMany(
      { sprint: id },
      { $unset: { sprint: 1 } }
    )
    
    await Sprint.findByIdAndDelete(id)
    res.json({ message: 'Sprint deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Start a sprint
const startSprint = async (req, res) => {
  try {
    const { id } = req.params
    
    // Add vendor filtering
    const filter = { _id: id }
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    const sprint = await Sprint.findOne(filter).populate('project', 'name')
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' })
    }
    
    // Check access permissions
    const project = sprint.project
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    
    const canAccess = req.user.role === 'admin' ||
                     project.client.toString() === req.user._id.toString() ||
                     project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                     project.projectManager.toString() === req.user._id.toString()
    
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    if (sprint.status === 'active') {
      return res.status(400).json({ message: 'Sprint is already active' })
    }
    
    sprint.status = 'active'
    sprint.startedAt = Date.now()
    await sprint.save()
    
    res.json(sprint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Complete a sprint
const completeSprint = async (req, res) => {
  try {
    const { id } = req.params
    
    // Add vendor filtering
    const filter = { _id: id }
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    const sprint = await Sprint.findOne(filter).populate('project', 'name')
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' })
    }
    
    // Check access permissions
    const project = sprint.project
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    
    const canAccess = req.user.role === 'admin' ||
                     project.client.toString() === req.user._id.toString() ||
                     project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                     project.projectManager.toString() === req.user._id.toString()
    
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    if (sprint.status !== 'active') {
      return res.status(400).json({ message: 'Sprint is not active' })
    }
    
    sprint.status = 'completed'
    sprint.completedAt = Date.now()
    await sprint.save()
    
    res.json(sprint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get sprint metrics
const getSprintMetrics = async (req, res) => {
  try {
    const { id } = req.params
    
    // Add vendor filtering
    const filter = { _id: id }
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    const sprint = await Sprint.findOne(filter)
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' })
    }
    
    const tasks = await Task.find({ sprint: id })
    
    const metrics = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
      pendingTasks: tasks.filter(task => task.status === 'pending').length,
      completionRate: tasks.length > 0 ? 
        (tasks.filter(task => task.status === 'completed').length / tasks.length) * 100 : 0,
      totalStoryPoints: tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0),
      completedStoryPoints: tasks
        .filter(task => task.status === 'completed')
        .reduce((sum, task) => sum + (task.storyPoints || 0), 0)
    }
    
    res.json(metrics)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add a task to a sprint
const addTask = async (req, res) => {
  try {
    const { id } = req.params
    const { taskId } = req.body
    
    // Add vendor filtering
    const filter = { _id: id }
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    const sprint = await Sprint.findOne(filter)
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' })
    }
    
    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    // Check if task is already in sprint backlog
    const existingTask = sprint.backlog.find(item => item.task.toString() === taskId)
    if (existingTask) {
      return res.status(400).json({ message: 'Task is already in sprint backlog' })
    }
    
    // Add task to backlog
    sprint.backlog.push({
      task: taskId,
      priority: sprint.backlog.length + 1,
      storyPoints: task.storyPoints || 0
    })
    
    // Update task to reference sprint
    task.sprint = sprint._id
    await task.save()
    
    await sprint.save()
    await sprint.populate('backlog.task', 'title status priority')
    
    res.json(sprint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Remove a task from a sprint
const removeTask = async (req, res) => {
  try {
    const { id, taskId } = req.params
    
    // Add vendor filtering
    const filter = { _id: id }
    if (req.vendorFilter) {
      Object.assign(filter, req.vendorFilter)
    } else if (req.user && req.user.vendor) {
      filter.vendor = req.user.vendor
    }
    
    const sprint = await Sprint.findOne(filter)
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' })
    }
    
    // Remove task from backlog
    sprint.backlog = sprint.backlog.filter(item => item.task.toString() !== taskId)
    
    // Remove sprint reference from task
    await Task.findByIdAndUpdate(taskId, { $unset: { sprint: 1 } })
    
    await sprint.save()
    await sprint.populate('backlog.task', 'title status priority')
    
    res.json(sprint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  getSprintMetrics,
  addTask,
  removeTask
} 