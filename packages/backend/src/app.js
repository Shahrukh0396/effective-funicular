const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const { createServer } = require('http')
const { Server } = require('socket.io')
const compression = require('compression')
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const swaggerUi = require('swagger-ui-express')
const config = require('./config')
const swaggerSpecs = require('./config/swagger')
const swaggerFixMiddleware = require('./middleware/swaggerFix')

// Import security middleware
const { 
  securityHeaders, 
  corsOptions, 
  generalLimiter, 
  sanitizeRequest,
  errorHandler,
  notFound 
} = require('./middleware/security')

// Import multi-tenant middleware
const { detectVendor, filterByVendor, injectVendorBranding } = require('./middleware/multiTenant')

// Import routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const sprintRoutes = require('./routes/sprintRoutes')
const gdprRoutes = require('./routes/gdprRoutes')
const employeeRoutes = require('./routes/employeeRoutes')
const adminRoutes = require('./routes/adminRoutes')
const superAccountRoutes = require('./routes/superAccountRoutes')
const emailRoutes = require('./routes/emailRoutes')
const vendorRoutes = require('./routes/vendorRoutes')
const onboardingRoutes = require('./routes/onboardingRoutes')
const chatRoutes = require('./routes/chatRoutes')

// Create Express app
const app = express()
const httpServer = createServer(app)

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      config.clientUrl,    // http://localhost:5173
      config.employeeUrl,  // http://localhost:5174
      config.adminUrl      // http://localhost:5175
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Export io instance
module.exports.io = io

// Security middleware
app.use(securityHeaders)
app.use(cors(corsOptions))
app.use(compression())
app.use(mongoSanitize())
app.use(sanitizeRequest)
app.use(generalLimiter)

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Multi-tenant middleware
app.use(detectVendor)
app.use(filterByVendor)
app.use(injectVendorBranding)

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Swagger Documentation with HTTPS fix
app.use('/api-docs', swaggerFixMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Linton Client Portal API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true,
    url: '/api-docs/swagger.json',
    validatorUrl: null,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayOperationId: false,
    docExpansion: 'list',
    maxDisplayedTags: 10,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (request) => {
      if (request.url && request.url.startsWith('https://')) {
        request.url = request.url.replace('https://', 'http://');
      }
      return request;
    }
  }
}))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: config.nodeEnv
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/sprints', sprintRoutes)
app.use('/api/gdpr', gdprRoutes)
app.use('/api/employee', employeeRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/super-accounts', superAccountRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/onboarding', onboardingRoutes)
app.use('/api/chat', chatRoutes)

// 404 handler
app.use(notFound)

// Error handling middleware
app.use(errorHandler)

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    // Start server on all network interfaces
    httpServer.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${config.port}`)
      console.log(`📊 Environment: ${config.nodeEnv}`)
      console.log(`🔗 Health check: http://localhost:${config.port}/health`)
      console.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`)
      console.log(`🌐 Network access: http://0.0.0.0:${config.port}`)
      console.log(`💡 Use your machine's IP address to access from other devices`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)

  // Join user to their room for private messages
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`)
    console.log(`👤 User ${userId} joined their room`)
  })

  // Join project room for project updates
  socket.on('joinProject', (projectId) => {
    socket.join(`project_${projectId}`)
    console.log(`📁 User joined project ${projectId}`)
  })

  // Join conversation room for chat
  socket.on('joinConversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`)
    console.log(`💬 User joined conversation ${conversationId}`)
  })

  // Leave conversation room
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`)
    console.log(`💬 User left conversation ${conversationId}`)
  })

  // Typing indicator
  socket.on('typing', ({ conversationId, userId, isTyping }) => {
    socket.to(`conversation_${conversationId}`).emit('userTyping', {
      conversationId,
      userId,
      isTyping
    })
  })

  // Message read receipt
  socket.on('messageRead', ({ messageId, conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('messageRead', {
      messageId,
      conversationId,
      userId
    })
  })

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id)
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  httpServer.close(() => {
    console.log('✅ Process terminated')
    process.exit(0)
  })
}) 