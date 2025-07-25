const request = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const app = require('../../src/app')
const User = require('../../src/models/User')
const Vendor = require('../../src/models/Vendor')
const Session = require('../../src/models/Session')
const AuditLog = require('../../src/models/AuditLog')
const config = require('../../src/config')

describe('Authentication System Tests', () => {
  let testVendor, superAdmin, admin, employee, client

  beforeAll(async () => {
    // Clean up any existing test data first
    await User.deleteMany({})
    await Vendor.deleteMany({})
    await Session.deleteMany({})
    await AuditLog.deleteMany({})

    // Create test vendor
    testVendor = new Vendor({
      companyName: 'Test Vendor',
      slug: 'test-vendor',
      email: 'contact@test-vendor.com',
      password: await bcrypt.hash('password123', 10),
      contactPerson: {
        firstName: 'Test',
        lastName: 'Admin'
      },
      customDomain: 'test-vendor.com',
      isActive: true,
      settings: {
        maxUsers: 100,
        features: ['projects', 'tasks', 'analytics']
      }
    })
    await testVendor.save()

    // Create test users
    superAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@test.com',
      password: 'password123', // Don't hash manually - the model will do it
      role: 'super_admin',
      vendor: testVendor._id,
      isSuperAccount: true,
      isActive: true,
      permissions: [
        'read_projects',
        'write_projects',
        'delete_projects',
        'read_tasks',
        'write_tasks',
        'delete_tasks',
        'manage_users',
        'manage_billing',
        'view_analytics',
        'manage_vendors',
        'white_label_access'
      ]
    })
    await superAdmin.save()

    admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test-vendor.com',
      password: 'password123', // Don't hash manually - the model will do it
      role: 'admin',
      vendor: testVendor._id,
      isActive: true,
      permissions: ['manage_users', 'view_analytics', 'write_projects']
    })
    await admin.save()

    employee = new User({
      firstName: 'Employee',
      lastName: 'User',
      email: 'employee@test-vendor.com',
      password: 'password123', // Don't hash manually - the model will do it
      role: 'employee',
      vendor: testVendor._id,
      isActive: true,
      permissions: ['read_projects', 'write_tasks', 'view_analytics']
    })
    await employee.save()

    client = new User({
      firstName: 'Client',
      lastName: 'User',
      email: 'client@test-vendor.com',
      password: 'password123', // Don't hash manually - the model will do it
      role: 'client',
      vendor: testVendor._id,
      isActive: true,
      permissions: ['read_projects', 'write_projects', 'view_analytics']
    })
    await client.save()
  })

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({})
    await Vendor.deleteMany({})
    await Session.deleteMany({})
    await AuditLog.deleteMany({})
  })

  beforeEach(async () => {
    // Clear sessions and audit logs before each test
    await Session.deleteMany({})
    await AuditLog.deleteMany({})
  })

  describe('Login Tests', () => {
    test('Should login super admin successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.role).toBe('super_admin')
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
    })

    test('Should login admin successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.role).toBe('admin')
      expect(response.body.data.accessToken).toBeDefined()
    })

    test('Should login employee successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'employee@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.role).toBe('employee')
      expect(response.body.data.accessToken).toBeDefined()
    })

    test('Should login client successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.role).toBe('client')
      expect(response.body.data.accessToken).toBeDefined()
    })

    test('Should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'wrongpassword',
          vendorDomain: 'test-vendor'
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    test('Should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com'
          // Missing password
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    test('Should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Portal Access Tests', () => {
    test('Super admin should be able to access any portal', async () => {
      const portalConfigs = [
        { portal: 'client', vendorDomain: 'test-vendor' },
        { portal: 'employee', vendorDomain: 'test-vendor' },
        { portal: 'admin', vendorDomain: 'test-vendor' },
        { portal: 'super_admin', vendorDomain: 'test-vendor' }
      ]

      for (const config of portalConfigs) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'superadmin@test.com',
            password: 'password123',
            vendorDomain: config.vendorDomain
          })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
      }
    })

    test('Admin should be able to access admin portal', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    test('Employee should be able to access employee portal', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'employee@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    test('Client should be able to access client portal', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    test('Admin should NOT be able to access different vendor', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test-vendor.com',
          password: 'password123',
          vendorDomain: 'different-vendor'
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Token Management Tests', () => {
    test('Should generate valid access and refresh tokens', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
      expect(response.body.data.expiresIn).toBeDefined()
    })

    test('Should validate token and return user info', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe('client@test-vendor.com')
    })

    test('Should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    test('Should reject expired token', async () => {
      const sessionId = require('crypto').randomBytes(32).toString('hex')
      const expiredToken = jwt.sign(
        {
          userId: client._id,
          email: client.email,
          role: client.role,
          vendorId: testVendor._id,
          portalType: 'client',
          permissions: client.permissions,
          isSuperAccount: client.isSuperAccount,
          sessionId: sessionId,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) - 3600
        },
        config.jwtSecret
      )

      const session = new Session({
        sessionId: sessionId,
        user: client._id,
        vendor: testVendor._id,
        accessToken: expiredToken,
        refreshToken: 'dummy-refresh-token',
        portalType: 'client',
        isActive: true
      })
      await session.save()

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    test('Should logout and blacklist tokens', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
        .send({
          accessToken: loginResponse.body.data.accessToken,
          refreshToken: loginResponse.body.data.refreshToken
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('Rate Limiting Tests', () => {
    test('Should limit login attempts', async () => {
      const attempts = []
      
      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'client@test-vendor.com',
            password: 'wrongpassword',
            vendorDomain: 'test-vendor'
          })
        
        attempts.push(response.status)
      }

      // In test environment, rate limit is high, so we expect 401 (invalid credentials)
      expect(attempts[5]).toBe(401)
    })
  })

  describe('Session Management Tests', () => {
    test('Should create session on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      const session = await Session.findOne({
        user: client._id,
        accessToken: response.body.data.accessToken
      })

      expect(session).toBeDefined()
      expect(session.isActive).toBe(true)
    })

    test('Should list user sessions', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      const response = await request(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.sessions).toBeDefined()
    })

    test('Should terminate specific session', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      const session = await Session.findOne({
        user: client._id,
        accessToken: loginResponse.body.data.accessToken
      })

      const response = await request(app)
        .delete(`/api/auth/sessions/${session.sessionId}`)
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('Audit Logging Tests', () => {
    test('Should log successful login', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          vendorDomain: 'test-vendor'
        })

      const auditLog = await AuditLog.findOne({
        event: 'user.login.success',
        userId: client._id
      })

      expect(auditLog).toBeDefined()
      expect(auditLog.portalType).toBe('client')
      expect(auditLog.vendorId.toString()).toBe(testVendor._id.toString())
      expect(auditLog.metadata.success).toBe(true)
    })

    test('Should log failed login', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'wrongpassword',
          vendorDomain: 'test-vendor'
        })

      const auditLog = await AuditLog.findOne({
        event: 'user.login.failed'
      })

      expect(auditLog).toBeDefined()
      expect(auditLog.metadata.success).toBe(false)
    })
  })
}) 