const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')
const Vendor = require('../src/models/Vendor')
const Project = require('../src/models/Project')
const Conversation = require('../src/models/Conversation')
const Message = require('../src/models/Message')
const config = require('../src/config')

async function createChatTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('Connected to MongoDB')
    
    // Clear existing test data
    console.log('Clearing existing test data...')
    await User.deleteMany({ 
      $or: [
        { email: { $regex: /test\d+@/ } },
        { email: 'admin@linton.com' },
        { email: 'manager@linton.com' },
        { email: 'developer@linton.com' },
        { email: 'designer@linton.com' },
        { email: 'client1@acmecorp.com' },
        { email: 'client2@techstart.com' },
        { email: 'client3@innovateco.com' },
        { email: 'employee1@linton.com' },
        { email: 'employee2@linton.com' },
        { email: 'employee3@linton.com' }
      ]
    })
    await Vendor.deleteMany({ 
      $or: [
        { name: { $regex: /Test Vendor/ } },
        { name: 'Linton Systems' },
        { name: 'Acme Corporation' },
        { name: 'TechStart Inc' }
      ]
    })
    await Project.deleteMany({ name: { $regex: /Test Project/ } })
    await Conversation.deleteMany({ name: { $regex: /Test Chat/ } })
    await Message.deleteMany({ content: { $regex: /Test message/ } })
    
    console.log('Creating test data...')
    
    // Create test vendors
    const vendors = []
    const vendorData = [
      {
        companyName: 'Linton Systems',
        slug: 'linton-systems',
        email: 'admin@linton.com',
        password: 'TestPass123!',
        contactPerson: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+1234567890',
          position: 'System Administrator'
        },
        industry: 'software-development',
        companySize: '11-25',
        website: 'https://linton-systems.com',
        description: 'Leading software development company specializing in custom solutions.',
        subscription: {
          plan: 'enterprise',
          status: 'active',
          currentPeriodStart: new Date('2024-01-01'),
          currentPeriodEnd: new Date('2024-12-31')
        },
        isActive: true,
        isEmailVerified: true
      },
      {
        companyName: 'Acme Corporation',
        slug: 'acme-corp',
        email: 'admin@acmecorp.com',
        password: 'TestPass123!',
        contactPerson: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+1234567891',
          position: 'CTO'
        },
        industry: 'consulting',
        companySize: '26-50',
        website: 'https://acme-corp.com',
        description: 'Manufacturing company with innovative solutions.',
        subscription: {
          plan: 'professional',
          status: 'active',
          currentPeriodStart: new Date('2024-01-01'),
          currentPeriodEnd: new Date('2024-12-31')
        },
        isActive: true,
        isEmailVerified: true
      },
      {
        companyName: 'TechStart Inc',
        slug: 'techstart-inc',
        email: 'admin@techstart.com',
        password: 'TestPass123!',
        contactPerson: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '+1234567892',
          position: 'CEO'
        },
        industry: 'web-development',
        companySize: '1-5',
        website: 'https://techstart-inc.com',
        description: 'Innovative startup focused on web development.',
        subscription: {
          plan: 'starter',
          status: 'active',
          currentPeriodStart: new Date('2024-01-01'),
          currentPeriodEnd: new Date('2024-12-31')
        },
        isActive: true,
        isEmailVerified: true
      }
    ]
    
    for (const vendorInfo of vendorData) {
      const vendor = new Vendor(vendorInfo)
      await vendor.save()
      vendors.push(vendor)
      console.log(`✅ Created vendor: ${vendor.name} (${vendor.email})`)
    }
    
    // Create test users for Linton Systems
    const lintonUsers = []
    const lintonUserData = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@linton.com',
        password: 'TestPass123!',
        role: 'admin',
        company: 'Linton Systems',
        position: 'System Administrator',
        vendor: vendors[0]._id,
        isActive: true,
        isEmailVerified: true,
        permissions: ['manage_users', 'manage_billing', 'view_analytics', 'read_projects', 'write_projects', 'delete_projects', 'read_tasks', 'write_tasks', 'delete_tasks']
      },
      {
        firstName: 'Project',
        lastName: 'Manager',
        email: 'manager@linton.com',
        password: 'TestPass123!',
        role: 'employee',
        company: 'Linton Systems',
        position: 'Project Manager',
        vendor: vendors[0]._id,
        isActive: true,
        isEmailVerified: true,
        permissions: ['manage_users', 'view_analytics', 'read_projects', 'write_projects', 'read_tasks', 'write_tasks']
      },
      {
        firstName: 'Senior',
        lastName: 'Developer',
        email: 'developer@linton.com',
        password: 'TestPass123!',
        role: 'employee',
        company: 'Linton Systems',
        position: 'Senior Developer',
        vendor: vendors[0]._id,
        isActive: true,
        isEmailVerified: true,
        permissions: ['read_projects', 'write_projects', 'read_tasks', 'write_tasks', 'view_analytics']
      },
      {
        firstName: 'UI/UX',
        lastName: 'Designer',
        email: 'designer@linton.com',
        password: 'TestPass123!',
        role: 'employee',
        company: 'Linton Systems',
        position: 'UI/UX Designer',
        vendor: vendors[0]._id,
        isActive: true,
        isEmailVerified: true,
        permissions: ['read_projects', 'read_tasks', 'write_tasks']
      }
    ]
    
    for (const userInfo of lintonUserData) {
      const user = new User(userInfo)
      await user.save()
      lintonUsers.push(user)
      console.log(`✅ Created Linton user: ${user.firstName} ${user.lastName} (${user.email})`)
    }
    
    // Create test users for Acme Corporation
    const acmeUsers = []
    const acmeUserData = [
      {
        firstName: 'Client',
        lastName: 'One',
        email: 'client1@acmecorp.com',
        password: 'TestPass123!',
        role: 'client',
        company: 'Acme Corporation',
        position: 'CTO',
        vendor: vendors[1]._id,
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Client',
        lastName: 'Two',
        email: 'client2@acmecorp.com',
        password: 'TestPass123!',
        role: 'client',
        company: 'Acme Corporation',
        position: 'Product Manager',
        vendor: vendors[1]._id,
        isActive: true,
        isEmailVerified: true
      }
    ]
    
    for (const userInfo of acmeUserData) {
      const user = new User(userInfo)
      await user.save()
      acmeUsers.push(user)
      console.log(`✅ Created Acme user: ${user.firstName} ${user.lastName} (${user.email})`)
    }
    
    // Create test users for TechStart Inc
    const techstartUsers = []
    const techstartUserData = [
      {
        firstName: 'Client',
        lastName: 'Three',
        email: 'client3@techstart.com',
        password: 'TestPass123!',
        role: 'client',
        company: 'TechStart Inc',
        position: 'CEO',
        vendor: vendors[2]._id,
        isActive: true,
        isEmailVerified: true
      }
    ]
    
    for (const userInfo of techstartUserData) {
      const user = new User(userInfo)
      await user.save()
      techstartUsers.push(user)
      console.log(`✅ Created TechStart user: ${user.firstName} ${user.lastName} (${user.email})`)
    }
    
    // Create test projects
    const projects = []
    const projectData = [
      {
        name: 'Test Project: E-commerce Platform',
        description: 'A modern e-commerce platform with advanced features.',
        client: acmeUsers[0]._id,
        vendor: vendors[1]._id,
        status: 'in-progress',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
        budget: 50000,
        team: [lintonUsers[1]._id, lintonUsers[2]._id, lintonUsers[3]._id],
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        priority: 'high'
      },
      {
        name: 'Test Project: Mobile App',
        description: 'Cross-platform mobile application for task management.',
        client: techstartUsers[0]._id,
        vendor: vendors[2]._id,
        status: 'planning',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-15'),
        budget: 35000,
        team: [lintonUsers[1]._id, lintonUsers[2]._id],
        technologies: ['React Native', 'Firebase', 'Redux'],
        priority: 'medium'
      }
    ]
    
    for (const projectInfo of projectData) {
      const project = new Project(projectInfo)
      await project.save()
      projects.push(project)
      console.log(`✅ Created project: ${project.name}`)
    }
    
    // Create test conversations
    const conversations = []
    const conversationData = [
      {
        name: 'Test Chat: Project Discussion',
        type: 'group',
        description: 'General discussion about project progress',
        vendor: vendors[1]._id,
        participants: [
          { user: lintonUsers[1]._id, role: 'admin' },
          { user: lintonUsers[2]._id, role: 'member' },
          { user: lintonUsers[3]._id, role: 'member' },
          { user: acmeUsers[0]._id, role: 'member' }
        ],
        project: projects[0]._id,
        createdBy: lintonUsers[1]._id
      },
      {
        name: 'Test Chat: Direct Message',
        type: 'direct',
        vendor: vendors[1]._id,
        participants: [
          { user: lintonUsers[1]._id, role: 'member' },
          { user: acmeUsers[0]._id, role: 'member' }
        ],
        createdBy: lintonUsers[1]._id
      },
      {
        name: 'Test Chat: Tech Discussion',
        type: 'group',
        description: 'Technical discussion and architecture planning',
        vendor: vendors[2]._id,
        participants: [
          { user: lintonUsers[2]._id, role: 'admin' },
          { user: lintonUsers[3]._id, role: 'member' },
          { user: techstartUsers[0]._id, role: 'member' }
        ],
        project: projects[1]._id,
        createdBy: lintonUsers[2]._id
      }
    ]
    
    for (const conversationInfo of conversationData) {
      const conversation = new Conversation(conversationInfo)
      await conversation.save()
      conversations.push(conversation)
      console.log(`✅ Created conversation: ${conversation.name}`)
    }
    
    // Create test messages
    const messages = []
    const messageData = [
      {
        content: 'Test message: Hello everyone! Welcome to the project discussion.',
        conversation: conversations[0]._id,
        sender: lintonUsers[1]._id,
        vendor: vendors[1]._id,
        messageType: 'text'
      },
      {
        content: 'Test message: Thanks! Looking forward to working with the team.',
        conversation: conversations[0]._id,
        sender: acmeUsers[0]._id,
        vendor: vendors[1]._id,
        messageType: 'text'
      },
      {
        content: 'Test message: Hi there! How is the project coming along?',
        conversation: conversations[1]._id,
        sender: lintonUsers[1]._id,
        vendor: vendors[1]._id,
        messageType: 'text'
      },
      {
        content: 'Test message: Great! The technical architecture looks solid.',
        conversation: conversations[2]._id,
        sender: lintonUsers[2]._id,
        vendor: vendors[2]._id,
        messageType: 'text'
      }
    ]
    
    for (const messageInfo of messageData) {
      const message = new Message(messageInfo)
      await message.save()
      messages.push(message)
      console.log(`✅ Created message: ${message.content.substring(0, 50)}...`)
    }
    
    console.log('\n🎉 Chat test data created successfully!')
    console.log('\n📋 Test Credentials:')
    console.log('==================')
    
    console.log('\n🏢 Linton Systems (Vendor):')
    console.log('Admin: admin@linton.com / TestPass123!')
    console.log('Manager: manager@linton.com / TestPass123!')
    console.log('Developer: developer@linton.com / TestPass123!')
    console.log('Designer: designer@linton.com / TestPass123!')
    
    console.log('\n🏭 Acme Corporation (Vendor):')
    console.log('Client 1: client1@acmecorp.com / TestPass123!')
    console.log('Client 2: client2@acmecorp.com / TestPass123!')
    
    console.log('\n🚀 TechStart Inc (Vendor):')
    console.log('Client 3: client3@techstart.com / TestPass123!')
    
    console.log('\n💬 Test Conversations:')
    console.log('- Project Discussion (Group chat with Linton team + Acme client)')
    console.log('- Direct Message (Manager ↔ Client)')
    console.log('- Tech Discussion (Developer team + TechStart client)')
    
    console.log('\n🔗 API Endpoints to test:')
    console.log('- GET /api/chat/conversations (get user conversations)')
    console.log('- GET /api/chat/conversations/:id/messages (get messages)')
    console.log('- POST /api/chat/messages/text (send text message)')
    console.log('- POST /api/chat/messages/file (send file message)')
    
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error creating test data:', error)
    process.exit(1)
  }
}

// Run the script
createChatTestData() 