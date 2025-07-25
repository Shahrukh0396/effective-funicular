require('dotenv').config()

module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongoUri: process.env.NODE_ENV === 'test' 
    ? (process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test-auth')
    : (process.env.MONGO_URI || 'mongodb+srv://Shahrukh:Pakistan28*@client-portal.wqlclt3.mongodb.net/'),
  
  // JWT configuration - Enhanced for access and refresh tokens
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  
  // Token configuration
  tokens: {
    accessToken: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      algorithm: 'HS256',
      issuer: 'linton-tech-platform'
    },
    refreshToken: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      algorithm: 'HS256',
      issuer: 'linton-tech-platform'
    }
  },
  
  // Session configuration
  session: {
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 5,
    sessionTimeout: process.env.SESSION_TIMEOUT || '24h',
    idleTimeout: process.env.IDLE_TIMEOUT || '4h'
  },
  
  // Security configuration
  security: {
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    passwordHistoryCount: parseInt(process.env.PASSWORD_HISTORY_COUNT) || 5,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    accountLockoutDuration: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION) || 15, // minutes
    passwordExpirationDays: parseInt(process.env.PASSWORD_EXPIRATION_DAYS) || 90
  },
  
  // Client URLs for CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  employeeUrl: process.env.EMPLOYEE_URL || 'http://localhost:5174',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5175',
  marketingUrl: process.env.MARKETING_URL || 'http://localhost:5177',
  superAdminUrl: process.env.SUPER_ADMIN_URL || 'http://localhost:5176',
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  
  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  
  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-rar-compressed'
    ]
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
} 