const mongoose = require('mongoose')
const Vendor = require('../src/models/Vendor')
const User = require('../src/models/User')
const Project = require('../src/models/Project')
const config = require('../src/config')

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

async function createDemoVendor() {
  try {
    console.log('🚀 Creating demo vendor...')

    // Create demo vendor
    const vendor = new Vendor({
      companyName: 'Acme Digital Agency',
      slug: 'acme-digital',
      email: 'demo@acmedigital.com',
      password: 'DemoPassword123!',
      contactPerson: {
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1-555-0123',
        position: 'CEO'
      },
      industry: 'digital-marketing',
      companySize: '11-25',
      website: 'https://acmedigital.com',
      description: 'A leading digital marketing agency specializing in SEO, PPC, and social media marketing.',
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        companyName: 'Acme Digital',
        tagline: 'Digital Marketing That Drives Results'
      },
      subscription: {
        plan: 'professional',
        status: 'active',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      limits: {
        agents: 25,
        contractors: 50,
        projects: 100,
        storage: 50 * 1024 * 1024 * 1024 // 50GB
      },
      usage: {
        agents: 0,
        contractors: 0,
        projects: 0,
        storage: 0
      },
      isEmailVerified: true,
      onboarding: {
        step: 'completed',
        completedSteps: ['company-info', 'branding', 'team-setup', 'first-project'],
        isCompleted: true
      }
    })

    await vendor.save()
    console.log('✅ Demo vendor created:', vendor.companyName)

    // Create demo team members
    const teamMembers = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@acmedigital.com',
        role: 'employee',
        position: 'Project Manager'
      },
      {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike@acmedigital.com',
        role: 'employee',
        position: 'Senior Developer'
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily@acmedigital.com',
        role: 'employee',
        position: 'Designer'
      }
    ]

    console.log('👥 Creating demo team members...')
    for (const member of teamMembers) {
      const user = new User({
        ...member,
        password: 'DemoPassword123!',
        vendor: vendor._id,
        company: vendor.companyName,
        isEmailVerified: true
      })
      await user.save()
      console.log(`✅ Created team member: ${member.firstName} ${member.lastName}`)
    }

    // Create demo clients
    const clients = [
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert@techstartup.com',
        role: 'client',
        company: 'TechStartup Inc'
      },
      {
        firstName: 'Lisa',
        lastName: 'Brown',
        email: 'lisa@ecommerce.com',
        role: 'client',
        company: 'E-Commerce Solutions'
      }
    ]

    console.log('👤 Creating demo clients...')
    for (const client of clients) {
      const user = new User({
        ...client,
        password: 'DemoPassword123!',
        vendor: vendor._id,
        isEmailVerified: true
      })
      await user.save()
      console.log(`✅ Created client: ${client.firstName} ${client.lastName}`)
    }

    // Create demo projects
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Complete redesign of the company website with modern UI/UX and improved performance.',
        client: await User.findOne({ email: 'robert@techstartup.com', vendor: vendor._id }),
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        budget: 15000,
        status: 'in-progress',
        priority: 'high'
      },
      {
        name: 'SEO Campaign',
        description: 'Comprehensive SEO campaign to improve search rankings and organic traffic.',
        client: await User.findOne({ email: 'lisa@ecommerce.com', vendor: vendor._id }),
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 30 days ago
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days total
        budget: 8000,
        status: 'in-progress',
        priority: 'medium'
      }
    ]

    console.log('📁 Creating demo projects...')
    for (const projectData of projects) {
      const project = new Project({
        ...projectData,
        vendor: vendor._id,
        createdBy: vendor._id
      })
      await project.save()
      console.log(`✅ Created project: ${projectData.name}`)
    }

    // Update vendor usage
    vendor.usage.agents = teamMembers.length
    vendor.usage.contractors = clients.length
    vendor.usage.projects = projects.length
    await vendor.save()

    console.log('')
    console.log('🎉 Demo vendor setup completed!')
    console.log('')
    console.log('📋 Demo Vendor Details:')
    console.log(`   Company: ${vendor.companyName}`)
    console.log(`   Slug: ${vendor.slug}`)
    console.log(`   Email: ${vendor.email}`)
    console.log(`   Password: DemoPassword123!`)
    console.log('')
    console.log('👥 Team Members:')
    teamMembers.forEach(member => {
      console.log(`   - ${member.firstName} ${member.lastName} (${member.email})`)
    })
    console.log('')
    console.log('👤 Clients:')
    clients.forEach(client => {
      console.log(`   - ${client.firstName} ${client.lastName} (${client.email})`)
    })
    console.log('')
    console.log('📁 Projects:')
    projects.forEach(project => {
      console.log(`   - ${project.name}`)
    })
    console.log('')
    console.log('🌐 Access URLs:')
    console.log(`   - Vendor Dashboard: http://localhost:5175/login`)
    console.log(`   - Client Portal: http://localhost:5173/login`)
    console.log(`   - Employee Portal: http://localhost:5174/login`)
    console.log('')
    console.log('🔑 All users have password: DemoPassword123!')

  } catch (error) {
    console.error('❌ Error creating demo vendor:', error)
  } finally {
    mongoose.connection.close()
    console.log('✅ Database connection closed')
  }
}

// Run the script
createDemoVendor() 