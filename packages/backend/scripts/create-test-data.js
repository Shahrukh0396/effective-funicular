const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')
const Project = require('../src/models/Project')
const Task = require('../src/models/Task')
const Sprint = require('../src/models/Sprint')
const config = require('../src/config')

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('Connected to MongoDB')
    
    // Clear existing test data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing test data...')
    await User.deleteMany({ 
      $or: [
        { email: { $regex: /test\d+@/ } },
        { email: 'john.smith@acmecorp.com' },
        { email: 'sarah.johnson@techstart.com' },
        { email: 'michael.brown@innovateco.com' },
        { email: 'emily.davis@globaltech.com' },
        { email: 'alex.chen@linton.com' },
        { email: 'maria.garcia@linton.com' },
        { email: 'david.wilson@linton.com' },
        { email: 'lisa.anderson@linton.com' }
      ]
    })
    await Project.deleteMany({ name: { $regex: /Test Project/ } })
    await Task.deleteMany({ title: { $regex: /Test Task/ } })
    await Sprint.deleteMany({ name: { $regex: /Test Sprint/ } })
    
    console.log('Creating test data...')
    
    // Create test clients
    const clients = []
    const clientData = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@acmecorp.com',
        password: 'TestPass123!',
        role: 'client',
        company: 'Acme Corporation',
        position: 'CTO',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techstart.com',
        password: 'TestPass123!',
        role: 'client',
        company: 'TechStart Inc',
        position: 'Product Manager',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@innovateco.com',
        password: 'TestPass123!',
        role: 'client',
        company: 'InnovateCo Solutions',
        position: 'CEO',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@globaltech.com',
        password: 'TestPass123!',
        role: 'client',
        company: 'GlobalTech Systems',
        position: 'VP of Engineering',
        isActive: true,
        isEmailVerified: true
      }
    ]
    
    for (const clientInfo of clientData) {
      const client = new User(clientInfo)
      await client.save()
      clients.push(client)
      console.log(`✅ Created client: ${client.firstName} ${client.lastName} (${client.email})`)
    }
    
    // Create test employees
    const employees = []
    const employeeData = [
      {
        firstName: 'Alex',
        lastName: 'Chen',
        email: 'alex.chen@linton.com',
        password: 'TestPass123!',
        role: 'employee',
        company: 'Linton Systems',
        position: 'Senior Developer',
        isActive: true,
        isEmailVerified: true,
        permissions: ['read_projects', 'read_tasks', 'write_tasks']
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@linton.com',
        password: 'TestPass123!',
        role: 'employee',
        company: 'Linton Systems',
        position: 'UI/UX Designer',
        isActive: true,
        isEmailVerified: true,
        permissions: ['read_projects', 'read_tasks', 'write_tasks']
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@linton.com',
        password: 'TestPass123!',
        role: 'employee',
        company: 'Linton Systems',
        position: 'QA Engineer',
        isActive: true,
        isEmailVerified: true,
        permissions: ['read_projects', 'read_tasks', 'write_tasks']
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@linton.com',
        password: 'TestPass123!',
        role: 'employee',
        company: 'Linton Systems',
        position: 'Project Manager',
        isActive: true,
        isEmailVerified: true,
        permissions: ['read_projects', 'read_tasks', 'write_tasks', 'manage_users']
      }
    ]
    
    for (const employeeInfo of employeeData) {
      const employee = new User(employeeInfo)
      await employee.save()
      employees.push(employee)
      console.log(`✅ Created employee: ${employee.firstName} ${employee.lastName} (${employee.email})`)
    }
    
    // Create test projects
    const projects = []
    const projectData = [
      {
        name: 'Test Project: E-commerce Platform',
        description: 'A modern e-commerce platform with advanced features including user authentication, product catalog, shopping cart, and payment processing.',
        client: clients[0]._id,
        status: 'in-progress',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
        budget: 50000,
        team: [employees[0]._id, employees[1]._id, employees[2]._id],
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        priority: 'high'
      },
      {
        name: 'Test Project: Mobile App Development',
        description: 'Cross-platform mobile application for task management with real-time synchronization and offline capabilities.',
        client: clients[1]._id,
        status: 'planning',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-15'),
        budget: 35000,
        team: [employees[0]._id, employees[3]._id],
        technologies: ['React Native', 'Firebase', 'Redux'],
        priority: 'medium'
      },
      {
        name: 'Test Project: Data Analytics Dashboard',
        description: 'Comprehensive analytics dashboard for business intelligence with interactive charts, data visualization, and reporting features.',
        client: clients[2]._id,
        status: 'completed',
        startDate: new Date('2023-10-01'),
        endDate: new Date('2024-02-28'),
        budget: 25000,
        team: [employees[1]._id, employees[2]._id],
        technologies: ['Vue.js', 'D3.js', 'Python', 'PostgreSQL'],
        priority: 'high'
      },
      {
        name: 'Test Project: API Integration System',
        description: 'Enterprise-level API integration system connecting multiple third-party services with automated data synchronization.',
        client: clients[3]._id,
        status: 'in-progress',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-31'),
        budget: 40000,
        team: [employees[0]._id, employees[1]._id, employees[2]._id, employees[3]._id],
        technologies: ['Node.js', 'Express', 'Redis', 'Docker'],
        priority: 'high'
      },
      {
        name: 'Test Project: Customer Portal',
        description: 'Self-service customer portal with account management, billing, and support ticket system.',
        client: clients[0]._id,
        status: 'planning',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-09-30'),
        budget: 30000,
        team: [employees[1]._id, employees[3]._id],
        technologies: ['Vue.js', 'Laravel', 'MySQL'],
        priority: 'medium'
      }
    ]
    
    for (const projectInfo of projectData) {
      const project = new Project(projectInfo)
      await project.save()
      projects.push(project)
      console.log(`✅ Created project: ${project.name}`)
    }
    
    // Create test sprints
    const sprints = []
    const sprintData = [
      {
        name: 'Test Sprint: Foundation',
        project: projects[0]._id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        status: 'completed',
        goal: 'Set up project foundation and basic architecture'
      },
      {
        name: 'Test Sprint: Core Features',
        project: projects[0]._id,
        startDate: new Date('2024-02-16'),
        endDate: new Date('2024-03-31'),
        status: 'active',
        goal: 'Implement core e-commerce functionality'
      },
      {
        name: 'Test Sprint: UI/UX Design',
        project: projects[1]._id,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        status: 'planning',
        goal: 'Complete mobile app design and wireframes'
      },
      {
        name: 'Test Sprint: Backend Development',
        project: projects[3]._id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-30'),
        status: 'active',
        goal: 'Develop API integration backend services'
      }
    ]
    
    for (const sprintInfo of sprintData) {
      const sprint = new Sprint(sprintInfo)
      await sprint.save()
      sprints.push(sprint)
      console.log(`✅ Created sprint: ${sprint.name}`)
    }
    
    // Create test tasks
    const taskLabels = ['feature', 'bug', 'enhancement', 'documentation', 'testing', 'design']
    const taskStatuses = ['todo', 'in_progress', 'review', 'completed']
    const taskPriorities = ['low', 'medium', 'high', 'urgent']
    
    const taskData = [
      // E-commerce Platform Tasks
      {
        title: 'Test Task: User Authentication System',
        description: 'Implement secure user registration, login, and password reset functionality with JWT tokens.',
        project: projects[0]._id,
        sprint: sprints[0]._id,
        assignedTo: employees[0]._id,
        createdBy: employees[3]._id,
        status: 'done',
        priority: 'high',
        label: 'feature',
        estimatedHours: 16,
        actualHours: 14,
        dueDate: new Date('2024-02-10')
      },
      {
        title: 'Test Task: Product Catalog API',
        description: 'Create RESTful API endpoints for product management including CRUD operations and search functionality.',
        project: projects[0]._id,
        sprint: sprints[1]._id,
        assignedTo: employees[0]._id,
        createdBy: employees[3]._id,
        status: 'in-progress',
        priority: 'high',
        label: 'feature',
        estimatedHours: 20,
        actualHours: 8,
        dueDate: new Date('2024-03-25')
      },
      {
        title: 'Test Task: Shopping Cart Implementation',
        description: 'Develop shopping cart functionality with add/remove items, quantity updates, and price calculations.',
        project: projects[0]._id,
        sprint: sprints[1]._id,
        assignedTo: employees[1]._id,
        createdBy: employees[3]._id,
        status: 'todo',
        priority: 'high',
        label: 'feature',
        estimatedHours: 12,
        actualHours: 0,
        dueDate: new Date('2024-03-31')
      },
      {
        title: 'Test Task: Payment Integration Bug Fix',
        description: 'Fix Stripe payment processing issues and improve error handling for failed transactions.',
        project: projects[0]._id,
        sprint: sprints[1]._id,
        assignedTo: employees[0]._id,
        createdBy: employees[3]._id,
        status: 'review',
        priority: 'urgent',
        label: 'bug',
        estimatedHours: 6,
        actualHours: 5,
        dueDate: new Date('2024-03-20')
      },
      
      // Mobile App Tasks
      {
        title: 'Test Task: App Wireframe Design',
        description: 'Create detailed wireframes for all app screens including user flows and navigation structure.',
        project: projects[1]._id,
        sprint: sprints[2]._id,
        assignedTo: employees[1]._id,
        createdBy: employees[3]._id,
        status: 'todo',
        priority: 'medium',
        label: 'design',
        estimatedHours: 10,
        actualHours: 0,
        dueDate: new Date('2024-03-31')
      },
      {
        title: 'Test Task: React Native Setup',
        description: 'Set up React Native development environment and configure build tools for iOS and Android.',
        project: projects[1]._id,
        sprint: sprints[2]._id,
        assignedTo: employees[0]._id,
        createdBy: employees[3]._id,
        status: 'todo',
        priority: 'medium',
        label: 'feature',
        estimatedHours: 8,
        actualHours: 0,
        dueDate: new Date('2024-03-31')
      },
      
      // Data Analytics Dashboard Tasks
      {
        title: 'Test Task: Dashboard UI Components',
        description: 'Create reusable chart components and data visualization widgets for the analytics dashboard.',
        project: projects[2]._id,
        assignedTo: employees[1]._id,
        createdBy: employees[3]._id,
        status: 'done',
        priority: 'high',
        label: 'feature',
        estimatedHours: 15,
        actualHours: 16,
        dueDate: new Date('2024-02-15')
      },
      {
        title: 'Test Task: Data Processing Pipeline',
        description: 'Implement ETL processes for data transformation and aggregation from multiple sources.',
        project: projects[2]._id,
        assignedTo: employees[2]._id,
        createdBy: employees[3]._id,
        status: 'done',
        priority: 'high',
        label: 'feature',
        estimatedHours: 18,
        actualHours: 20,
        dueDate: new Date('2024-02-20')
      },
      
      // API Integration System Tasks
      {
        title: 'Test Task: Third-party API Connectors',
        description: 'Develop connectors for Salesforce, HubSpot, and other third-party APIs with authentication handling.',
        project: projects[3]._id,
        sprint: sprints[3]._id,
        assignedTo: employees[0]._id,
        createdBy: employees[3]._id,
        status: 'in-progress',
        priority: 'high',
        label: 'feature',
        estimatedHours: 25,
        actualHours: 12,
        dueDate: new Date('2024-04-15')
      },
      {
        title: 'Test Task: Data Synchronization Engine',
        description: 'Build automated data synchronization engine with conflict resolution and error recovery.',
        project: projects[3]._id,
        sprint: sprints[3]._id,
        assignedTo: employees[2]._id,
        createdBy: employees[3]._id,
        status: 'todo',
        priority: 'high',
        label: 'feature',
        estimatedHours: 20,
        actualHours: 0,
        dueDate: new Date('2024-04-30')
      },
      {
        title: 'Test Task: API Documentation',
        description: 'Create comprehensive API documentation with examples and integration guides.',
        project: projects[3]._id,
        sprint: sprints[3]._id,
        assignedTo: employees[1]._id,
        createdBy: employees[3]._id,
        status: 'todo',
        priority: 'medium',
        label: 'documentation',
        estimatedHours: 8,
        actualHours: 0,
        dueDate: new Date('2024-04-30')
      },
      
      // Customer Portal Tasks
      {
        title: 'Test Task: Portal Architecture Design',
        description: 'Design scalable architecture for customer portal with microservices approach.',
        project: projects[4]._id,
        assignedTo: employees[3]._id,
        createdBy: employees[3]._id,
        status: 'todo',
        priority: 'medium',
        label: 'design',
        estimatedHours: 12,
        actualHours: 0,
        dueDate: new Date('2024-04-15')
      },
      {
        title: 'Test Task: User Interface Mockups',
        description: 'Create high-fidelity mockups for customer portal screens and user experience flows.',
        project: projects[4]._id,
        assignedTo: employees[1]._id,
        createdBy: employees[3]._id,
        status: 'todo',
        priority: 'medium',
        label: 'design',
        estimatedHours: 10,
        actualHours: 0,
        dueDate: new Date('2024-04-20')
      }
    ]
    
    for (const taskInfo of taskData) {
      const task = new Task(taskInfo)
      await task.save()
      console.log(`✅ Created task: ${task.title}`)
    }
    
    console.log('\n🎉 Test data creation completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`- ${clients.length} clients created`)
    console.log(`- ${employees.length} employees created`)
    console.log(`- ${projects.length} projects created`)
    console.log(`- ${sprints.length} sprints created`)
    console.log(`- ${taskData.length} tasks created`)
    
    console.log('\n🔑 Test Account Credentials:')
    console.log('\nClients:')
    clients.forEach(client => {
      console.log(`- ${client.email} / TestPass123!`)
    })
    
    console.log('\nEmployees:')
    employees.forEach(employee => {
      console.log(`- ${employee.email} / TestPass123!`)
    })
    
    console.log('\n💡 You can now test the employee portal with these accounts!')
    
  } catch (error) {
    console.error('❌ Error creating test data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the script
createTestData() 