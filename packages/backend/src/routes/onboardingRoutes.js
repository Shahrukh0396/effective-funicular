const express = require('express')
const router = express.Router()
const onboardingController = require('../controllers/onboardingController')
const { vendorAuth } = require('../middleware/vendorAuth')
const { validateRequest } = require('../middleware/validation')
const { body } = require('express-validator')

// Get onboarding progress
router.get('/progress', vendorAuth, onboardingController.getOnboardingProgress)

// Update company information
router.put('/company-info', [
  vendorAuth,
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('industry')
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
  validateRequest
], onboardingController.updateCompanyInfo)

// Update branding
router.put('/branding', [
  vendorAuth,
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
  validateRequest
], onboardingController.updateBranding)

// Add team members
router.post('/team-members', [
  vendorAuth,
  body('teamMembers')
    .isArray({ min: 1 })
    .withMessage('At least one team member is required'),
  body('teamMembers.*.firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('teamMembers.*.lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('teamMembers.*.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email for each team member'),
  body('teamMembers.*.position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position must be less than 100 characters'),
  validateRequest
], onboardingController.addTeamMembers)

// Create first project
router.post('/first-project', [
  vendorAuth,
  body('projectName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('projectDescription')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Project description must be between 10 and 1000 characters'),
  body('clientEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid client email'),
  body('clientName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Client name must be between 2 and 100 characters'),
  validateRequest
], onboardingController.createFirstProject)

// Skip onboarding step
router.post('/skip-step', [
  vendorAuth,
  body('step')
    .isIn(['company-info', 'branding', 'team-setup', 'first-project'])
    .withMessage('Invalid step to skip'),
  validateRequest
], onboardingController.skipOnboardingStep)

module.exports = router 