const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function testEmployeePortalLogin() {
  console.log('🧪 Testing Employee Portal Login (Frontend Compatible)...\n')

  try {
    console.log('1️⃣ Testing employee login with portalType...')
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'alex.chen@acmecorp.com',
      password: 'TestPass123!',
      portalType: 'employee'
    })
    
    if (response.data.success) {
      console.log('✅ Employee login successful')
      console.log(`   User: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`)
      console.log(`   Role: ${response.data.data.user.role}`)
      console.log(`   Token: ${response.data.data.accessToken.substring(0, 50)}...`)
      
      const token = response.data.data.accessToken
      
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
      
      console.log('\n3️⃣ Testing tasks endpoint...')
      const tasksResponse = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (tasksResponse.data.success) {
        console.log('✅ Tasks endpoint works')
        console.log(`   Found ${tasksResponse.data.data.length} tasks`)
      } else {
        console.log('❌ Tasks endpoint failed')
      }
      
    } else {
      console.log('❌ Employee login failed')
      console.log('   Response:', response.data)
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
testEmployeePortalLogin() 