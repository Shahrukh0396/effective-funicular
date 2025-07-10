const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  // Message content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  
  // Message type
  messageType: {
    type: String,
    enum: ['text', 'audio', 'file', 'image', 'video'],
    default: 'text',
    required: true
  },
  
  // File attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: String, // For images/videos
    duration: Number, // For audio/video files (in seconds)
    width: Number, // For images/videos
    height: Number // For images/videos
  }],
  
  // Audio message specific fields
  audio: {
    duration: Number, // Duration in seconds
    waveform: [Number], // Audio waveform data for visualization
    transcription: String // Speech-to-text transcription
  },
  
  // Message metadata
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  // Reply to another message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Read receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // System message flags
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  
  // Message editing
  editedAt: Date,
  originalContent: String,
  
  // Multi-tenant support
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  }
}, {
  timestamps: true
})

// Indexes for performance
messageSchema.index({ conversation: 1, createdAt: -1 })
messageSchema.index({ sender: 1, createdAt: -1 })
messageSchema.index({ vendor: 1, conversation: 1 })
messageSchema.index({ 'readBy.user': 1 })

// Virtual for formatted content
messageSchema.virtual('formattedContent').get(function() {
  if (this.messageType === 'text') {
    return this.content
  } else if (this.messageType === 'audio') {
    return `🎤 Audio message (${this.audio?.duration || 0}s)`
  } else if (this.messageType === 'file') {
    return `📎 ${this.attachments?.[0]?.originalName || 'File'}`
  } else if (this.messageType === 'image') {
    return `🖼️ Image`
  } else if (this.messageType === 'video') {
    return `🎥 Video`
  }
  return this.content
})

// Methods
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString())
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    })
    this.status = 'read'
    return this.save()
  }
  return Promise.resolve(this)
}

messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(r => 
    r.user.toString() === userId.toString() && r.emoji === emoji
  )
  
  if (existingReaction) {
    // Remove reaction if already exists
    this.reactions = this.reactions.filter(r => 
      !(r.user.toString() === userId.toString() && r.emoji === emoji)
    )
  } else {
    // Add new reaction
    this.reactions.push({
      user: userId,
      emoji,
      createdAt: new Date()
    })
  }
  
  return this.save()
}

messageSchema.methods.editContent = function(newContent) {
  if (!this.originalContent) {
    this.originalContent = this.content
  }
  this.content = newContent
  this.editedAt = new Date()
  return this.save()
}

// Static methods
messageSchema.statics.findByConversation = function(conversationId, limit = 50, offset = 0) {
  return this.find({ conversation: conversationId })
    .populate('sender', 'firstName lastName email avatar')
    .populate('replyTo', 'content sender')
    .populate('readBy.user', 'firstName lastName')
    .populate('reactions.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
}

messageSchema.statics.getUnreadCount = function(conversationId, userId) {
  return this.countDocuments({
    conversation: conversationId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId }
  })
}

// Pre-save middleware to update conversation's last message
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Conversation = mongoose.model('Conversation')
      await Conversation.findByIdAndUpdate(
        this.conversation,
        {
          lastMessage: {
            content: this.formattedContent,
            sender: this.sender,
            timestamp: this.createdAt,
            messageType: this.messageType
          }
        }
      )
    } catch (error) {
      console.error('Error updating conversation last message:', error)
    }
  }
  next()
})

module.exports = mongoose.model('Message', messageSchema) 