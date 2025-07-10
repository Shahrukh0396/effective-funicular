const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Linton Client Portal API',
      version: '2.0.0',
      description: `
        ## GDPR Compliant Client Portal API v2.0
        
        This API provides comprehensive project management functionality with full GDPR compliance and enterprise-grade security.
        
        ### 🚀 Key Features:
        - **Authentication & Authorization** - JWT-based secure authentication with role-based access control
        - **Project Management** - Complete project lifecycle management with analytics and timeline
        - **Task Management** - Agile task tracking with sprints, time tracking, and comments
        - **User Management** - Profile management, dashboard, and personal statistics
        - **Real-time Communication** - Socket.IO integration for live updates
        - **File Management** - Secure file uploads and storage
        - **GDPR Compliance** - Data portability, consent management, right to be forgotten
        - **Analytics & Reporting** - Comprehensive project and task analytics
        
        ### 🔒 Security Features:
        - ✅ JWT Authentication
        - ✅ Role-Based Access Control (RBAC)
        - ✅ Input Validation & Sanitization
        - ✅ Rate Limiting
        - ✅ CORS Protection
        - ✅ Security Headers
        - ✅ MongoDB Injection Protection
        
        ### 📊 GDPR Compliance:
        - ✅ Consent Management
        - ✅ Data Portability
        - ✅ Right to be Forgotten
        - ✅ Data Retention Policies
        - ✅ Audit Trails
        - ✅ Consent History Tracking
        
        ### 🔐 Authentication:
        All protected endpoints require a valid JWT token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ### 📈 Rate Limiting:
        - General endpoints: 100 requests per 15 minutes
        - Authentication endpoints: 5 attempts per 15 minutes
        - File uploads: 10 uploads per hour
        
        ### 👥 User Roles:
        - **Client**: Can view their own projects and tasks
        - **Employee**: Can view projects they're involved in
        - **Admin**: Full access to all data and management functions
      `,
      contact: {
        name: 'Linton Support',
        email: 'support@linton.com',
        url: 'https://linton.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server'
      },
      {
        url: 'http://192.168.18.52:3000',
        description: 'Network development server'
      },
      {
        url: 'https://api.linton.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication. Include in Authorization header: Bearer <token>'
        }
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['client', 'employee', 'admin'], example: 'client' },
            company: { type: 'string', example: 'Acme Corp' },
            position: { type: 'string', example: 'Project Manager' },
            phone: { type: 'string', example: '+1234567890' },
            bio: { type: 'string', example: 'Experienced project manager with 5+ years in software development' },
            avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
            isActive: { type: 'boolean', example: true },
            isEmailVerified: { type: 'boolean', example: false },
            preferences: { type: 'object' },
            consent: {
              type: 'object',
              properties: {
                marketing: { type: 'boolean', example: true },
                analytics: { type: 'boolean', example: false },
                necessary: { type: 'boolean', example: true },
                thirdParty: { type: 'boolean', example: false }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UserRegistration: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 8, example: 'securePassword123' },
            firstName: { type: 'string', minLength: 2, example: 'John' },
            lastName: { type: 'string', minLength: 2, example: 'Doe' },
            role: { type: 'string', enum: ['client', 'employee', 'admin'], example: 'client' },
            company: { type: 'string', example: 'Acme Corp' },
            gdprConsent: { type: 'boolean', example: true }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'securePassword123' }
          }
        },
        UserProfile: {
          type: 'object',
          properties: {
            firstName: { type: 'string', minLength: 2, example: 'John' },
            lastName: { type: 'string', minLength: 2, example: 'Doe' },
            phone: { type: 'string', example: '+1234567890' },
            company: { type: 'string', example: 'Acme Corp' },
            position: { type: 'string', example: 'Project Manager' },
            bio: { type: 'string', example: 'Experienced project manager' },
            avatar: { type: 'string', example: 'https://example.com/avatar.jpg' }
          }
        },
        DashboardData: {
          type: 'object',
          properties: {
            projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
            tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
            statistics: {
              type: 'object',
              properties: {
                totalProjects: { type: 'number', example: 5 },
                totalTasks: { type: 'number', example: 25 },
                completedTasks: { type: 'number', example: 18 },
                overdueTasks: { type: 'number', example: 3 },
                completionRate: { type: 'number', example: 72 }
              }
            },
            recentActivity: { type: 'array', items: { $ref: '#/components/schemas/Task' } }
          }
        },
        
        // Project schemas
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            name: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', example: 'Complete redesign of company website' },
            status: { type: 'string', enum: ['planning', 'active', 'completed', 'on-hold'], example: 'active' },
            client: { $ref: '#/components/schemas/User' },
            projectManager: { $ref: '#/components/schemas/User' },
            team: { 
              type: 'array', 
              items: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' },
                  role: { type: 'string', enum: ['developer', 'designer', 'manager', 'tester'] },
                  joinedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            startDate: { type: 'string', format: 'date', example: '2024-01-01' },
            endDate: { type: 'string', format: 'date', example: '2024-06-30' },
            budget: { type: 'number', example: 50000 },
            metrics: {
              type: 'object',
              properties: {
                totalTasks: { type: 'number', example: 25 },
                completedTasks: { type: 'number', example: 18 },
                progress: { type: 'number', example: 72 }
              }
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: { type: 'string', example: 'project-brief.pdf' },
                  originalName: { type: 'string', example: 'Project Brief.pdf' },
                  path: { type: 'string', example: '/uploads/project-brief.pdf' },
                  size: { type: 'number', example: 1024000 },
                  mimeType: { type: 'string', example: 'application/pdf' },
                  uploadedBy: { $ref: '#/components/schemas/User' },
                  uploadedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ProjectAnalytics: {
          type: 'object',
          properties: {
            projectMetrics: { type: 'object' },
            taskStats: { type: 'array' },
            timeStats: { type: 'array' },
            progress: { type: 'number', example: 72 },
            isOverdue: { type: 'boolean', example: false },
            totalTasks: { type: 'number', example: 25 },
            completedTasks: { type: 'number', example: 18 },
            remainingTasks: { type: 'number', example: 7 }
          }
        },
        ProjectTimeline: {
          type: 'object',
          properties: {
            timeline: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'project_start' },
                  date: { type: 'string', format: 'date-time' },
                  title: { type: 'string', example: 'Project Started' },
                  description: { type: 'string', example: 'Project "Website Redesign" began' },
                  status: { type: 'string', enum: ['completed', 'pending', 'overdue'] },
                  taskId: { type: 'string', example: '507f1f77bcf86cd799439013' }
                }
              }
            },
            project: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Website Redesign' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                status: { type: 'string', example: 'active' }
              }
            }
          }
        },
        
        // Task schemas
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            title: { type: 'string', example: 'Design Homepage' },
            description: { type: 'string', example: 'Create modern homepage design' },
            status: { type: 'string', enum: ['todo', 'in-progress', 'review', 'testing', 'done', 'blocked'], example: 'in-progress' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'high' },
            type: { type: 'string', enum: ['feature', 'bug', 'improvement', 'task', 'story', 'epic'], example: 'feature' },
            assignedTo: { $ref: '#/components/schemas/User' },
            createdBy: { $ref: '#/components/schemas/User' },
            project: { $ref: '#/components/schemas/Project' },
            sprint: { $ref: '#/components/schemas/Sprint' },
            dueDate: { type: 'string', format: 'date-time' },
            estimatedHours: { type: 'number', example: 8 },
            actualHours: { type: 'number', example: 6 },
            storyPoints: { type: 'number', example: 5 },
            labels: { type: 'array', items: { type: 'string' }, example: ['frontend', 'design'] },
            tags: { type: 'array', items: { type: 'string' }, example: ['ui', 'responsive'] },
            acceptanceCriteria: { type: 'array', items: { type: 'string' }, example: ['Mobile responsive', 'Cross-browser compatible'] },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  content: { type: 'string', example: 'This task is progressing well' },
                  author: { $ref: '#/components/schemas/User' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            timeEntries: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' },
                  description: { type: 'string', example: 'Working on frontend implementation' },
                  startTime: { type: 'string', format: 'date-time' },
                  endTime: { type: 'string', format: 'date-time' },
                  duration: { type: 'number', example: 2.5 },
                  isRunning: { type: 'boolean', example: false }
                }
              }
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: { type: 'string', example: 'design-mockup.png' },
                  originalName: { type: 'string', example: 'Design Mockup.png' },
                  path: { type: 'string', example: '/uploads/design-mockup.png' },
                  size: { type: 'number', example: 512000 },
                  mimeType: { type: 'string', example: 'image/png' },
                  uploadedBy: { $ref: '#/components/schemas/User' },
                  uploadedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        TaskStatistics: {
          type: 'object',
          properties: {
            totalTasks: { type: 'number', example: 25 },
            completedTasks: { type: 'number', example: 18 },
            overdueTasks: { type: 'number', example: 3 },
            statusBreakdown: { type: 'array' },
            priorityBreakdown: { type: 'array' },
            completionRate: { type: 'number', example: 72 }
          }
        },
        
        // Sprint schemas
        Sprint: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
            name: { type: 'string', example: 'Sprint 1 - Foundation' },
            description: { type: 'string', example: 'Foundation and setup sprint' },
            status: { type: 'string', enum: ['planning', 'active', 'completed'], example: 'active' },
            project: { $ref: '#/components/schemas/Project' },
            startDate: { type: 'string', format: 'date', example: '2024-01-01' },
            endDate: { type: 'string', format: 'date', example: '2024-01-14' },
            goal: { type: 'string', example: 'Complete foundation setup' },
            tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // GDPR schemas
        Consent: {
          type: 'object',
          properties: {
            marketing: { type: 'boolean', example: true },
            analytics: { type: 'boolean', example: false },
            necessary: { type: 'boolean', example: true },
            thirdParty: { type: 'boolean', example: false }
          }
        },
        ConsentUpdate: {
          type: 'object',
          required: ['consentType', 'granted'],
          properties: {
            consentType: { type: 'string', enum: ['marketing', 'analytics', 'necessary', 'thirdParty'], example: 'marketing' },
            granted: { type: 'boolean', example: true }
          }
        },
        ConsentHistory: {
          type: 'object',
          properties: {
            consentType: { type: 'string', example: 'marketing' },
            granted: { type: 'boolean', example: true },
            timestamp: { type: 'string', format: 'date-time' },
            ipAddress: { type: 'string', example: '192.168.1.1' },
            userAgent: { type: 'string', example: 'Mozilla/5.0...' }
          }
        },
        
        // Pagination schema
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 25 },
            pages: { type: 'integer', example: 3 }
          }
        },
        
        // Error schemas
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: { type: 'array', items: { type: 'string' } }
          }
        },
        
        // Success response schema
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management, profiles, and GDPR compliance'
      },
      {
        name: 'Projects',
        description: 'Project management and analytics'
      },
      {
        name: 'Tasks',
        description: 'Task management, time tracking, and comments'
      },
      {
        name: 'Sprints',
        description: 'Agile sprint management'
      },
      {
        name: 'GDPR',
        description: 'GDPR compliance and data management'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
}

const specs = swaggerJsdoc(options)

module.exports = specs 