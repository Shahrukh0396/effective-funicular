const mongoose = require('mongoose')
const Conversation = require('../src/models/Conversation')
const User = require('../src/models/User')
const config = require('../src/config')

async function setupDefaultChannels() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    // Get all vendors
    const users = await User.find({ role: 'admin' }).distinct('vendorId')
    console.log(`📊 Found ${users.length} vendors to process`)

    for (const vendorId of users) {
      console.log(`🏢 Processing vendor: ${vendorId}`)
      
      // Check if default channels already exist
      const existingChannels = await Conversation.find({
        vendor: vendorId,
        type: 'channel',
        channelType: { $in: ['general', 'random'] }
      })
      
      if (existingChannels.length === 0) {
        // Create default channels
        const adminUser = await User.findOne({ vendorId, role: 'admin' })
        if (adminUser) {
          await Conversation.createDefaultChannels(vendorId, adminUser._id)
          console.log(`✅ Created default channels for vendor: ${vendorId}`)
        }
      } else {
        console.log(`⏭️ Default channels already exist for vendor: ${vendorId}`)
      }
    }

    console.log('✅ Default channels setup completed')
  } catch (error) {
    console.error('❌ Error setting up default channels:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the script
setupDefaultChannels() 