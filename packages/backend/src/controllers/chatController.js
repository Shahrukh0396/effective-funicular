const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/User')
const Project = require('../models/Project')
const { validationResult } = require('express-validator')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/chat'
    try {
      await fs.mkdir(uploadDir, { recursive: true })
      cb(null, uploadDir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Max 5 files per message
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/zip', 'application/x-rar-compressed'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'), false)
    }
  }
})

// Get available users for new conversations
const getAvailableUsers = async (req, res) => {
  try {
    // Get all users in the same vendor/organization as the current user
    const users = await User.find({
      vendor: req.user.vendor,
      _id: { $ne: req.user._id } // Exclude current user
    }).select('firstName lastName email avatar role')
    
    res.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Get available users error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available users'
    })
  }
}

// Get user conversations
const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.findUserConversations(req.user._id, req.user.vendor)
    
    res.json({
      success: true,
      data: conversations
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    })
  }
}

// Get conversation messages
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { limit = 50, offset = 0 } = req.query
    
    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }
    
    const isParticipant = conversation.participants.some(p => 
      p.user.toString() === req.user._id.toString()
    )
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    const messages = await Message.findByConversation(conversationId, parseInt(limit), parseInt(offset))
    
    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: { readBy: { user: req.user._id, readAt: new Date() } },
        $set: { status: 'read' }
      }
    )
    
    // Update conversation last read
    await conversation.updateLastRead(req.user._id)
    
    res.json({
      success: true,
      data: messages.reverse() // Return in chronological order
    })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    })
  }
}

// Send text message
const sendTextMessage = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }
    
    const { conversationId } = req.params
    const { content, replyTo } = req.body
    
    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }
    
    const isParticipant = conversation.participants.some(p => 
      p.user.toString() === req.user._id.toString()
    )
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    const message = new Message({
      content,
      conversation: conversationId,
      sender: req.user._id,
      replyTo,
      vendor: req.user.vendor
    })
    
    await message.save()
    
    // Populate sender info
    await message.populate('sender', 'firstName lastName email avatar')
    if (replyTo) {
      await message.populate('replyTo', 'content sender')
    }
    
    // Emit to Socket.IO
    const io = req.app.get('io')
    conversation.participants.forEach(participant => {
      if (participant.user.toString() !== req.user._id.toString()) {
        io.to(`user_${participant.user}`).emit('message:received', {
          message,
          conversationId
        })
      }
    })
    
    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    })
  }
}

// Send file message
const sendFileMessage = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { replyTo } = req.body
    
    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }
    
    const isParticipant = conversation.participants.some(p => 
      p.user.toString() === req.user._id.toString()
    )
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      })
    }
    
    const attachments = []
    
    for (const file of req.files) {
      const attachment = {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/chat/${file.filename}`
      }
      
      // Generate thumbnail for images
      if (file.mimetype.startsWith('image/')) {
        try {
          const thumbnailName = `thumb_${file.filename}`
          await sharp(file.path)
            .resize(200, 200, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(path.join('uploads/chat', thumbnailName))
          
          attachment.thumbnailUrl = `/uploads/chat/${thumbnailName}`
          
          // Get image dimensions
          const metadata = await sharp(file.path).metadata()
          attachment.width = metadata.width
          attachment.height = metadata.height
        } catch (error) {
          console.error('Thumbnail generation error:', error)
        }
      }
      
      // Handle video files
      if (file.mimetype.startsWith('video/')) {
        attachment.messageType = 'video'
        // Note: Video duration extraction would require ffmpeg
        // For now, we'll set a placeholder
        attachment.duration = 0
      }
      
      // Handle audio files
      if (file.mimetype.startsWith('audio/')) {
        attachment.messageType = 'audio'
        // Note: Audio duration extraction would require ffmpeg
        attachment.duration = 0
      }
      
      attachments.push(attachment)
    }
    
    const messageType = attachments[0].messageType || 'file'
    const content = `📎 ${attachments.length} file${attachments.length > 1 ? 's' : ''}`
    
    const message = new Message({
      content,
      messageType,
      attachments,
      conversation: conversationId,
      sender: req.user._id,
      replyTo,
      vendor: req.user.vendor
    })
    
    await message.save()
    
    // Populate sender info
    await message.populate('sender', 'firstName lastName email avatar')
    if (replyTo) {
      await message.populate('replyTo', 'content sender')
    }
    
    // Emit to Socket.IO
    const io = req.app.get('io')
    conversation.participants.forEach(participant => {
      if (participant.user.toString() !== req.user._id.toString()) {
        io.to(`user_${participant.user}`).emit('message:received', {
          message,
          conversationId
        })
      }
    })
    
    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Send file message error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send file message'
    })
  }
}

// Create conversation (direct or group)
const createConversation = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }
    
    const { type, participantId, name, participantIds } = req.body
    
    if (type === 'direct') {
      // Create direct conversation
      const participant = await User.findById(participantId)
      if (!participant || participant.vendor.toString() !== req.user.vendor.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Participant not found'
        })
      }
      
      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        'participants.user': { $all: [req.user._id, participantId] },
        vendor: req.user.vendor
      })
      
      if (existingConversation) {
        return res.json({
          success: true,
          data: existingConversation
        })
      }
      
      const conversation = new Conversation({
        type: 'direct',
        participants: [
          { user: req.user._id, role: 'member' },
          { user: participantId, role: 'member' }
        ],
        vendor: req.user.vendor,
        createdBy: req.user._id
      })
      
      await conversation.save()
      await conversation.populate('participants.user', 'firstName lastName email avatar')
      
      res.json({
        success: true,
        data: conversation
      })
    } else if (type === 'group') {
      // Create group conversation
      const participants = await User.find({
        _id: { $in: participantIds },
        vendor: req.user.vendor
      })
      
      if (participants.length !== participantIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some participants not found'
        })
      }
      
      const conversation = new Conversation({
        name,
        type: 'group',
        participants: [
          { user: req.user._id, role: 'admin' },
          ...participantIds.map(id => ({ user: id, role: 'member' }))
        ],
        vendor: req.user.vendor,
        createdBy: req.user._id
      })
      
      await conversation.save()
      await conversation.populate('participants.user', 'firstName lastName email avatar')
      
      res.json({
        success: true,
        data: conversation
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation type'
      })
    }
  } catch (error) {
    console.error('Create conversation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    })
  }
}

// Create direct conversation (legacy method for backward compatibility)
const createDirectConversation = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }
    
    const { participantId } = req.body
    
    // Check if participant exists
    const participant = await User.findById(participantId)
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      })
    }
    
    // Check if conversation already exists
    const existingConversation = await Conversation.findByParticipants(
      [req.user._id, participantId],
      req.user.vendor
    )
    
    if (existingConversation.length > 0) {
      return res.json({
        success: true,
        data: existingConversation[0]
      })
    }
    
    const conversation = new Conversation({
      type: 'direct',
      participants: [
        { user: req.user._id, role: 'member' },
        { user: participantId, role: 'member' }
      ],
      vendor: req.user.vendor,
      createdBy: req.user._id
    })
    
    await conversation.save()
    
    // Populate participants
    await conversation.populate('participants.user', 'firstName lastName email avatar')
    
    res.json({
      success: true,
      data: conversation
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    })
  }
}

// Create group conversation (legacy method for backward compatibility)
const createGroupConversation = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }
    
    const { name, participantIds, description, isPrivate } = req.body
    
    // Validate participants
    const participants = await User.find({
      _id: { $in: participantIds },
      vendor: req.user.vendor
    })
    
    if (participants.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some participants not found'
      })
    }
    
    const conversation = new Conversation({
      name,
      type: 'group',
      description,
      isPrivate,
      participants: [
        { user: req.user._id, role: 'admin' },
        ...participantIds.map(id => ({ user: id, role: 'member' }))
      ],
      vendor: req.user.vendor,
      createdBy: req.user._id
    })
    
    await conversation.save()
    
    // Populate participants
    await conversation.populate('participants.user', 'firstName lastName email avatar')
    
    res.json({
      success: true,
      data: conversation
    })
  } catch (error) {
    console.error('Create group conversation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create group conversation'
    })
  }
}

// Add reaction to message
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params
    const { emoji } = req.body
    
    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }
    
    await message.addReaction(req.user._id, emoji)
    
    // Populate reactions
    await message.populate('reactions.user', 'firstName lastName')
    
    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Add reaction error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction'
    })
  }
}

// Edit message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const { content } = req.body
    
    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      })
    }
    
    await message.editContent(content)
    
    // Populate sender info
    await message.populate('sender', 'firstName lastName email avatar')
    
    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('Edit message error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to edit message'
    })
  }
}

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    
    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }
    
    // Check if user is the sender or admin
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    await Message.findByIdAndDelete(messageId)
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    })
  }
}

module.exports = {
  getAvailableUsers,
  getUserConversations,
  getConversationMessages,
  sendTextMessage,
  sendFileMessage,
  createConversation,
  createDirectConversation,
  createGroupConversation,
  addReaction,
  editMessage,
  deleteMessage
} 