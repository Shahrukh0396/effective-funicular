const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function testAdminLogin() {
  console.log('🧪 Testing Admin Panel Login...\n')

  try {
    // Test platform admin login (Linton Tech LLC)
    console.log('1️⃣ Testing Platform Admin Login...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@linton-tech.com',
      password: 'TestPass123!',
      portalType: 'admin'
    })
    
    if (loginResponse.data.success) {
      console.log('✅ Platform Admin login successful')
      console.log(`   User ID: ${loginResponse.data.data.user.id}`)
      console.log(`   Role: ${loginResponse.data.data.user.role}`)
      console.log(`   Email: ${loginResponse.data.data.user.email}`)
      console.log(`   Vendor: ${loginResponse.data.data.user.vendorId?.name || 'N/A'}`)
      console.log(`   Token: ${loginResponse.data.data.accessToken.substring(0, 50)}...`)
      
      const token = loginResponse.data.data.accessToken
      
      // Test the /me endpoint
      console.log('\n2️⃣ Testing /me endpoint...')
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (meResponse.data.success) {
        console.log('✅ /me endpoint works')
        console.log(`   User: ${meResponse.data.data.user.email}`)
      } else {
        console.log('❌ /me endpoint failed')
      }
      
    } else {
      console.log('❌ Platform Admin login failed')
      console.log('   Response:', loginResponse.data)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Data:', error.response.data)
    }
  }
}

// Run the test
testAdminLogin() 