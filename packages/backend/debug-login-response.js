const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const config = require('./src/config')
const User = require('./src/models/User')
const Vendor = require('./src/models/Vendor')

async function debugLoginResponses() {
  try {
    // Connect to test database
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    const request = require('supertest')
    const app = require('./src/app')

    console.log('Setting up test data...')

    // Clean up any existing test data first
    await User.deleteMany({})
    await Vendor.deleteMany({})

    // Create test vendor
    const testVendor = new Vendor({
      companyName: 'Test Vendor',
      slug: 'test-vendor',
      email: 'contact@test-vendor.com',
      password: 'password123',
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
    const superAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@test.com',
      password: 'password123',
      role: 'super_admin',
      isSuperAccount: true,
      isActive: true,
      permissions: ['manage_users', 'manage_vendors', 'view_analytics', 'manage_billing']
    })
    await superAdmin.save()

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

    console.log('Test data created successfully!')
    console.log('Testing login responses for each user...')

    const testCases = [
      {
        name: 'Super Admin',
        email: 'superadmin@test.com',
        password: 'password123',
        portalType: 'super_admin',
        vendorDomain: 'test-vendor'
      },
      {
        name: 'Admin',
        email: 'admin@test-vendor.com',
        password: 'password123',
        portalType: 'admin',
        vendorDomain: 'test-vendor'
      },
      {
        name: 'Employee',
        email: 'employee@test-vendor.com',
        password: 'password123',
        portalType: 'employee',
        vendorDomain: 'test-vendor'
      },
      {
        name: 'Client',
        email: 'client@test-vendor.com',
        password: 'password123',
        portalType: 'client',
        vendorDomain: 'test-vendor'
      }
    ]

    for (const testCase of testCases) {
      console.log(`\n--- Testing ${testCase.name} ---`)
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(testCase)

      console.log(`Status: ${response.status}`)
      console.log(`Body:`, JSON.stringify(response.body, null, 2))
      
      if (response.status === 200) {
        console.log('✅ Login successful')
      } else {
        console.log('❌ Login failed')
      }
    }

    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

debugLoginResponses() 