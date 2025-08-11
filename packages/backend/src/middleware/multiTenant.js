const Vendor = require('../models/Vendor')

// Multi-tenant middleware to detect vendor from subdomain or custom domain
const detectVendor = async (req, res, next) => {
  try {
    const hostname = req.hostname.toLowerCase()
    
    // Skip for localhost and IP addresses
    if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return next()
    }

    // Check for white-label custom domains first
    const vendorByCustomDomain = await Vendor.findOne({
      $or: [
        { 'branding.customDomain': hostname },
        { 'branding.whiteLabel.domains.clientPortal': hostname },
        { 'branding.whiteLabel.domains.employeePortal': hostname },
        { 'branding.whiteLabel.domains.adminPortal': hostname }
      ]
    })

    if (vendorByCustomDomain) {
      req.vendorContext = vendorByCustomDomain
      req.vendorSlug = vendorByCustomDomain.domain
      req.portalType = detectPortalType(hostname, vendorByCustomDomain)
      return next()
    }

    // Check for subdomain pattern (e.g., acme.lintonlabs.com)
    const subdomainMatch = hostname.match(/^([^.]+)\.(.+)$/)
    if (subdomainMatch) {
      const subdomain = subdomainMatch[1]
      const domain = subdomainMatch[2]
      
      // Skip if it's a common subdomain
      const commonSubdomains = ['www', 'api', 'staging', 'dev']
      if (commonSubdomains.includes(subdomain)) {
        return next()
      }

      // Find vendor by domain
      const vendorByDomain = await Vendor.findOne({ domain: subdomain })
      if (vendorByDomain) {
        req.vendorContext = vendorByDomain
        req.vendorSlug = vendorByDomain.domain
        req.portalType = detectPortalType(hostname, vendorByDomain)
        return next()
      }
    }

    // Check for portal-specific subdomains (app, employee, admin)
    const portalSubdomainMatch = hostname.match(/^(app|employee|admin)\.(.+)$/)
    if (portalSubdomainMatch) {
      const portalType = portalSubdomainMatch[1]
      const domain = portalSubdomainMatch[2]
      
      // Find vendor by domain
      const vendorByDomain = await Vendor.findOne({ 
        domain: domain.replace(/\./g, '') 
      })
      if (vendorByDomain) {
        req.vendorContext = vendorByDomain
        req.vendorSlug = vendorByDomain.domain
        req.portalType = portalType
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

// Helper function to detect portal type
const detectPortalType = (hostname, vendor) => {
  // Check white-label domains first
  if (vendor.branding.whiteLabel && vendor.branding.whiteLabel.enabled) {
    if (hostname === vendor.branding.whiteLabel.domains.clientPortal) return 'client'
    if (hostname === vendor.branding.whiteLabel.domains.employeePortal) return 'employee'
    if (hostname === vendor.branding.whiteLabel.domains.adminPortal) return 'admin'
  }

  // Check subdomain patterns
  if (hostname.startsWith('app.')) return 'client'
  if (hostname.startsWith('employee.')) return 'employee'
  if (hostname.startsWith('admin.')) return 'admin'

  // Default to client portal
  return 'client'
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

  // Check white-label status for white-label clients
  if (req.vendorContext.whiteLabelSettings && req.vendorContext.whiteLabelSettings.isWhiteLabelClient) {
    if (req.vendorContext.whiteLabelSettings.whiteLabelStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'White-label account is not active'
      })
    }
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
      companyName: req.vendorContext.branding.companyName || req.vendorContext.name,
      primaryColor: req.vendorContext.branding.primaryColor,
      secondaryColor: req.vendorContext.branding.secondaryColor,
      logo: req.vendorContext.branding.logo,
      logoDark: req.vendorContext.branding.logoDark,
      favicon: req.vendorContext.branding.favicon,
      tagline: req.vendorContext.branding.tagline,
      whiteLabel: req.vendorContext.branding.whiteLabel,
      clientType: req.vendorContext.clientType
    }
  }
  next()
}

// Middleware to check portal access
const checkPortalAccess = (allowedPortalTypes) => {
  return (req, res, next) => {
    if (!req.vendorContext) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      })
    }

    if (!req.portalType) {
      return res.status(400).json({
        success: false,
        message: 'Portal type not detected'
      })
    }

    if (!allowedPortalTypes.includes(req.portalType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This portal is for ${allowedPortalTypes.join(', ')} only.`
      })
    }

    next()
  }
}

module.exports = {
  detectVendor,
  requireVendorContext,
  filterByVendor,
  injectVendorBranding,
  checkPortalAccess
} 