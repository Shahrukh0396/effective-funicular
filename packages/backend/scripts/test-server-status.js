const axios = require('axios')

async function testServerStatus() {
  try {
    console.log('🧪 TESTING SERVER STATUS')
    console.log('=' .repeat(40))
    
    // Test health endpoint
    console.log('\n🔍 Testing health endpoint...')
    try {
      const healthResponse = await axios.get('http://localhost:3000/health')
      console.log('✅ Health endpoint works:', healthResponse.data)
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.message)
    }
    
    // Test auth endpoint
    console.log('\n🔍 Testing auth endpoint...')
    try {
      const authResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'test@test.com',
        password: 'test'
      })
      console.log('✅ Auth endpoint works')
    } catch (error) {
      console.log('❌ Auth endpoint failed (expected):', error.response?.status, error.response?.data?.message)
    }
    
    // Test admin test endpoint
    console.log('\n🔍 Testing admin test endpoint...')
    try {
      const adminTestResponse = await axios.get('http://localhost:3000/api/admin/test')
      console.log('✅ Admin test endpoint works:', adminTestResponse.data)
    } catch (error) {
      console.log('❌ Admin test endpoint failed:', error.response?.status, error.response?.data?.message)
    }
    
    console.log('\n✅ Server status test completed!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testServerStatus() 