const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
  // Basic conversation info
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'project', 'channel', 'support'],
    default: 'direct',
    required: true
  },
  
  // Channel type (for Slack-like channels)
  channelType: {
    type: String,
    enum: ['general', 'random', 'project', 'custom'],
    default: 'custom'
  },
  
  // Channel visibility (public/private)
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Channel purpose/description
  purpose: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Channel topic
  topic: {
    type: String,
    trim: true,
    maxlength: 250
  },
  
  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'readonly'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Project reference (for project-based conversations)
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  
  // Group conversation settings
  isPrivate: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Conversation metadata
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'audio', 'file', 'image', 'video'],
      default: 'text'
    }
  },
  
  // Multi-tenant support
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  
  // System fields
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Indexes for performance
conversationSchema.index({ vendor: 1, participants: 1 })
conversationSchema.index({ vendor: 1, project: 1 })
conversationSchema.index({ vendor: 1, type: 1, channelType: 1 })
conversationSchema.index({ 'lastMessage.timestamp': -1 })

// Virtual for unread count
conversationSchema.virtual('unreadCount').get(function() {
  return this.participants.reduce((total, participant) => {
    const lastMessageTime = this.lastMessage?.timestamp || new Date(0)
    const lastReadTime = participant.lastReadAt || new Date(0)
    return total + (lastMessageTime > lastReadTime ? 1 : 0)
  }, 0)
})

// Methods
conversationSchema.methods.addParticipant = function(userId, role = 'member') {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString())
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date(),
      lastReadAt: new Date()
    })
  }
  return this.save()
}

conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString())
  return this.save()
}

conversationSchema.methods.updateLastRead = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString())
  if (participant) {
    participant.lastReadAt = new Date()
    return this.save()
  }
  return Promise.resolve(this)
}

conversationSchema.methods.updateLastMessage = function(content, senderId, messageType = 'text') {
  this.lastMessage = {
    content,
    sender: senderId,
    timestamp: new Date(),
    messageType
  }
  return this.save()
}

// Static methods
conversationSchema.statics.findByParticipants = function(participantIds, vendorId) {
  return this.find({
    vendor: vendorId,
    'participants.user': { $all: participantIds },
    type: 'direct',
    isActive: true
  })
}

conversationSchema.statics.findUserConversations = function(userId, vendorId) {
  return this.find({
    vendor: vendorId,
    'participants.user': userId,
    isActive: true
  })
  .populate('participants.user', 'firstName lastName email avatar')
  .populate('project', 'name')
  .populate('lastMessage.sender', 'firstName lastName')
  .sort({ 'lastMessage.timestamp': -1 })
}

// Get all available channels for a user (public channels + private channels they're a member of)
conversationSchema.statics.findAvailableChannels = function(userId, vendorId) {
  return this.find({
    vendor: vendorId,
    type: 'channel',
    $or: [
      { isPublic: true }, // Public channels
      { 'participants.user': userId } // Private channels where user is a participant
    ]
  })
  .populate('participants.user', 'firstName lastName email avatar')
  .populate('createdBy', 'firstName lastName email avatar')
  .sort({ name: 1 })
}

// Create default channels for a vendor
conversationSchema.statics.createDefaultChannels = async function(vendorId, createdBy) {
  const defaultChannels = [
    {
      name: 'general',
      channelType: 'general',
      purpose: 'General discussion for the team',
      topic: 'Company-wide announcements and general discussion',
      type: 'channel',
      isPublic: true,
      isPrivate: false
    },
    {
      name: 'random',
      channelType: 'random',
      purpose: 'Non-work related discussions',
      topic: 'Water cooler chat and casual conversations',
      type: 'channel',
      isPublic: true,
      isPrivate: false
    }
  ]
  
  const channels = []
  for (const channelData of defaultChannels) {
    const existingChannel = await this.findOne({
      vendor: vendorId,
      name: channelData.name,
      type: 'channel'
    })
    
    if (!existingChannel) {
      const channel = new this({
        ...channelData,
        vendor: vendorId,
        createdBy,
        participants: [{
          user: createdBy,
          role: 'admin',
          joinedAt: new Date(),
          lastReadAt: new Date()
        }]
      })
      await channel.save()
      channels.push(channel)
    }
  }
  
  return channels
}

module.exports = mongoose.model('Conversation', conversationSchema) 