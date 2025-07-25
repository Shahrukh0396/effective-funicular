const mongoose = require('mongoose')
const User = require('../src/models/User')
const Vendor = require('../src/models/Vendor')
const config = require('../src/config')

async function checkDatabase() {
  console.log('🔍 Checking Database...\n')

  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('✅ Connected to MongoDB')
    console.log(`   URI: ${config.mongoUri}`)
    
    // Check if users exist
    console.log('\n👥 Checking Users...')
    const users = await User.find({})
    console.log(`   Total users: ${users.length}`)
    
    // Check specific users
    const superAdmin = await User.findOne({ email: 'super.admin@linton.com' })
    if (superAdmin) {
      console.log('✅ Super admin exists')
      console.log(`   Role: ${superAdmin.role}`)
      console.log(`   Active: ${superAdmin.isActive}`)
      console.log(`   Email verified: ${superAdmin.emailVerified}`)
    } else {
      console.log('❌ Super admin not found')
    }
    
    const platformAdmin = await User.findOne({ email: 'admin@linton-tech.com' })
    if (platformAdmin) {
      console.log('✅ Platform admin exists')
      console.log(`   Role: ${platformAdmin.role}`)
      console.log(`   Vendor ID: ${platformAdmin.vendorId}`)
    } else {
      console.log('❌ Platform admin not found')
    }
    
    // Check vendors
    console.log('\n🏢 Checking Vendors...')
    const vendors = await Vendor.find({})
    console.log(`   Total vendors: ${vendors.length}`)
    
    vendors.forEach(vendor => {
      console.log(`   - ${vendor.name} (${vendor.domain}) - ${vendor.clientType}`)
    })
    
    // Check if super admin has vendor association
    if (superAdmin) {
      console.log('\n🔗 Checking Super Admin Vendor Association...')
      if (superAdmin.vendorId) {
        const vendor = await Vendor.findById(superAdmin.vendorId)
        if (vendor) {
          console.log(`   Super admin is associated with vendor: ${vendor.name}`)
        } else {
          console.log('   ❌ Super admin vendor not found')
        }
      } else {
        console.log('   Super admin has no vendor association (this is correct for super_admin role)')
      }
    }
    
    // Test password hashing
    console.log('\n🔐 Testing Password...')
    const bcrypt = require('bcryptjs')
    const testPassword = 'TestPass123!'
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    console.log('   Password hashing works')
    
    // Test login logic
    console.log('\n🔑 Testing Login Logic...')
    if (superAdmin) {
      const isPasswordValid = await bcrypt.compare(testPassword, superAdmin.password)
      console.log(`   Password validation: ${isPasswordValid}`)
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the check
checkDatabase() 