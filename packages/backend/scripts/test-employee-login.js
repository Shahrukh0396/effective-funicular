const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

const employeeCredentials = [
  {
    name: 'Alex Chen (Acme Digital Agency)',
    email: 'alex.chen@acmecorp.com',
    password: 'TestPass123!'
  },
  {
    name: 'Maria Garcia (Acme Digital Agency)',
    email: 'maria.garcia@acmecorp.com',
    password: 'TestPass123!'
  },
  {
    name: 'David Wilson (TechStart Solutions)',
    email: 'david.wilson@techstart.com',
    password: 'TestPass123!'
  },
  {
    name: 'Lisa Anderson (InnovateCo Development)',
    email: 'lisa.anderson@innovateco.com',
    password: 'TestPass123!'
  }
]

async function testEmployeeLogin() {
  console.log('🧪 Testing Employee Portal Login...\n')

  for (const cred of employeeCredentials) {
    try {
      console.log(`🔐 Testing: ${cred.name}`)
      console.log(`   Email: ${cred.email}`)
      
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: cred.email,
        password: cred.password,
        portalType: 'employee'
      })
      
      if (loginResponse.data.success) {
        console.log('   ✅ Login successful')
        console.log(`   Role: ${loginResponse.data.data.user.role}`)
        console.log(`   Name: ${loginResponse.data.data.user.firstName} ${loginResponse.data.data.user.lastName}`)
        console.log(`   Company: ${loginResponse.data.data.user.company}`)
        console.log(`   Position: ${loginResponse.data.data.user.position}`)
        console.log(`   Token: ${loginResponse.data.data.accessToken.substring(0, 50)}...`)
        
        const token = loginResponse.data.data.accessToken
        
        // Test the /me endpoint
        console.log('   🔍 Testing /me endpoint...')
        const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (meResponse.data.success) {
          console.log('   ✅ /me endpoint works')
        } else {
          console.log('   ❌ /me endpoint failed')
        }
        
      } else {
        console.log('   ❌ Login failed')
        console.log(`   Response: ${JSON.stringify(loginResponse.data)}`)
      }
      
    } catch (error) {
      console.log('   ❌ Login failed')
      console.log(`   Error: ${error.response?.data?.message || error.message}`)
    }
    
    console.log('') // Empty line for readability
  }
  
  console.log('🎉 Employee login tests completed!')
}

// Run the test
testEmployeeLogin() 