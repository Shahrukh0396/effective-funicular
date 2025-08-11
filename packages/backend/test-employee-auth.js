const axios = require('axios')

async function testEmployeeAuth() {
  try {
    // Test employee login
    const loginResponse = await axios.post('http://localhost:3000/api/employee/login', {
      email: 'alex.chen@acmecorp.com',
      password: 'TestPass123!' // Correct password
    })
    
    console.log('Login response:', loginResponse.data)
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token
      
      // Test fetching projects with the token
      const projectsResponse = await axios.get('http://localhost:3000/api/employee/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Projects response:', projectsResponse.data)
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

testEmployeeAuth() 