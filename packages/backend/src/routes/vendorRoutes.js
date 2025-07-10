const express = require('express')
const router = express.Router()
const vendorController = require('../controllers/vendorController')
const { vendorAuth, checkVendorSubscription } = require('../middleware/vendorAuth')
const { validateRequest } = require('../middleware/validation')
const { body } = require('express-validator')

// Public routes
router.post('/register', [
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
    .isLength({ min: 3, max: 50 })
    .withMessage('Slug must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('contactPerson.firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contact first name is required'),
  body('contactPerson.lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contact last name is required'),
  validateRequest
], vendorController.registerVendor)

router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
], vendorController.loginVendor)

router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  validateRequest
], vendorController.verifyVendorEmail)

router.get('/check-slug/:slug', vendorController.checkSlugAvailability)

router.get('/branding/:slug', vendorController.getVendorBranding)

// Protected routes (require vendor authentication)
router.get('/profile', vendorAuth, vendorController.getVendorProfile)

router.put('/profile', [
  vendorAuth,
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('contactPerson.firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contact first name must be between 1 and 50 characters'),
  body('contactPerson.lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contact last name must be between 1 and 50 characters'),
  body('contactPerson.phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must be less than 20 characters'),
  body('contactPerson.position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position must be less than 100 characters'),
  body('industry')
    .optional()
    .isIn([
      'digital-marketing',
      'web-development',
      'design-agency',
      'consulting',
      'software-development',
      'content-creation',
      'seo-agency',
      'social-media',
      'ecommerce',
      'other'
    ])
    .withMessage('Invalid industry selection'),
  body('companySize')
    .optional()
    .isIn(['1-5', '6-10', '11-25', '26-50', '51-100', '100+'])
    .withMessage('Invalid company size selection'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('branding.primaryColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Primary color must be a valid hex color'),
  body('branding.secondaryColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Secondary color must be a valid hex color'),
  body('branding.companyName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand company name must be less than 100 characters'),
  body('branding.tagline')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Tagline must be less than 200 characters'),
  body('branding.customDomain')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Custom domain must be less than 100 characters'),
  validateRequest
], vendorController.updateVendorProfile)

router.get('/dashboard', [
  vendorAuth,
  checkVendorSubscription
], vendorController.getVendorDashboard)

router.post('/resend-verification', [
  vendorAuth,
  validateRequest
], vendorController.resendVerificationEmail)

module.exports = router 