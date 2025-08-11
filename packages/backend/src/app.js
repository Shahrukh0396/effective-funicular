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
const scheduler = require('./utils/scheduler')
const WebSocketAuthService = require('./services/websocketAuthService')

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
const authRoutes = require('./routes/auth')
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
const marketingRoutes = require('./routes/marketingRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const timeTrackingRoutes = require('./routes/timeTrackingRoutes')
const mfaRoutes = require('./routes/mfaRoutes')
const testRoutes = require('./routes/testRoutes')

// Create Express app
const app = express()
const httpServer = createServer(app)

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      config.clientUrl,    // http://localhost:5173
      config.employeeUrl,  // http://localhost:5174
      config.adminUrl,     // http://localhost:5175
      config.marketingUrl, // http://localhost:5177
      config.superAdminUrl, // http://localhost:5176
      // Production domains
      'https://app.linton-tech.com',
      'https://admin.linton-tech.com',
      'https://employee.linton-tech.com',
      'https://api.linton-tech.com',
      // Allow localhost with any port for development
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  allowEIO3: true, // Allow Engine.IO v3 clients
  transports: ['polling', 'websocket']
})

// Export app and io for testing
module.exports = app
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
// app.use(detectVendor)
// app.use(filterByVendor)
// app.use(injectVendorBranding)

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

// Socket.IO connection test endpoint
app.get('/socket-test', (req, res) => {
  res.json({
    success: true,
    message: 'Socket.IO server is running',
    socketUrl: `http://localhost:${config.port}`,
    corsOrigins: [
      config.clientUrl,
      config.employeeUrl,
      config.adminUrl,
      config.marketingUrl,
      config.superAdminUrl
    ]
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
app.use('/api/marketing', marketingRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/time-entries', timeTrackingRoutes)
app.use('/api/mfa', mfaRoutes)
app.use('/api/test', testRoutes)

// 404 handler
app.use(notFound)

// Error handling middleware
app.use(errorHandler)

// Connect to MongoDB only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(config.mongoUri)
    .then(() => {
      console.log('✅ Connected to MongoDB')
      
      // Initialize scheduled tasks
      scheduler.init()
      
      // Start server
      httpServer.listen(config.port, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${config.port}`)
        console.log(`📊 Environment: ${config.nodeEnv}`)
        console.log(`🔗 Health check: http://localhost:${config.port}/health`)
        console.log(`�� API Documentation: http://localhost:${config.port}/api-docs`)
        console.log(`🌐 Network access: http://0.0.0.0:${config.port}`)
        console.log(`💡 Use your machine's IP address to access from other devices`)
      })
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err)
      process.exit(1)
    })
}

// Initialize WebSocket authentication service
const wsAuthService = new WebSocketAuthService(io)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)
  console.log('📍 Client origin:', socket.handshake.headers.origin)
  console.log('🌐 Client address:', socket.handshake.address)

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

  // Typing start
  socket.on('typing:start', ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('typing:start', {
      conversationId,
      userId
    })
  })

  // Typing stop
  socket.on('typing:stop', ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('typing:stop', {
      conversationId,
      userId
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

  // Message delivered receipt
  socket.on('messageDelivered', ({ messageId, conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('messageDelivered', {
      messageId,
      conversationId,
      userId
    })
  })

  // Message sent receipt
  socket.on('messageSent', ({ messageId, conversationId, userId }) => {
    socket.to(`user_${userId}`).emit('messageSent', {
      messageId,
      conversationId,
      userId
    })
  })

  // Reaction events
  socket.on('reaction:add', ({ messageId, conversationId, emoji, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('reaction:added', {
      messageId,
      conversationId,
      emoji,
      userId
    })
  })

  socket.on('reaction:remove', ({ messageId, conversationId, emoji, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('reaction:removed', {
      messageId,
      conversationId,
      emoji,
      userId
    })
  })

  // Message edit events
  socket.on('message:edit', ({ messageId, conversationId, content, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('message:edited', {
      messageId,
      conversationId,
      content,
      userId
    })
  })

  // Message delete events
  socket.on('message:delete', ({ messageId, conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('message:deleted', {
      messageId,
      conversationId,
      userId
    })
  })

  // User presence
  socket.on('presence:online', (userId) => {
    socket.broadcast.emit('user:online', { userId })
  })

  socket.on('presence:away', (userId) => {
    socket.broadcast.emit('user:away', { userId })
  })

  socket.on('disconnect', (reason) => {
    console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason)
  })

  socket.on('error', (error) => {
    console.error('🔌 Socket error:', error)
  })
})

// Socket.IO error handling
io.engine.on('connection_error', (err) => {
  console.error('🔌 Socket.IO connection error:', {
    req: err.req,
    code: err.code,
    message: err.message,
    context: err.context
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  scheduler.stop()
  httpServer.close(() => {
    console.log('✅ Process terminated')
    process.exit(0)
  })
}) 