const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const Project = require('../src/models/Project')
const Sprint = require('../src/models/Sprint')
const axios = require('axios')

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api'

async function testPortalAccess() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    console.log('\n🧪 TESTING PORTAL ACCESS')
    console.log('=' .repeat(60))

    // Test Sarah Johnson (Employee Portal)
    console.log('\n👤 Testing Sarah Johnson (Employee Portal)')
    console.log('-' .repeat(40))
    
    // Login as Sarah Johnson
    const sarahLoginResponse = await axios.post(`${BASE_URL}/employee/login`, {
      email: 'sarah.johnson@linton.com',
      password: 'TestPass123!'
    })
    
    if (sarahLoginResponse.data.token) {
      console.log('✅ Sarah Johnson login successful')
      
      const sarahToken = sarahLoginResponse.data.token
      const headers = { Authorization: `Bearer ${sarahToken}` }
      
      // Test projects endpoint
      try {
        const projectsResponse = await axios.get(`${BASE_URL}/employee/projects`, { headers })
        console.log(`✅ Sarah can see ${projectsResponse.data.length} projects`)
        projectsResponse.data.forEach(project => {
          console.log(`   📋 ${project.name} (${project.status})`)
        })
      } catch (error) {
        console.log('❌ Sarah cannot see projects:', error.response?.data?.message || error.message)
      }
      
      // Test sprints endpoint
      try {
        const sprintsResponse = await axios.get(`${BASE_URL}/employee/sprints`, { headers })
        console.log(`✅ Sarah can see ${sprintsResponse.data.length} sprints`)
        sprintsResponse.data.forEach(sprint => {
          console.log(`   🏃 ${sprint.name} (${sprint.status})`)
        })
      } catch (error) {
        console.log('❌ Sarah cannot see sprints:', error.response?.data?.message || error.message)
      }
      
    } else {
      console.log('❌ Sarah Johnson login failed')
    }

    // Test David Wilson (Admin Portal)
    console.log('\n👤 Testing David Wilson (Admin Portal)')
    console.log('-' .repeat(40))
    
    // Login as David Wilson (admin users use employee login endpoint)
    const davidLoginResponse = await axios.post(`${BASE_URL}/employee/login`, {
      email: 'david.wilson@linton.com',
      password: 'TestPass123!'
    })
    
    if (davidLoginResponse.data.token) {
      console.log('✅ David Wilson login successful')
      
      const davidToken = davidLoginResponse.data.token
      const headers = { Authorization: `Bearer ${davidToken}` }
      
      // Test admin projects endpoint
      try {
        const projectsResponse = await axios.get(`${BASE_URL}/admin/projects`, { headers })
        console.log(`✅ David can see ${projectsResponse.data.length} projects`)
        projectsResponse.data.forEach(project => {
          console.log(`   📋 ${project.name} (${project.status})`)
        })
      } catch (error) {
        console.log('❌ David cannot see projects:', error.response?.data?.message || error.message)
      }
      
      // Test admin sprints endpoint
      try {
        const sprintsResponse = await axios.get(`${BASE_URL}/admin/sprints`, { headers })
        console.log(`✅ David can see ${sprintsResponse.data.length} sprints`)
        sprintsResponse.data.forEach(sprint => {
          console.log(`   🏃 ${sprint.name} (${sprint.status})`)
        })
      } catch (error) {
        console.log('❌ David cannot see sprints:', error.response?.data?.message || error.message)
      }
      
    } else {
      console.log('❌ David Wilson login failed')
    }

    // Test direct database access
    console.log('\n📊 DATABASE VERIFICATION')
    console.log('-' .repeat(40))
    
    const sarahJohnson = await User.findOne({ email: 'sarah.johnson@linton.com' })
    const davidWilson = await User.findOne({ email: 'david.wilson@linton.com' })
    
    console.log(`👤 Sarah Johnson permissions: ${sarahJohnson.permissions.join(', ')}`)
    console.log(`👤 David Wilson permissions: ${davidWilson.permissions.join(', ')}`)
    
    // Check projects in database
    const projects = await Project.find({})
    console.log(`📋 Total projects in database: ${projects.length}`)
    
    // Check which projects Sarah is on
    const sarahProjects = projects.filter(p => 
      p.team.some(member => member.user.toString() === sarahJohnson._id.toString())
    )
    console.log(`📋 Projects Sarah is on: ${sarahProjects.length}`)
    
    // Check which projects David is on
    const davidProjects = projects.filter(p => 
      p.team.some(member => member.user.toString() === davidWilson._id.toString())
    )
    console.log(`📋 Projects David is on: ${davidProjects.length}`)
    
    // Check sprints in database
    const sprints = await Sprint.find({})
    console.log(`🏃 Total sprints in database: ${sprints.length}`)
    
    // Check which sprints Sarah is on
    const sarahSprints = sprints.filter(s => 
      s.team.some(member => member.user.toString() === sarahJohnson._id.toString())
    )
    console.log(`🏃 Sprints Sarah is on: ${sarahSprints.length}`)
    
    // Check which sprints David is on
    const davidSprints = sprints.filter(s => 
      s.team.some(member => member.user.toString() === davidWilson._id.toString())
    )
    console.log(`🏃 Sprints David is on: ${davidSprints.length}`)

    console.log('\n' + '=' .repeat(60))
    console.log('✅ PORTAL ACCESS TESTING COMPLETED!')
    console.log('=' .repeat(60))

    await mongoose.disconnect()
    console.log('\n✅ Testing completed!')

  } catch (error) {
    console.error('❌ Error during testing:', error)
    process.exit(1)
  }
}

// Run the tests
testPortalAccess() 