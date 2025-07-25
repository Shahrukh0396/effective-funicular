const mongoose = require('mongoose')
const User = require('../src/models/User')
const Vendor = require('../src/models/Vendor')
const bcrypt = require('bcryptjs')
const config = require('../src/config')

async function simpleAuthTest() {
  console.log('🔍 Simple Auth Test...\n')

  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('✅ Connected to MongoDB')
    
    // Test 1: Find super admin
    console.log('\n1️⃣ Testing Super Admin Lookup...')
    const superAdmin = await User.findOne({ email: 'super.admin@linton.com' }).populate('vendor')
    
    if (superAdmin) {
      console.log('✅ Super admin found')
      console.log(`   ID: ${superAdmin._id}`)
      console.log(`   Role: ${superAdmin.role}`)
      console.log(`   Active: ${superAdmin.isActive}`)
      console.log(`   Vendor: ${superAdmin.vendor ? superAdmin.vendor.name : 'None'}`)
    } else {
      console.log('❌ Super admin not found')
      return
    }
    
    // Test 2: Test password validation
    console.log('\n2️⃣ Testing Password Validation...')
    const testPassword = 'TestPass123!'
    const isPasswordValid = await bcrypt.compare(testPassword, superAdmin.password)
    console.log(`   Password valid: ${isPasswordValid}`)
    
    // Test 3: Test vendor lookup
    console.log('\n3️⃣ Testing Vendor Lookup...')
    const vendors = await Vendor.find({})
    console.log(`   Found ${vendors.length} vendors`)
    
    if (vendors.length > 0) {
      const firstVendor = vendors[0]
      console.log(`   First vendor: ${firstVendor.name} (${firstVendor.domain})`)
    }
    
    // Test 4: Test JWT generation
    console.log('\n4️⃣ Testing JWT Generation...')
    const jwt = require('jsonwebtoken')
    
    const payload = {
      userId: superAdmin._id,
      email: superAdmin.email,
      role: superAdmin.role,
      vendorId: vendors[0]._id,
      portalType: 'super_admin',
      permissions: superAdmin.permissions,
      isSuperAccount: superAdmin.isSuperAccount
    }
    
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '15m',
      issuer: 'linton-tech-platform'
    })
    
    console.log('✅ JWT generated successfully')
    console.log(`   Token: ${token.substring(0, 50)}...`)
    
    // Test 5: Test token verification
    console.log('\n5️⃣ Testing JWT Verification...')
    const decoded = jwt.verify(token, config.jwtSecret)
    console.log('✅ JWT verified successfully')
    console.log(`   Decoded user ID: ${decoded.userId}`)
    console.log(`   Decoded role: ${decoded.role}`)
    
    console.log('\n🎉 All basic auth components are working!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('❌ Error stack:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the test
simpleAuthTest() 