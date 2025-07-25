/**
 * Email validation utilities for business email validation
 */

// Common free email providers that are typically not business emails
const FREE_EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'tutanota.com',
  'yandex.com',
  'zoho.com',
  'fastmail.com',
  'gmx.com',
  '163.com',
  'qq.com',
  '126.com',
  'sina.com',
  'sohu.com'
]

/**
 * Validates if an email is a business email
 * @param {string} email - The email to validate
 * @returns {Object} - Validation result with isValid boolean and message
 */
export const validateBusinessEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Email is required'
    }
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    }
  }

  // Extract domain from email
  const domain = email.split('@')[1]?.toLowerCase()
  
  if (!domain) {
    return {
      isValid: false,
      message: 'Invalid email format'
    }
  }

  // Check if it's a free email provider
  if (FREE_EMAIL_PROVIDERS.includes(domain)) {
    return {
      isValid: false,
      message: 'Please use a business email address (not a free email provider)'
    }
  }

  // Additional checks for common business email patterns
  const businessIndicators = [
    'company',
    'corp',
    'inc',
    'llc',
    'ltd',
    'enterprise',
    'business',
    'office',
    'team',
    'staff',
    'admin',
    'info',
    'contact',
    'hello',
    'support',
    'sales',
    'marketing',
    'hr',
    'finance',
    'legal'
  ]

  const localPart = email.split('@')[0]?.toLowerCase()
  
  // If local part contains business indicators, it's likely a business email
  const hasBusinessIndicator = businessIndicators.some(indicator => 
    localPart.includes(indicator)
  )

  // If domain is not a free provider and has business indicators, consider it valid
  if (hasBusinessIndicator) {
    return {
      isValid: true,
      message: 'Valid business email'
    }
  }

  // For domains that are not free providers, we'll be more lenient
  // but still require some basic validation
  if (domain.length > 3 && !domain.includes('.')) {
    return {
      isValid: false,
      message: 'Please use a valid business email address'
    }
  }

  return {
    isValid: true,
    message: 'Valid business email'
  }
}

/**
 * Validates general email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email format is valid
 */
export const isValidEmailFormat = (email) => {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Extracts domain from email
 * @param {string} email - The email address
 * @returns {string|null} - The domain or null if invalid
 */
export const extractDomain = (email) => {
  if (!isValidEmailFormat(email)) {
    return null
  }
  
  return email.split('@')[1]?.toLowerCase() || null
}

/**
 * Checks if email is from a free provider
 * @param {string} email - The email to check
 * @returns {boolean} - Whether the email is from a free provider
 */
export const isFreeEmailProvider = (email) => {
  const domain = extractDomain(email)
  if (!domain) {
    return false
  }
  
  return FREE_EMAIL_PROVIDERS.includes(domain)
} 