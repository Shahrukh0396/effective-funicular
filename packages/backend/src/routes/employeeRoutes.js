const express = require('express')
const { body, validationResult } = require('express-validator')
const { auth, authorize } = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')
const { generalLimiter } = require('../middleware/security')
const User = require('../models/User')
const Task = require('../models/Task')
const Project = require('../models/Project')
const Attendance = require('../models/Attendance')
const TimeEntry = require('../models/TimeEntry')

// Simple employee authorization middleware
const employeeAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    })
  }
  
  console.log('Employee auth - User role:', req.user.role)
  
  if (req.user.role === 'employee' || req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.isSuperAccount) {
    return next()
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Employee access only.'
  })
}

const router = express.Router()

/**
 * @swagger
 * /api/employee/login:
 *   post:
 *     summary: Employee login
 *     description: Authenticate employee and return JWT token
 *     tags: [Employee]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user by email - allow employees, admins, super admins, and super accounts
    const user = await User.findOne({ 
      email,
      $or: [
        { role: 'employee' },
        { role: 'admin' },
        { role: 'super_admin' },
        { isSuperAccount: true }
      ]
    })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' })
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Update last login
    user.lastLogin = new Date()
    await user.save()
    
    // Generate token
    const token = user.generateAuthToken()
    
    // Return user data (excluding sensitive information)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isSuperAccount: user.isSuperAccount,
      position: user.position,
      avatar: user.avatar,
      permissions: user.permissions,
      isActive: user.isActive
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    })
  } catch (error) {
    console.error('Employee login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Employee-specific middleware - only employees can access these routes
router.use(auth)
// router.use(authorize(['employee', 'admin', 'super_admin']))

/**
 * @swagger
 * /api/employee/me:
 *   get:
 *     summary: Get current employee profile
 *     description: Retrieve current employee's profile information
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', employeeAuth, async (req, res) => {
  try {
    const employee = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -passwordResetToken')
    
    if (!employee || (!['employee', 'admin'].includes(employee.role) && !employee.isSuperAccount && employee.role !== 'super_admin')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    
    res.json(employee)
  } catch (error) {
    console.error('Get employee profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/logout:
 *   post:
 *     summary: Employee logout
 *     description: Logout employee (client-side token removal)
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You could implement a blacklist here if needed
    res.json({ success: true, message: 'Logout successful' })
  } catch (error) {
    console.error('Employee logout error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/attendance/check-in:
 *   post:
 *     summary: Employee check-in
 *     description: Record employee check-in time
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Check-in recorded successfully
 */
router.post('/attendance/check-in', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    })
    
    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' })
    }
    
    let attendance
    if (existingAttendance) {
      attendance = existingAttendance
    } else {
      attendance = new Attendance({
        employee: req.user._id,
        date: today
      })
    }
    
    attendance.checkIn = new Date()
    await attendance.save()
    
    res.json({
      success: true,
      message: 'Check-in recorded successfully',
      checkInTime: attendance.checkIn
    })
  } catch (error) {
    console.error('Check-in error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/attendance/check-out:
 *   post:
 *     summary: Employee check-out
 *     description: Record employee check-out time
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Check-out recorded successfully
 */
router.post('/attendance/check-out', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    })
    
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'No check-in found for today' })
    }
    
    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' })
    }
    
    attendance.checkOut = new Date()
    attendance.totalHours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60)
    await attendance.save()
    
    res.json({
      success: true,
      message: 'Check-out recorded successfully',
      checkOutTime: attendance.checkOut,
      totalHours: attendance.totalHours
    })
  } catch (error) {
    console.error('Check-out error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/attendance/status:
 *   get:
 *     summary: Get attendance status
 *     description: Get current attendance status for today
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance status retrieved successfully
 */
router.get('/attendance/status', employeeAuth, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    })
    
    res.json({
      checkedIn: !!attendance?.checkIn,
      checkedOut: !!attendance?.checkOut,
      checkInTime: attendance?.checkIn,
      checkOutTime: attendance?.checkOut,
      totalHours: attendance?.totalHours || 0
    })
  } catch (error) {
    console.error('Get attendance status error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/attendance/history:
 *   get:
 *     summary: Get attendance history
 *     description: Get attendance history for the current employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance history retrieved successfully
 */
router.get('/attendance/history', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const query = { employee: req.user._id }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }
    
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(30)
    
    res.json(attendance)
  } catch (error) {
    console.error('Get attendance history error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/tasks/my-tasks:
 *   get:
 *     summary: Get employee's assigned tasks
 *     description: Get all tasks assigned to the current employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get('/tasks/my-tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name description')
      .populate('sprint', 'name startDate endDate')
      .populate('createdBy', 'firstName lastName')
      .sort({ priority: -1, dueDate: 1 })
    
    res.json(tasks)
  } catch (error) {
    console.error('Get my tasks error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/tasks/available:
 *   get:
 *     summary: Get available tasks
 *     description: Get tasks that can be assigned to the employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available tasks retrieved successfully
 */
router.get('/tasks/available', async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: null,
      status: { $in: ['todo', 'blocked'] }
    })
      .populate('project', 'name description')
      .populate('sprint', 'name startDate endDate')
      .populate('createdBy', 'firstName lastName')
      .sort({ priority: -1, dueDate: 1 })
    
    res.json(tasks)
  } catch (error) {
    console.error('Get available tasks error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/tasks/:id/start:
 *   post:
 *     summary: Start working on a task
 *     description: Start time tracking for a specific task
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task started successfully
 */
router.post('/tasks/:id/start', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    if (task.assignedTo?.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to work on this task' })
    }
    
    // Check if already has a running time entry
    const runningEntry = await TimeEntry.findOne({
      user: req.user._id,
      isRunning: true
    })
    
    if (runningEntry) {
      return res.status(400).json({ message: 'You already have a running time entry' })
    }
    
    // Create new time entry
    const timeEntry = new TimeEntry({
      user: req.user._id,
      task: task._id,
      startTime: new Date(),
      isRunning: true
    })
    await timeEntry.save()
    
    // Update task status
    task.status = 'in-progress'
    task.startedAt = new Date()
    await task.save()
    
    res.json({
      success: true,
      message: 'Task started successfully',
      timeEntry
    })
  } catch (error) {
    console.error('Start task error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/tasks/:id/stop:
 *   post:
 *     summary: Stop working on a task
 *     description: Stop time tracking for a specific task
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task stopped successfully
 */
router.post('/tasks/:id/stop', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    // Find running time entry for this task
    const timeEntry = await TimeEntry.findOne({
      user: req.user._id,
      task: task._id,
      isRunning: true
    })
    
    if (!timeEntry) {
      return res.status(400).json({ message: 'No running time entry found for this task' })
    }
    
    // Stop time entry
    timeEntry.endTime = new Date()
    timeEntry.duration = (timeEntry.endTime - timeEntry.startTime) / (1000 * 60 * 60) // hours
    timeEntry.isRunning = false
    await timeEntry.save()
    
    // Update task actual hours
    task.actualHours += timeEntry.duration
    await task.save()
    
    res.json({
      success: true,
      message: 'Task stopped successfully',
      duration: timeEntry.duration
    })
  } catch (error) {
    console.error('Stop task error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/tasks/:id/update-status:
 *   put:
 *     summary: Update task status
 *     description: Update the status of an assigned task
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, testing, done, blocked]
 *     responses:
 *       200:
 *         description: Task status updated successfully
 */
router.put('/tasks/:id/update-status', async (req, res) => {
  try {
    const { status } = req.body
    const task = await Task.findById(req.params.id)
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    if (task.assignedTo?.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to update this task' })
    }
    
    task.status = status
    if (status === 'done') {
      task.completedAt = new Date()
    }
    
    await task.save()
    
    res.json({
      success: true,
      message: 'Task status updated successfully',
      task
    })
  } catch (error) {
    console.error('Update task status error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/projects:
 *   get:
 *     summary: Get employee's projects
 *     description: Get all projects the employee is involved in
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({
      'team.user': req.user._id
    })
      .populate('team.user', 'firstName lastName email avatar')
      .populate('client', 'firstName lastName email company')
      .populate('projectManager', 'firstName lastName email')
      .sort({ updatedAt: -1 })
    
    res.json(projects)
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/sprints:
 *   get:
 *     summary: Get employee's sprints
 *     description: Get all sprints the employee is involved in
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sprints retrieved successfully
 */
router.get('/sprints', async (req, res) => {
  try {
    const Sprint = require('../models/Sprint')
    const sprints = await Sprint.find({
      'team.user': req.user._id
    })
      .populate('project', 'name description status')
      .populate('team.user', 'firstName lastName email avatar')
      .sort({ startDate: -1 })
    
    res.json(sprints)
  } catch (error) {
    console.error('Get sprints error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/profile/update:
 *   put:
 *     summary: Update employee profile
 *     description: Update employee's profile information
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile/update', async (req, res) => {
  try {
    const { firstName, lastName, phone, bio } = req.body
    
    const employee = await User.findById(req.user._id)
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    
    if (firstName) employee.firstName = firstName
    if (lastName) employee.lastName = lastName
    if (phone) employee.phone = phone
    if (bio) employee.bio = bio
    
    await employee.save()
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        bio: employee.bio,
        avatar: employee.avatar
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/tasks/:id/claim:
 *   post:
 *     summary: Claim unassigned task
 *     description: Allow employee to claim/select an unassigned task
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task claimed successfully
 *       400:
 *         description: Task already assigned
 *       404:
 *         description: Task not found
 */
router.post('/tasks/:id/claim', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    // Check if task is already assigned
    if (task.assignedTo) {
      return res.status(400).json({ 
        message: 'Task is already assigned to another employee',
        assignedTo: task.assignedTo
      })
    }
    
    // Check if task is available (not completed, not blocked, etc.)
    if (task.status === 'done' || task.status === 'blocked') {
      return res.status(400).json({ 
        message: 'Task is not available for claiming',
        status: task.status
      })
    }
    
    // Assign task to current employee
    task.assignedTo = req.user._id
    task.assignedAt = new Date()
    task.status = 'todo' // Reset to todo when claimed
    await task.save()
    
    res.json({
      success: true,
      message: `Task "${task.title}" claimed successfully`,
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedAt: task.assignedAt,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours
      }
    })
  } catch (error) {
    console.error('Claim task error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/tasks/:id/unclaim:
 *   post:
 *     summary: Unclaim assigned task
 *     description: Allow employee to unclaim/return an assigned task
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task unclaimed successfully
 *       403:
 *         description: Not authorized to unclaim this task
 *       404:
 *         description: Task not found
 */
router.post('/tasks/:id/unclaim', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    // Check if task is assigned to current employee
    if (task.assignedTo?.toString() !== req.user._id) {
      return res.status(403).json({ 
        message: 'Not authorized to unclaim this task',
        assignedTo: task.assignedTo
      })
    }
    
    // Check if task is in progress (shouldn't allow unclaiming)
    if (task.status === 'in-progress') {
      return res.status(400).json({ 
        message: 'Cannot unclaim task that is in progress. Please update status first.',
        status: task.status
      })
    }
    
    // Remove assignment
    task.assignedTo = null
    task.assignedAt = null
    task.status = 'todo' // Reset to todo when unclaimed
    await task.save()
    
    res.json({
      success: true,
      message: `Task "${task.title}" unclaimed successfully`,
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: null,
        assignedAt: null,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours
      }
    })
  } catch (error) {
    console.error('Unclaim task error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/employee/tasks/history:
 *   get:
 *     summary: Get employee task history
 *     description: Get all tasks that the employee has worked on
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task history retrieved successfully
 */
router.get('/tasks/history', async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
      status: { $in: ['done', 'blocked'] }
    })
      .populate('project', 'name')
      .populate('sprint', 'name')
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(50) // Limit to last 50 tasks
    
    const historyData = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedAt: task.assignedAt,
      completedAt: task.completedAt,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      project: task.project ? {
        id: task.project._id,
        name: task.project.name
      } : null,
      sprint: task.sprint ? {
        id: task.sprint._id,
        name: task.sprint.name
      } : null,
      dueDate: task.dueDate,
      createdAt: task.createdAt
    }))
    
    res.json(historyData)
  } catch (error) {
    console.error('Get task history error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router 