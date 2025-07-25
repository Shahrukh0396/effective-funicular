const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function testSuperAdminLogin() {
  console.log('🧪 Testing Super Admin Login for Frontend...\n')

  try {
    // Test the exact endpoint that the super admin panel uses
    console.log('1️⃣ Testing Super Admin Login with portalType...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'super.admin@linton.com',
      password: 'TestPass123!',
      portalType: 'super_admin'
    })
    
    if (loginResponse.data.success) {
      console.log('✅ Super Admin login successful')
      console.log(`   User ID: ${loginResponse.data.data.user.id}`)
      console.log(`   Role: ${loginResponse.data.data.user.role}`)
      console.log(`   Email: ${loginResponse.data.data.user.email}`)
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
      console.log('❌ Super Admin login failed')
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
testSuperAdminLogin() 