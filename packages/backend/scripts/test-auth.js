const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function testAuth() {
  console.log('🧪 Testing Authentication...\n')

  try {
    // Test 1: Super Admin Login
    console.log('1️⃣ Testing Super Admin Login...')
    const superAdminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'super.admin@linton.com',
      password: 'TestPass123!',
      portalType: 'super_admin'
    })
    
    if (superAdminLogin.data.success) {
      console.log('✅ Super Admin login successful')
      console.log(`   Role: ${superAdminLogin.data.data.user.role}`)
      console.log(`   Vendor: ${superAdminLogin.data.data.vendor.name}`)
      console.log(`   Token: ${superAdminLogin.data.data.accessToken.substring(0, 20)}...`)
      
      const superAdminToken = superAdminLogin.data.data.accessToken
      
      // Test Super Admin API access
      console.log('\n🔐 Testing Super Admin API access...')
      try {
        const usersResponse = await axios.get(`${BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${superAdminToken}` }
        })
        console.log('✅ Super Admin can access users API')
        console.log(`   Found ${usersResponse.data.data.length} users`)
      } catch (error) {
        console.log('❌ Super Admin users access failed:', error.response?.data?.message || error.message)
      }
      
    } else {
      console.log('❌ Super Admin login failed')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 2: Platform Admin Login
    console.log('2️⃣ Testing Platform Admin Login...')
    const platformAdminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@linton-tech.com',
      password: 'TestPass123!',
      portalType: 'admin'
    })
    
    if (platformAdminLogin.data.success) {
      console.log('✅ Platform Admin login successful')
      console.log(`   Role: ${platformAdminLogin.data.data.user.role}`)
      console.log(`   Vendor: ${platformAdminLogin.data.data.vendor.name}`)
      console.log(`   Token: ${platformAdminLogin.data.data.accessToken.substring(0, 20)}...`)
      
      const platformAdminToken = platformAdminLogin.data.data.accessToken
      
      // Test Platform Admin API access
      console.log('\n🔐 Testing Platform Admin API access...')
      try {
        const projectsResponse = await axios.get(`${BASE_URL}/projects`, {
          headers: { Authorization: `Bearer ${platformAdminToken}` }
        })
        console.log('✅ Platform Admin can access projects API')
        console.log(`   Found ${projectsResponse.data.data.length} projects`)
      } catch (error) {
        console.log('❌ Platform Admin projects access failed:', error.response?.data?.message || error.message)
      }
      
    } else {
      console.log('❌ Platform Admin login failed')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 3: Vendor Admin Login
    console.log('3️⃣ Testing Vendor Admin Login...')
    const vendorAdminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@acmecorp.com',
      password: 'TestPass123!',
      portalType: 'admin'
    })
    
    if (vendorAdminLogin.data.success) {
      console.log('✅ Vendor Admin login successful')
      console.log(`   Role: ${vendorAdminLogin.data.data.user.role}`)
      console.log(`   Vendor: ${vendorAdminLogin.data.data.vendor.name}`)
      console.log(`   Token: ${vendorAdminLogin.data.data.accessToken.substring(0, 20)}...`)
      
      const vendorAdminToken = vendorAdminLogin.data.data.accessToken
      
      // Test Vendor Admin API access
      console.log('\n🔐 Testing Vendor Admin API access...')
      try {
        const tasksResponse = await axios.get(`${BASE_URL}/tasks`, {
          headers: { Authorization: `Bearer ${vendorAdminToken}` }
        })
        console.log('✅ Vendor Admin can access tasks API')
        console.log(`   Found ${tasksResponse.data.data.length} tasks`)
      } catch (error) {
        console.log('❌ Vendor Admin tasks access failed:', error.response?.data?.message || error.message)
      }
      
    } else {
      console.log('❌ Vendor Admin login failed')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 4: Employee Login
    console.log('4️⃣ Testing Employee Login...')
    const employeeLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'alex.chen@acmecorp.com',
      password: 'TestPass123!',
      portalType: 'employee'
    })
    
    if (employeeLogin.data.success) {
      console.log('✅ Employee login successful')
      console.log(`   Role: ${employeeLogin.data.data.user.role}`)
      console.log(`   Vendor: ${employeeLogin.data.data.vendor.name}`)
      console.log(`   Token: ${employeeLogin.data.data.accessToken.substring(0, 20)}...`)
    } else {
      console.log('❌ Employee login failed')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 5: Client Login
    console.log('5️⃣ Testing Client Login...')
    const clientLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.smith@acmecorp.com',
      password: 'TestPass123!',
      portalType: 'client'
    })
    
    if (clientLogin.data.success) {
      console.log('✅ Client login successful')
      console.log(`   Role: ${clientLogin.data.data.user.role}`)
      console.log(`   Vendor: ${clientLogin.data.data.vendor.name}`)
      console.log(`   Token: ${clientLogin.data.data.accessToken.substring(0, 20)}...`)
    } else {
      console.log('❌ Client login failed')
    }

    console.log('\n🎉 Authentication testing completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
  }
}

// Run the test
testAuth() 