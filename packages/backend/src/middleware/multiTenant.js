const Vendor = require('../models/Vendor')

// Multi-tenant middleware to detect vendor from subdomain or custom domain
const detectVendor = async (req, res, next) => {
  try {
    const hostname = req.hostname.toLowerCase()
    
    // Skip for localhost and IP addresses
    if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return next()
    }

    // Check for custom domain first
    const vendorByDomain = await Vendor.findOne({
      'branding.customDomain': hostname
    })

    if (vendorByDomain) {
      req.vendorContext = vendorByDomain
      req.vendorSlug = vendorByDomain.slug
      return next()
    }

    // Check for subdomain pattern (e.g., acme.lintonlabs.com)
    const subdomainMatch = hostname.match(/^([^.]+)\.(.+)$/)
    if (subdomainMatch) {
      const subdomain = subdomainMatch[1]
      const domain = subdomainMatch[2]
      
      // Skip if it's a common subdomain
      const commonSubdomains = ['www', 'api', 'admin', 'client', 'employee', 'staging', 'dev']
      if (commonSubdomains.includes(subdomain)) {
        return next()
      }

      // Find vendor by slug
      const vendorBySlug = await Vendor.findOne({ slug: subdomain })
      if (vendorBySlug) {
        req.vendorContext = vendorBySlug
        req.vendorSlug = vendorBySlug.slug
        return next()
      }
    }

    // No vendor context found
    next()
  } catch (error) {
    console.error('Multi-tenant detection error:', error)
    next()
  }
}

// Middleware to require vendor context
const requireVendorContext = (req, res, next) => {
  if (!req.vendorContext) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found or invalid subdomain'
    })
  }

  // Check if vendor is active
  if (!req.vendorContext.isActive) {
    return res.status(403).json({
      success: false,
      message: 'This vendor account is deactivated'
    })
  }

  // Check subscription status
  if (req.vendorContext.subscription.status === 'suspended') {
    return res.status(403).json({
      success: false,
      message: 'This vendor account is suspended'
    })
  }

  next()
}

// Middleware to filter data by vendor
const filterByVendor = (req, res, next) => {
  if (req.vendorContext) {
    req.vendorFilter = { vendor: req.vendorContext._id }
  }
  next()
}

// Middleware to inject vendor branding into response
const injectVendorBranding = (req, res, next) => {
  if (req.vendorContext) {
    res.locals.vendorBranding = {
      companyName: req.vendorContext.branding.companyName || req.vendorContext.companyName,
      primaryColor: req.vendorContext.branding.primaryColor,
      secondaryColor: req.vendorContext.branding.secondaryColor,
      logo: req.vendorContext.branding.logo,
      logoDark: req.vendorContext.branding.logoDark,
      favicon: req.vendorContext.branding.favicon,
      tagline: req.vendorContext.branding.tagline
    }
  }
  next()
}

module.exports = {
  detectVendor,
  requireVendorContext,
  filterByVendor,
  injectVendorBranding
} 