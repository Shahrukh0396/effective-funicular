const mongoose = require('mongoose')
const config = require('../src/config')
const User = require('../src/models/User')
const Conversation = require('../src/models/Conversation')
const Message = require('../src/models/Message')
const axios = require('axios')

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api'

async function testSarahChat() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    console.log('✅ Connected to MongoDB')

    console.log('\n🔍 INVESTIGATING SARAH JOHNSON CHAT ACCESS')
    console.log('=' .repeat(60))

    // Get Sarah Johnson from database
    const sarahJohnson = await User.findOne({ email: 'sarah.johnson@linton.com' })
    console.log('\n👤 Sarah Johnson Details:')
    console.log(`   ID: ${sarahJohnson._id}`)
    console.log(`   Name: ${sarahJohnson.firstName} ${sarahJohnson.lastName}`)
    console.log(`   Email: ${sarahJohnson.email}`)
    console.log(`   Role: ${sarahJohnson.role}`)
    console.log(`   Vendor: ${sarahJohnson.vendor}`)

    // Check all users in the same vendor
    console.log('\n👥 ALL USERS IN SARAH\'S VENDOR:')
    console.log('-' .repeat(40))
    const allUsers = await User.find({ vendor: sarahJohnson.vendor })
    console.log(`Total users in vendor: ${allUsers.length}`)
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`)
    })

    // Check existing conversations
    console.log('\n💬 EXISTING CONVERSATIONS IN DATABASE:')
    console.log('-' .repeat(40))
    const allConversations = await Conversation.find({ vendor: sarahJohnson.vendor })
    console.log(`Total conversations in vendor: ${allConversations.length}`)
    allConversations.forEach((conversation, index) => {
      console.log(`\n${index + 1}. ${conversation.name || 'Direct Chat'} (${conversation.type})`)
      console.log(`   ID: ${conversation._id}`)
      console.log(`   Participants: ${conversation.participants.length}`)
      conversation.participants.forEach(participant => {
        console.log(`     - User ID: ${participant.user}, Role: ${participant.role}`)
      })
    })

    // Check Sarah's conversations
    console.log('\n🔍 SARAH\'S CONVERSATIONS (Database Check):')
    console.log('-' .repeat(40))
    const sarahConversations = allConversations.filter(conversation => {
      return conversation.participants.some(p => p.user.toString() === sarahJohnson._id.toString())
    })
    console.log(`Sarah is in ${sarahConversations.length} conversations:`)
    sarahConversations.forEach((conversation, index) => {
      console.log(`\n${index + 1}. ${conversation.name || 'Direct Chat'} (${conversation.type})`)
      const participant = conversation.participants.find(p => p.user.toString() === sarahJohnson._id.toString())
      console.log(`   Role: ${participant.role}`)
      console.log(`   Joined At: ${participant.joinedAt}`)
    })

    // Test Sarah's login and chat API access
    console.log('\n🔐 TESTING SARAH\'S CHAT API ACCESS:')
    console.log('-' .repeat(40))
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/employee/login`, {
        email: 'sarah.johnson@linton.com',
        password: 'TestPass123!'
      })
      
      if (loginResponse.data.token) {
        console.log('✅ Sarah Johnson login successful')
        
        const sarahToken = loginResponse.data.token
        const headers = { Authorization: `Bearer ${sarahToken}` }
        
        // Test chat conversations endpoint
        try {
          const conversationsResponse = await axios.get(`${BASE_URL}/chat/conversations`, { headers })
          console.log(`✅ Sarah can see ${conversationsResponse.data.data.length} conversations via API:`)
          conversationsResponse.data.data.forEach((conversation, index) => {
            console.log(`   ${index + 1}. ${conversation.name || 'Direct Chat'} (${conversation.type})`)
          })
        } catch (error) {
          console.log('❌ Sarah cannot see conversations via API:', error.response?.data?.message || error.message)
        }
        
        // Test available users endpoint
        try {
          const usersResponse = await axios.get(`${BASE_URL}/chat/users`, { headers })
          console.log(`✅ Sarah can see ${usersResponse.data.data.length} available users for chat:`)
          usersResponse.data.data.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`)
          })
        } catch (error) {
          console.log('❌ Sarah cannot see available users:', error.response?.data?.message || error.message)
        }
        
        // Test creating a direct conversation
        if (allUsers.length > 1) {
          const otherUser = allUsers.find(u => u._id.toString() !== sarahJohnson._id.toString())
          if (otherUser) {
            try {
              const createConversationResponse = await axios.post(`${BASE_URL}/chat/conversations`, {
                type: 'direct',
                participantId: otherUser._id
              }, { headers })
              console.log(`✅ Sarah can create conversation with ${otherUser.firstName} ${otherUser.lastName}`)
            } catch (error) {
              console.log('❌ Sarah cannot create conversation:', error.response?.data?.message || error.message)
            }
          }
        }
        
      } else {
        console.log('❌ Sarah Johnson login failed')
      }
    } catch (error) {
      console.log('❌ Login error:', error.response?.data?.message || error.message)
    }

    // Check for any data inconsistencies
    console.log('\n🔍 CHAT DATA CONSISTENCY CHECK:')
    console.log('-' .repeat(40))
    
    // Check if there are any conversations without Sarah but should have her
    const conversationsWithoutSarah = allConversations.filter(conversation => {
      return !conversation.participants.some(p => p.user.toString() === sarahJohnson._id.toString())
    })
    console.log(`📊 Conversations without Sarah: ${conversationsWithoutSarah.length}`)
    
    // Check if there are any users Sarah can't chat with
    const usersSarahCanChatWith = allUsers.filter(user => user._id.toString() !== sarahJohnson._id.toString())
    console.log(`👥 Users Sarah can potentially chat with: ${usersSarahCanChatWith.length}`)
    usersSarahCanChatWith.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`)
    })

    console.log('\n' + '=' .repeat(60))
    console.log('✅ SARAH JOHNSON CHAT INVESTIGATION COMPLETED!')
    console.log('=' .repeat(60))

    await mongoose.disconnect()
    console.log('\n✅ Investigation completed!')

  } catch (error) {
    console.error('❌ Error during investigation:', error)
    process.exit(1)
  }
}

testSarahChat() 