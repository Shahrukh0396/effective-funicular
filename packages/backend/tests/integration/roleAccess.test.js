const request = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const app = require('../../src/app')
const User = require('../../src/models/User')
const Vendor = require('../../src/models/Vendor')
const Project = require('../../src/models/Project')
const Task = require('../../src/models/Task')

describe('Role-Based Access Control Integration Tests', () => {
  let testVendor, superAdmin, admin, employee, client
  let testProject, testTask

  beforeAll(async () => {
    // Ensure we're connected to the test database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test-auth')
    }
    
    // Clean up any existing test data first
    await User.deleteMany({})
    await Vendor.deleteMany({})
    await Project.deleteMany({})
    await Task.deleteMany({})

    // Create test vendor
    testVendor = new Vendor({
      companyName: 'Test Vendor',
      slug: 'test-vendor',
      email: 'contact@test-vendor.com',
      password: 'password123', // Don't hash manually - the model will do it
      contactPerson: {
        firstName: 'John',
        lastName: 'Doe'
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
      isSuperAccount: true,
      isActive: true,
      permissions: ['manage_users', 'manage_vendors', 'view_analytics', 'manage_billing']
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

    // Create test project
    testProject = new Project({
      name: 'Test Project',
      description: 'A test project for RBAC testing',
      vendor: testVendor._id,
      client: client._id, // Add the required client field
      createdBy: admin._id,
      status: 'in-progress', // Use valid status value
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
    await testProject.save()

    // Create test task
    testTask = new Task({
      title: 'Test Task',
      description: 'A test task for RBAC testing',
      project: testProject._id,
      vendor: testVendor._id, // Add the required vendor field
      createdBy: admin._id,
      status: 'todo', // Use valid status value
      priority: 'medium',
      type: 'task'
    })
    await testTask.save()
  })

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({})
    await Vendor.deleteMany({})
    await Project.deleteMany({})
    await Task.deleteMany({})
  })

  describe('User Management Access Control', () => {
    let superAdminToken, adminToken, employeeToken, clientToken

    beforeEach(async () => {
      // Ensure test data exists before login attempts
      const adminExists = await User.findOne({ email: 'admin@test-vendor.com' })
      if (!adminExists) {
        console.log('⚠️ Test data not found, recreating...')
        // Recreate test data if it doesn't exist
        const testVendor = await Vendor.findOne({ slug: 'test-vendor' })
        if (!testVendor) {
          throw new Error('Test vendor not found')
        }
        
        const admin = new User({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@test-vendor.com',
          password: 'password123',
          role: 'admin',
          vendor: testVendor._id,
          isActive: true,
          permissions: ['manage_users', 'view_analytics', 'write_projects']
        })
        await admin.save()
        
        const employee = new User({
          firstName: 'Employee',
          lastName: 'User',
          email: 'employee@test-vendor.com',
          password: 'password123',
          role: 'employee',
          vendor: testVendor._id,
          isActive: true,
          permissions: ['read_projects', 'write_tasks', 'view_analytics']
        })
        await employee.save()
        
        const client = new User({
          firstName: 'Client',
          lastName: 'User',
          email: 'client@test-vendor.com',
          password: 'password123',
          role: 'client',
          vendor: testVendor._id,
          isActive: true,
          permissions: ['read_projects', 'write_projects', 'view_analytics']
        })
        await client.save()
      }

      // Login all users
      const superAdminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'password123',
          portalType: 'super_admin',
          vendorDomain: 'test-vendor'
        })
      superAdminToken = superAdminResponse.body.data.accessToken

      const adminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test-vendor.com',
          password: 'password123',
          portalType: 'admin',
          vendorDomain: 'test-vendor'
        })
      adminToken = adminResponse.body.data.accessToken

      const employeeResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'employee@test-vendor.com',
          password: 'password123',
          portalType: 'employee',
          vendorDomain: 'test-vendor'
        })
      employeeToken = employeeResponse.body.data.accessToken

      const clientResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          portalType: 'client',
          vendorDomain: 'test-vendor'
        })
      clientToken = clientResponse.body.data.accessToken
    })

    describe('User CRUD Operations', () => {
      test('Super admin should be able to create users', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            firstName: 'New',
            lastName: 'User',
            email: 'newuser@test-vendor.com',
            password: 'password123',
            role: 'employee',
            company: 'Test Company',
            position: 'Developer'
          })

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
      })

      test('Admin should be able to create users', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            firstName: 'New',
            lastName: 'Employee',
            email: 'newemployee@test-vendor.com',
            password: 'password123',
            role: 'employee',
            company: 'Test Company',
            position: 'Developer'
          })

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
      })

      test('Admin should NOT be able to create admin users', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            firstName: 'New',
            lastName: 'Admin',
            email: 'newadmin@test-vendor.com',
            password: 'password123',
            role: 'admin',
            company: 'Test Company',
            position: 'Manager'
          })

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
      })

      test('Employee should NOT be able to create users', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            firstName: 'New',
            lastName: 'User',
            email: 'newuser@test-vendor.com',
            password: 'password123',
            role: 'employee',
            company: 'Test Company',
            position: 'Developer'
          })

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
      })

      test('Client should NOT be able to create users', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${clientToken}`)
          .send({
            firstName: 'New',
            lastName: 'User',
            email: 'newuser@test-vendor.com',
            password: 'password123',
            role: 'employee',
            company: 'Test Company',
            position: 'Developer'
          })

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
      })

      test('Super admin should be able to view all users', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${superAdminToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.users).toBeInstanceOf(Array)
        expect(response.body.data.users.length).toBeGreaterThan(0)
      })

      test('Admin should be able to view users in their vendor', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.users).toBeInstanceOf(Array)
      })

      test('Employee should NOT be able to view all users', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${employeeToken}`)

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
      })
    })

    describe('User Profile Access', () => {
      test('Users should be able to view their own profile', async () => {
        const response = await request(app)
          .get('/api/users/profile/me')
          .set('Authorization', `Bearer ${clientToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.user.email).toBe('client@test-vendor.com')
      })

      test('Users should be able to update their own profile', async () => {
        const response = await request(app)
          .put('/api/users/profile/me')
          .set('Authorization', `Bearer ${clientToken}`)
          .send({
            firstName: 'Updated',
            lastName: 'Client'
          })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
      })
    })
  })

  describe('Project Management Access Control', () => {
    let superAdminToken, adminToken, employeeToken, clientToken

    beforeEach(async () => {
      // Login all users
      const superAdminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'password123',
          portalType: 'super_admin',
          vendorDomain: 'test-vendor'
        })
      superAdminToken = superAdminResponse.body.data.accessToken

      const adminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test-vendor.com',
          password: 'password123',
          portalType: 'admin',
          vendorDomain: 'test-vendor'
        })
      adminToken = adminResponse.body.data.accessToken

      const employeeResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'employee@test-vendor.com',
          password: 'password123',
          portalType: 'employee',
          vendorDomain: 'test-vendor'
        })
      employeeToken = employeeResponse.body.data.accessToken

      const clientResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          portalType: 'client',
          vendorDomain: 'test-vendor'
        })
      clientToken = clientResponse.body.data.accessToken
    })

    describe('Project CRUD Operations', () => {
      test('Super admin should be able to create projects', async () => {
        const response = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            name: 'Super Admin Project',
            description: 'Project created by super admin',
            status: 'active',
            client: client._id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
      })

      test('Admin should be able to create projects', async () => {
        const response = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Admin Project',
            description: 'Project created by admin',
            status: 'active',
            client: client._id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
      })

      test('Client should be able to create projects', async () => {
        const response = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${clientToken}`)
          .send({
            name: 'Client Project',
            description: 'Project created by client',
            status: 'active',
            client: client._id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
      })

      test('Employee should NOT be able to create projects', async () => {
        const response = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            name: 'Employee Project',
            description: 'Project created by employee',
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
      })

      test('All users should be able to view projects', async () => {
        const users = [
          { token: superAdminToken, name: 'Super Admin' },
          { token: adminToken, name: 'Admin' },
          { token: employeeToken, name: 'Employee' },
          { token: clientToken, name: 'Client' }
        ]

        for (const user of users) {
          const response = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${user.token}`)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.projects).toBeInstanceOf(Array)
        }
      })
    })
  })

  describe('Task Management Access Control', () => {
    let superAdminToken, adminToken, employeeToken, clientToken

    beforeEach(async () => {
      // Login all users
      const superAdminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'password123',
          portalType: 'super_admin',
          vendorDomain: 'test-vendor'
        })
      superAdminToken = superAdminResponse.body.data.accessToken

      const adminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test-vendor.com',
          password: 'password123',
          portalType: 'admin',
          vendorDomain: 'test-vendor'
        })
      adminToken = adminResponse.body.data.accessToken

      const employeeResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'employee@test-vendor.com',
          password: 'password123',
          portalType: 'employee',
          vendorDomain: 'test-vendor'
        })
      employeeToken = employeeResponse.body.data.accessToken

      const clientResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          portalType: 'client',
          vendorDomain: 'test-vendor'
        })
      clientToken = clientResponse.body.data.accessToken
    })

    describe('Task CRUD Operations', () => {
      test('Super admin should be able to create tasks', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            title: 'Super Admin Task',
            description: 'Task created by super admin',
            project: testProject._id,
            assignedTo: employee._id,
            status: 'pending',
            priority: 'high'
          })

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
      })

      test('Admin should be able to create tasks', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: 'Admin Task',
            description: 'Task created by admin',
            project: testProject._id,
            assignedTo: employee._id,
            status: 'pending',
            priority: 'medium'
          })

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
      })

      test('Employee should be able to create tasks', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            title: 'Employee Task',
            description: 'Task created by employee',
            project: testProject._id,
            assignedTo: employee._id,
            status: 'pending',
            priority: 'low'
          })

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
      })

      test('Client should NOT be able to create tasks', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${clientToken}`)
          .send({
            title: 'Client Task',
            description: 'Task created by client',
            project: testProject._id,
            assignedTo: employee._id,
            status: 'pending',
            priority: 'medium'
          })

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
      })

      test('All users should be able to view tasks', async () => {
        const users = [
          { token: superAdminToken, name: 'Super Admin' },
          { token: adminToken, name: 'Admin' },
          { token: employeeToken, name: 'Employee' },
          { token: clientToken, name: 'Client' }
        ]

        for (const user of users) {
          const response = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${user.token}`)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.tasks).toBeInstanceOf(Array)
        }
      })
    })
  })

  describe('Admin Dashboard Access Control', () => {
    let superAdminToken, adminToken, employeeToken, clientToken

    beforeEach(async () => {
      // Login all users
      const superAdminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@test.com',
          password: 'password123',
          portalType: 'super_admin',
          vendorDomain: 'test-vendor'
        })
      superAdminToken = superAdminResponse.body.data.accessToken

      const adminResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test-vendor.com',
          password: 'password123',
          portalType: 'admin',
          vendorDomain: 'test-vendor'
        })
      adminToken = adminResponse.body.data.accessToken

      const employeeResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'employee@test-vendor.com',
          password: 'password123',
          portalType: 'employee',
          vendorDomain: 'test-vendor'
        })
      employeeToken = employeeResponse.body.data.accessToken

      const clientResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'client@test-vendor.com',
          password: 'password123',
          portalType: 'client',
          vendorDomain: 'test-vendor'
        })
      clientToken = clientResponse.body.data.accessToken
    })

    describe('Dashboard Access', () => {
      test('Super admin should be able to access admin dashboard', async () => {
        const response = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${superAdminToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveProperty('userStats')
        expect(response.body.data).toHaveProperty('sessionStats')
      })

      test('Admin should be able to access admin dashboard', async () => {
        const response = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${adminToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveProperty('userStats')
        expect(response.body.data).toHaveProperty('sessionStats')
      })

      test('Employee should be able to access admin dashboard', async () => {
        const response = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${employeeToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
      })

      test('Client should NOT be able to access admin dashboard', async () => {
        const response = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${clientToken}`)

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
      })
    })

    describe('Security Management', () => {
      test('Super admin should be able to view security overview', async () => {
        const response = await request(app)
          .get('/api/admin/security')
          .set('Authorization', `Bearer ${superAdminToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveProperty('securityStats')
        expect(response.body.data).toHaveProperty('suspiciousActivities')
      })

      test('Admin should be able to view security overview', async () => {
        const response = await request(app)
          .get('/api/admin/security')
          .set('Authorization', `Bearer ${adminToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
      })

      test('Employee should NOT be able to view security overview', async () => {
        const response = await request(app)
          .get('/api/admin/security')
          .set('Authorization', `Bearer ${employeeToken}`)

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
      })
    })
  })

  describe('Cross-Portal Access Control', () => {
    test('Users should only access appropriate portals', async () => {
      const testCases = [
        {
          user: { email: 'superadmin@test.com', password: 'password123' },
          allowedPortals: ['client', 'employee', 'admin', 'super_admin'],
          deniedPortals: []
        },
        {
          user: { email: 'admin@test-vendor.com', password: 'password123' },
          allowedPortals: ['employee', 'admin'],
          deniedPortals: ['client', 'super_admin']
        },
        {
          user: { email: 'employee@test-vendor.com', password: 'password123' },
          allowedPortals: ['employee'],
          deniedPortals: ['client', 'admin', 'super_admin']
        },
        {
          user: { email: 'client@test-vendor.com', password: 'password123' },
          allowedPortals: ['client'],
          deniedPortals: ['employee', 'admin', 'super_admin']
        }
      ]

      for (const testCase of testCases) {
        // Test allowed portals
        for (const portal of testCase.allowedPortals) {
          const response = await request(app)
            .post('/api/auth/login')
            .send({
              ...testCase.user,
              portalType: portal,
              vendorDomain: 'test-vendor'
            })

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
        }

        // Test denied portals
        for (const portal of testCase.deniedPortals) {
          const response = await request(app)
            .post('/api/auth/login')
            .send({
              ...testCase.user,
              portalType: portal,
              vendorDomain: 'test-vendor'
            })

          expect(response.status).toBe(403)
          expect(response.body.success).toBe(false)
        }
      }
    })
  })
}) 