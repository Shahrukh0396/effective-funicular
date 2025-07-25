const express = require('express')
const { body, validationResult, query } = require('express-validator')
const Project = require('../models/Project')
const Task = require('../models/Task')
const { auth, authorize, hasPermission } = require('../middleware/auth')
const upload = require('../middleware/fileUpload')
const projectController = require('../controllers/projectController')
const { validateRequest } = require('../middleware/validation')

const router = express.Router()

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve all projects with optional filtering and pagination
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, completed, on-hold]
 *         description: Filter by project status
 *         example: "active"
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, status, startDate, endDate, createdAt]
 *           default: "createdAt"
 *         description: Sort field
 *         example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new project
 *     description: Create a new project with validation
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - client
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Website Redesign"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: "Complete redesign of company website with modern UI/UX"
 *               client:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               status:
 *                 type: string
 *                 enum: [planning, active, completed, on-hold]
 *                 default: "planning"
 *                 example: "planning"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-30"
 *               budget:
 *                 type: number
 *                 minimum: 0
 *                 example: 50000
 *               team:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Project created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/',
  auth,
  [
    query('status').optional().isIn(['planning', 'active', 'completed', 'on-hold']),
    query('client').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sortBy').optional().isIn(['name', 'status', 'startDate', 'endDate', 'createdAt']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  validateRequest,
  projectController.getProjects
)

router.post('/',
  auth,
  authorize(['admin', 'super_admin', 'client']), // Admins, super admins, and clients can create projects
  [
    body('name').trim().isLength({ min: 3, max: 100 }),
    body('description').trim().isLength({ min: 10 }),
    body('client').isMongoId(),
    body('status').optional().isIn(['planning', 'active', 'completed', 'on-hold']),
    body('startDate').optional().isISO8601().toDate(),
    body('endDate').optional().isISO8601().toDate(),
    body('budget').optional().isFloat({ min: 0 }),
    body('team').optional().isArray(),
    body('team.*').optional().isMongoId()
  ],
  validateRequest,
  projectController.createProject
)

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Retrieve a specific project by its ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update project
 *     description: Update an existing project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Website Redesign v2"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: "Updated website redesign with enhanced features"
 *               status:
 *                 type: string
 *                 enum: [planning, active, completed, on-hold]
 *                 example: "active"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-08-30"
 *               budget:
 *                 type: number
 *                 minimum: 0
 *                 example: 75000
 *               team:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Project updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete project
 *     description: Delete a project (soft delete)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
  auth,
  projectController.getProjectById
)

router.put('/:id',
  auth,
  authorize(['admin', 'employee']),
  [
    body('name').optional().trim().isLength({ min: 3, max: 100 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('status').optional().isIn(['planning', 'active', 'completed', 'on-hold']),
    body('startDate').optional().isISO8601().toDate(),
    body('endDate').optional().isISO8601().toDate(),
    body('budget').optional().isFloat({ min: 0 }),
    body('team').optional().isArray(),
    body('team.*').optional().isMongoId()
  ],
  validateRequest,
  projectController.updateProject
)

router.delete('/:id',
  auth,
  authorize(['admin']),
  projectController.deleteProject
)

/**
 * @swagger
 * /api/projects/{id}/analytics:
 *   get:
 *     summary: Get project analytics
 *     description: Retrieve comprehensive analytics and metrics for a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Project analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectMetrics:
 *                       type: object
 *                     taskStats:
 *                       type: array
 *                     timeStats:
 *                       type: array
 *                     progress:
 *                       type: number
 *                     isOverdue:
 *                       type: boolean
 *                     totalTasks:
 *                       type: number
 *                     completedTasks:
 *                       type: number
 *                     remainingTasks:
 *                       type: number
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/analytics',
  auth,
  projectController.getProjectAnalytics
)

/**
 * @swagger
 * /api/projects/{id}/timeline:
 *   get:
 *     summary: Get project timeline
 *     description: Retrieve project timeline with all events and milestones
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Project timeline retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           status:
 *                             type: string
 *                           taskId:
 *                             type: string
 *                     project:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         status:
 *                           type: string
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/timeline',
  auth,
  projectController.getProjectTimeline
)

/**
 * @swagger
 * /api/projects/{id}/tasks:
 *   get:
 *     summary: Get project tasks
 *     description: Retrieve all tasks for a specific project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *         description: Filter by task status
 *         example: "in-progress"
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Project tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/tasks',
  auth,
  [
    query('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
    query('assignedTo').optional().isMongoId()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params
      const { status, assignedTo } = req.query
      
      const project = await Project.findById(id)
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        })
      }
      
      // Get tasks for this project
      const Task = require('../models/Task')
      let filter = { project: id }
      
      if (status) filter.status = status
      if (assignedTo) filter.assignedTo = assignedTo
      
      const tasks = await Task.find(filter)
        .populate('assignedTo', 'firstName lastName email')
        .populate('sprint', 'name status')
        .sort({ createdAt: -1 })
      
      res.json({
        success: true,
        data: tasks
      })
    } catch (error) {
      console.error('Get project tasks error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get project tasks'
      })
    }
  }
)

/**
 * @swagger
 * /api/projects/{id}/sprints:
 *   get:
 *     summary: Get project sprints
 *     description: Retrieve all sprints for a specific project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, completed]
 *         description: Filter by sprint status
 *         example: "active"
 *     responses:
 *       200:
 *         description: Project sprints retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sprint'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/sprints',
  auth,
  [
    query('status').optional().isIn(['planning', 'active', 'completed'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params
      const { status } = req.query
      
      const project = await Project.findById(id)
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        })
      }
      
      // Get sprints for this project
      const Sprint = require('../models/Sprint')
      let filter = { project: id }
      
      if (status) filter.status = status
      
      const sprints = await Sprint.find(filter)
        .populate('backlog.task', 'title status priority')
        .populate('team.user', 'firstName lastName email avatar')
        .sort({ startDate: -1 })
      
      res.json({
        success: true,
        data: sprints
      })
    } catch (error) {
      console.error('Get project sprints error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get project sprints'
      })
    }
  }
)

// @route   POST /api/projects/:id/team
// @desc    Add team member to project
// @access  Private (Project manager or admin)
router.post('/:id/team', [
  auth,
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('role')
    .isIn(['developer', 'designer', 'tester', 'analyst', 'manager'])
    .withMessage('Valid role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { userId, role } = req.body

    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    // Check permissions
    const canManageTeam = req.user.role === 'admin' ||
                         project.projectManager.toString() === req.user._id.toString()

    if (!canManageTeam) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project manager or admin can manage team.'
      })
    }

    await project.addTeamMember(userId, role)

    const updatedProject = await Project.findById(req.params.id)
      .populate('client', 'firstName lastName email company')
      .populate('projectManager', 'firstName lastName email')
      .populate('team.user', 'firstName lastName email avatar')

    res.json({
      success: true,
      message: 'Team member added successfully',
      data: {
        project: updatedProject
      }
    })
  } catch (error) {
    console.error('Add team member error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while adding team member'
    })
  }
})

// @route   DELETE /api/projects/:id/team/:userId
// @desc    Remove team member from project
// @access  Private (Project manager or admin)
router.delete('/:id/team/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    // Check permissions
    const canManageTeam = req.user.role === 'admin' ||
                         project.projectManager.toString() === req.user._id.toString()

    if (!canManageTeam) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project manager or admin can manage team.'
      })
    }

    await project.removeTeamMember(req.params.userId)

    const updatedProject = await Project.findById(req.params.id)
      .populate('client', 'firstName lastName email company')
      .populate('projectManager', 'firstName lastName email')
      .populate('team.user', 'firstName lastName email avatar')

    res.json({
      success: true,
      message: 'Team member removed successfully',
      data: {
        project: updatedProject
      }
    })
  } catch (error) {
    console.error('Remove team member error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while removing team member'
    })
  }
})

// @route   POST /api/projects/:id/attachments
// @desc    Upload project attachment
// @access  Private (Project team members or admin)
router.post('/:id/attachments', auth, upload.single('file'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    // Check permissions
    const canUpload = req.user.role === 'admin' ||
                     project.client.toString() === req.user._id.toString() ||
                     project.team.some(member => member.user.toString() === req.user._id.toString()) ||
                     project.projectManager.toString() === req.user._id.toString()

    if (!canUpload) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project team members can upload files.'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id
    }

    project.attachments.push(attachment)
    await project.save()

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        attachment
      }
    })
  } catch (error) {
    console.error('Upload attachment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while uploading file'
    })
  }
})

module.exports = router 