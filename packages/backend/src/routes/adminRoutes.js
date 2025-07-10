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

const router = express.Router()

// Admin-specific middleware - only admins can access these routes
router.use(auth)

router.use(authorize('admin'))

/**
 * @swagger
 * /api/admin/employees:
 *   get:
 *     summary: Get all employees
 *     description: Retrieve all employees with their attendance and performance data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/employees', async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: ['employee', 'senior', 'lead'] } })
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
    
    // Get today's attendance for each employee
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const employeesWithAttendance = await Promise.all(
      employees.map(async (employee) => {
        const attendance = await Attendance.findOne({
          employee: employee._id,
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        })
        
        // Get today's time entries
        const timeEntries = await TimeEntry.find({
          user: employee._id,
          startTime: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        })
        
        const hoursToday = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)
        
        // Calculate performance based on completed tasks
        const completedTasks = await Task.countDocuments({
          assignedTo: employee._id,
          status: 'done',
          completedAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        })
        
        const totalTasks = await Task.countDocuments({
          assignedTo: employee._id,
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        })
        
        const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        
        return {
          ...employee.toObject(),
          attendanceStatus: attendance ? (attendance.checkOut ? 'checked_out' : 'checked_in') : 'absent',
          hoursToday,
          performance
        }
      })
    )
    
    res.json(employeesWithAttendance)
  } catch (error) {
    console.error('Get employees error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/employees:
 *   post:
 *     summary: Create new employee
 *     description: Create a new employee account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [employee, senior, lead]
 *               position:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Validation error
 */
router.post('/employees', 
  [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['employee', 'senior', 'lead']).withMessage('Invalid role'),
    body('position').optional().trim()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, role, position } = req.body
      
      // Check if email already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' })
      }
      
      // Create new employee
      const employee = new User({
        firstName,
        lastName,
        email,
        password,
        role,
        position,
        isActive: true,
        isEmailVerified: true // Admin creates verified accounts
      })
      
      await employee.save()
      
      // Return employee data without password
      const employeeData = {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        position: employee.position,
        isActive: employee.isActive,
        createdAt: employee.createdAt
      }
      
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        employee: employeeData
      })
    } catch (error) {
      console.error('Create employee error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

/**
 * @swagger
 * /api/admin/employees/:id/details:
 *   get:
 *     summary: Get employee details
 *     description: Get detailed information about an employee including performance stats
 *     tags: [Admin]
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
 *         description: Employee details retrieved successfully
 *       404:
 *         description: Employee not found
 */
router.get('/employees/:id/details', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -passwordResetToken')
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    
    // Get performance statistics
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const [totalTasks, completedTasks, timeEntries, attendanceRecords] = await Promise.all([
      Task.countDocuments({
        assignedTo: employee._id,
        createdAt: { $gte: last30Days }
      }),
      Task.countDocuments({
        assignedTo: employee._id,
        status: 'done',
        completedAt: { $gte: last30Days }
      }),
      TimeEntry.find({
        user: employee._id,
        startTime: { $gte: last30Days }
      }),
      Attendance.find({
        employee: employee._id,
        date: { $gte: last30Days }
      })
    ])
    
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const avgHoursPerDay = attendanceRecords.length > 0 ? totalHours / attendanceRecords.length : 0
    
    const stats = {
      totalTasks,
      completedTasks,
      totalHours,
      avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
      attendanceRate: attendanceRecords.length > 0 ? 
        (attendanceRecords.filter(a => a.status === 'present').length / attendanceRecords.length * 100).toFixed(1) : 0
    }
    
    res.json({
      ...employee.toObject(),
      stats
    })
  } catch (error) {
    console.error('Get employee details error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/employees/:id/toggle-status:
 *   put:
 *     summary: Toggle employee status
 *     description: Activate or deactivate an employee account
 *     tags: [Admin]
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
 *         description: Employee status updated successfully
 *       404:
 *         description: Employee not found
 */
router.put('/employees/:id/toggle-status', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    
    employee.isActive = !employee.isActive
    await employee.save()
    
    res.json({
      success: true,
      message: `Employee ${employee.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: employee.isActive
    })
  } catch (error) {
    console.error('Toggle employee status error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/attendance/overview:
 *   get:
 *     summary: Get attendance overview
 *     description: Get attendance statistics for all employees
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance overview retrieved successfully
 */
router.get('/attendance/overview', async (req, res) => {
  try {
    const { date } = req.query
    const targetDate = date ? new Date(date) : new Date()
    targetDate.setHours(0, 0, 0, 0)
    
    const attendance = await Attendance.find({
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('employee', 'firstName lastName email role')
    
    const employees = await User.find({ role: { $in: ['employee', 'senior', 'lead'] } })
    
    const overview = {
      totalEmployees: employees.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: employees.length - attendance.length,
      late: attendance.filter(a => a.status === 'late').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
      averageHours: attendance.length > 0 ? 
        attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length : 0,
      attendanceRecords: attendance
    }
    
    res.json(overview)
  } catch (error) {
    console.error('Get attendance overview error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/performance/overview:
 *   get:
 *     summary: Get performance overview
 *     description: Get performance statistics for all employees
 *     tags: [Admin]
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
 *         description: Performance overview retrieved successfully
 */
router.get('/performance/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()
    
    const employees = await User.find({ role: { $in: ['employee', 'senior', 'lead'] } })
    
    const performanceData = await Promise.all(
      employees.map(async (employee) => {
        const [tasks, timeEntries] = await Promise.all([
          Task.find({
            assignedTo: employee._id,
            createdAt: { $gte: start, $lte: end }
          }),
          TimeEntry.find({
            user: employee._id,
            startTime: { $gte: start, $lte: end }
          })
        ])
        
        const completedTasks = tasks.filter(t => t.status === 'done').length
        const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)
        const productivity = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
        
        return {
          employee: {
            id: employee._id,
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email,
            role: employee.role
          },
          stats: {
            totalTasks: tasks.length,
            completedTasks,
            totalHours,
            productivity: Math.round(productivity),
            averageHoursPerDay: timeEntries.length > 0 ? totalHours / timeEntries.length : 0
          }
        }
      })
    )
    
    const overview = {
      totalEmployees: employees.length,
      averageProductivity: performanceData.length > 0 ? 
        performanceData.reduce((sum, data) => sum + data.stats.productivity, 0) / performanceData.length : 0,
      totalHours: performanceData.reduce((sum, data) => sum + data.stats.totalHours, 0),
      totalTasks: performanceData.reduce((sum, data) => sum + data.stats.totalTasks, 0),
      completedTasks: performanceData.reduce((sum, data) => sum + data.stats.completedTasks, 0),
      performanceData
    }
    
    res.json(overview)
  } catch (error) {
    console.error('Get performance overview error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/gdpr/employee-data:
 *   get:
 *     summary: Get employee GDPR data
 *     description: Get employee data for GDPR compliance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee GDPR data retrieved successfully
 */
router.get('/gdpr/employee-data', async (req, res) => {
  try {
    const { employeeId } = req.query
    
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' })
    }
    
    const employee = await User.findById(employeeId)
      .select('-password')
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    
    // Get all data related to the employee
    const [tasks, timeEntries, attendance] = await Promise.all([
      Task.find({ assignedTo: employeeId }),
      TimeEntry.find({ user: employeeId }),
      Attendance.find({ employee: employeeId })
    ])
    
    const gdprData = {
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        position: employee.position,
        createdAt: employee.createdAt,
        lastLogin: employee.lastLogin,
        gdpr: employee.gdpr
      },
      tasks: tasks.length,
      timeEntries: timeEntries.length,
      attendanceRecords: attendance.length,
      dataSummary: {
        totalTasks: tasks.length,
        totalHours: timeEntries.reduce((sum, entry) => sum + entry.duration, 0),
        totalAttendanceDays: attendance.length,
        lastActivity: employee.lastActivity
      }
    }
    
    res.json(gdprData)
  } catch (error) {
    console.error('Get GDPR data error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/gdpr/anonymize-employee:
 *   post:
 *     summary: Anonymize employee data
 *     description: Anonymize employee data for GDPR compliance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee data anonymized successfully
 */
router.post('/gdpr/anonymize-employee', async (req, res) => {
  try {
    const { employeeId } = req.body
    
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' })
    }
    
    const employee = await User.findById(employeeId)
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }
    
    // Anonymize employee data
    await employee.anonymizeData()
    
    // Anonymize related data
    await Promise.all([
      TimeEntry.updateMany(
        { user: employeeId },
        { 
          $set: {
            'gdpr.anonymized': true,
            description: null,
            location: null,
            deviceInfo: null
          }
        }
      ),
      Attendance.updateMany(
        { employee: employeeId },
        {
          $set: {
            'gdpr.anonymized': true,
            location: null,
            deviceInfo: null,
            notes: null
          }
        }
      )
    ])
    
    res.json({
      success: true,
      message: 'Employee data anonymized successfully'
    })
  } catch (error) {
    console.error('Anonymize employee error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/dashboard/analytics:
 *   get:
 *     summary: Get dashboard analytics
 *     description: Get comprehensive analytics for the admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 */
router.get('/dashboard/analytics', async (req, res) => {
  try {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    
    // Get all users by role
    const [clients, employees, projects, tasks] = await Promise.all([
      User.find({ role: 'client' }).countDocuments(),
      User.find({ role: { $in: ['employee', 'senior', 'lead'] } }).countDocuments(),
      Project.find().countDocuments(),
      Task.find().countDocuments()
    ])
    
    // Get revenue data (mock for now - replace with actual billing data)
    const monthlyRevenue = 125000
    const revenueGrowth = 12.5
    const totalRevenue = 1250000
    
    // Get project statistics
    const [activeProjects, completedProjects] = await Promise.all([
      Project.find({ status: { $in: ['active', 'in_progress'] } }).countDocuments(),
      Project.find({ status: 'completed' }).countDocuments()
    ])
    
    // Get task statistics
    const [pendingTasks, completedTasks] = await Promise.all([
      Task.find({ status: { $in: ['pending', 'in_progress'] } }).countDocuments(),
      Task.find({ status: 'done' }).countDocuments()
    ])
    
    // Get team efficiency
    const employeeUsers = await User.find({ role: { $in: ['employee', 'senior', 'lead'] } })
    const efficiencyData = await Promise.all(
      employeeUsers.map(async (employee) => {
        const employeeTasks = await Task.find({ assignedTo: employee._id })
        const completedEmployeeTasks = employeeTasks.filter(t => t.status === 'done')
        return employeeTasks.length > 0 ? (completedEmployeeTasks.length / employeeTasks.length) * 100 : 0
      })
    )
    
    const teamEfficiency = efficiencyData.length > 0 ? 
      efficiencyData.reduce((sum, eff) => sum + eff, 0) / efficiencyData.length : 0
    
    // Get recent activity
    const recentActivity = await Promise.all([
      // Recent projects
      Project.find().sort({ createdAt: -1 }).limit(3).populate('client', 'firstName lastName'),
      // Recent tasks
      Task.find().sort({ createdAt: -1 }).limit(3).populate('assignedTo', 'firstName lastName'),
      // Recent users
      User.find().sort({ createdAt: -1 }).limit(3)
    ])
    
    const analytics = {
      metrics: {
        monthlyRevenue,
        revenueGrowth,
        activeClients: clients,
        clientGrowth: 8.2,
        activeProjects,
        projectCompletionRate: projects > 0 ? Math.round((completedProjects / projects) * 100) : 0,
        teamEfficiency: Math.round(teamEfficiency),
        efficiencyChange: 5.2,
        clientSatisfaction: 4.6,
        satisfactionResponses: 38
      },
      projectStatuses: [
        { name: 'On Track', count: Math.floor(activeProjects * 0.52), percentage: 52, color: 'bg-green-500' },
        { name: 'At Risk', count: Math.floor(activeProjects * 0.26), percentage: 26, color: 'bg-yellow-500' },
        { name: 'Delayed', count: Math.floor(activeProjects * 0.13), percentage: 13, color: 'bg-red-500' },
        { name: 'Completed', count: completedProjects, percentage: Math.round((completedProjects / projects) * 100), color: 'bg-blue-500' }
      ],
      taskMetrics: [
        { name: 'Completed', percentage: tasks > 0 ? Math.round((completedTasks / tasks) * 100) : 0 },
        { name: 'In Progress', percentage: tasks > 0 ? Math.round((pendingTasks / tasks) * 100) : 0 },
        { name: 'Pending', percentage: tasks > 0 ? Math.round(((tasks - completedTasks - pendingTasks) / tasks) * 100) : 0 }
      ],
      recentActivity: [
        ...recentActivity[0].map(project => ({
          id: project._id,
          title: 'New Project Created',
          description: project.name,
          user: `${project.client?.firstName || 'Unknown'} ${project.client?.lastName || 'Client'}`,
          time: project.createdAt,
          icon: 'ProjectIcon',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        })),
        ...recentActivity[1].map(task => ({
          id: task._id,
          title: 'Task Created',
          description: task.title,
          user: `${task.assignedTo?.firstName || 'Unknown'} ${task.assignedTo?.lastName || 'Employee'}`,
          time: task.createdAt,
          icon: 'TaskIcon',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5),
      systemAlerts: [
        {
          id: 1,
          title: 'High Server Load',
          description: 'Server CPU usage at 85%',
          severity: 'Warning',
          severityClass: 'bg-yellow-100 text-yellow-800',
          severityBg: 'bg-yellow-100',
          severityColor: 'text-yellow-600',
          time: new Date(Date.now() - 60 * 60 * 1000)
        },
        {
          id: 2,
          title: 'Database Backup',
          description: 'Daily backup completed successfully',
          severity: 'Info',
          severityClass: 'bg-blue-100 text-blue-800',
          severityBg: 'bg-blue-100',
          severityColor: 'text-blue-600',
          time: new Date(Date.now() - 3 * 60 * 60 * 1000)
        }
      ]
    }
    
    res.json(analytics)
  } catch (error) {
    console.error('Get dashboard analytics error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/clients/analytics:
 *   get:
 *     summary: Get client analytics
 *     description: Get comprehensive client analytics and management data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client analytics retrieved successfully
 */
router.get('/clients/analytics', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' })
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
    
    // Get client analytics
    const totalClients = clients.length
    const activeClients = clients.filter(client => client.isActive).length
    const newClientsThisMonth = clients.filter(client => 
      client.createdAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    ).length
    
    // Mock revenue data (replace with actual billing integration)
    const totalRevenue = 1250000
    const revenueGrowth = 8.2
    const avgSatisfaction = 4.6
    const satisfactionResponses = 42
    
    // Get client projects and performance
    const clientsWithData = await Promise.all(
      clients.map(async (client) => {
        const clientProjects = await Project.find({ client: client._id })
        const activeProjects = clientProjects.filter(p => p.status === 'active' || p.status === 'in_progress').length
        const totalRevenue = clientProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
        
        return {
          id: client._id,
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phone || '',
          status: client.isActive ? 'active' : 'inactive',
          activeProjects,
          totalRevenue,
          satisfaction: Math.floor(Math.random() * 2) + 4, // Mock satisfaction
          lastActivity: client.lastActivity || client.createdAt,
          initials: `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase()
        }
      })
    )
    
    const analytics = {
      totalClients,
      clientGrowth: newClientsThisMonth,
      activeSubscriptions: activeClients,
      subscriptionRate: totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0,
      totalRevenue,
      revenueGrowth,
      avgSatisfaction,
      satisfactionResponses,
      clients: clientsWithData
    }
    
    res.json(analytics)
  } catch (error) {
    console.error('Get client analytics error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/projects:
 *   get:
 *     summary: Get all projects
 *     description: Get all projects for admin view
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('client', 'firstName lastName email company')
      .populate('projectManager', 'firstName lastName email')
      .populate('team.user', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
    
    res.json(projects)
  } catch (error) {
    console.error('Get admin projects error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/sprints:
 *   get:
 *     summary: Get all sprints
 *     description: Get all sprints for admin view
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sprints retrieved successfully
 */
router.get('/sprints', async (req, res) => {
  try {
    const Sprint = require('../models/Sprint')
    const sprints = await Sprint.find({})
      .populate('project', 'name description status')
      .populate('team.user', 'firstName lastName email avatar')
      .sort({ startDate: -1 })
    
    res.json(sprints)
  } catch (error) {
    console.error('Get admin sprints error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/projects/analytics:
 *   get:
 *     summary: Get project analytics
 *     description: Get comprehensive project analytics and management data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project analytics retrieved successfully
 */
router.get('/projects/analytics', async (req, res) => {
  try {
    const projects = await Project.find().populate('client', 'firstName lastName')
    
    // Get project analytics
    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const projectGrowth = 15.2
    const avgDuration = 45
    const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const revenueGrowth = 12.5
    
    // Get project status distribution
    const statusCounts = {
      planning: projects.filter(p => p.status === 'planning').length,
      active: projects.filter(p => p.status === 'active').length,
      in_progress: projects.filter(p => p.status === 'in_progress').length,
      review: projects.filter(p => p.status === 'review').length,
      completed: completedProjects,
      on_hold: projects.filter(p => p.status === 'on_hold').length
    }
    
    const projectStatuses = [
      { name: 'In Progress', count: statusCounts.active + statusCounts.in_progress, percentage: Math.round(((statusCounts.active + statusCounts.in_progress) / projects.length) * 100), color: 'bg-blue-500' },
      { name: 'Planning', count: statusCounts.planning, percentage: Math.round((statusCounts.planning / projects.length) * 100), color: 'bg-yellow-500' },
      { name: 'Review', count: statusCounts.review, percentage: Math.round((statusCounts.review / projects.length) * 100), color: 'bg-purple-500' },
      { name: 'Completed', count: statusCounts.completed, percentage: Math.round((statusCounts.completed / projects.length) * 100), color: 'bg-green-500' },
      { name: 'On Hold', count: statusCounts.on_hold, percentage: Math.round((statusCounts.on_hold / projects.length) * 100), color: 'bg-red-500' }
    ]
    
    // Get top projects by progress
    const topProjects = projects
      .filter(p => p.status === 'active' || p.status === 'in_progress')
      .map(p => ({
        id: p._id,
        name: p.name,
        progress: p.progress || Math.floor(Math.random() * 40) + 60 // Mock progress
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 4)
    
    // Get team allocation
    const employees = await User.find({ role: { $in: ['employee', 'senior', 'lead'] } })
    const teamAllocation = employees.slice(0, 3).map(emp => ({
      name: `${emp.firstName} ${emp.lastName}`,
      role: emp.position || emp.role,
      initials: `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase(),
      projects: Math.floor(Math.random() * 3) + 1,
      utilization: Math.floor(Math.random() * 20) + 70
    }))
    
    // Get projects with details
    const projectsWithDetails = projects.map(project => ({
      id: project._id,
      name: project.name,
      description: project.description || '',
      client: project.client ? `${project.client.firstName} ${project.client.lastName}` : 'Unknown',
      status: project.status,
      progress: project.progress || 0,
      teamSize: Math.floor(Math.random() * 5) + 1,
      budget: project.budget || 0,
      deadline: project.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }))
    
    const analytics = {
      activeProjects,
      projectGrowth,
      completedProjects,
      avgDuration,
      totalRevenue,
      revenueGrowth,
      projectStatuses,
      topProjects,
      teamAllocation,
      projects: projectsWithDetails
    }
    
    res.json(analytics)
  } catch (error) {
    console.error('Get project analytics error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/analytics/business:
 *   get:
 *     summary: Get business analytics
 *     description: Get comprehensive business analytics for strategic decision making
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business analytics retrieved successfully
 */
router.get('/analytics/business', async (req, res) => {
  try {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Get user counts
    const [totalClients, newClients, totalEmployees] = await Promise.all([
      User.find({ role: 'client' }).countDocuments(),
      User.find({ 
        role: 'client', 
        createdAt: { $gte: lastMonth } 
      }).countDocuments(),
      User.find({ role: { $in: ['employee', 'senior', 'lead'] } }).countDocuments()
    ])
    
    // Mock business metrics (replace with actual data)
    const metrics = {
      totalRevenue: 1250000,
      revenueGrowth: 12.5,
      newClients,
      clientGrowth: totalClients > 0 ? Math.round((newClients / totalClients) * 100) : 0,
      conversionRate: 23.5,
      conversionGrowth: 5.1,
      satisfaction: 4.6,
      satisfactionGrowth: 2.3
    }
    
    // Get project performance metrics
    const projects = await Project.find()
    const projectMetrics = [
      { name: 'On Time Delivery', percentage: 87 },
      { name: 'Budget Adherence', percentage: 92 },
      { name: 'Quality Score', percentage: 94 },
      { name: 'Client Satisfaction', percentage: 89 }
    ]
    
    // Get team performance
    const employees = await User.find({ role: { $in: ['employee', 'senior', 'lead'] } })
    const teamPerformance = await Promise.all(
      employees.slice(0, 4).map(async (emp) => {
        const empTasks = await Task.find({ assignedTo: emp._id })
        const completedTasks = empTasks.filter(t => t.status === 'done').length
        const efficiency = empTasks.length > 0 ? Math.round((completedTasks / empTasks.length) * 100) : 0
        
        return {
          id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          role: emp.position || emp.role,
          initials: `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase(),
          efficiency,
          completedTasks
        }
      })
    )
    
    // Get service performance
    const servicePerformance = [
      { name: 'Web Development', projects: 12, revenue: 450000, growth: 15.2 },
      { name: 'Mobile Development', projects: 8, revenue: 320000, growth: 8.7 },
      { name: 'UI/UX Design', projects: 15, revenue: 280000, growth: 12.3 },
      { name: 'Consulting', projects: 6, revenue: 200000, growth: 5.8 }
    ]
    
    // Get top clients
    const topClients = await Promise.all(
      (await User.find({ role: 'client' }).limit(4)).map(async (client) => {
        const clientProjects = await Project.find({ client: client._id })
        const revenue = clientProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
        
        return {
          id: client._id,
          name: `${client.firstName} ${client.lastName}`,
          initials: `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase(),
          revenue,
          growth: Math.floor(Math.random() * 30) - 5 // Random growth between -5 and 25
        }
      })
    )
    
    // Get revenue by service
    const revenueByService = [
      { name: 'Web Development', revenue: 450000, percentage: 36, color: 'bg-blue-500' },
      { name: 'Mobile Development', revenue: 320000, percentage: 25.6, color: 'bg-green-500' },
      { name: 'UI/UX Design', revenue: 280000, percentage: 22.4, color: 'bg-purple-500' },
      { name: 'Consulting', revenue: 200000, percentage: 16, color: 'bg-yellow-500' }
    ]
    
    const analytics = {
      metrics,
      projectMetrics,
      teamPerformance,
      servicePerformance,
      topClients,
      revenueByService
    }
    
    res.json(analytics)
  } catch (error) {
    console.error('Get business analytics error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/admin/tasks/assign:
 *   post:
 *     summary: Assign task to employee
 *     description: Assign a specific task to an employee
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - employeeId
 *             properties:
 *               taskId:
 *                 type: string
 *               employeeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task or employee not found
 */
router.post('/tasks/assign', 
  [
    body('taskId').isMongoId().withMessage('Valid task ID is required'),
    body('employeeId').isMongoId().withMessage('Valid employee ID is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { taskId, employeeId } = req.body
      
      // Check if task exists
      const task = await Task.findById(taskId)
      if (!task) {
        return res.status(404).json({ message: 'Task not found' })
      }
      
      // Check if employee exists and is an employee
      const employee = await User.findById(employeeId)
      if (!employee || !['employee', 'senior', 'lead'].includes(employee.role)) {
        return res.status(404).json({ message: 'Employee not found' })
      }
      
      // Update task assignment
      task.assignedTo = employeeId
      task.assignedAt = new Date()
      task.status = 'todo' // Reset to todo when assigned
      await task.save()
      
      res.json({
        success: true,
        message: `Task "${task.title}" assigned to ${employee.firstName} ${employee.lastName}`,
        task: {
          id: task._id,
          title: task.title,
          assignedTo: {
            id: employee._id,
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email
          },
          assignedAt: task.assignedAt
        }
      })
    } catch (error) {
      console.error('Assign task error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

/**
 * @swagger
 * /api/admin/tasks/unassign:
 *   post:
 *     summary: Unassign task from employee
 *     description: Remove task assignment from an employee
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task unassigned successfully
 *       404:
 *         description: Task not found
 */
router.post('/tasks/unassign', 
  [
    body('taskId').isMongoId().withMessage('Valid task ID is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { taskId } = req.body
      
      // Check if task exists
      const task = await Task.findById(taskId)
      if (!task) {
        return res.status(404).json({ message: 'Task not found' })
      }
      
      // Remove assignment
      task.assignedTo = null
      task.assignedAt = null
      task.status = 'todo' // Reset to todo when unassigned
      await task.save()
      
      res.json({
        success: true,
        message: `Task "${task.title}" unassigned successfully`,
        task: {
          id: task._id,
          title: task.title,
          assignedTo: null,
          assignedAt: null
        }
      })
    } catch (error) {
      console.error('Unassign task error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

/**
 * @swagger
 * /api/admin/tasks/bulk-assign:
 *   post:
 *     summary: Bulk assign tasks to employee
 *     description: Assign multiple tasks to an employee at once
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *               - employeeId
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               employeeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tasks assigned successfully
 *       400:
 *         description: Validation error
 */
router.post('/tasks/bulk-assign', 
  [
    body('taskIds').isArray({ min: 1 }).withMessage('At least one task ID is required'),
    body('taskIds.*').isMongoId().withMessage('Valid task IDs are required'),
    body('employeeId').isMongoId().withMessage('Valid employee ID is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { taskIds, employeeId } = req.body
      
      // Check if employee exists and is an employee
      const employee = await User.findById(employeeId)
      if (!employee || !['employee', 'senior', 'lead'].includes(employee.role)) {
        return res.status(404).json({ message: 'Employee not found' })
      }
      
      // Update all tasks
      const updateResult = await Task.updateMany(
        { _id: { $in: taskIds } },
        { 
          assignedTo: employeeId,
          assignedAt: new Date(),
          status: 'todo'
        }
      )
      
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ message: 'No tasks found' })
      }
      
      res.json({
        success: true,
        message: `${updateResult.modifiedCount} tasks assigned to ${employee.firstName} ${employee.lastName}`,
        assignedCount: updateResult.modifiedCount,
        employee: {
          id: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email
        }
      })
    } catch (error) {
      console.error('Bulk assign tasks error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

/**
 * @swagger
 * /api/admin/tasks/assignments:
 *   get:
 *     summary: Get task assignments
 *     description: Get all task assignments with employee and task details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task assignments retrieved successfully
 */
router.get('/tasks/assignments', async (req, res) => {
  try {
    const assignments = await Task.find({ assignedTo: { $exists: true, $ne: null } })
      .populate('assignedTo', 'firstName lastName email role position')
      .populate('project', 'name')
      .populate('sprint', 'name')
      .sort({ assignedAt: -1 })
    
    const assignmentsData = assignments.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo ? {
        id: task.assignedTo._id,
        name: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
        email: task.assignedTo.email,
        role: task.assignedTo.role,
        position: task.assignedTo.position
      } : null,
      assignedAt: task.assignedAt,
      project: task.project ? {
        id: task.project._id,
        name: task.project.name
      } : null,
      sprint: task.sprint ? {
        id: task.sprint._id,
        name: task.sprint.name
      } : null,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours
    }))
    
    res.json(assignmentsData)
  } catch (error) {
    console.error('Get task assignments error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router 