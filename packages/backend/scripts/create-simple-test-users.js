const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')
const Vendor = require('../src/models/Vendor')
const config = require('../src/config')

async function createSimpleTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('Connected to MongoDB')
    
    // Get the existing vendor
    const vendor = await Vendor.findOne()
    if (!vendor) {
      console.error('No vendor found in database')
      process.exit(1)
    }
    
    console.log(`Using vendor: ${vendor.companyName} (${vendor._id})`)
    
    // Create test client
    const clientPassword = 'TestPass123!'
    const client = new User({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@acmecorp.com',
      password: clientPassword,
      role: 'client',
      company: 'Acme Corporation',
      position: 'CTO',
      vendor: vendor._id,
      isActive: true,
      isEmailVerified: true,
      gdpr: {
        consent: {
          marketing: true,
          analytics: true,
          necessary: true,
          thirdParty: false
        }
      }
    })
    
    await client.save()
    console.log(`✅ Created client: ${client.firstName} ${client.lastName} (${client.email})`)
    
    // Create test employee
    const employeePassword = 'TestPass123!'
    const employee = new User({
      firstName: 'Alex',
      lastName: 'Chen',
      email: 'alex.chen@linton.com',
      password: employeePassword,
      role: 'employee',
      company: 'Linton Systems',
      position: 'Senior Developer',
      vendor: vendor._id,
      isActive: true,
      isEmailVerified: true,
      permissions: ['read_projects', 'read_tasks', 'write_tasks'],
      gdpr: {
        consent: {
          marketing: true,
          analytics: true,
          necessary: true,
          thirdParty: false
        }
      }
    })
    
    await employee.save()
    console.log(`✅ Created employee: ${employee.firstName} ${employee.lastName} (${employee.email})`)
    
    // Create admin user
    const adminPassword = 'TestPass123!'
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@linton.com',
      password: adminPassword,
      role: 'admin',
      company: 'Linton Systems',
      position: 'System Administrator',
      vendor: vendor._id,
      isActive: true,
      isEmailVerified: true,
      permissions: ['read_projects', 'write_projects', 'delete_projects', 'read_tasks', 'write_tasks', 'delete_tasks', 'manage_users', 'manage_billing', 'view_analytics'],
      gdpr: {
        consent: {
          marketing: true,
          analytics: true,
          necessary: true,
          thirdParty: false
        }
      }
    })
    
    await admin.save()
    console.log(`✅ Created admin: ${admin.firstName} ${admin.lastName} (${admin.email})`)
    
    console.log('\n📋 Test Credentials:')
    console.log('====================')
    console.log('\n🔵 CLIENT PORTAL:')
    console.log(`Email: ${client.email}`)
    console.log(`Password: ${clientPassword}`)
    console.log(`Company: ${client.company}`)
    console.log(`Role: ${client.role}`)
    
    console.log('\n🟢 EMPLOYEE PORTAL:')
    console.log(`Email: ${employee.email}`)
    console.log(`Password: ${employeePassword}`)
    console.log(`Company: ${employee.company}`)
    console.log(`Role: ${employee.role}`)
    
    console.log('\n🔴 ADMIN PANEL:')
    console.log(`Email: ${admin.email}`)
    console.log(`Password: ${adminPassword}`)
    console.log(`Company: ${admin.company}`)
    console.log(`Role: ${admin.role}`)
    
    console.log('\n🌐 Portal URLs:')
    console.log('Client Portal: http://localhost:5173')
    console.log('Employee Portal: http://localhost:5174')
    console.log('Admin Panel: http://localhost:5175')
    
    await mongoose.disconnect()
    console.log('\n✅ Test users created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating test users:', error)
    process.exit(1)
  }
}

createSimpleTestUsers() 