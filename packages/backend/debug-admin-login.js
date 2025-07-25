const mongoose = require('mongoose')
const User = require('./src/models/User')
const Vendor = require('./src/models/Vendor')
const authService = require('./src/services/authService')

async function debugAdminLogin() {
  try {
    // Use test database
    const testUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test-auth'
    await mongoose.connect(testUri)
    console.log('Connected to MongoDB (test database)')

    // Find the admin user
    const admin = await User.findOne({ email: 'admin@test-vendor.com' })
    if (!admin) {
      console.log('❌ Admin user NOT found')
      return
    }
    console.log('✅ Admin user found:', {
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      vendor: admin.vendor
    })

    // Find the vendor
    const vendor = await Vendor.findOne({ slug: 'test-vendor' })
    if (!vendor) {
      console.log('❌ Vendor NOT found')
      return
    }
    console.log('✅ Vendor found:', {
      _id: vendor._id,
      companyName: vendor.companyName,
      slug: vendor.slug,
      isActive: vendor.isActive
    })

    // Test portal access validation
    console.log('\n🔍 Testing portal access validation:')
    
    const portals = ['client', 'employee', 'admin', 'super_admin']
    for (const portal of portals) {
      const hasAccess = authService.validatePortalAccess(admin, vendor, portal)
      console.log(`Portal '${portal}': ${hasAccess ? '✅' : '❌'}`)
    }

    // Test vendor matching
    console.log('\n🔍 Testing vendor matching:')
    console.log('Admin vendor ID:', admin.vendor.toString())
    console.log('Vendor ID:', vendor._id.toString())
    console.log('Vendor match:', admin.vendor.toString() === vendor._id.toString())

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

debugAdminLogin() 