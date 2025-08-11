const express = require('express')
const { body, query } = require('express-validator')
const TimeEntry = require('../models/TimeEntry')
const Task = require('../models/Task')
const Project = require('../models/Project')
const { auth, authorize } = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')

const router = express.Router()

// Apply authentication to all time tracking routes
router.use(auth)

/**
 * @swagger
 * /api/time-entries:
 *   get:
 *     summary: Get time entries
 *     description: Retrieve time entries with filtering and pagination
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: task
 *         schema:
 *           type: string
 *         description: Filter by task ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Time entries retrieved successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create time entry
 *     description: Create a new time entry
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project
 *               - task
 *               - hours
 *               - date
 *             properties:
 *               project:
 *                 type: string
 *                 description: Project ID
 *               task:
 *                 type: string
 *                 description: Task ID
 *               hours:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 24
 *                 description: Hours worked
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of work
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Description of work done
 *               billable:
 *                 type: boolean
 *                 default: true
 *                 description: Whether time is billable
 *     responses:
 *       201:
 *         description: Time entry created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', [
  query('user').optional().isMongoId(),
  query('project').optional().isMongoId(),
  query('task').optional().isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validateRequest, async (req, res) => {
  try {
    const {
      user,
      project,
      task,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query

    const { user: currentUser, vendorId } = req

    // Build query
    const query = { vendor: vendorId }

    // Filter by user (admin can see all, users can only see their own)
    if (user) {
      query.user = user
    } else if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
      query.user = currentUser._id
    }

    if (project) query.project = project
    if (task) query.task = task

    // Date range filtering
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const timeEntries = await TimeEntry.find(query)
      .populate('user', 'firstName lastName email')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await TimeEntry.countDocuments(query)

    res.json({
      success: true,
      data: {
        timeEntries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get time entries error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

router.post('/', [
  body('project').isMongoId(),
  body('task').isMongoId(),
  body('hours').isFloat({ min: 0.1, max: 24 }),
  body('date').isISO8601(),
  body('description').optional().trim().isLength({ max: 500 }),
  body('billable').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const {
      project,
      task,
      hours,
      date,
      description,
      billable = true
    } = req.body

    const { user, vendorId } = req

    // Verify project and task exist and belong to vendor
    const projectExists = await Project.findOne({ _id: project, vendor: vendorId })
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    const taskExists = await Task.findOne({ _id: task, project, vendor: vendorId })
    if (!taskExists) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Create time entry
    const timeEntry = new TimeEntry({
      user: user._id,
      project,
      task,
      hours,
      date: new Date(date),
      description,
      billable,
      vendor: vendorId
    })

    await timeEntry.save()

    // Populate references for response
    await timeEntry.populate('user', 'firstName lastName email')
    await timeEntry.populate('project', 'name')
    await timeEntry.populate('task', 'title')

    res.status(201).json({
      success: true,
      message: 'Time entry created successfully',
      data: { timeEntry }
    })
  } catch (error) {
    console.error('Create time entry error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/time-entries/{id}:
 *   put:
 *     summary: Update time entry
 *     description: Update an existing time entry
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Time entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hours:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 24
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               billable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Time entry updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Time entry not found
 *   delete:
 *     summary: Delete time entry
 *     description: Delete a time entry
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Time entry ID
 *     responses:
 *       200:
 *         description: Time entry deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Time entry not found
 */
router.put('/:id', [
  body('hours').optional().isFloat({ min: 0.1, max: 24 }),
  body('date').optional().isISO8601(),
  body('description').optional().trim().isLength({ max: 500 }),
  body('billable').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params
    const { user, vendorId } = req
    const updateData = req.body

    // Find time entry
    const timeEntry = await TimeEntry.findOne({ _id: id, vendor: vendorId })
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      })
    }

    // Check permissions (users can only edit their own entries, admins can edit all)
    if (user.role !== 'admin' && user.role !== 'super_admin' && 
        timeEntry.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own time entries'
      })
    }

    // Update time entry
    Object.assign(timeEntry, updateData)
    await timeEntry.save()

    // Populate references for response
    await timeEntry.populate('user', 'firstName lastName email')
    await timeEntry.populate('project', 'name')
    await timeEntry.populate('task', 'title')

    res.json({
      success: true,
      message: 'Time entry updated successfully',
      data: { timeEntry }
    })
  } catch (error) {
    console.error('Update time entry error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { user, vendorId } = req

    // Find time entry
    const timeEntry = await TimeEntry.findOne({ _id: id, vendor: vendorId })
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      })
    }

    // Check permissions (users can only delete their own entries, admins can delete all)
    if (user.role !== 'admin' && user.role !== 'super_admin' && 
        timeEntry.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own time entries'
      })
    }

    await timeEntry.deleteOne()

    res.json({
      success: true,
      message: 'Time entry deleted successfully'
    })
  } catch (error) {
    console.error('Delete time entry error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/time-entries/start:
 *   post:
 *     summary: Start time tracking
 *     description: Start tracking time for a task
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task
 *             properties:
 *               task:
 *                 type: string
 *                 description: Task ID to start tracking
 *               description:
 *                 type: string
 *                 description: Initial description of work
 *     responses:
 *       200:
 *         description: Time tracking started successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/start', [
  body('task').isMongoId(),
  body('description').optional().trim().isLength({ max: 500 })
], validateRequest, async (req, res) => {
  try {
    const { task, description } = req.body
    const { user, vendorId } = req

    // Check if user is already tracking time
    const activeEntry = await TimeEntry.findOne({
      user: user._id,
      vendor: vendorId,
      endTime: null
    })

    if (activeEntry) {
      return res.status(400).json({
        success: false,
        message: 'You are already tracking time for another task'
      })
    }

    // Verify task exists and belongs to vendor
    const taskExists = await Task.findOne({ _id: task, vendor: vendorId })
    if (!taskExists) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Create new time entry with start time
    const timeEntry = new TimeEntry({
      user: user._id,
      project: taskExists.project,
      task,
      startTime: new Date(),
      description,
      vendor: vendorId
    })

    await timeEntry.save()

    // Populate references for response
    await timeEntry.populate('user', 'firstName lastName email')
    await timeEntry.populate('project', 'name')
    await timeEntry.populate('task', 'title')

    res.json({
      success: true,
      message: 'Time tracking started successfully',
      data: { timeEntry }
    })
  } catch (error) {
    console.error('Start time tracking error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/time-entries/stop:
 *   post:
 *     summary: Stop time tracking
 *     description: Stop tracking time and calculate hours
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Final description of work done
 *     responses:
 *       200:
 *         description: Time tracking stopped successfully
 *       400:
 *         description: No active time tracking found
 *       401:
 *         description: Unauthorized
 */
router.post('/stop', [
  body('description').optional().trim().isLength({ max: 500 })
], validateRequest, async (req, res) => {
  try {
    const { description } = req.body
    const { user, vendorId } = req

    // Find active time entry
    const activeEntry = await TimeEntry.findOne({
      user: user._id,
      vendor: vendorId,
      endTime: null
    })

    if (!activeEntry) {
      return res.status(400).json({
        success: false,
        message: 'No active time tracking found'
      })
    }

    // Calculate hours and update entry
    const endTime = new Date()
    const hours = (endTime - activeEntry.startTime) / (1000 * 60 * 60) // Convert to hours

    activeEntry.endTime = endTime
    activeEntry.hours = Math.round(hours * 100) / 100 // Round to 2 decimal places
    activeEntry.date = new Date(activeEntry.startTime)
    
    if (description) {
      activeEntry.description = description
    }

    await activeEntry.save()

    // Populate references for response
    await activeEntry.populate('user', 'firstName lastName email')
    await activeEntry.populate('project', 'name')
    await activeEntry.populate('task', 'title')

    res.json({
      success: true,
      message: 'Time tracking stopped successfully',
      data: { timeEntry: activeEntry }
    })
  } catch (error) {
    console.error('Stop time tracking error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/time-entries/active:
 *   get:
 *     summary: Get active time tracking
 *     description: Get currently active time tracking for user
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active time tracking retrieved successfully
 *       404:
 *         description: No active time tracking found
 */
router.get('/active', async (req, res) => {
  try {
    const { user, vendorId } = req

    const activeEntry = await TimeEntry.findOne({
      user: user._id,
      vendor: vendorId,
      endTime: null
    }).populate('project', 'name')
      .populate('task', 'title')

    if (!activeEntry) {
      return res.status(404).json({
        success: false,
        message: 'No active time tracking found'
      })
    }

    // Calculate elapsed time
    const elapsed = new Date() - activeEntry.startTime
    const elapsedHours = Math.round((elapsed / (1000 * 60 * 60)) * 100) / 100

    res.json({
      success: true,
      data: {
        timeEntry: activeEntry,
        elapsedHours
      }
    })
  } catch (error) {
    console.error('Get active time tracking error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/time-entries/reports:
 *   get:
 *     summary: Get time tracking reports
 *     description: Generate time tracking reports with various filters
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [summary, detailed, project, user]
 *           default: "summary"
 *         description: Type of report to generate
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Time tracking report generated successfully
 */
router.get('/reports', [
  query('type').optional().isIn(['summary', 'detailed', 'project', 'user']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('project').optional().isMongoId(),
  query('user').optional().isMongoId()
], validateRequest, async (req, res) => {
  try {
    const {
      type = 'summary',
      startDate,
      endDate,
      project,
      user
    } = req.query

    const { user: currentUser, vendorId } = req

    // Build query
    const query = { vendor: vendorId }

    // Date range filtering
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    if (project) query.project = project
    if (user) {
      query.user = user
    } else if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
      query.user = currentUser._id
    }

    // Remove entries without hours (incomplete entries)
    query.hours = { $exists: true, $ne: null }

    switch (type) {
      case 'summary':
        // Summary report with totals
        const summary = await TimeEntry.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              totalHours: { $sum: '$hours' },
              totalEntries: { $sum: 1 },
              billableHours: {
                $sum: { $cond: ['$billable', '$hours', 0] }
              },
              nonBillableHours: {
                $sum: { $cond: ['$billable', 0, '$hours'] }
              }
            }
          }
        ])

        res.json({
          success: true,
          data: {
            type: 'summary',
            report: summary[0] || {
              totalHours: 0,
              totalEntries: 0,
              billableHours: 0,
              nonBillableHours: 0
            }
          }
        })
        break

      case 'detailed':
        // Detailed report with all entries
        const detailed = await TimeEntry.find(query)
          .populate('user', 'firstName lastName email')
          .populate('project', 'name')
          .populate('task', 'title')
          .sort({ date: -1 })

        res.json({
          success: true,
          data: {
            type: 'detailed',
            entries: detailed
          }
        })
        break

      case 'project':
        // Project-based report
        const projectReport = await TimeEntry.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$project',
              totalHours: { $sum: '$hours' },
              totalEntries: { $sum: 1 },
              billableHours: {
                $sum: { $cond: ['$billable', '$hours', 0] }
              }
            }
          },
          {
            $lookup: {
              from: 'projects',
              localField: '_id',
              foreignField: '_id',
              as: 'project'
            }
          },
          { $unwind: '$project' }
        ])

        res.json({
          success: true,
          data: {
            type: 'project',
            report: projectReport
          }
        })
        break

      case 'user':
        // User-based report
        const userReport = await TimeEntry.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$user',
              totalHours: { $sum: '$hours' },
              totalEntries: { $sum: 1 },
              billableHours: {
                $sum: { $cond: ['$billable', '$hours', 0] }
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' }
        ])

        res.json({
          success: true,
          data: {
            type: 'user',
            report: userReport
          }
        })
        break

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid report type'
        })
    }
  } catch (error) {
    console.error('Time tracking report error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router 