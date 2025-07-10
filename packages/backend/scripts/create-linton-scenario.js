const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const Project = require('../src/models/Project')
const Task = require('../src/models/Task')
const Sprint = require('../src/models/Sprint')
const Vendor = require('../src/models/Vendor')
const bcrypt = require('bcryptjs')

async function createLintonScenario() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Vendor.deleteMany({})
    await Project.deleteMany({})
    await Task.deleteMany({})
    await Sprint.deleteMany({})
    console.log('🧹 Cleared existing data')

    // Create Linton-Tech (Service Provider)
    const lintonTech = new Vendor({
      companyName: 'Linton-Tech',
      slug: 'linton-tech',
      email: 'admin@linton-tech.com',
      password: await bcrypt.hash('LintonTech123!', 10),
      contactPerson: {
        firstName: 'David',
        lastName: 'Wilson',
        phone: '+1-555-0123',
        position: 'CTO'
      },
      companySize: '26-50',
      industry: 'software-development',
      description: 'Leading technology service provider specializing in mobile and web application development',
      website: 'https://linton-tech.com',
      branding: {
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        companyName: 'Linton-Tech',
        tagline: 'Innovative Technology Solutions'
      },
      subscription: {
        plan: 'professional',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-12-31')
      }
    })
    await lintonTech.save()
    console.log('✅ Created Linton-Tech vendor')

    // Create Linton-Tech employees (11-50 employees)
    const lintonEmployees = [
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@linton.com',
        password: await bcrypt.hash('DavidWilson123!', 10),
        role: 'admin',
        position: 'CTO',
        phone: '+1-555-0001',
        department: 'Engineering',
        vendor: lintonTech._id
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@linton.com',
        password: await bcrypt.hash('SarahJohnson123!', 10),
        role: 'employee',
        position: 'Senior Developer',
        phone: '+1-555-0002',
        department: 'Engineering',
        vendor: lintonTech._id
      },
      {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.chen@linton.com',
        password: await bcrypt.hash('MikeChen123!', 10),
        role: 'employee',
        position: 'Frontend Developer',
        phone: '+1-555-0003',
        department: 'Engineering',
        vendor: lintonTech._id
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@linton.com',
        password: await bcrypt.hash('EmilyDavis123!', 10),
        role: 'employee',
        position: 'Backend Developer',
        phone: '+1-555-0004',
        department: 'Engineering',
        vendor: lintonTech._id
      },
      {
        firstName: 'Alex',
        lastName: 'Thompson',
        email: 'alex.thompson@linton.com',
        password: await bcrypt.hash('AlexThompson123!', 10),
        role: 'employee',
        position: 'UI/UX Designer',
        phone: '+1-555-0005',
        department: 'Design',
        vendor: lintonTech._id
      },
      {
        firstName: 'Jessica',
        lastName: 'Martinez',
        email: 'jessica.martinez@linton.com',
        password: await bcrypt.hash('JessicaMartinez123!', 10),
        role: 'employee',
        position: 'Project Manager',
        phone: '+1-555-0006',
        department: 'Project Management',
        vendor: lintonTech._id
      },
      {
        firstName: 'Ryan',
        lastName: 'Anderson',
        email: 'ryan.anderson@linton.com',
        password: await bcrypt.hash('RyanAnderson123!', 10),
        role: 'employee',
        position: 'DevOps Engineer',
        phone: '+1-555-0007',
        department: 'Engineering',
        vendor: lintonTech._id
      },
      {
        firstName: 'Lisa',
        lastName: 'Garcia',
        email: 'lisa.garcia@linton.com',
        password: await bcrypt.hash('LisaGarcia123!', 10),
        role: 'employee',
        position: 'QA Engineer',
        phone: '+1-555-0008',
        department: 'Quality Assurance',
        vendor: lintonTech._id
      },
      {
        firstName: 'Kevin',
        lastName: 'Brown',
        email: 'kevin.brown@linton.com',
        password: await bcrypt.hash('KevinBrown123!', 10),
        role: 'employee',
        position: 'Mobile Developer',
        phone: '+1-555-0009',
        department: 'Engineering',
        vendor: lintonTech._id
      },
      {
        firstName: 'Amanda',
        lastName: 'Wilson',
        email: 'amanda.wilson@linton.com',
        password: await bcrypt.hash('AmandaWilson123!', 10),
        role: 'employee',
        position: 'Business Analyst',
        phone: '+1-555-0010',
        department: 'Business Analysis',
        vendor: lintonTech._id
      },
      {
        firstName: 'Chris',
        lastName: 'Lee',
        email: 'chris.lee@linton.com',
        password: await bcrypt.hash('ChrisLee123!', 10),
        role: 'employee',
        position: 'Full Stack Developer',
        phone: '+1-555-0011',
        department: 'Engineering',
        vendor: lintonTech._id
      }
    ]

    const createdEmployees = []
    for (const empData of lintonEmployees) {
      const employee = new User(empData)
      await employee.save()
      createdEmployees.push(employee)
      console.log(`✅ Created employee: ${employee.firstName} ${employee.lastName}`)
    }

    // Create HK Applications client
    const hkApplications = new User({
      firstName: 'Hunter',
      lastName: 'Kaufman',
      email: 'hunter.kaufman@hkapplications.com',
      password: await bcrypt.hash('HunterKaufman123!', 10),
      role: 'client',
      position: 'CEO',
      company: 'HK Applications',
      phone: '+1-555-1001',
      address: {
        street: '456 Innovation Drive',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        country: 'USA'
      },
      vendor: lintonTech._id
    })
    await hkApplications.save()
    console.log('✅ Created HK Applications client: Hunter Kaufman')

    // Create HK Applications team members
    const hkTeamMembers = [
      {
        firstName: 'Rachel',
        lastName: 'Miller',
        email: 'rachel.miller@hkapplications.com',
        password: await bcrypt.hash('RachelMiller123!', 10),
        role: 'client',
        position: 'Product Manager',
        company: 'HK Applications',
        phone: '+1-555-1002',
        vendor: lintonTech._id
      },
      {
        firstName: 'Tom',
        lastName: 'Williams',
        email: 'tom.williams@hkapplications.com',
        password: await bcrypt.hash('TomWilliams123!', 10),
        role: 'client',
        position: 'Marketing Director',
        company: 'HK Applications',
        phone: '+1-555-1003',
        vendor: lintonTech._id
      }
    ]

    const createdClients = [hkApplications]
    for (const clientData of hkTeamMembers) {
      const client = new User(clientData)
      await client.save()
      createdClients.push(client)
      console.log(`✅ Created client: ${client.firstName} ${client.lastName}`)
    }

    // Create projects for HK Applications
    const projects = [
      {
        name: 'HK Applications Mobile App',
        description: 'Cross-platform mobile application for iOS and Android with real-time features, user authentication, and seamless integration with web platform',
        status: 'in-progress',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-08-30'),
        budget: 85000,
        client: hkApplications._id,
        projectManager: createdEmployees.find(e => e.email === 'jessica.martinez@linton.com')._id,
        team: [
          { user: createdEmployees.find(e => e.email === 'sarah.johnson@linton.com')._id, role: 'developer' },
          { user: createdEmployees.find(e => e.email === 'mike.chen@linton.com')._id, role: 'developer' },
          { user: createdEmployees.find(e => e.email === 'emily.davis@linton.com')._id, role: 'developer' },
          { user: createdEmployees.find(e => e.email === 'alex.thompson@linton.com')._id, role: 'designer' },
          { user: createdEmployees.find(e => e.email === 'kevin.brown@linton.com')._id, role: 'developer' },
          { user: createdEmployees.find(e => e.email === 'chris.lee@linton.com')._id, role: 'developer' }
        ],
        vendor: lintonTech._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id
      },
      {
        name: 'HK Applications Web Platform',
        description: 'Modern web application with responsive design, admin dashboard, and API integration for the mobile app',
        status: 'planning',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-10-15'),
        budget: 65000,
        client: hkApplications._id,
        projectManager: createdEmployees.find(e => e.email === 'jessica.martinez@linton.com')._id,
        team: [
          { user: createdEmployees.find(e => e.email === 'sarah.johnson@linton.com')._id, role: 'developer' },
          { user: createdEmployees.find(e => e.email === 'mike.chen@linton.com')._id, role: 'developer' },
          { user: createdEmployees.find(e => e.email === 'emily.davis@linton.com')._id, role: 'developer' },
          { user: createdEmployees.find(e => e.email === 'alex.thompson@linton.com')._id, role: 'designer' },
          { user: createdEmployees.find(e => e.email === 'chris.lee@linton.com')._id, role: 'developer' }
        ],
        vendor: lintonTech._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id
      }
    ]

    const createdProjects = []
    for (const projectData of projects) {
      const project = new Project(projectData)
      await project.save()
      await project.populate('client', 'firstName lastName email')
      await project.populate('projectManager', 'firstName lastName email')
      await project.populate('team.user', 'firstName lastName email')
      createdProjects.push(project)
      console.log(`✅ Created project: ${project.name}`)
    }

    // Create tasks for each project
    const mobileAppTasks = [
      {
        title: 'User Authentication System',
        description: 'Implement secure user authentication with JWT tokens, social login (Google, Apple), and biometric authentication',
        type: 'feature',
        priority: 'high',
        status: 'in-progress',
        estimatedHours: 80,
        dueDate: new Date('2024-02-28'),
        assignedTo: createdEmployees.find(e => e.email === 'emily.davis@linton.com')._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        vendor: lintonTech._id,
        project: createdProjects[0]._id,
        labels: ['backend', 'security'],
        tags: ['authentication', 'api', 'mobile']
      },
      {
        title: 'Mobile UI/UX Design',
        description: 'Create comprehensive mobile UI/UX design system with native iOS and Android components',
        type: 'feature',
        priority: 'high',
        status: 'in-progress',
        estimatedHours: 60,
        dueDate: new Date('2024-02-15'),
        assignedTo: createdEmployees.find(e => e.email === 'alex.thompson@linton.com')._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        vendor: lintonTech._id,
        project: createdProjects[0]._id,
        labels: ['design', 'ui/ux'],
        tags: ['mobile', 'design-system']
      },
      {
        title: 'Real-time Chat Feature',
        description: 'Implement real-time chat functionality with push notifications and message encryption',
        type: 'feature',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 100,
        dueDate: new Date('2024-04-15'),
        assignedTo: createdEmployees.find(e => e.email === 'sarah.johnson@linton.com')._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        vendor: lintonTech._id,
        project: createdProjects[0]._id,
        labels: ['backend', 'frontend'],
        tags: ['realtime', 'chat', 'notifications']
      },
      {
        title: 'Offline Data Sync',
        description: 'Implement offline data synchronization with conflict resolution and background sync',
        type: 'feature',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 90,
        dueDate: new Date('2024-05-01'),
        assignedTo: createdEmployees.find(e => e.email === 'kevin.brown@linton.com')._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        vendor: lintonTech._id,
        project: createdProjects[0]._id,
        labels: ['backend', 'mobile'],
        tags: ['offline', 'sync', 'data']
      },
      {
        title: 'Push Notifications',
        description: 'Implement push notification system for iOS and Android with custom notification types',
        type: 'feature',
        priority: 'low',
        status: 'todo',
        estimatedHours: 50,
        dueDate: new Date('2024-06-01'),
        assignedTo: createdEmployees.find(e => e.email === 'kevin.brown@linton.com')._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        vendor: lintonTech._id,
        project: createdProjects[0]._id,
        labels: ['mobile', 'notifications'],
        tags: ['push', 'notifications']
      }
    ]

    const webPlatformTasks = [
      {
        title: 'Responsive Web Design',
        description: 'Create responsive web design that works seamlessly across desktop, tablet, and mobile devices',
        type: 'feature',
        priority: 'high',
        status: 'todo',
        estimatedHours: 70,
        dueDate: new Date('2024-04-30'),
        assignedTo: createdEmployees.find(e => e.email === 'mike.chen@linton.com')._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        vendor: lintonTech._id,
        project: createdProjects[1]._id,
        labels: ['frontend', 'design'],
        tags: ['responsive', 'web-design']
      },
      {
        title: 'Admin Dashboard',
        description: 'Build comprehensive admin dashboard with user management, analytics, and system monitoring',
        type: 'feature',
        priority: 'high',
        status: 'todo',
        estimatedHours: 120,
        dueDate: new Date('2024-06-15'),
        assignedTo: createdEmployees.find(e => e.email === 'chris.lee@linton.com')._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        vendor: lintonTech._id,
        project: createdProjects[1]._id,
        labels: ['frontend', 'backend'],
        tags: ['admin', 'dashboard', 'analytics']
      },
      {
        title: 'API Development',
        description: 'Develop RESTful API endpoints for mobile app integration with comprehensive documentation',
        type: 'feature',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 80,
        dueDate: new Date('2024-05-30'),
        assignedTo: createdEmployees.find(e => e.email === 'emily.davis@linton.com')._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        vendor: lintonTech._id,
        project: createdProjects[1]._id,
        labels: ['backend', 'api'],
        tags: ['api', 'documentation']
      }
    ]

    const allTasks = [...mobileAppTasks, ...webPlatformTasks]
    const createdTasks = []
    for (const taskData of allTasks) {
      const task = new Task(taskData)
      await task.save()
      createdTasks.push(task)
    }
    console.log(`✅ Created ${createdTasks.length} tasks`)

    // Create sprints for each project
    const mobileAppSprints = [
      {
        name: 'Sprint 1: Foundation',
        description: 'Set up project foundation, authentication system, and basic UI components',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        status: 'active',
        project: createdProjects[0]._id,
        vendor: lintonTech._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        backlog: createdTasks.filter(t => ['User Authentication System', 'Mobile UI/UX Design'].includes(t.title)).map(t => ({ task: t._id }))
      },
      {
        name: 'Sprint 2: Core Features',
        description: 'Implement core app features including real-time chat and data management',
        startDate: new Date('2024-02-16'),
        endDate: new Date('2024-04-15'),
        status: 'planning',
        project: createdProjects[0]._id,
        vendor: lintonTech._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        backlog: createdTasks.filter(t => ['Real-time Chat Feature', 'Offline Data Sync'].includes(t.title)).map(t => ({ task: t._id }))
      },
      {
        name: 'Sprint 3: Polish & Launch',
        description: 'Final polish, push notifications, and preparation for app store launch',
        startDate: new Date('2024-04-16'),
        endDate: new Date('2024-06-01'),
        status: 'planning',
        project: createdProjects[0]._id,
        vendor: lintonTech._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        backlog: createdTasks.filter(t => ['Push Notifications'].includes(t.title)).map(t => ({ task: t._id }))
      }
    ]

    const webPlatformSprints = [
      {
        name: 'Sprint 1: Web Foundation',
        description: 'Set up web project foundation and responsive design system',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-04-30'),
        status: 'planning',
        project: createdProjects[1]._id,
        vendor: lintonTech._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        backlog: createdTasks.filter(t => ['Responsive Web Design'].includes(t.title)).map(t => ({ task: t._id }))
      },
      {
        name: 'Sprint 2: Admin & API',
        description: 'Develop admin dashboard and API endpoints for mobile integration',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-07-15'),
        status: 'planning',
        project: createdProjects[1]._id,
        vendor: lintonTech._id,
        createdBy: createdEmployees.find(e => e.email === 'david.wilson@linton.com')._id,
        backlog: createdTasks.filter(t => ['Admin Dashboard', 'API Development'].includes(t.title)).map(t => ({ task: t._id }))
      }
    ]

    const allSprints = [...mobileAppSprints, ...webPlatformSprints]
    const createdSprints = []
    for (const sprintData of allSprints) {
      const sprint = new Sprint(sprintData)
      await sprint.save()
      createdSprints.push(sprint)
    }
    console.log(`✅ Created ${createdSprints.length} sprints`)

    console.log('\n🎉 Linton-Tech scenario created successfully!')
    console.log('\n📋 Summary:')
    console.log(`- Vendor: Linton-Tech`)
    console.log(`- Employees: ${createdEmployees.length}`)
    console.log(`- Clients: ${createdClients.length}`)
    console.log(`- Projects: ${createdProjects.length}`)
    console.log(`- Tasks: ${createdTasks.length}`)
    console.log(`- Sprints: ${createdSprints.length}`)

    console.log('\n🔑 Test Credentials:')
    console.log('\n👨‍💼 Linton-Tech Admin:')
    console.log('   Email: david.wilson@linton.com')
    console.log('   Password: DavidWilson123!')
    console.log('   Role: Admin')

    console.log('\n👨‍💼 Linton-Tech Employee:')
    console.log('   Email: sarah.johnson@linton.com')
    console.log('   Password: SarahJohnson123!')
    console.log('   Role: Employee')

    console.log('\n👨‍💼 HK Applications CEO:')
    console.log('   Email: hunter.kaufman@hkapplications.com')
    console.log('   Password: HunterKaufman123!')
    console.log('   Role: Client')

    console.log('\n🌐 Access URLs:')
    console.log('   - Admin Panel: http://localhost:5175/login')
    console.log('   - Employee Portal: http://localhost:5174/login')
    console.log('   - Client Portal: http://localhost:5173/login')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating Linton scenario:', error)
    process.exit(1)
  }
}

createLintonScenario() 