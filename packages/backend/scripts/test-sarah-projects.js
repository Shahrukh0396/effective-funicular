const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const Project = require('../src/models/Project')
const Sprint = require('../src/models/Sprint')
const Task = require('../src/models/Task')
const axios = require('axios')

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api'

async function testSarahProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    console.log('\n🔍 INVESTIGATING SARAH JOHNSON PROJECT ACCESS')
    console.log('=' .repeat(60))

    // Get Sarah Johnson from database
    const sarahJohnson = await User.findOne({ email: 'sarah.johnson@linton.com' })
    console.log('\n👤 Sarah Johnson Details:')
    console.log(`   ID: ${sarahJohnson._id}`)
    console.log(`   Name: ${sarahJohnson.firstName} ${sarahJohnson.lastName}`)
    console.log(`   Email: ${sarahJohnson.email}`)
    console.log(`   Role: ${sarahJohnson.role}`)
    console.log(`   Permissions: ${sarahJohnson.permissions.join(', ')}`)
    console.log(`   isActive: ${sarahJohnson.isActive}`)

    // Check all projects in database
    console.log('\n📋 ALL PROJECTS IN DATABASE:')
    console.log('-' .repeat(40))
    const allProjects = await Project.find({})
    console.log(`Total projects: ${allProjects.length}`)
    
    allProjects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.name} (${project.status})`)
      console.log(`   ID: ${project._id}`)
      console.log(`   Client: ${project.client}`)
      console.log(`   Project Manager: ${project.projectManager}`)
      console.log(`   Team Members: ${project.team.length}`)
      
      if (project.team.length > 0) {
        console.log('   Team Details:')
        project.team.forEach(member => {
          console.log(`     - User ID: ${member.user}, Role: ${member.role}`)
        })
      }
    })

    // Check which projects Sarah is assigned to (from database perspective)
    console.log('\n🔍 PROJECTS SARAH IS ASSIGNED TO (Database Check):')
    console.log('-' .repeat(40))
    
    const sarahProjects = allProjects.filter(project => {
      return project.team.some(member => member.user.toString() === sarahJohnson._id.toString())
    })
    
    console.log(`Sarah is assigned to ${sarahProjects.length} projects:`)
    sarahProjects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.name} (${project.status})`)
      const teamMember = project.team.find(member => member.user.toString() === sarahJohnson._id.toString())
      console.log(`   Role: ${teamMember.role}`)
      console.log(`   Assigned At: ${teamMember.assignedAt}`)
    })

    // Test Sarah's login and API access
    console.log('\n🔐 TESTING SARAH\'S LOGIN AND API ACCESS:')
    console.log('-' .repeat(40))
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/employee/login`, {
        email: 'sarah.johnson@linton.com',
        password: 'TestPass123!'
      })
      
      if (loginResponse.data.token) {
        console.log('✅ Sarah Johnson login successful')
        
        const sarahToken = loginResponse.data.token
        const headers = { Authorization: `Bearer ${sarahToken}` }
        
        // Test employee projects endpoint
        try {
          const projectsResponse = await axios.get(`${BASE_URL}/employee/projects`, { headers })
          console.log(`✅ Sarah can see ${projectsResponse.data.length} projects via API:`)
          projectsResponse.data.forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.name} (${project.status})`)
          })
        } catch (error) {
          console.log('❌ Sarah cannot see projects via API:', error.response?.data?.message || error.message)
        }
        
        // Test user projects endpoint (what admin panel might use)
        try {
          const userProjectsResponse = await axios.get(`${BASE_URL}/users/${sarahJohnson._id}/projects`, { headers })
          console.log(`✅ Sarah's user projects endpoint shows ${userProjectsResponse.data.data.projects.length} projects:`)
          userProjectsResponse.data.data.projects.forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.name} (${project.status})`)
          })
        } catch (error) {
          console.log('❌ Sarah cannot access user projects endpoint:', error.response?.data?.message || error.message)
        }
        
      } else {
        console.log('❌ Sarah Johnson login failed')
      }
    } catch (error) {
      console.log('❌ Login error:', error.response?.data?.message || error.message)
    }

    // Test admin access to see what admin panel would show
    console.log('\n👨‍💼 TESTING ADMIN ACCESS (David Wilson):')
    console.log('-' .repeat(40))
    
    try {
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
          const adminProjectsResponse = await axios.get(`${BASE_URL}/admin/projects`, { headers })
          console.log(`✅ Admin can see ${adminProjectsResponse.data.length} projects:`)
          adminProjectsResponse.data.forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.name} (${project.status})`)
          })
        } catch (error) {
          console.log('❌ Admin cannot see projects:', error.response?.data?.message || error.message)
        }
        
        // Test getting Sarah's projects as admin
        try {
          const sarahProjectsAsAdminResponse = await axios.get(`${BASE_URL}/users/${sarahJohnson._id}/projects`, { headers })
          console.log(`✅ Admin can see Sarah has ${sarahProjectsAsAdminResponse.data.data.projects.length} projects:`)
          sarahProjectsAsAdminResponse.data.data.projects.forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.name} (${project.status})`)
          })
        } catch (error) {
          console.log('❌ Admin cannot see Sarahs projects:', error.response?.data?.message || error.message)
        }
        
      } else {
        console.log('❌ David Wilson login failed')
      }
    } catch (error) {
      console.log('❌ Admin login error:', error.response?.data?.message || error.message)
    }

    // Check for any data inconsistencies
    console.log('\n🔍 DATA CONSISTENCY CHECK:')
    console.log('-' .repeat(40))
    
    // Check if there are any projects where Sarah is in team but project is not active
    const sarahInactiveProjects = sarahProjects.filter(project => project.status !== 'active' && project.status !== 'in-progress')
    if (sarahInactiveProjects.length > 0) {
      console.log(`⚠️  Sarah is assigned to ${sarahInactiveProjects.length} inactive projects:`)
      sarahInactiveProjects.forEach(project => {
        console.log(`   - ${project.name} (${project.status})`)
      })
    }
    
    // Check if there are any projects where Sarah is not in team but should be
    const projectsWithoutSarah = allProjects.filter(project => {
      return !project.team.some(member => member.user.toString() === sarahJohnson._id.toString())
    })
    console.log(`📊 Projects without Sarah: ${projectsWithoutSarah.length}`)
    projectsWithoutSarah.forEach(project => {
      console.log(`   - ${project.name} (${project.status})`)
    })

    console.log('\n' + '=' .repeat(60))
    console.log('✅ SARAH JOHNSON PROJECT INVESTIGATION COMPLETED!')
    console.log('=' .repeat(60))

    await mongoose.disconnect()
    console.log('\n✅ Investigation completed!')

  } catch (error) {
    console.error('❌ Error during investigation:', error)
    process.exit(1)
  }
}

testSarahProjects() 