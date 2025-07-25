const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function debugEmployeeLogin() {
  console.log('🔍 Debugging Employee Login Process...\n')

  try {
    // Test 1: Basic login without portalType
    console.log('1️⃣ Testing login WITHOUT portalType...')
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'alex.chen@acmecorp.com',
        password: 'TestPass123!'
      })
      console.log('   ✅ Login successful without portalType')
      console.log('   Response:', JSON.stringify(response.data, null, 2))
    } catch (error) {
      console.log('   ❌ Login failed without portalType')
      console.log('   Error:', error.response?.data || error.message)
    }

    console.log('\n2️⃣ Testing login WITH portalType: employee...')
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'alex.chen@acmecorp.com',
        password: 'TestPass123!',
        portalType: 'employee'
      })
      console.log('   ✅ Login successful with portalType: employee')
      console.log('   Response:', JSON.stringify(response.data, null, 2))
      
      const token = response.data.data.accessToken
      
      console.log('\n3️⃣ Testing /me endpoint with token...')
      try {
        const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('   ✅ /me endpoint works')
        console.log('   User data:', JSON.stringify(meResponse.data, null, 2))
      } catch (error) {
        console.log('   ❌ /me endpoint failed')
        console.log('   Error:', error.response?.data || error.message)
      }
      
    } catch (error) {
      console.log('   ❌ Login failed with portalType: employee')
      console.log('   Status:', error.response?.status)
      console.log('   Error:', error.response?.data || error.message)
    }

    console.log('\n4️⃣ Testing with different employee...')
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'maria.garcia@acmecorp.com',
        password: 'TestPass123!',
        portalType: 'employee'
      })
      console.log('   ✅ Maria login successful')
      console.log('   Role:', response.data.data.user.role)
      console.log('   Vendor:', response.data.data.user.vendorId)
    } catch (error) {
      console.log('   ❌ Maria login failed')
      console.log('   Error:', error.response?.data || error.message)
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

// Run the debug
debugEmployeeLogin() 