const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const jwt = require('jsonwebtoken')

async function testAuthMiddleware() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    const davidWilson = await User.findOne({ email: 'david.wilson@linton.com' })
    
    console.log('\n🧪 TESTING AUTH MIDDLEWARE FLOW')
    console.log('=' .repeat(50))
    
    // Step 1: Generate token
    const token = davidWilson.generateAuthToken()
    console.log(`\n🔑 Generated token: ${token.substring(0, 50)}...`)
    
    // Step 2: Decode token (simulate auth middleware)
    const decoded = jwt.verify(token, config.jwtSecret)
    console.log('\n🔍 Decoded token:')
    console.log(`   userId: ${decoded.userId}`)
    console.log(`   email: ${decoded.email}`)
    console.log(`   role: ${decoded.role}`)
    
    // Step 3: Find user (simulate auth middleware)
    const user = await User.findById(decoded.userId).select('-password')
    console.log('\n👤 Found user:')
    console.log(`   ID: ${user._id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   isActive: ${user.isActive}`)
    
    // Step 4: Test authorization (simulate authorize middleware)
    console.log('\n🔐 Testing authorization:')
    const roles = ['admin']
    const userRole = user.role
    
    console.log(`   User role: "${userRole}"`)
    console.log(`   Allowed roles: ${JSON.stringify(roles)}`)
    console.log(`   roles.includes(userRole): ${roles.includes(userRole)}`)
    console.log(`   userRole === 'super_admin': ${userRole === 'super_admin'}`)
    console.log(`   user.isSuperAccount: ${user.isSuperAccount}`)
    
    // Super accounts have access to all roles
    if (userRole === 'super_admin' || user.isSuperAccount) {
      console.log('   ✅ Super account access granted')
    } else if (!roles.includes(userRole)) {
      console.log('   ❌ Access denied - role not in allowed list')
    } else {
      console.log('   ✅ Access granted')
    }

    await mongoose.disconnect()
    console.log('\n✅ Auth middleware test completed!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testAuthMiddleware() 