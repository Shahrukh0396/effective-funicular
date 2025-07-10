const mongoose = require('mongoose')
const User = require('../src/models/User')
const config = require('../src/config')

async function updateAdminToSuper() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('Connected to MongoDB')
    
    // Find the existing admin user
    const adminUser = await User.findOne({ email: 'admin@linton.com' })
    if (!adminUser) {
      console.error('Admin user not found')
      process.exit(1)
    }
    
    console.log('Found admin user:', adminUser.email)
    
    // Update the admin user to have super account privileges
    adminUser.role = 'super_admin'
    adminUser.isSuperAccount = true
    adminUser.permissions = [
      'read_projects',
      'write_projects',
      'delete_projects',
      'read_tasks',
      'write_tasks',
      'delete_tasks',
      'manage_users',
      'manage_billing',
      'view_analytics'
    ]
    
    await adminUser.save()
    
    console.log('✅ Admin user updated to super admin!')
    console.log('Email:', adminUser.email)
    console.log('Password: TestPass123!')
    console.log('Role: super_admin')
    console.log('isSuperAccount: true')
    
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error updating admin user:', error)
    process.exit(1)
  }
}

updateAdminToSuper() 