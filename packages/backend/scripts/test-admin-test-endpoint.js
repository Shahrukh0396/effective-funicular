const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const axios = require('axios')

async function testAdminTestEndpoint() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    console.log('\n🧪 TESTING ADMIN TEST ENDPOINT')
    console.log('=' .repeat(50))

    // Get David Wilson and generate token
    const davidWilson = await User.findOne({ email: 'david.wilson@linton.com' })
    const token = davidWilson.generateAuthToken()
    
    console.log('👤 David Wilson token generated')
    console.log(`🔑 Token: ${token.substring(0, 50)}...`)

    // Test admin test endpoint
    console.log('\n🔍 Testing admin test endpoint...')
    try {
      const response = await axios.get('http://localhost:3000/api/admin/test', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('✅ Admin test endpoint works!')
      console.log('   Response:', response.data)
    } catch (error) {
      console.log('❌ Admin test endpoint failed:')
      console.log(`   Status: ${error.response?.status}`)
      console.log(`   Message: ${error.response?.data?.message}`)
    }

    await mongoose.disconnect()
    console.log('\n✅ Test completed!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testAdminTestEndpoint() 