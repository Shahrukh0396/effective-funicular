const express = require('express')
const { body, validationResult, query } = require('express-validator')
const User = require('../models/User')
const Project = require('../models/Project')
const { auth, authorize, hasPermission } = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')
const userController = require('../controllers/userController')

const router = express.Router()

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', [
  auth,
  authorize('admin'),
  query('role').optional().isIn(['client', 'employee', 'admin']),
  query('status').optional().isIn(['active', 'inactive']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { role, status, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    let filter = {}
    if (role) filter.role = role
    if (status) filter.isActive = status === 'active'

    const users = await User.find(filter)
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await User.countDocuments(filter)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    })
  }
})

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or self)
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if user is requesting their own profile or is admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const user = await User.findById(req.params.id)
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
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    })
  }
})

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private (Admin)
router.put('/:id', [
  auth,
  authorize('admin'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['client', 'employee', 'admin'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
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

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'role', 'isActive', 'permissions',
      'phone', 'company', 'position', 'bio', 'preferences'
    ]

    const updates = {}
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    })
  }
})

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await User.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    })
  }
})

// @route   GET /api/users/:id/projects
// @desc    Get user's projects
// @access  Private (Admin or self)
router.get('/:id/projects', auth, async (req, res) => {
  try {
    // Check if user is requesting their own projects or is admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    let projects
    if (user.role === 'client') {
      projects = await Project.find({ client: user._id })
        .populate('client', 'firstName lastName email company')
        .populate('projectManager', 'firstName lastName email')
        .populate('team.user', 'firstName lastName email avatar')
        .sort({ createdAt: -1 })
    } else {
      projects = await Project.find({
        $or: [
          { client: user._id },
          { 'team.user': user._id },
          { projectManager: user._id }
        ]
      })
        .populate('client', 'firstName lastName email company')
        .populate('projectManager', 'firstName lastName email')
        .populate('team.user', 'firstName lastName email avatar')
        .sort({ createdAt: -1 })
    }

    res.json({
      success: true,
      data: {
        projects
      }
    })
  } catch (error) {
    console.error('Get user projects error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user projects'
    })
  }
})

// @route   GET /api/users/:id/analytics
// @desc    Get user analytics
// @access  Private (Admin or self)
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    // Check if user is requesting their own analytics or is admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get project statistics
    const projectStats = await Project.aggregate([
      {
        $match: {
          $or: [
            { client: user._id },
            { 'team.user': user._id },
            { projectManager: user._id }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          totalActualCost: { $sum: '$actualCost' }
        }
      }
    ])

    // Get recent activity
    const recentProjects = await Project.find({
      $or: [
        { client: user._id },
        { 'team.user': user._id },
        { projectManager: user._id }
      ]
    })
      .sort({ lastActivity: -1 })
      .limit(5)
      .select('name status lastActivity')

    res.json({
      success: true,
      data: {
        projectStats,
        recentProjects,
        userRole: user.role,
        memberSince: user.createdAt,
        lastLogin: user.lastLogin
      }
    })
  } catch (error) {
    console.error('Get user analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user analytics'
    })
  }
})

// @route   POST /api/users/:id/permissions
// @desc    Update user permissions (admin only)
// @access  Private (Admin)
router.post('/:id/permissions', [
  auth,
  authorize('admin'),
  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .isIn([
      'read_projects',
      'write_projects',
      'delete_projects',
      'read_tasks',
      'write_tasks',
      'delete_tasks',
      'manage_users',
      'manage_billing',
      'view_analytics'
    ])
    .withMessage('Invalid permission')
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

    const { permissions } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.permissions = permissions
    await user.save()

    res.json({
      success: true,
      message: 'User permissions updated successfully',
      data: {
        permissions: user.permissions
      }
    })
  } catch (error) {
    console.error('Update user permissions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating user permissions'
    })
  }
})

// @route   POST /api/users/:id/activate
// @desc    Activate/deactivate user (admin only)
// @access  Private (Admin)
router.post('/:id/activate', [
  auth,
  authorize('admin'),
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
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

    const { isActive } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.isActive = isActive
    await user.save()

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('Activate/deactivate user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    })
  }
})

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the current user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update user profile
 *     description: Update the current user's profile information
 *     tags: [Users]
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
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Doe"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               company:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Acme Corp"
 *               position:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Project Manager"
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Experienced project manager with 5+ years in software development"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
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
 */

// Get user profile
router.get('/profile', auth, userController.getProfile)

// Update user profile
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number too long'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name too long'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position too long'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio too long'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
], userController.updateProfile)

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change password
 *     description: Change the current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "currentPassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Current password incorrect
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

// Change password
router.post('/change-password', [
  auth,
  body('currentPassword')
    .isLength({ min: 8 })
    .withMessage('Current password must be at least 8 characters'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
], userController.changePassword)

/**
 * @swagger
 * /api/users/dashboard:
 *   get:
 *     summary: Get user dashboard data
 *     description: Retrieve comprehensive dashboard data for the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalProjects:
 *                           type: number
 *                         totalTasks:
 *                           type: number
 *                         completedTasks:
 *                           type: number
 *                         overdueTasks:
 *                           type: number
 *                         completionRate:
 *                           type: number
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Get user dashboard data
router.get('/dashboard', auth, userController.getDashboardData)

/**
 * @swagger
 * /api/users/projects:
 *   get:
 *     summary: Get user's projects
 *     description: Retrieve all projects for the current user with filtering and pagination
 *     tags: [Users]
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
 *     responses:
 *       200:
 *         description: User's projects retrieved successfully
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
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         pages:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Get user's projects
router.get('/projects', [
  auth,
  query('status').optional().isIn(['planning', 'active', 'completed', 'on-hold']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], userController.getUserProjects)

/**
 * @swagger
 * /api/users/tasks:
 *   get:
 *     summary: Get user's tasks
 *     description: Retrieve all tasks for the current user with filtering and pagination
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, review, testing, done, blocked]
 *         description: Filter by task status
 *         example: "in-progress"
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by task priority
 *         example: "high"
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *         example: "507f1f77bcf86cd799439012"
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
 *     responses:
 *       200:
 *         description: User's tasks retrieved successfully
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
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         pages:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Get user's tasks
router.get('/tasks', [
  auth,
  query('status').optional().isIn(['todo', 'in-progress', 'review', 'testing', 'done', 'blocked']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('project').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], userController.getUserTasks)

/**
 * @swagger
 * /api/users/consent:
 *   post:
 *     summary: Update GDPR consent
 *     description: Update the user's GDPR consent preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consentType
 *               - granted
 *             properties:
 *               consentType:
 *                 type: string
 *                 enum: [marketing, analytics, necessary, thirdParty]
 *                 example: "marketing"
 *               granted:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Consent updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid consent type
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

// Update GDPR consent
router.post('/consent', [
  auth,
  body('consentType')
    .isIn(['marketing', 'analytics', 'necessary', 'thirdParty'])
    .withMessage('Invalid consent type'),
  body('granted')
    .isBoolean()
    .withMessage('Granted must be a boolean')
], userController.updateConsent)

/**
 * @swagger
 * /api/users/data-portability:
 *   post:
 *     summary: Request data portability
 *     description: Request a copy of the user's personal data (GDPR compliance)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data portability request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Request data portability
router.post('/data-portability', auth, userController.requestDataPortability)

/**
 * @swagger
 * /api/users/right-to-be-forgotten:
 *   post:
 *     summary: Request right to be forgotten
 *     description: Request data anonymization (GDPR compliance)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Right to be forgotten request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Request right to be forgotten
router.post('/right-to-be-forgotten', auth, userController.requestRightToBeForgotten)

/**
 * @swagger
 * /api/users/statistics:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve comprehensive statistics for the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                     totalProjects:
 *                       type: number
 *                       example: 5
 *                     totalTasks:
 *                       type: number
 *                       example: 25
 *                     completedTasks:
 *                       type: number
 *                       example: 18
 *                     overdueTasks:
 *                       type: number
 *                       example: 3
 *                     completionRate:
 *                       type: number
 *                       example: 72
 *                     projectStatusBreakdown:
 *                       type: array
 *                     taskStatusBreakdown:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Get user statistics
router.get('/statistics', [
  auth,
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], userController.getUserStatistics)

module.exports = router 