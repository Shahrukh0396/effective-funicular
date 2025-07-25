const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function testEmployeeSpecificLogin() {
  console.log('🧪 Testing Employee-Specific Login Endpoint...\n')

  try {
    console.log('1️⃣ Testing /api/employee/login...')
    const response = await axios.post(`${BASE_URL}/employee/login`, {
      email: 'alex.chen@acmecorp.com',
      password: 'TestPass123!'
    })
    
    console.log('✅ Employee-specific login successful')
    console.log('Response:', JSON.stringify(response.data, null, 2))
    
    const token = response.data.token
    
    console.log('\n2️⃣ Testing /api/employee/me...')
    const meResponse = await axios.get(`${BASE_URL}/employee/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    console.log('✅ Employee-specific /me endpoint works')
    console.log('User data:', JSON.stringify(meResponse.data, null, 2))
    
  } catch (error) {
    console.log('❌ Employee-specific login failed')
    console.log('Status:', error.response?.status)
    console.log('Error:', error.response?.data || error.message)
  }
}

// Run the test
testEmployeeSpecificLogin() 