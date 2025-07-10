const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const Project = require('../src/models/Project')
const Task = require('../src/models/Task')
const Sprint = require('../src/models/Sprint')
const Vendor = require('../src/models/Vendor')

async function createDemoProjectData() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    // Get the first vendor
    const vendor = await Vendor.findOne({})
    if (!vendor) {
      console.log('❌ No vendor found. Please run create-demo-vendor.js first.')
      process.exit(1)
    }

    // Get users for the vendor
    const users = await User.find({ vendor: vendor._id })
    if (users.length === 0) {
      console.log('❌ No users found. Please run create-test-data.js first.')
      process.exit(1)
    }

    const admin = users.find(u => u.role === 'admin')
    const employees = users.filter(u => u.role === 'employee')
    const clients = users.filter(u => u.role === 'client')

    console.log(`📊 Found ${users.length} users (${employees.length} employees, ${clients.length} clients)`)

    // Create demo projects
    const projects = await createProjects(vendor, admin, employees, clients)
    console.log(`✅ Created ${projects.length} projects`)

    // Create tasks and subtasks for each project
    for (const project of projects) {
      const tasks = await createTasksForProject(project, employees, admin)
      console.log(`✅ Created ${tasks.length} tasks for project: ${project.name}`)

      // Create sprints for each project
      const sprints = await createSprintsForProject(project, tasks, admin)
      console.log(`✅ Created ${sprints.length} sprints for project: ${project.name}`)
    }

    console.log('🎉 Demo project data created successfully!')
    console.log('\n📋 Summary:')
    console.log(`- Projects: ${projects.length}`)
    console.log(`- Total Tasks: ${await Task.countDocuments({ vendor: vendor._id })}`)
    console.log(`- Total Sprints: ${await Sprint.countDocuments({ vendor: vendor._id })}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating demo data:', error)
    process.exit(1)
  }
}

async function createProjects(vendor, admin, employees, clients) {
  const projectData = [
    {
      name: 'E-Commerce Platform Redesign',
      description: 'Complete redesign of the e-commerce platform with modern UI/UX and enhanced functionality',
      status: 'in-progress',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      budget: 50000,
      client: clients[0]?._id || employees[0]._id,
      projectManager: admin._id,
      team: employees.slice(0, 3).map(emp => ({ user: emp._id, role: 'developer' })),
      vendor: vendor._id,
      createdBy: admin._id
    },
    {
      name: 'Mobile App Development',
      description: 'Cross-platform mobile application for iOS and Android with real-time features',
      status: 'in-progress',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-15'),
      budget: 75000,
      client: clients[1]?._id || employees[1]._id,
      projectManager: employees[0]._id,
      team: employees.slice(1, 4).map(emp => ({ user: emp._id, role: 'developer' })),
      vendor: vendor._id,
      createdBy: admin._id
    },
    {
      name: 'CRM System Integration',
      description: 'Integration of customer relationship management system with existing business processes',
      status: 'planning',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      budget: 35000,
      client: clients[2]?._id || employees[2]._id,
      projectManager: employees[1]._id,
      team: employees.slice(0, 2).map(emp => ({ user: emp._id, role: 'developer' })),
      vendor: vendor._id,
      createdBy: admin._id
    }
  ]

  const projects = []
  for (const data of projectData) {
    const project = new Project(data)
    await project.save()
    await project.populate('client', 'firstName lastName email')
    await project.populate('projectManager', 'firstName lastName email')
    await project.populate('team.user', 'firstName lastName email')
    projects.push(project)
  }

  return projects
}

async function createTasksForProject(project, employees, admin) {
  const taskData = [
    // E-Commerce Platform Tasks
    {
      title: 'Design System Setup',
      description: 'Create comprehensive design system with color palette, typography, and component library',
      type: 'feature',
      priority: 'high',
      status: 'in-progress',
      estimatedHours: 40,
      dueDate: new Date('2024-02-15'),
      assignedTo: employees[0]._id,
      createdBy: admin._id,
      vendor: project.vendor,
      project: project._id,
      labels: ['design', 'ui/ux'],
      tags: ['frontend', 'design-system']
    },
    {
      title: 'User Authentication System',
      description: 'Implement secure user authentication with JWT tokens and role-based access control',
      type: 'feature',
      priority: 'high',
      status: 'todo',
      estimatedHours: 60,
      dueDate: new Date('2024-02-28'),
      assignedTo: employees[1]._id,
      createdBy: admin._id,
      vendor: project.vendor,
      project: project._id,
      labels: ['backend', 'security'],
      tags: ['authentication', 'api']
    },
    {
      title: 'Product Catalog Management',
      description: 'Build comprehensive product catalog with categories, search, and filtering capabilities',
      type: 'feature',
      priority: 'medium',
      status: 'todo',
      estimatedHours: 80,
      dueDate: new Date('2024-03-15'),
      assignedTo: employees[2]._id,
      createdBy: admin._id,
      vendor: project.vendor,
      project: project._id,
      labels: ['backend', 'database'],
      tags: ['catalog', 'search']
    },
    {
      title: 'Shopping Cart Implementation',
      description: 'Develop shopping cart functionality with persistent storage and real-time updates',
      type: 'feature',
      priority: 'high',
      status: 'todo',
      estimatedHours: 50,
      dueDate: new Date('2024-03-30'),
      assignedTo: employees[0]._id,
      createdBy: admin._id,
      vendor: project.vendor,
      project: project._id,
      labels: ['frontend', 'backend'],
      tags: ['cart', 'session']
    },
    {
      title: 'Payment Gateway Integration',
      description: 'Integrate multiple payment gateways (Stripe, PayPal) with secure transaction processing',
      type: 'feature',
      priority: 'high',
      status: 'todo',
      estimatedHours: 70,
      dueDate: new Date('2024-04-15'),
      assignedTo: employees[1]._id,
      createdBy: admin._id,
      vendor: project.vendor,
      project: project._id,
      labels: ['backend', 'security'],
      tags: ['payment', 'integration']
    }
  ]

  const tasks = []
  for (const data of taskData) {
    const task = new Task(data)
    await task.save()
    tasks.push(task)
  }

  // Create subtasks for the first task (Design System Setup)
  const designSystemTask = tasks[0]
  const subtaskData = [
    {
      title: 'Color Palette Definition',
      description: 'Define primary, secondary, and accent color schemes',
      type: 'task',
      priority: 'medium',
      status: 'done',
      estimatedHours: 8,
      dueDate: new Date('2024-01-25'),
      assignedTo: employees[0]._id,
      createdBy: admin._id,
      vendor: project.vendor,
      project: project._id,
      parentTask: designSystemTask._id,
      labels: ['design'],
      tags: ['colors']
    },
    {
      title: 'Typography System',
      description: 'Create typography scale and font hierarchy guidelines',
      type: 'task',
      priority: 'medium',
      status: 'in-progress',
      estimatedHours: 12,
      dueDate: new Date('2024-01-30'),
      assignedTo: employees[0]._id,
      createdBy: admin._id,
      vendor: project.vendor,
      project: project._id,
      parentTask: designSystemTask._id,
      labels: ['design'],
      tags: ['typography']
    },
    {
      title: 'Component Library',
      description: 'Build reusable UI components (buttons, forms, cards, etc.)',
      type: 'task',
      priority: 'high',
      status: 'todo',
      estimatedHours: 20,
      dueDate: new Date('2024-02-10'),
      assignedTo: employees[0]._id,
      createdBy: admin._id,
      vendor: project.vendor,
      project: project._id,
      parentTask: designSystemTask._id,
      labels: ['design', 'frontend'],
      tags: ['components']
    }
  ]

  for (const data of subtaskData) {
    const subtask = new Task(data)
    await subtask.save()
    
    // Add subtask to parent task
    designSystemTask.subtasks.push(subtask._id)
    await designSystemTask.save()
  }

  return tasks
}

async function createSprintsForProject(project, tasks, admin) {
  const sprintData = [
    {
      name: 'Foundation Sprint',
      description: 'Core infrastructure and design system setup',
      status: 'active',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-28'),
      project: project._id,
      vendor: project.vendor,
      createdBy: admin._id,
      team: [
        { user: admin._id, role: 'scrum-master' },
        { user: tasks[0].assignedTo, role: 'developer' },
        { user: tasks[1].assignedTo, role: 'developer' }
      ],
      goals: [
        { description: 'Complete design system foundation', isCompleted: false },
        { description: 'Set up development environment', isCompleted: true },
        { description: 'Establish coding standards', isCompleted: true }
      ]
    },
    {
      name: 'Authentication Sprint',
      description: 'User authentication and authorization features',
      status: 'planning',
      startDate: new Date('2024-01-29'),
      endDate: new Date('2024-02-11'),
      project: project._id,
      vendor: project.vendor,
      createdBy: admin._id,
      team: [
        { user: admin._id, role: 'scrum-master' },
        { user: tasks[1].assignedTo, role: 'developer' },
        { user: tasks[2].assignedTo, role: 'developer' }
      ],
      goals: [
        { description: 'Implement user registration', isCompleted: false },
        { description: 'Implement user login/logout', isCompleted: false },
        { description: 'Add role-based access control', isCompleted: false }
      ]
    },
    {
      name: 'Core Features Sprint',
      description: 'Product catalog and shopping cart implementation',
      status: 'planning',
      startDate: new Date('2024-02-12'),
      endDate: new Date('2024-02-25'),
      project: project._id,
      vendor: project.vendor,
      createdBy: admin._id,
      team: [
        { user: admin._id, role: 'scrum-master' },
        { user: tasks[2].assignedTo, role: 'developer' },
        { user: tasks[3].assignedTo, role: 'developer' }
      ],
      goals: [
        { description: 'Build product catalog', isCompleted: false },
        { description: 'Implement shopping cart', isCompleted: false },
        { description: 'Add search and filtering', isCompleted: false }
      ]
    }
  ]

  const sprints = []
  for (const data of sprintData) {
    const sprint = new Sprint(data)
    await sprint.save()
    sprints.push(sprint)
  }

  // Assign tasks to sprints
  // Sprint 1: Foundation Sprint (Design System + Auth setup)
  await sprints[0].addTask(tasks[0]._id, 1, 8) // Design System
  await sprints[0].addTask(tasks[1]._id, 2, 13) // Authentication

  // Sprint 2: Authentication Sprint (Auth completion + Catalog start)
  await sprints[1].addTask(tasks[1]._id, 1, 13) // Authentication (continued)
  await sprints[1].addTask(tasks[2]._id, 2, 21) // Product Catalog

  // Sprint 3: Core Features Sprint (Catalog + Cart)
  await sprints[2].addTask(tasks[2]._id, 1, 21) // Product Catalog (continued)
  await sprints[2].addTask(tasks[3]._id, 2, 13) // Shopping Cart

  // Update task sprint assignments
  tasks[0].sprint = sprints[0]._id
  tasks[1].sprint = sprints[1]._id
  tasks[2].sprint = sprints[2]._id
  tasks[3].sprint = sprints[2]._id

  for (const task of tasks) {
    if (task.sprint) {
      await task.save()
    }
  }

  return sprints
}

createDemoProjectData() 