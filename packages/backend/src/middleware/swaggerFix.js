// Custom Swagger UI middleware to fix HTTPS and YAML parsing issues
const swaggerFixMiddleware = (req, res, next) => {
  // Set headers to prevent HTTPS upgrades and fix content issues
  res.setHeader('Content-Security-Policy', "upgrade-insecure-requests: false");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Fix for YAML parsing issues in Swagger UI bundle
  if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // For static files, ensure they're served with HTTP-friendly headers
  if (req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.endsWith('.png') || req.path.endsWith('.ico')) {
    res.setHeader('Content-Security-Policy', "upgrade-insecure-requests: false");
  }
  
  next();
};

module.exports = swaggerFixMiddleware; 