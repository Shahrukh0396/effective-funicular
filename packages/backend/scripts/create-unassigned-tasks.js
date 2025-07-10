const mongoose = require('mongoose')
const Task = require('../src/models/Task')
const Project = require('../src/models/Project')
const User = require('../src/models/User')
const config = require('../src/config')

async function createUnassignedTasks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('Connected to MongoDB')
    
    // Get existing projects and employees
    const projects = await Project.find().limit(3)
    const employees = await User.find({ role: 'employee' }).limit(2)
    
    if (projects.length === 0 || employees.length === 0) {
      console.log('❌ No projects or employees found. Please run create-test-data.js first.')
      return
    }
    
    // Create unassigned tasks
    const unassignedTaskData = [
      {
        title: 'Unassigned Task: Database Optimization',
        description: 'Optimize database queries and indexes for better performance.',
        project: projects[0]._id,
        createdBy: employees[0]._id,
        status: 'todo',
        priority: 'high',
        type: 'improvement',
        estimatedHours: 8,
        dueDate: new Date('2024-04-15')
      },
      {
        title: 'Unassigned Task: Security Audit',
        description: 'Conduct comprehensive security audit of the application.',
        project: projects[1]._id,
        createdBy: employees[0]._id,
        status: 'todo',
        priority: 'urgent',
        type: 'task',
        estimatedHours: 12,
        dueDate: new Date('2024-04-10')
      },
      {
        title: 'Unassigned Task: Unit Tests',
        description: 'Write comprehensive unit tests for core functionality.',
        project: projects[2]._id,
        createdBy: employees[1]._id,
        status: 'todo',
        priority: 'medium',
        type: 'task',
        estimatedHours: 6,
        dueDate: new Date('2024-04-20')
      },
      {
        title: 'Unassigned Task: Documentation Update',
        description: 'Update API documentation and user guides.',
        project: projects[0]._id,
        createdBy: employees[1]._id,
        status: 'blocked',
        priority: 'low',
        type: 'documentation',
        estimatedHours: 4,
        dueDate: new Date('2024-04-25')
      }
    ]
    
    for (const taskInfo of unassignedTaskData) {
      const task = new Task(taskInfo)
      await task.save()
      console.log(`✅ Created unassigned task: ${task.title}`)
    }
    
    console.log('\n🎉 Unassigned tasks created successfully!')
    console.log('📋 These tasks should now appear in /api/employee/tasks/available')
    
  } catch (error) {
    console.error('❌ Error creating unassigned tasks:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the script
createUnassignedTasks() 