const mongoose = require('mongoose')
const Task = require('./src/models/Task')
const Project = require('./src/models/Project')
const config = require('./src/config')

async function checkTasks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')
    
    // Check all tasks
    const allTasks = await Task.find({}).populate('project', 'name _id')
    console.log(`📊 Total tasks in database: ${allTasks.length}`)
    
    if (allTasks.length > 0) {
      console.log('\n📋 Tasks found:')
      allTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title} (Project: ${task.project?.name || 'No project'} - ${task.project?._id || 'No ID'})`)
      })
    } else {
      console.log('❌ No tasks found in database')
    }
    
    // Check all projects
    const allProjects = await Project.find({}).select('name _id')
    console.log(`\n📊 Total projects in database: ${allProjects.length}`)
    
    if (allProjects.length > 0) {
      console.log('\n📋 Projects found:')
      allProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} (ID: ${project._id})`)
      })
    } else {
      console.log('❌ No projects found in database')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  }
}

checkTasks() 