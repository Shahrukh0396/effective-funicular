const express = require('express')
const { body, validationResult } = require('express-validator')
const { auth, authorize } = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')
const { generalLimiter } = require('../middleware/security')
const User = require('../models/User')

const router = express.Router()

// Super admin middleware - only super admins can access these routes
router.use(auth)
router.use(authorize(['super_admin']))

/**
 * @swagger
 * /api/super-accounts:
 *   get:
 *     summary: Get all super accounts
 *     description: Retrieve all super accounts created by the current super admin
 *     tags: [Super Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Super accounts retrieved successfully
 *       401:
 *         description: Unauthorized - Only super admins can access
 */
router.get('/', async (req, res) => {
  try {
    const superAccounts = await User.find({
      $or: [
        { role: 'super_admin' },
        { isSuperAccount: true }
      ]
    })
    .select('-password -emailVerificationToken -passwordResetToken')
    .populate('superAccountCreatedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    
    res.json(superAccounts)
  } catch (error) {
    console.error('Get super accounts error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/super-accounts:
 *   post:
 *     summary: Create new super account
 *     description: Create a new super account with full privileges across all portals
 *     tags: [Super Accounts]
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
 *               - baseRole
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
 *               baseRole:
 *                 type: string
 *                 enum: [client, employee, admin]
 *               company:
 *                 type: string
 *               position:
 *                 type: string
 *     responses:
 *       201:
 *         description: Super account created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Only super admins can access
 */
router.post('/', 
  [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('baseRole').isIn(['client', 'employee', 'admin']).withMessage('Invalid base role'),
    body('company').optional().trim(),
    body('position').optional().trim()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, baseRole, company, position } = req.body
      
      // Check if email already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' })
      }
      
      // Create new super account
      const superAccount = new User({
        firstName,
        lastName,
        email,
        password,
        role: baseRole, // Base role for the account
        isSuperAccount: true, // Flag as super account
        superAccountCreatedBy: req.user._id, // Track who created it
        superAccountCreatedAt: new Date(),
        company,
        position,
        isActive: true,
        isEmailVerified: true, // Super accounts are pre-verified
        // Give all permissions
        permissions: [
          'read_projects',
          'write_projects',
          'delete_projects',
          'read_tasks',
          'write_tasks',
          'delete_tasks',
          'manage_users',
          'manage_billing',
          'view_analytics'
        ]
      })
      
      await superAccount.save()
      
      // Return super account data without password
      const superAccountData = {
        id: superAccount._id,
        firstName: superAccount.firstName,
        lastName: superAccount.lastName,
        email: superAccount.email,
        role: superAccount.role,
        isSuperAccount: superAccount.isSuperAccount,
        company: superAccount.company,
        position: superAccount.position,
        isActive: superAccount.isActive,
        superAccountCreatedBy: superAccount.superAccountCreatedBy,
        superAccountCreatedAt: superAccount.superAccountCreatedAt,
        createdAt: superAccount.createdAt
      }
      
      res.status(201).json({
        success: true,
        message: 'Super account created successfully',
        superAccount: superAccountData
      })
    } catch (error) {
      console.error('Create super account error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

/**
 * @swagger
 * /api/super-accounts/:id:
 *   get:
 *     summary: Get super account details
 *     description: Get detailed information about a specific super account
 *     tags: [Super Accounts]
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
 *         description: Super account details retrieved successfully
 *       404:
 *         description: Super account not found
 */
router.get('/:id', async (req, res) => {
  try {
    const superAccount = await User.findOne({
      _id: req.params.id,
      $or: [
        { role: 'super_admin' },
        { isSuperAccount: true }
      ]
    })
    .select('-password -emailVerificationToken -passwordResetToken')
    .populate('superAccountCreatedBy', 'firstName lastName email')
    
    if (!superAccount) {
      return res.status(404).json({ message: 'Super account not found' })
    }
    
    res.json(superAccount)
  } catch (error) {
    console.error('Get super account details error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/super-accounts/:id:
 *   put:
 *     summary: Update super account
 *     description: Update super account information (cannot change role or super account status)
 *     tags: [Super Accounts]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               position:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Super account updated successfully
 *       404:
 *         description: Super account not found
 */
router.put('/:id', 
  [
    body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('company').optional().trim(),
    body('position').optional().trim(),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const superAccount = await User.findOne({
        _id: req.params.id,
        $or: [
          { role: 'super_admin' },
          { isSuperAccount: true }
        ]
      })
      
      if (!superAccount) {
        return res.status(404).json({ message: 'Super account not found' })
      }
      
      // Prevent updating the original super admin
      if (superAccount.role === 'super_admin' && !superAccount.isSuperAccount) {
        return res.status(403).json({ message: 'Cannot modify the original super admin account' })
      }
      
      // Update allowed fields
      const { firstName, lastName, company, position, isActive } = req.body
      
      if (firstName) superAccount.firstName = firstName
      if (lastName) superAccount.lastName = lastName
      if (company !== undefined) superAccount.company = company
      if (position !== undefined) superAccount.position = position
      if (isActive !== undefined) superAccount.isActive = isActive
      
      await superAccount.save()
      
      res.json({
        success: true,
        message: 'Super account updated successfully',
        superAccount: {
          id: superAccount._id,
          firstName: superAccount.firstName,
          lastName: superAccount.lastName,
          email: superAccount.email,
          role: superAccount.role,
          isSuperAccount: superAccount.isSuperAccount,
          company: superAccount.company,
          position: superAccount.position,
          isActive: superAccount.isActive
        }
      })
    } catch (error) {
      console.error('Update super account error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

/**
 * @swagger
 * /api/super-accounts/:id:
 *   delete:
 *     summary: Delete super account
 *     description: Delete a super account (cannot delete the original super admin)
 *     tags: [Super Accounts]
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
 *         description: Super account deleted successfully
 *       403:
 *         description: Cannot delete original super admin
 *       404:
 *         description: Super account not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const superAccount = await User.findOne({
      _id: req.params.id,
      $or: [
        { role: 'super_admin' },
        { isSuperAccount: true }
      ]
    })
    
    if (!superAccount) {
      return res.status(404).json({ message: 'Super account not found' })
    }
    
    // Prevent deleting the original super admin
    if (superAccount.role === 'super_admin' && !superAccount.isSuperAccount) {
      return res.status(403).json({ message: 'Cannot delete the original super admin account' })
    }
    
    await User.findByIdAndDelete(req.params.id)
    
    res.json({
      success: true,
      message: 'Super account deleted successfully'
    })
  } catch (error) {
    console.error('Delete super account error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * @swagger
 * /api/super-accounts/validate-access:
 *   post:
 *     summary: Validate super account access
 *     description: Validate if a user has super account access to a specific portal
 *     tags: [Super Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - portal
 *             properties:
 *               portal:
 *                 type: string
 *                 enum: [client, employee, admin]
 *     responses:
 *       200:
 *         description: Access validated successfully
 *       403:
 *         description: Access denied
 */
router.post('/validate-access', async (req, res) => {
  try {
    const { portal } = req.body
    
    if (!['client', 'employee', 'admin'].includes(portal)) {
      return res.status(400).json({ message: 'Invalid portal specified' })
    }
    
    // Super accounts have access to all portals
    if (req.user.role === 'super_admin' || req.user.isSuperAccount) {
      res.json({
        success: true,
        hasAccess: true,
        portal,
        user: {
          id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          role: req.user.role,
          isSuperAccount: req.user.isSuperAccount
        }
      })
    } else {
      res.status(403).json({
        success: false,
        hasAccess: false,
        message: 'Access denied - Super account required'
      })
    }
  } catch (error) {
    console.error('Validate access error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router 