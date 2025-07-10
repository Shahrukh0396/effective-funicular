const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')
const config = require('../src/config')

async function resetUserPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    // Fetch all users
    const users = await User.find({}, 'email role firstName lastName isActive')
    console.log(`📊 Found ${users.length} users in database`)

    const newPassword = 'TestPass123!'
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    console.log('\n🔐 RESETTING USER PASSWORDS')
    console.log('=' .repeat(60))

    let successCount = 0
    let failCount = 0

    // Reset password for each user
    for (const user of users) {
      try {
        await User.findByIdAndUpdate(user._id, {
          password: hashedPassword
        })
        
        console.log(`✅ Reset password for: ${user.firstName} ${user.lastName} (${user.email})`)
        console.log(`   Role: ${user.role}`)
        console.log(`   New Password: ${newPassword}`)
        successCount++
        
      } catch (error) {
        console.log(`❌ Failed to reset password for: ${user.email}`)
        console.log(`   Error: ${error.message}`)
        failCount++
      }
    }

    console.log('\n' + '=' .repeat(60))
    console.log('📊 PASSWORD RESET RESULTS')
    console.log('=' .repeat(60))
    console.log(`✅ Successful resets: ${successCount}`)
    console.log(`❌ Failed resets: ${failCount}`)
    console.log(`📈 Success rate: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`)

    if (successCount > 0) {
      console.log('\n🎉 PASSWORD RESET COMPLETED!')
      console.log(`\n📋 TEST CREDENTIALS:`)
      console.log(`Password for all users: ${newPassword}`)
      console.log('\n🌐 Portal URLs:')
      console.log('Client Portal: http://localhost:5173')
      console.log('Employee Portal: http://localhost:5174')
      console.log('Admin Panel: http://localhost:5175')
    }

    await mongoose.disconnect()
    console.log('\n✅ Password reset completed!')

  } catch (error) {
    console.error('❌ Error during password reset:', error)
    process.exit(1)
  }
}

// Run the password reset
resetUserPasswords() 