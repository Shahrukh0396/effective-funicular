const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')
const Vendor = require('../src/models/Vendor')
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
        { email: 'alex.chen@acmecorp.com' },
        { email: 'maria.garcia@acmecorp.com' },
        { email: 'david.wilson@techstart.com' },
        { email: 'lisa.anderson@innovateco.com' },
        { email: 'admin@linton.com' },
        { email: 'super.admin@linton.com' },
        { email: 'admin@linton-tech.com' },
        { email: 'admin@acmecorp.com' },
        { email: 'admin@techstart.com' },
        { email: 'admin@innovateco.com' },
        { email: 'admin@globaltech.com' }
      ]
    })
    await Vendor.deleteMany({ 
      $or: [
        { domain: 'acmecorp' },
        { domain: 'techstart' },
        { domain: 'innovateco' },
        { domain: 'globaltech' },
        { domain: 'linton' },
        { domain: 'linton-tech' }
      ]
    })
    await Project.deleteMany({ name: { $regex: /Test Project/ } })
    await Task.deleteMany({ title: { $regex: /Test Task/ } })
    await Sprint.deleteMany({ name: { $regex: /Test Sprint/ } })
    
    console.log('Creating test data...')
    
    // Create default Linton Tech LLC vendor (Platform Owner)
    const lintonTechLLC = new Vendor({
      name: 'Linton Tech LLC',
      domain: 'linton-tech',
      email: 'admin@linton-tech.com',
      subscriptionTier: 'enterprise',
      subscriptionStatus: 'active',
      clientType: 'platform-owner', // This is the platform owner
      billingInfo: {
        currency: 'USD',
        paymentMethod: 'stripe'
      },
      settings: {
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6',
          companyName: 'Linton Tech LLC',
          tagline: 'Operating System for Service Businesses'
        },
        features: [
          'projects', 'tasks', 'time_tracking', 'chat', 'file_upload', 
          'analytics', 'billing', 'white_label', 'api_access', 'custom_branding'
        ]
      },
      contactInfo: {
        address: {
          street: '555 Tech Drive',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA'
        },
        phone: '+15550555',
        website: 'https://linton-tech.com',
        primaryContact: {
          name: 'Platform Admin',
          email: 'admin@linton-tech.com',
          phone: '+15550555',
          position: 'Platform Administrator'
        }
      },
      limits: {
        maxUsers: 1000,
        maxProjects: 500,
        maxStorage: 1000
      },
      isActive: true
    })
    await lintonTechLLC.save()
    console.log(`✅ Created platform owner: ${lintonTechLLC.name} (${lintonTechLLC.domain})`)
    
    // Create white-label vendors (Service Companies using the platform)
    const vendors = []
    const vendorData = [
      {
        name: 'Acme Digital Agency',
        domain: 'acmecorp',
        email: 'admin@acmedigital.com',
        subscriptionTier: 'professional',
        subscriptionStatus: 'active',
        clientType: 'white-label-client', // White-label client
        billingInfo: {
          currency: 'USD',
          paymentMethod: 'stripe'
        },
        settings: {
          branding: {
            primaryColor: '#3B82F6',
            secondaryColor: '#8B5CF6',
            companyName: 'Acme Digital Agency',
            whiteLabel: true
          },
          features: ['projects', 'tasks', 'time_tracking', 'chat', 'file_upload', 'analytics']
        },
        whiteLabelSettings: {
          isWhiteLabelClient: true,
          whiteLabelStatus: 'active',
          whiteLabelCreatedAt: new Date()
        },
        contactInfo: {
          address: {
            street: '123 Business Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          phone: '+15550123',
          website: 'https://acmedigital.com',
          primaryContact: {
            name: 'John Smith',
            email: 'john.smith@acmecorp.com',
            phone: '+15550123',
            position: 'CTO'
          }
        },
        limits: {
          maxUsers: 25,
          maxProjects: 15,
          maxStorage: 50
        },
        isActive: true
      },
      {
        name: 'TechStart Solutions',
        domain: 'techstart',
        email: 'admin@techstart.com',
        subscriptionTier: 'starter',
        subscriptionStatus: 'active',
        clientType: 'white-label-client', // White-label client
        billingInfo: {
          currency: 'USD',
          paymentMethod: 'stripe'
        },
        settings: {
          branding: {
            primaryColor: '#10B981',
            secondaryColor: '#F59E0B',
            companyName: 'TechStart Solutions',
            whiteLabel: true
          },
          features: ['projects', 'tasks', 'time_tracking', 'chat']
        },
        whiteLabelSettings: {
          isWhiteLabelClient: true,
          whiteLabelStatus: 'active',
          whiteLabelCreatedAt: new Date()
        },
        contactInfo: {
          address: {
            street: '456 Innovation St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          phone: '+15550456',
          website: 'https://techstart.com',
          primaryContact: {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@techstart.com',
            phone: '+15550456',
            position: 'Product Manager'
          }
        },
        limits: {
          maxUsers: 10,
          maxProjects: 8,
          maxStorage: 20
        },
        isActive: true
      },
      {
        name: 'InnovateCo Development',
        domain: 'innovateco',
        email: 'admin@innovateco.com',
        subscriptionTier: 'enterprise',
        subscriptionStatus: 'active',
        clientType: 'white-label-client', // White-label client
        billingInfo: {
          currency: 'USD',
          paymentMethod: 'stripe'
        },
        settings: {
          branding: {
            primaryColor: '#8B5CF6',
            secondaryColor: '#EC4899',
            companyName: 'InnovateCo Development',
            whiteLabel: true
          },
          features: ['projects', 'tasks', 'time_tracking', 'chat', 'file_upload', 'analytics', 'billing', 'white_label']
        },
        whiteLabelSettings: {
          isWhiteLabelClient: true,
          whiteLabelStatus: 'active',
          whiteLabelCreatedAt: new Date()
        },
        contactInfo: {
          address: {
            street: '789 Enterprise Blvd',
            city: 'Austin',
            state: 'TX',
            zipCode: '73301',
            country: 'USA'
          },
          phone: '+15550789',
          website: 'https://innovateco.com',
          primaryContact: {
            name: 'Michael Brown',
            email: 'michael.brown@innovateco.com',
            phone: '+15550789',
            position: 'CEO'
          }
        },
        limits: {
          maxUsers: 100,
          maxProjects: 50,
          maxStorage: 200
        },
        isActive: true
      },
      {
        name: 'GlobalTech Systems',
        domain: 'globaltech',
        email: 'admin@globaltech.com',
        subscriptionTier: 'professional',
        subscriptionStatus: 'active',
        clientType: 'white-label-client', // White-label client
        billingInfo: {
          currency: 'USD',
          paymentMethod: 'stripe'
        },
        settings: {
          branding: {
            primaryColor: '#EF4444',
            secondaryColor: '#F97316',
            companyName: 'GlobalTech Systems',
            whiteLabel: true
          },
          features: ['projects', 'tasks', 'time_tracking', 'chat', 'file_upload', 'analytics']
        },
        whiteLabelSettings: {
          isWhiteLabelClient: true,
          whiteLabelStatus: 'active',
          whiteLabelCreatedAt: new Date()
        },
        contactInfo: {
          address: {
            street: '321 Global Way',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          },
          phone: '+15550321',
          website: 'https://globaltech.com',
          primaryContact: {
            name: 'Emily Davis',
            email: 'emily.davis@globaltech.com',
            phone: '+15550321',
            position: 'VP of Engineering'
          }
        },
        limits: {
          maxUsers: 50,
          maxProjects: 25,
          maxStorage: 100
        },
        isActive: true
      }
    ]
    
    for (const vendorInfo of vendorData) {
      const vendor = new Vendor(vendorInfo)
      await vendor.save()
      vendors.push(vendor)
      console.log(`✅ Created white-label vendor: ${vendor.name} (${vendor.domain})`)
    }
    
    // Create super admin user for Linton Tech LLC
    const superAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super.admin@linton.com',
      password: 'TestPass123!',
      role: 'super_admin',
      isActive: true,
      emailVerified: true,
      permissions: [
        'manage_users',
        'manage_projects',
        'manage_tasks',
        'view_analytics',
        'manage_billing',
        'manage_vendors',
        'manage_platform',
        'time_tracking',
        'file_upload',
        'chat_access'
      ]
    })
    await superAdmin.save()
    console.log(`✅ Created super admin: ${superAdmin.firstName} ${superAdmin.lastName} (${superAdmin.email})`)
    
    // Create admin user for Linton Tech LLC platform
    const platformAdmin = new User({
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@linton-tech.com',
      password: 'TestPass123!',
      role: 'vendor_admin',
      vendorId: lintonTechLLC._id, // Linton Tech LLC
      isActive: true,
      emailVerified: true,
      permissions: [
        'manage_users',
        'manage_projects',
        'manage_tasks',
        'view_analytics',
        'manage_billing',
        'time_tracking',
        'file_upload',
        'chat_access'
      ]
    })
    await platformAdmin.save()
    console.log(`✅ Created platform admin: ${platformAdmin.firstName} ${platformAdmin.lastName} (${platformAdmin.email})`)
    
    // Create admin users for each white-label vendor
    const vendorAdmins = []
    const vendorAdminData = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@acmecorp.com',
        password: 'TestPass123!',
        role: 'vendor_admin',
        vendorId: vendors[0]._id, // Acme Digital Agency
        isActive: true,
        emailVerified: true,
        permissions: [
          'manage_users',
          'manage_projects',
          'manage_tasks',
          'view_analytics',
          'manage_billing',
          'time_tracking',
          'file_upload',
          'chat_access'
        ]
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@techstart.com',
        password: 'TestPass123!',
        role: 'vendor_admin',
        vendorId: vendors[1]._id, // TechStart Solutions
        isActive: true,
        emailVerified: true,
        permissions: [
          'manage_users',
          'manage_projects',
          'manage_tasks',
          'view_analytics',
          'manage_billing',
          'time_tracking',
          'file_upload',
          'chat_access'
        ]
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@innovateco.com',
        password: 'TestPass123!',
        role: 'vendor_admin',
        vendorId: vendors[2]._id, // InnovateCo Development
        isActive: true,
        emailVerified: true,
        permissions: [
          'manage_users',
          'manage_projects',
          'manage_tasks',
          'view_analytics',
          'manage_billing',
          'time_tracking',
          'file_upload',
          'chat_access'
        ]
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@globaltech.com',
        password: 'TestPass123!',
        role: 'vendor_admin',
        vendorId: vendors[3]._id, // GlobalTech Systems
        isActive: true,
        emailVerified: true,
        permissions: [
          'manage_users',
          'manage_projects',
          'manage_tasks',
          'view_analytics',
          'manage_billing',
          'time_tracking',
          'file_upload',
          'chat_access'
        ]
      }
    ]
    
    for (const adminInfo of vendorAdminData) {
      const admin = new User(adminInfo)
      await admin.save()
      vendorAdmins.push(admin)
      console.log(`✅ Created vendor admin: ${admin.firstName} ${admin.lastName} (${admin.email})`)
    }
    
    // Create test clients for each vendor
    const clients = []
    const clientData = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@acmecorp.com',
        password: 'TestPass123!',
        role: 'client',
        vendorId: vendors[0]._id, // Acme Digital Agency
        isActive: true,
        emailVerified: true,
        company: 'Acme Corporation',
        position: 'CTO',
        permissions: ['chat_access', 'file_upload']
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techstart.com',
        password: 'TestPass123!',
        role: 'client',
        vendorId: vendors[1]._id, // TechStart Solutions
        isActive: true,
        emailVerified: true,
        company: 'TechStart Inc',
        position: 'Product Manager',
        permissions: ['chat_access', 'file_upload']
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@innovateco.com',
        password: 'TestPass123!',
        role: 'client',
        vendorId: vendors[2]._id, // InnovateCo Development
        isActive: true,
        emailVerified: true,
        company: 'InnovateCo Solutions',
        position: 'CEO',
        permissions: ['chat_access', 'file_upload']
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@globaltech.com',
        password: 'TestPass123!',
        role: 'client',
        vendorId: vendors[3]._id, // GlobalTech Systems
        isActive: true,
        emailVerified: true,
        company: 'GlobalTech Systems',
        position: 'VP of Engineering',
        permissions: ['chat_access', 'file_upload']
      }
    ]
    
    for (const clientInfo of clientData) {
      const client = new User(clientInfo)
      await client.save()
      clients.push(client)
      console.log(`✅ Created client: ${client.firstName} ${client.lastName} (${client.email})`)
    }
    
    // Create test employees for each vendor
    const employees = []
    const employeeData = [
      {
        firstName: 'Alex',
        lastName: 'Chen',
        email: 'alex.chen@acmecorp.com',
        password: 'TestPass123!',
        role: 'employee',
        vendorId: vendors[0]._id, // Acme Digital Agency
        isActive: true,
        emailVerified: true,
        company: 'Acme Digital Agency',
        position: 'Senior Developer',
        permissions: ['manage_projects', 'manage_tasks', 'time_tracking', 'chat_access', 'file_upload']
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@acmecorp.com',
        password: 'TestPass123!',
        role: 'employee',
        vendorId: vendors[0]._id, // Acme Digital Agency
        isActive: true,
        emailVerified: true,
        company: 'Acme Digital Agency',
        position: 'UI/UX Designer',
        permissions: ['manage_projects', 'manage_tasks', 'time_tracking', 'chat_access', 'file_upload']
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@techstart.com',
        password: 'TestPass123!',
        role: 'employee',
        vendorId: vendors[1]._id, // TechStart Solutions
        isActive: true,
        emailVerified: true,
        company: 'TechStart Solutions',
        position: 'QA Engineer',
        permissions: ['manage_projects', 'manage_tasks', 'time_tracking', 'chat_access', 'file_upload']
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@innovateco.com',
        password: 'TestPass123!',
        role: 'employee',
        vendorId: vendors[2]._id, // InnovateCo Development
        isActive: true,
        emailVerified: true,
        company: 'InnovateCo Development',
        position: 'Project Manager',
        permissions: ['manage_users', 'manage_projects', 'manage_tasks', 'time_tracking', 'chat_access', 'file_upload']
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
        vendorId: vendors[0]._id, // Acme Digital Agency
        clientId: clients[0]._id,
        type: 'web_development',
        status: 'active',
        priority: 'high',
        budget: {
          estimated: 50000,
          actual: 45000,
          currency: 'USD',
          billingType: 'fixed'
        },
        team: {
          projectManager: employees[3]._id,
          members: [
            { user: employees[0]._id, role: 'developer' },
            { user: employees[1]._id, role: 'designer' }
          ]
        },
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        timeline: {
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-30'),
          actualStartDate: new Date('2024-01-15'),
          actualEndDate: null
        }
      },
      {
        name: 'Test Project: Mobile App Development',
        description: 'Cross-platform mobile application for task management with real-time synchronization and offline capabilities.',
        vendorId: vendors[1]._id, // TechStart Solutions
        clientId: clients[1]._id,
        type: 'mobile_app',
        status: 'planning',
        priority: 'medium',
        budget: {
          estimated: 35000,
          actual: 0,
          currency: 'USD',
          billingType: 'fixed'
        },
        team: {
          projectManager: employees[3]._id,
          members: [
            { user: employees[2]._id, role: 'tester' }
          ]
        },
        technologies: ['React Native', 'Firebase', 'Redux'],
        timeline: {
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-08-15'),
          actualStartDate: null,
          actualEndDate: null
        }
      },
      {
        name: 'Test Project: Data Analytics Dashboard',
        description: 'Comprehensive analytics dashboard for business intelligence with interactive charts, data visualization, and reporting features.',
        vendorId: vendors[2]._id, // InnovateCo Development
        clientId: clients[2]._id,
        type: 'web_development',
        status: 'completed',
        priority: 'high',
        budget: {
          estimated: 25000,
          actual: 25000,
          currency: 'USD',
          billingType: 'fixed'
        },
        team: {
          projectManager: employees[3]._id,
          members: [
            { user: employees[1]._id, role: 'designer' },
            { user: employees[2]._id, role: 'tester' }
          ]
        },
        technologies: ['Vue.js', 'D3.js', 'Python', 'PostgreSQL'],
        timeline: {
          startDate: new Date('2023-10-01'),
          endDate: new Date('2024-02-28'),
          actualStartDate: new Date('2023-10-01'),
          actualEndDate: new Date('2024-02-28')
        }
      },
      {
        name: 'Test Project: API Integration System',
        description: 'Enterprise-level API integration system connecting multiple third-party services with automated data synchronization.',
        vendorId: vendors[3]._id, // GlobalTech Systems
        clientId: clients[3]._id,
        type: 'saas_development',
        status: 'active',
        priority: 'high',
        budget: {
          estimated: 40000,
          actual: 20000,
          currency: 'USD',
          billingType: 'hourly',
          hourlyRate: 150
        },
        team: {
          projectManager: employees[3]._id,
          members: [
            { user: employees[0]._id, role: 'developer' },
            { user: employees[1]._id, role: 'designer' },
            { user: employees[2]._id, role: 'tester' }
          ]
        },
        technologies: ['Node.js', 'Express', 'Redis', 'Docker'],
        timeline: {
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-07-31'),
          actualStartDate: new Date('2024-02-01'),
          actualEndDate: null
        }
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
        vendor: vendors[0]._id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        status: 'completed',
        goal: 'Set up project foundation and basic architecture'
      },
      {
        name: 'Test Sprint: Core Features',
        project: projects[0]._id,
        vendor: vendors[0]._id,
        startDate: new Date('2024-02-16'),
        endDate: new Date('2024-03-31'),
        status: 'active',
        goal: 'Implement core e-commerce functionality'
      },
      {
        name: 'Test Sprint: UI/UX Design',
        project: projects[1]._id,
        vendor: vendors[1]._id,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        status: 'planning',
        goal: 'Complete mobile app design and wireframes'
      },
      {
        name: 'Test Sprint: Backend Development',
        project: projects[3]._id,
        vendor: vendors[3]._id,
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
    const taskStatuses = ['todo', 'in-progress', 'review', 'done']
    const taskPriorities = ['low', 'medium', 'high', 'urgent']
    
    const taskData = [
      // E-commerce Platform Tasks
      {
        title: 'Test Task: User Authentication System',
        description: 'Implement secure user registration, login, and password reset functionality with JWT tokens.',
        project: projects[0]._id,
        sprint: sprints[0]._id,
        vendor: vendors[0]._id,
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
        vendor: vendors[0]._id,
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
        vendor: vendors[0]._id,
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
        vendor: vendors[0]._id,
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
        vendor: vendors[1]._id,
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
        vendor: vendors[1]._id,
        assignedTo: employees[2]._id,
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
        vendor: vendors[2]._id,
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
        vendor: vendors[2]._id,
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
        vendor: vendors[3]._id,
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
        vendor: vendors[3]._id,
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
        vendor: vendors[3]._id,
        assignedTo: employees[1]._id,
        createdBy: employees[3]._id,
        status: 'todo',
        priority: 'medium',
        label: 'documentation',
        estimatedHours: 8,
        actualHours: 0,
        dueDate: new Date('2024-04-30')
      }
    ]
    
    for (const taskInfo of taskData) {
      const task = new Task(taskInfo)
      await task.save()
      console.log(`✅ Created task: ${task.title}`)
    }
    
    console.log('\n🎉 Test data creation completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`- 1 platform owner created (Linton Tech LLC)`)
    console.log(`- ${vendors.length} white-label vendors created`)
    console.log(`- 1 super admin created`)
    console.log(`- 1 platform admin created`)
    console.log(`- ${vendorAdmins.length} vendor admins created`)
    console.log(`- ${clients.length} clients created`)
    console.log(`- ${employees.length} employees created`)
    console.log(`- ${projects.length} projects created`)
    console.log(`- ${sprints.length} sprints created`)
    console.log(`- ${taskData.length} tasks created`)
    
    console.log('\n🔑 Test Account Credentials:')
    console.log('\nSuper Admin (Platform Owner):')
    console.log(`- super.admin@linton.com / TestPass123!`)
    
    console.log('\nPlatform Admin (Linton Tech LLC):')
    console.log(`- admin@linton-tech.com / TestPass123!`)
    
    console.log('\nVendor Admins:')
    vendorAdmins.forEach((admin, index) => {
      const vendorName = vendors[index].name
      console.log(`- ${admin.email} / TestPass123! (${vendorName})`)
    })
    
    console.log('\nClients:')
    clients.forEach(client => {
      console.log(`- ${client.email} / TestPass123!`)
    })
    
    console.log('\nEmployees:')
    employees.forEach(employee => {
      console.log(`- ${employee.email} / TestPass123!`)
    })
    
    console.log('\n💡 You can now test all portals with these accounts!')
    console.log('\n🌐 Platform Structure:')
    console.log(`- Platform Owner: Linton Tech LLC (linton-tech.linton.com)`)
    console.log('\nWhite-Label Vendors:')
    vendors.forEach(vendor => {
      console.log(`- ${vendor.name}: ${vendor.domain}.linton.com`)
    })
    
  } catch (error) {
    console.error('❌ Error creating test data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the script
createTestData() 