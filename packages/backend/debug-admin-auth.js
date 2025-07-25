const mongoose = require('mongoose')
const User = require('./src/models/User')
const Vendor = require('./src/models/Vendor')
const config = require('./src/config')

async function debugAdminAuth() {
  try {
    // Use test database
    const testUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test-auth'
    await mongoose.connect(testUri)
    console.log('Connected to MongoDB (test database)')

    // Find the admin user
    const admin = await User.findOne({ email: 'admin@test-vendor.com' })
    if (!admin) {
      console.log('❌ Admin user NOT found')
      console.log('All users in database:')
      const allUsers = await User.find({})
      allUsers.forEach(user => {
        console.log(`- ${user.email} (role: ${user.role})`)
      })
    } else {
      console.log('✅ Admin user found:', {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        vendor: admin.vendor,
        permissions: admin.permissions
      })
    }

    // Find the vendor
    const vendor = await Vendor.findOne({ slug: 'test-vendor' })
    if (!vendor) {
      console.log('❌ Vendor NOT found')
      console.log('All vendors in database:')
      const allVendors = await Vendor.find({})
      allVendors.forEach(v => {
        console.log(`- ${v.companyName} (slug: ${v.slug})`)
      })
    } else {
      console.log('✅ Vendor found:', {
        _id: vendor._id,
        companyName: vendor.companyName,
        slug: vendor.slug,
        isActive: vendor.isActive
      })
    }

    if (admin && vendor) {
      // Check if admin belongs to vendor
      console.log('Admin vendor matches test vendor:', admin.vendor.toString() === vendor._id.toString())
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error)
  }
}

debugAdminAuth() 