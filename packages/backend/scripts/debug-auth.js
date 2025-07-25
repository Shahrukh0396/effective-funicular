const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function debugAuth() {
  console.log('🔍 Debugging Authentication...\n')

  try {
    // Test 1: Check if server is responding
    console.log('1️⃣ Testing server connectivity...')
    try {
      const healthCheck = await axios.get('http://localhost:3000/health')
      console.log('✅ Server is responding')
      console.log('   Response:', healthCheck.data)
    } catch (error) {
      console.log('❌ Server not responding:', error.message)
      return
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 2: Test login with detailed error
    console.log('2️⃣ Testing Super Admin Login with detailed error...')
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'super.admin@linton.com',
        password: 'TestPass123!'
      })
      
      console.log('✅ Login successful')
      console.log('   Response:', JSON.stringify(loginResponse.data, null, 2))
      
    } catch (error) {
      console.log('❌ Login failed')
      console.log('   Status:', error.response?.status)
      console.log('   Message:', error.response?.data?.message)
      console.log('   Full error:', error.response?.data)
      
      if (error.response?.status === 500) {
        console.log('\n🔍 Server error details:')
        console.log('   This might be a database connection issue or model validation error')
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

// Run the debug
debugAuth() 