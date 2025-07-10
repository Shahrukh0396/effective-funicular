const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')

async function testAuthLogic() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    const davidWilson = await User.findOne({ email: 'david.wilson@linton.com' })
    
    console.log('\n🧪 TESTING AUTHORIZATION LOGIC')
    console.log('=' .repeat(50))
    
    console.log(`User role: "${davidWilson.role}"`)
    console.log(`Allowed roles: ["admin"]`)
    console.log(`Role included: ${["admin"].includes(davidWilson.role)}`)
    console.log(`Role === "admin": ${davidWilson.role === "admin"}`)
    console.log(`Role type: ${typeof davidWilson.role}`)
    console.log(`isSuperAccount: ${davidWilson.isSuperAccount}`)
    
    // Test the exact logic from the authorize middleware
    const roles = ['admin']
    const userRole = davidWilson.role
    
    console.log('\n🔍 AUTHORIZATION MIDDLEWARE LOGIC:')
    console.log(`roles.includes(userRole): ${roles.includes(userRole)}`)
    console.log(`userRole === 'super_admin': ${userRole === 'super_admin'}`)
    console.log(`davidWilson.isSuperAccount: ${davidWilson.isSuperAccount}`)
    
    // Super accounts have access to all roles
    if (userRole === 'super_admin' || davidWilson.isSuperAccount) {
      console.log('✅ Super account access granted')
    } else if (!roles.includes(userRole)) {
      console.log('❌ Access denied - role not in allowed list')
    } else {
      console.log('✅ Access granted')
    }

    await mongoose.disconnect()
    console.log('\n✅ Auth logic test completed!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testAuthLogic() 