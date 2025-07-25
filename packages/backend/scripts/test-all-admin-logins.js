const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

const adminCredentials = [
  {
    name: 'Platform Admin (Linton Tech LLC)',
    email: 'admin@linton-tech.com',
    password: 'TestPass123!'
  },
  {
    name: 'Vendor Admin (Acme Digital Agency)',
    email: 'admin@acmecorp.com',
    password: 'TestPass123!'
  },
  {
    name: 'Vendor Admin (TechStart Solutions)',
    email: 'admin@techstart.com',
    password: 'TestPass123!'
  },
  {
    name: 'Vendor Admin (InnovateCo Development)',
    email: 'admin@innovateco.com',
    password: 'TestPass123!'
  },
  {
    name: 'Vendor Admin (GlobalTech Systems)',
    email: 'admin@globaltech.com',
    password: 'TestPass123!'
  }
]

async function testAllAdminLogins() {
  console.log('🧪 Testing All Admin Panel Logins...\n')

  for (const cred of adminCredentials) {
    try {
      console.log(`🔐 Testing: ${cred.name}`)
      console.log(`   Email: ${cred.email}`)
      
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: cred.email,
        password: cred.password,
        portalType: 'admin'
      })
      
      if (loginResponse.data.success) {
        console.log('   ✅ Login successful')
        console.log(`   Role: ${loginResponse.data.data.user.role}`)
        console.log(`   Vendor: ${loginResponse.data.data.user.vendorId?.name || 'N/A'}`)
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
  
  console.log('🎉 Admin login tests completed!')
}

// Run the test
testAllAdminLogins() 