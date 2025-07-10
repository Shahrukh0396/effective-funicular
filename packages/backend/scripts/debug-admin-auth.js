const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const jwt = require('jsonwebtoken')
const axios = require('axios')

async function debugAdminAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    console.log('\n🔍 DEBUGGING ADMIN AUTHORIZATION')
    console.log('=' .repeat(60))

    // Get David Wilson
    const davidWilson = await User.findOne({ email: 'david.wilson@linton.com' })
    console.log('\n👤 David Wilson Details:')
    console.log(`   ID: ${davidWilson._id}`)
    console.log(`   Role: ${davidWilson.role}`)
    console.log(`   Permissions: ${davidWilson.permissions.join(', ')}`)
    console.log(`   isSuperAccount: ${davidWilson.isSuperAccount}`)

    // Generate token manually
    const token = davidWilson.generateAuthToken()
    console.log(`\n🔑 Generated Token: ${token.substring(0, 50)}...`)

    // Decode token to verify contents
    const decoded = jwt.verify(token, config.jwtSecret)
    console.log('\n🔍 Decoded Token:')
    console.log(`   userId: ${decoded.userId}`)
    console.log(`   email: ${decoded.email}`)
    console.log(`   role: ${decoded.role}`)

    // Test login
    console.log('\n🧪 Testing Login...')
    const loginResponse = await axios.post('http://localhost:3000/api/employee/login', {
      email: 'david.wilson@linton.com',
      password: 'TestPass123!'
    })

    if (loginResponse.data.token) {
      console.log('✅ Login successful')
      const loginToken = loginResponse.data.token
      
      // Test admin projects endpoint
      console.log('\n🧪 Testing Admin Projects Endpoint...')
      try {
        const projectsResponse = await axios.get('http://localhost:3000/api/admin/projects', {
          headers: { Authorization: `Bearer ${loginToken}` }
        })
        console.log('✅ Admin projects endpoint works!')
        console.log(`   Found ${projectsResponse.data.length} projects`)
      } catch (error) {
        console.log('❌ Admin projects endpoint failed:')
        console.log(`   Status: ${error.response?.status}`)
        console.log(`   Message: ${error.response?.data?.message}`)
        console.log(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`)
      }

      // Test admin sprints endpoint
      console.log('\n🧪 Testing Admin Sprints Endpoint...')
      try {
        const sprintsResponse = await axios.get('http://localhost:3000/api/admin/sprints', {
          headers: { Authorization: `Bearer ${loginToken}` }
        })
        console.log('✅ Admin sprints endpoint works!')
        console.log(`   Found ${sprintsResponse.data.length} sprints`)
      } catch (error) {
        console.log('❌ Admin sprints endpoint failed:')
        console.log(`   Status: ${error.response?.status}`)
        console.log(`   Message: ${error.response?.data?.message}`)
        console.log(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`)
      }

    } else {
      console.log('❌ Login failed')
    }

    await mongoose.disconnect()
    console.log('\n✅ Debug completed!')

  } catch (error) {
    console.error('❌ Error during debug:', error)
    process.exit(1)
  }
}

// Run the debug
debugAdminAuth() 