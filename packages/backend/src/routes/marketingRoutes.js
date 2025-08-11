const express = require('express')
const { body, validationResult } = require('express-validator')
const MarketingLead = require('../models/MarketingLead')
const Newsletter = require('../models/Newsletter')
const emailService = require('../services/emailService')
const config = require('../config')
const { validateRequest } = require('../middleware/validation')
const { generalLimiter } = require('../middleware/security')

const router = express.Router()

// Apply rate limiting to marketing routes
router.use(generalLimiter)

/**
 * @swagger
 * /api/marketing/leads:
 *   get:
 *     summary: Get all marketing leads
 *     description: Retrieve all marketing leads with filtering and pagination
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, qualified, converted, lost, nurturing]
 *         description: Filter by lead status
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [website, referral, social, ads, email, demo_request, contact_form]
 *         description: Filter by lead source
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
 *         description: Leads retrieved successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new marketing lead
 *     description: Capture a new lead from marketing website
 *     tags: [Marketing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               phone:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [website, referral, social, ads, email, demo_request, contact_form]
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               message:
 *                 type: string
 *               marketingData:
 *                 type: object
 *                 properties:
 *                   utmSource:
 *                     type: string
 *                   utmMedium:
 *                     type: string
 *                   utmCampaign:
 *                     type: string
 *                   referrer:
 *                     type: string
 *                   landingPage:
 *                     type: string
 *     responses:
 *       201:
 *         description: Lead created successfully
 *       400:
 *         description: Validation error
 */
router.get('/leads', async (req, res) => {
  try {
    const { 
      status, 
      source, 
      page = 1, 
      limit = 10,
      search 
    } = req.query

    const query = {}

    if (status) query.status = status
    if (source) query.source = source
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ]
    }

    const leads = await MarketingLead.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await MarketingLead.countDocuments(query)

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get leads error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

router.post('/leads', [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 }),
  body('company').optional().trim().isLength({ max: 100 }),
  body('phone').optional().matches(/^[\+]?[1-9]\d{0,15}$|^0\d{0,15}$/),
  body('source').optional().isIn(['website', 'referral', 'social', 'ads', 'email', 'demo_request', 'contact_form']),
  body('interests').optional().isArray(),
  body('message').optional().trim().isLength({ max: 1000 })
], validateRequest, async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      company,
      phone,
      source = 'website',
      interests = [],
      message,
      marketingData = {}
    } = req.body

    // Check if lead already exists
    const existingLead = await MarketingLead.findOne({ email })
    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: 'Lead with this email already exists'
      })
    }

    // Create new lead
    const lead = new MarketingLead({
      email,
      firstName,
      lastName,
      company,
      phone,
      source,
      interests,
      notes: message,
      marketingData: {
        ...marketingData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      gdpr: {
        consent: {
          marketing: false,
          analytics: false,
          necessary: true
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    })

    await lead.save()

    // Send notification email to sales team
    try {
      await emailService.sendLeadNotification(lead)
    } catch (emailError) {
      console.error('Lead notification email error:', emailError)
    }

    res.status(201).json({
      success: true,
      message: 'Lead captured successfully',
      data: { lead }
    })
  } catch (error) {
    console.error('Create lead error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/marketing/newsletter:
 *   post:
 *     summary: Subscribe to newsletter
 *     description: Subscribe email to newsletter with GDPR compliance
 *     tags: [Marketing]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               source:
 *                 type: string
 *                 enum: [website, popup, landing_page, blog, social, referral]
 *     responses:
 *       201:
 *         description: Newsletter subscription successful
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already subscribed
 */
router.post('/newsletter', [
  body('email').isEmail().normalizeEmail(),
  body('firstName').optional().trim().isLength({ max: 50 }),
  body('lastName').optional().trim().isLength({ max: 50 }),
  body('interests').optional().isArray(),
  body('source').optional().isIn(['website', 'popup', 'landing_page', 'blog', 'social', 'referral'])
], validateRequest, async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      interests = [],
      source = 'website',
      marketingData = {}
    } = req.body

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email })
    if (existingSubscriber && existingSubscriber.status === 'subscribed') {
      return res.status(409).json({
        success: false,
        message: 'Email is already subscribed to newsletter'
      })
    }

    // Create or update newsletter subscription
    const newsletterData = {
      email,
      firstName,
      lastName,
      interests,
      source,
      status: 'subscribed',
      marketingData: {
        ...marketingData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      gdpr: {
        consent: {
          marketing: true,
          analytics: false,
          necessary: true
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    }

    let subscriber
    if (existingSubscriber) {
      // Update existing subscriber
      Object.assign(existingSubscriber, newsletterData)
      subscriber = await existingSubscriber.save()
    } else {
      // Create new subscriber
      subscriber = new Newsletter(newsletterData)
      await subscriber.save()
    }

    // Send welcome email
    try {
      await emailService.sendNewsletterWelcome(subscriber)
    } catch (emailError) {
      console.error('Newsletter welcome email error:', emailError)
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: { subscriber }
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/marketing/contact:
 *   post:
 *     summary: Send contact form
 *     description: Handle contact form submissions
 *     tags: [Marketing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - message
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
 *       400:
 *         description: Validation error
 */
router.post('/contact', [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 }),
  body('company').optional().trim().isLength({ max: 100 }),
  body('phone').optional().matches(/^[\+]?[1-9]\d{0,15}$|^0\d{0,15}$/),
  body('message').trim().isLength({ min: 10, max: 2000 }),
  body('subject').optional().trim().isLength({ max: 200 })
], validateRequest, async (req, res) => {
  try {
    console.log('Contact form request body:', JSON.stringify(req.body, null, 2))
    
    const {
      email,
      firstName,
      lastName,
      company,
      phone,
      message,
      subject = 'Contact Form Submission'
    } = req.body

    // Create lead from contact form
    const lead = new MarketingLead({
      email,
      firstName,
      lastName,
      company,
      phone,
      source: 'contact_form',
      notes: `Subject: ${subject}\n\nMessage: ${message}`,
      marketingData: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      gdpr: {
        consent: {
          marketing: false,
          analytics: false,
          necessary: true
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    })

    await lead.save()

    // Send contact form notification
    try {
      await emailService.sendEmail({
        to: config.email.user, // Send to admin email
        subject: `📧 New Contact Form Submission: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Linton Portals</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">New Contact Form Submission</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">📧 New Contact Form Submission</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Contact Details</h3>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Company:</strong> ${company || 'Not provided'}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 15px 0; color: #333;">Message</h4>
                <p style="margin: 0; color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #666; font-size: 14px;">
                  This contact form was submitted from the marketing website.<br>
                  Submitted at: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
            
            <div style="background: #f1f3f4; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © 2024 Linton Portals. All rights reserved.
              </p>
            </div>
          </div>
        `,
        text: `
Linton Portals - New Contact Form Submission

📧 New Contact Form Submission

Contact Details:
• Name: ${firstName} ${lastName}
• Email: ${email}
• Company: ${company || 'Not provided'}
• Phone: ${phone || 'Not provided'}
• Subject: ${subject}

Message:
${message}

This contact form was submitted from the marketing website.
Submitted at: ${new Date().toLocaleString()}

© 2024 Linton Portals. All rights reserved.
        `
      })
    } catch (emailError) {
      console.error('Contact form email error:', emailError)
    }

    res.json({
      success: true,
      message: 'Contact form submitted successfully'
    })
  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/marketing/pricing:
 *   get:
 *     summary: Get pricing information
 *     description: Retrieve pricing plans and features
 *     tags: [Marketing]
 *     responses:
 *       200:
 *         description: Pricing information retrieved successfully
 */
router.get('/pricing', async (req, res) => {
  try {
    const pricing = {
      plans: [
        {
          name: 'Starter',
          price: 49,
          currency: 'USD',
          billingCycle: 'monthly',
          features: [
            'Up to 10 users',
            '5 projects',
            'Basic analytics',
            'Email support',
            'File storage (10GB)'
          ],
          limits: {
            users: 10,
            projects: 5,
            storage: 10
          }
        },
        {
          name: 'Professional',
          price: 99,
          currency: 'USD',
          billingCycle: 'monthly',
          features: [
            'Up to 25 users',
            'Unlimited projects',
            'Advanced analytics',
            'Priority support',
            'File storage (50GB)',
            'API access',
            'Custom branding'
          ],
          limits: {
            users: 25,
            projects: -1, // unlimited
            storage: 50
          }
        },
        {
          name: 'Enterprise',
          price: 199,
          currency: 'USD',
          billingCycle: 'monthly',
          features: [
            'Unlimited users',
            'Unlimited projects',
            'Advanced analytics',
            'Dedicated support',
            'File storage (100GB)',
            'API access',
            'Custom branding',
            'White-label solution',
            'Custom development'
          ],
          limits: {
            users: -1, // unlimited
            projects: -1, // unlimited
            storage: 100
          }
        }
      ],
      features: [
        'Project Management',
        'Task Tracking',
        'Time Tracking',
        'Team Collaboration',
        'File Management',
        'Real-time Chat',
        'Analytics & Reporting',
        'Mobile App',
        'API Access',
        'White-label Solution'
      ]
    }

    res.json({
      success: true,
      data: pricing
    })
  } catch (error) {
    console.error('Get pricing error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

/**
 * @swagger
 * /api/marketing/demo-request:
 *   post:
 *     summary: Request demo
 *     description: Handle demo requests from marketing website
 *     tags: [Marketing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               companySize:
 *                 type: string
 *                 enum: [1-10, 11-50, 51-200, 200+]
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Demo request submitted successfully
 *       400:
 *         description: Validation error
 */
/**
 * @swagger
 * /api/marketing/leads/{id}:
 *   put:
 *     summary: Update lead status
 *     description: Update lead status and information
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, contacted, qualified, converted, lost, nurturing]
 *               notes:
 *                 type: string
 *               leadScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Lead updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Lead not found
 */
router.put('/leads/:id', [
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'converted', 'lost', 'nurturing']),
  body('notes').optional().trim().isLength({ max: 1000 }),
  body('leadScore').optional().isInt({ min: 0, max: 100 })
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const lead = await MarketingLead.findById(id)
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      })
    }

    // Update lead
    Object.assign(lead, updateData)
    await lead.save()

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead }
    })
  } catch (error) {
    console.error('Update lead error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

router.post('/demo-request', [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 }),
  body('company').optional().trim().isLength({ max: 100 }),
  body('companySize').optional().isIn(['1-10', '11-50', '51-200', '200+']),
  body('interests').optional().isArray(),
  body('message').optional().trim().isLength({ max: 1000 })
], validateRequest, async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      company,
      companySize,
      interests = [],
      message
    } = req.body

    // Create lead from demo request
    const lead = new MarketingLead({
      email,
      firstName,
      lastName,
      company,
      source: 'demo_request',
      interests,
      notes: `Company Size: ${companySize || 'Not specified'}\n\nMessage: ${message || 'Demo request'}`,
      status: 'qualified', // Demo requests are typically qualified
      leadScore: 75, // Higher score for demo requests
      marketingData: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      gdpr: {
        consent: {
          marketing: false,
          analytics: false,
          necessary: true
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    })

    await lead.save()

    // Send demo request notification
    try {
      await emailService.sendEmail({
        to: config.email.user, // Send to admin email
        subject: `🎯 New Demo Request: ${firstName} ${lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Linton Portals</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">New Demo Request</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">🎯 New Demo Request</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Lead Details</h3>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Company:</strong> ${company || 'Not provided'}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Company Size:</strong> ${companySize || 'Not specified'}</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Lead Score:</strong> 75 (High Priority)</p>
                <p style="margin: 0 0 10px 0; color: #666;"><strong>Status:</strong> Qualified</p>
              </div>
              
              ${message ? `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 15px 0; color: #333;">Additional Message</h4>
                <p style="margin: 0; color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #666; font-size: 14px;">
                  This demo request was submitted from the marketing website.<br>
                  Submitted at: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
            
            <div style="background: #f1f3f4; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                © 2024 Linton Portals. All rights reserved.
              </p>
            </div>
          </div>
        `,
        text: `
Linton Portals - New Demo Request

🎯 New Demo Request

Lead Details:
• Name: ${firstName} ${lastName}
• Email: ${email}
• Company: ${company || 'Not provided'}
• Company Size: ${companySize || 'Not specified'}
• Lead Score: 75 (High Priority)
• Status: Qualified

${message ? `Additional Message:\n${message}\n` : ''}
This demo request was submitted from the marketing website.
Submitted at: ${new Date().toLocaleString()}

© 2024 Linton Portals. All rights reserved.
        `
      })
    } catch (emailError) {
      console.error('Demo request email error:', emailError)
    }

    res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully. We\'ll contact you soon!'
    })
  } catch (error) {
    console.error('Demo request error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router 