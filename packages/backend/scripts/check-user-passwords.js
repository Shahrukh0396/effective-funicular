const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')

async function checkUserPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    // Fetch all users with their password hashes
    const users = await User.find({}, 'email role firstName lastName password isActive')
    console.log(`📊 Found ${users.length} users in database`)

    console.log('\n🔍 USER PASSWORD ANALYSIS')
    console.log('=' .repeat(60))

    for (const user of users) {
      console.log(`\n👤 ${user.firstName} ${user.lastName} (${user.email})`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`)
      console.log(`   Hash Length: ${user.password.length} characters`)
      
      // Try to determine password pattern
      const name = user.email.split('@')[0]
      const parts = name.split('.')
      if (parts.length === 2) {
        const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
        console.log(`   Expected Pattern 1: ${firstName}${lastName}123!`)
      }
      console.log(`   Expected Pattern 2: TestPass123!`)
    }

    console.log('\n' + '=' .repeat(60))
    console.log('💡 SUGGESTIONS:')
    console.log('1. Check if users were created with different password patterns')
    console.log('2. Try common passwords like: password, 123456, admin, etc.')
    console.log('3. Reset passwords for testing using the User model')
    console.log('4. Check if there are any password reset tokens')

    await mongoose.disconnect()
    console.log('\n✅ Password analysis completed!')

  } catch (error) {
    console.error('❌ Error during password analysis:', error)
    process.exit(1)
  }
}

// Run the analysis
checkUserPasswords() 