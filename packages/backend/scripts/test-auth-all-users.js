const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const axios = require('axios')

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api'

// Test endpoints for each portal
const ENDPOINTS = {
  client: `${BASE_URL}/auth/login`,
  employee: `${BASE_URL}/employee/login`,
  admin: `${BASE_URL}/auth/login` // Admin uses same endpoint as client
}

// Password patterns to try
function generatePasswords(email) {
  const passwords = []
  
  // Pattern 1: Common test password
  passwords.push('TestPass123!')
  
  // Pattern 2: {FirstName}{LastName}123!
  const name = email.split('@')[0]
  const parts = name.split('.')
  if (parts.length === 2) {
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    passwords.push(`${firstName}${lastName}123!`)
  }
  
  return passwords
}

async function testUserLogin(email, passwords, role) {
  try {
    let endpoint
    let portalName
    
    // Determine which endpoint to use based on role
    if (role === 'client') {
      endpoint = ENDPOINTS.client
      portalName = 'CLIENT PORTAL'
    } else if (role === 'employee') {
      endpoint = ENDPOINTS.employee
      portalName = 'EMPLOYEE PORTAL'
    } else if (role === 'admin') {
      endpoint = ENDPOINTS.admin
      portalName = 'ADMIN PORTAL'
    } else {
      console.log(`❌ Unknown role: ${role} for ${email}`)
      return false
    }

    console.log(`\n🔐 Testing ${portalName} login for ${email}...`)
    
    // Try each password
    for (let i = 0; i < passwords.length; i++) {
      const password = passwords[i]
      console.log(`   Trying password ${i + 1}/${passwords.length}: ${password}`)
      
      try {
        const response = await axios.post(endpoint, {
          email: email,
          password: password
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.status === 200 && response.data.success) {
          console.log(`✅ SUCCESS: ${email} logged in successfully to ${portalName}`)
          console.log(`   Password used: ${password}`)
          console.log(`   Role: ${response.data.user?.role || role}`)
          console.log(`   Token: ${response.data.token ? '✅ Received' : '❌ Missing'}`)
          return true
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log(`   ❌ Password ${i + 1} failed: Invalid credentials`)
        } else {
          console.log(`   ❌ Password ${i + 1} failed: ${error.message}`)
        }
      }
    }
    
    console.log(`❌ FAILED: ${email} - All passwords failed`)
    return false

  } catch (error) {
    console.log(`❌ FAILED: ${email} - ${error.message}`)
    return false
  }
}

async function testAllUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    // Fetch all users
    const users = await User.find({}, 'email role firstName lastName isActive')
    console.log(`📊 Found ${users.length} users in database`)

    if (users.length === 0) {
      console.log('❌ No users found in database')
      return
    }

    console.log('\n🚀 Starting authentication tests...')
    console.log('=' .repeat(60))

    let successCount = 0
    let failCount = 0

    // Test each user
    for (const user of users) {
      if (!user.isActive) {
        console.log(`⚠️  SKIPPED: ${user.email} - Account inactive`)
        continue
      }

      const passwords = generatePasswords(user.email)
      const success = await testUserLogin(user.email, passwords, user.role)
      
      if (success) {
        successCount++
      } else {
        failCount++
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n' + '=' .repeat(60))
    console.log('📊 AUTHENTICATION TEST RESULTS')
    console.log('=' .repeat(60))
    console.log(`✅ Successful logins: ${successCount}`)
    console.log(`❌ Failed logins: ${failCount}`)
    console.log(`📈 Success rate: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`)

    if (successCount === users.filter(u => u.isActive).length) {
      console.log('\n🎉 ALL USERS CAN LOGIN SUCCESSFULLY!')
    } else {
      console.log('\n⚠️  Some users failed to login. Check the errors above.')
    }

    await mongoose.disconnect()
    console.log('\n✅ Authentication tests completed!')

  } catch (error) {
    console.error('❌ Error during authentication tests:', error)
    process.exit(1)
  }
}

// Run the tests
testAllUsers() 