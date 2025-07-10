const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const Project = require('../src/models/Project')
const Sprint = require('../src/models/Sprint')

async function fixDataIssues() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    // Get users
    const davidWilson = await User.findOne({ email: 'david.wilson@linton.com' })
    const sarahJohnson = await User.findOne({ email: 'sarah.johnson@linton.com' })
    const allEmployees = await User.find({ role: 'employee' })

    console.log('\n🔧 FIXING DATA ISSUES')
    console.log('=' .repeat(60))

    // 1. Fix Project team structure for Sarah Johnson
    console.log('\n📋 Fixing Project team assignments...')
    
    const projects = await Project.find({})
    for (const project of projects) {
      console.log(`\n🔧 Project: ${project.name}`)
      
      // Add David Wilson to all projects as admin
      const davidInTeam = project.team.find(member => member.user.toString() === davidWilson._id.toString())
      if (!davidInTeam) {
        project.team.push({
          user: davidWilson._id,
          role: 'manager',
          assignedAt: new Date()
        })
        console.log(`   ✅ Added David Wilson as manager`)
      } else {
        console.log(`   ℹ️  David Wilson already in team`)
      }

      // Ensure Sarah Johnson is in team
      const sarahInTeam = project.team.find(member => member.user.toString() === sarahJohnson._id.toString())
      if (!sarahInTeam) {
        project.team.push({
          user: sarahJohnson._id,
          role: 'developer',
          assignedAt: new Date()
        })
        console.log(`   ✅ Added Sarah Johnson as developer`)
      } else {
        console.log(`   ℹ️  Sarah Johnson already in team`)
      }

      await project.save()
    }

    // 2. Fix Sprint team assignments
    console.log('\n📋 Fixing Sprint team assignments...')
    
    const sprints = await Sprint.find({})
    for (const sprint of sprints) {
      console.log(`\n🔧 Sprint: ${sprint.name}`)
      
      // Add all employees to sprint team
      for (const employee of allEmployees) {
        const employeeInTeam = sprint.team.find(member => member.user.toString() === employee._id.toString())
        if (!employeeInTeam) {
          sprint.team.push({
            user: employee._id,
            role: 'developer',
            capacity: 40
          })
          console.log(`   ✅ Added ${employee.firstName} ${employee.lastName} to sprint team`)
        }
      }

      // Update team size
      sprint.capacity.teamSize = sprint.team.length
      await sprint.save()
    }

    // 3. Add admin permissions to David Wilson
    console.log('\n📋 Updating David Wilson permissions...')
    
    if (!davidWilson.permissions.includes('read_projects')) {
      davidWilson.permissions = [
        'read_projects',
        'write_projects', 
        'delete_projects',
        'read_tasks',
        'write_tasks',
        'delete_tasks',
        'manage_users',
        'manage_billing',
        'view_analytics'
      ]
      await davidWilson.save()
      console.log(`   ✅ Updated David Wilson permissions`)
    } else {
      console.log(`   ℹ️  David Wilson already has admin permissions`)
    }

    // 4. Add employee permissions to Sarah Johnson
    console.log('\n📋 Updating Sarah Johnson permissions...')
    
    if (!sarahJohnson.permissions.includes('read_projects')) {
      sarahJohnson.permissions = [
        'read_projects',
        'read_tasks',
        'write_tasks'
      ]
      await sarahJohnson.save()
      console.log(`   ✅ Updated Sarah Johnson permissions`)
    } else {
      console.log(`   ℹ️  Sarah Johnson already has employee permissions`)
    }

    console.log('\n' + '=' .repeat(60))
    console.log('✅ DATA FIXES COMPLETED!')
    console.log('=' .repeat(60))
    
    console.log('\n📊 SUMMARY:')
    console.log(`✅ Fixed ${projects.length} projects`)
    console.log(`✅ Fixed ${sprints.length} sprints`)
    console.log(`✅ Updated user permissions`)
    
    console.log('\n🎯 TESTING RECOMMENDATIONS:')
    console.log('1. Login as Sarah Johnson (employee portal) - should now see projects and sprints')
    console.log('2. Login as David Wilson (admin portal) - should now see all projects and sprints')
    console.log('3. Check that tasks are properly assigned and visible')

    await mongoose.disconnect()
    console.log('\n✅ Data fixes completed!')

  } catch (error) {
    console.error('❌ Error during data fixes:', error)
    process.exit(1)
  }
}

// Run the data fixes
fixDataIssues() 