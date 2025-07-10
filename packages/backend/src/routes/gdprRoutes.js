const express = require('express')
const { body } = require('express-validator')
const gdprController = require('../controllers/gdprController')
const { auth, authorize } = require('../middleware/auth')
const { validateRequest } = require('../middleware/validation')

const router = express.Router()

/**
 * @swagger
 * /api/gdpr/consent:
 *   get:
 *     summary: Get user consent preferences
 *     description: Retrieve current user's GDPR consent preferences
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consent preferences retrieved successfully
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
 *                     consent:
 *                       $ref: '#/components/schemas/Consent'
 *                     consentHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Update consent preferences
 *     description: Update user's GDPR consent preferences
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsentUpdate'
 *           example:
 *             consentType: "marketing"
 *             granted: true
 *     responses:
 *       200:
 *         description: Consent updated successfully
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
 *                   example: "Consent updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     consent:
 *                       $ref: '#/components/schemas/Consent'
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
router.get('/consent', auth, gdprController.getConsentStatus)
router.post('/consent',
  auth,
  [
    body('consentType').isIn(['marketing', 'analytics', 'necessary', 'thirdParty']),
    body('granted').isBoolean()
  ],
  validateRequest,
  gdprController.updateConsent
)

/**
 * @swagger
 * /api/gdpr/export:
 *   post:
 *     summary: Request data export
 *     description: Request export of all user data (GDPR data portability)
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data export request processed successfully
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
 *                   example: "Data portability request processed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     downloadUrl:
 *                       type: string
 *                       example: "/api/gdpr/download/507f1f77bcf86cd799439011"
 *                     downloadExpires:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/export', auth, gdprController.requestDataPortability)

/**
 * @swagger
 * /api/gdpr/download/{userId}:
 *   get:
 *     summary: Download data export
 *     description: Download user data export file
 *     tags: [GDPR]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Data export file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 projects:
 *                   type: array
 *                 tasks:
 *                   type: array
 *                 exportDate:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Download link expired or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/download/:userId', gdprController.downloadDataExport)

/**
 * @swagger
 * /api/gdpr/delete:
 *   post:
 *     summary: Request data deletion
 *     description: Request deletion of user data (GDPR right to be forgotten)
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 example: "I no longer wish to use this service"
 *               immediate:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *     responses:
 *       200:
 *         description: Deletion request submitted successfully
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
 *                   example: "Right to be forgotten request submitted"
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       example: "forgotten_507f1f77bcf86cd799439011"
 *                     scheduledDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request
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
router.post('/delete',
  auth,
  [
    body('reason').isLength({ min: 10 }),
    body('immediate').optional().isBoolean()
  ],
  validateRequest,
  gdprController.requestRightToBeForgotten
)

/**
 * @swagger
 * /api/gdpr/process-deletion/{requestId}:
 *   post:
 *     summary: Process deletion request (Admin only)
 *     description: Process a pending right to be forgotten request
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Deletion request ID
 *         example: "forgotten_507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Deletion request processed successfully
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
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Deletion request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/process-deletion/:requestId', 
  auth, 
  authorize(['admin']), 
  gdprController.processRightToBeForgotten
)

/**
 * @swagger
 * /api/gdpr/pending-deletions:
 *   get:
 *     summary: Get pending deletion requests (Admin only)
 *     description: Retrieve all pending right to be forgotten requests
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending deletion requests retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       requestId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       reason:
 *                         type: string
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                       scheduledDate:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/pending-deletions', 
  auth, 
  authorize(['admin']), 
  gdprController.getPendingForgottenRequests
)

/**
 * @swagger
 * /api/gdpr/cleanup:
 *   post:
 *     summary: Cleanup expired data (Admin only)
 *     description: Clean up expired data and deletion requests
 *     tags: [GDPR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
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
 *                   example: "Cleanup completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedUsers:
 *                       type: number
 *                       example: 5
 *                     deletedRequests:
 *                       type: number
 *                       example: 10
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/cleanup', 
  auth, 
  authorize(['admin']), 
  gdprController.cleanupExpiredData
)

module.exports = router 