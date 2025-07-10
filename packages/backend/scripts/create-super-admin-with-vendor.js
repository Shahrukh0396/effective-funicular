const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')
const Vendor = require('../src/models/Vendor')
const config = require('../src/config')

async function createSuperAdminWithVendor() {
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
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' })
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email)
      console.log('Email:', existingSuperAdmin.email)
      console.log('Password: SuperAdmin123!')
      process.exit(0)
    }
    
    // Create super admin account
    const superAdminPassword = 'SuperAdmin123!'
    const superAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@linton.com',
      password: superAdminPassword,
      role: 'super_admin',
      vendor: vendor._id,
      isActive: true,
      isEmailVerified: true,
      isSuperAccount: true,
      permissions: [
        'read_projects',
        'write_projects',
        'delete_projects',
        'read_tasks',
        'write_tasks',
        'delete_tasks',
        'manage_users',
        'manage_billing',
        'view_analytics'
      ],
      company: 'Linton Systems',
      position: 'Super Administrator',
      gdpr: {
        consent: {
          marketing: true,
          analytics: true,
          necessary: true,
          thirdParty: false
        }
      }
    })
    
    await superAdmin.save()
    
    console.log('✅ Super admin created successfully!')
    console.log('Email:', superAdmin.email)
    console.log('Password:', superAdminPassword)
    console.log('Role: super_admin')
    console.log('isSuperAccount: true')
    console.log('\n⚠️  Please change the password after first login!')
    
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error)
    process.exit(1)
  }
}

createSuperAdminWithVendor() 