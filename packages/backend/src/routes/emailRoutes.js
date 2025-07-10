const express = require('express')
const router = express.Router()
const emailService = require('../services/emailService')
const { body } = require('express-validator')
const { validateRequest } = require('../middleware/validation')

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Send test email
 *     description: Send a test email to verify email service configuration
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "test@example.com"
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Email service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/test',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email } = req.body

      console.log('📧 Sending test email to:', email)

      const result = await emailService.sendTestEmail(email)

      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          messageId: result.messageId,
          to: email,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Test email error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error.message
      })
    }
  }
)

module.exports = router 