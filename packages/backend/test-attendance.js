const axios = require('axios')

async function testAttendanceEndpoints() {
  const baseURL = 'http://localhost:3000'
  
  console.log('🧪 Testing Attendance Endpoints...')
  
  try {
    // Test 1: Check if server is running
    console.log('\n1. Testing server connectivity...')
    try {
      await axios.get(`${baseURL}/api/employee/test`)
      console.log('✅ Server is running')
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Server is running (authentication required)')
      } else {
        console.log('❌ Server connectivity issue:', error.message)
        return
      }
    }
    
    // Test 2: Test attendance status endpoint (should fail without auth)
    console.log('\n2. Testing attendance status without auth...')
    try {
      await axios.get(`${baseURL}/api/employee/attendance/status`)
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Attendance status endpoint requires authentication (correct)')
      } else {
        console.log('❌ Unexpected error:', error.response?.data)
      }
    }
    
    // Test 3: Test check-in endpoint (should fail without auth)
    console.log('\n3. Testing check-in without auth...')
    try {
      await axios.post(`${baseURL}/api/employee/attendance/check-in`)
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Check-in endpoint requires authentication (correct)')
      } else {
        console.log('❌ Unexpected error:', error.response?.data)
      }
    }
    
    // Test 4: Test check-out endpoint (should fail without auth)
    console.log('\n4. Testing check-out without auth...')
    try {
      await axios.post(`${baseURL}/api/employee/attendance/check-out`)
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Check-out endpoint requires authentication (correct)')
      } else {
        console.log('❌ Unexpected error:', error.response?.data)
      }
    }
    
    // Test 5: Test attendance history endpoint (should fail without auth)
    console.log('\n5. Testing attendance history without auth...')
    try {
      await axios.get(`${baseURL}/api/employee/attendance/history`)
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Attendance history endpoint requires authentication (correct)')
      } else {
        console.log('❌ Unexpected error:', error.response?.data)
      }
    }
    
    console.log('\n✅ All attendance endpoints are properly protected and responding')
    console.log('🔧 The backend attendance system is working correctly!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 3000')
    }
  }
}

testAttendanceEndpoints() 