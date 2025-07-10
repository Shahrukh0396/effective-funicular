const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')
const config = require('../src/config')

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('Connected to MongoDB')
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' })
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email)
      process.exit(0)
    }
    
    // Create super admin account
    const superAdminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@linton.com',
      password: 'SuperAdmin123!',
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
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
      position: 'Super Administrator'
    }
    
    // Password will be hashed by the pre-save middleware
    
    // Create super admin
    const superAdmin = new User(superAdminData)
    await superAdmin.save()
    
    console.log('✅ Super admin created successfully!')
    console.log('Email:', superAdminData.email)
    console.log('Password:', 'SuperAdmin123!')
    console.log('\n⚠️  Please change the password after first login!')
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the script
createSuperAdmin() 