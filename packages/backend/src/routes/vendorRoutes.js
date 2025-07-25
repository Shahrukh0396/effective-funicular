const express = require('express')
const { body, validationResult } = require('express-validator')
const { auth, authorize } = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')
const { generalLimiter } = require('../middleware/security')
const vendorController = require('../controllers/vendorController')

const router = express.Router()

// Super admin middleware - only super admins can access these routes
router.use(auth)
router.use(authorize(['super_admin']))

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all vendors
 *     description: Retrieve all vendors (both white-label and Linton-Tech clients)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendors retrieved successfully
 *       401:
 *         description: Unauthorized - Only super admins can access
 */
router.get('/', vendorController.getAllVendors)

/**
 * @swagger
 * /api/vendors/white-label:
 *   get:
 *     summary: Get white-label vendors
 *     description: Retrieve only white-label vendors
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: White-label vendors retrieved successfully
 */
router.get('/white-label', vendorController.getWhiteLabelVendors)

/**
 * @swagger
 * /api/vendors/linton-tech:
 *   get:
 *     summary: Get Linton-Tech clients
 *     description: Retrieve only Linton-Tech clients
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Linton-Tech clients retrieved successfully
 */
router.get('/linton-tech', vendorController.getLintonTechClients)

/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Create white-label vendor
 *     description: Create a new white-label vendor with custom domains
 *     tags: [Vendors]
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
 *               - domain
 *               - email
 *               - password
 *               - contactPerson
 *             properties:
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               contactPerson:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   position:
 *                     type: string
 *               industry:
 *                 type: string
 *               companySize:
 *                 type: string
 *               website:
 *                 type: string
 *               description:
 *                 type: string
 *               branding:
 *                 type: object
 *               subscription:
 *                 type: object
 *     responses:
 *       201:
 *         description: White-label vendor created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Only super admins can access
 */
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  body('domain').trim().isLength({ min: 2 }).withMessage('Domain must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('contactPerson.firstName').trim().isLength({ min: 2 }).withMessage('Contact first name is required'),
  body('contactPerson.lastName').trim().isLength({ min: 2 }).withMessage('Contact last name is required'),
  body('industry').optional().isIn([
    'digital-marketing', 'web-development', 'design-agency', 'consulting',
    'software-development', 'content-creation', 'seo-agency', 'social-media',
    'ecommerce', 'other'
  ]),
  body('companySize').optional().isIn(['1-5', '6-10', '11-25', '26-50', '51-100', '100+']),
  validateRequest
], vendorController.createWhiteLabelVendor)

/**
 * @swagger
 * /api/vendors/:id:
 *   get:
 *     summary: Get vendor by ID
 *     description: Get detailed information about a specific vendor
 *     tags: [Vendors]
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
 *         description: Vendor details retrieved successfully
 *       404:
 *         description: Vendor not found
 */
router.get('/:id', vendorController.getVendorById)

/**
 * @swagger
 * /api/vendors/:id:
 *   put:
 *     summary: Update vendor
 *     description: Update vendor information and settings
 *     tags: [Vendors]
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
 *               companyName:
 *                 type: string
 *               contactPerson:
 *                 type: object
 *               industry:
 *                 type: string
 *               companySize:
 *                 type: string
 *               website:
 *                 type: string
 *               description:
 *                 type: string
 *               branding:
 *                 type: object
 *               subscription:
 *                 type: object
 *               limits:
 *                 type: object
 *               settings:
 *                 type: object
 *               whiteLabelSettings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 *       404:
 *         description: Vendor not found
 */
router.put('/:id', [
  body('companyName').optional().trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  body('contactPerson.firstName').optional().trim().isLength({ min: 2 }).withMessage('Contact first name must be at least 2 characters'),
  body('contactPerson.lastName').optional().trim().isLength({ min: 2 }).withMessage('Contact last name must be at least 2 characters'),
  body('industry').optional().isIn([
    'digital-marketing', 'web-development', 'design-agency', 'consulting',
    'software-development', 'content-creation', 'seo-agency', 'social-media',
    'ecommerce', 'other'
  ]),
  body('companySize').optional().isIn(['1-5', '6-10', '11-25', '26-50', '51-100', '100+']),
  validateRequest
], vendorController.updateVendor)

/**
 * @swagger
 * /api/vendors/:id:
 *   delete:
 *     summary: Delete vendor
 *     description: Delete a vendor (only if no associated data exists)
 *     tags: [Vendors]
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
 *         description: Vendor deleted successfully
 *       400:
 *         description: Cannot delete vendor with associated data
 *       404:
 *         description: Vendor not found
 */
router.delete('/:id', vendorController.deleteVendor)

/**
 * @swagger
 * /api/vendors/:id/stats:
 *   get:
 *     summary: Get vendor statistics
 *     description: Get comprehensive statistics for a vendor
 *     tags: [Vendors]
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
 *         description: Vendor statistics retrieved successfully
 *       404:
 *         description: Vendor not found
 */
router.get('/:id/stats', vendorController.getVendorStats)

/**
 * @swagger
 * /api/vendors/:id/subscription:
 *   put:
 *     summary: Update vendor subscription
 *     description: Update vendor subscription plan and status
 *     tags: [Vendors]
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
 *               plan:
 *                 type: string
 *                 enum: ['starter', 'professional', 'enterprise', 'white-label']
 *               status:
 *                 type: string
 *                 enum: ['trial', 'active', 'past_due', 'cancelled', 'suspended']
 *               currentPeriodStart:
 *                 type: string
 *                 format: date-time
 *               currentPeriodEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Vendor subscription updated successfully
 *       404:
 *         description: Vendor not found
 */
router.put('/:id/subscription', [
  body('plan').optional().isIn(['starter', 'professional', 'enterprise', 'white-label']),
  body('status').optional().isIn(['trial', 'active', 'past_due', 'cancelled', 'suspended']),
  body('currentPeriodStart').optional().isISO8601().withMessage('Invalid start date'),
  body('currentPeriodEnd').optional().isISO8601().withMessage('Invalid end date'),
  validateRequest
], vendorController.updateVendorSubscription)

module.exports = router 