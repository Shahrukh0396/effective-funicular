const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/User')
const Project = require('../models/Project')
const { validationResult } = require('express-validator')
const path = require('path')
const fs = require('fs').promises
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')

// Get available users for new conversations
const getAvailableUsers = async (req, res) => {
  try {
    console.log('🔍 Chat - Current user:', {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      vendorId: req.user.vendorId
    })
    
    // Get all users in the same vendor/organization as the current user
    const users = await User.find({
      vendorId: req.user.vendorId,
      _id: { $ne: req.user._id } // Exclude current user
    }).select('firstName lastName email avatar role')
    
    console.log('🔍 Chat - Found users:', users.length)
    console.log('🔍 Chat - Users data:', users.map(u => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role
    })))
    
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

// Get user conversations with improved performance
const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.findUserConversations(req.user._id, req.user.vendorId)
    
    // Add unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.getUnreadCount(conversation._id, req.user._id)
        return {
          ...conversation.toObject(),
          unreadCount
        }
      })
    )
    
    res.json({
      success: true,
      data: conversationsWithUnread
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    })
  }
}

// Get conversation messages with improved performance
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

// Send text message with improved real-time features
const sendTextMessage = async (req, res) => {
  try {
    console.log('🔍 Send message - Request body:', req.body)
    console.log('🔍 Send message - User:', {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      vendorId: req.user.vendorId
    })
    
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
    
    console.log('🔍 Send message - Conversation ID:', conversationId)
    console.log('🔍 Send message - Content:', content)
    
    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      })
    }
    
    console.log('🔍 Send message - Conversation found:', conversation._id)
    
    const isParticipant = conversation.participants.some(p => 
      p.user.toString() === req.user._id.toString()
    )
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    console.log('🔍 Send message - User is participant')
    
    const message = new Message({
      content,
      conversation: conversationId,
      sender: req.user._id,
      replyTo,
      vendor: req.user.vendorId
    })
    
    console.log('🔍 Send message - Message object:', {
      content: message.content,
      conversation: message.conversation,
      sender: message.sender,
      replyTo: message.replyTo,
      vendor: message.vendor
    })
    
    await message.save()
    
    // Populate sender info
    await message.populate('sender', 'firstName lastName email avatar')
    if (replyTo) {
      await message.populate('replyTo', 'content sender')
    }
    
    // Emit to Socket.IO with improved real-time features
    const io = req.app.get('io')
    if (io && conversation.participants) {
      // Emit message sent event to sender for immediate feedback
      io.to(`user_${req.user._id}`).emit('message:sent', {
        message,
        conversationId,
        status: 'sent'
      })
      
      // Emit to other participants
      conversation.participants.forEach(participant => {
        if (participant.user.toString() !== req.user._id.toString()) {
          io.to(`user_${participant.user}`).emit('message:received', {
            message,
            conversationId,
            status: 'delivered'
          })
        }
      })
      
      // Emit typing stop event
      io.to(`conversation_${conversationId}`).emit('typing:stop', {
        conversationId,
        userId: req.user._id
      })
    }
    
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

// Send file message with improved handling
const sendFileMessage = async (req, res) => {
  try {
    const { conversationId } = req.body
    const { replyTo } = req.body
    
    // Validate conversationId manually
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      })
    }
    
    // Check if conversationId is a valid MongoDB ObjectId
    const mongoose = require('mongoose')
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID format'
      })
    }
    
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
          const thumbnailPath = path.join('uploads/chat', thumbnailName)
          
          await sharp(file.path)
            .resize(200, 200, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath)
          
          attachment.thumbnailUrl = `/uploads/chat/${thumbnailName}`
          
          // Get image dimensions
          const metadata = await sharp(file.path).metadata()
          attachment.width = metadata.width
          attachment.height = metadata.height
        } catch (error) {
          console.error('Error generating thumbnail:', error)
        }
      }
      
      attachments.push(attachment)
    }
    
    const message = new Message({
      content: `📎 ${attachments.length} file${attachments.length > 1 ? 's' : ''}`,
      messageType: 'file',
      attachments,
      conversation: conversationId,
      sender: req.user._id,
      replyTo,
      vendor: req.user.vendorId
    })
    
    await message.save()
    await message.populate('sender', 'firstName lastName email avatar')
    
    if (replyTo) {
      await message.populate('replyTo', 'content sender')
    }
    
    // Emit to Socket.IO
    const io = req.app.get('io')
    if (io && conversation.participants) {
      // Emit message sent event to sender
      io.to(`user_${req.user._id}`).emit('message:sent', {
        message,
        conversationId,
        status: 'sent'
      })
      
      // Emit to other participants
      conversation.participants.forEach(participant => {
        if (participant.user.toString() !== req.user._id.toString()) {
          io.to(`user_${participant.user}`).emit('message:received', {
            message,
            conversationId,
            status: 'delivered'
          })
        }
      })
    }
    
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

// Create conversation (direct, group, or channel)
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
    
    const { type, participantId, name, participantIds, channelType, purpose, topic } = req.body
    
    if (type === 'direct') {
      // Create direct conversation
      const participant = await User.findById(participantId)
      const userVendor = req.user.vendorId.toString();
      const participantVendor = (participant && participant.vendorId || '').toString();
      if (!participant || !userVendor || !participantVendor || participantVendor !== userVendor) {
        return res.status(400).json({
          success: false,
          message: 'Participant not found or vendor mismatch'
        })
      }
      
      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        'participants.user': { $all: [req.user._id, participantId] },
        vendor: req.user.vendorId
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
        vendor: req.user.vendorId,
        createdBy: req.user._id
      })
      
      await conversation.save()
      await conversation.populate('participants.user', 'firstName lastName email avatar')
      
      res.json({
        success: true,
        data: conversation
      })
    } else if (type === 'channel') {
      // Create channel
      const conversation = new Conversation({
        type: 'channel',
        name,
        channelType: channelType || 'custom',
        purpose,
        topic,
        participants: [
          { user: req.user._id, role: 'admin' }
        ],
        vendor: req.user.vendorId,
        createdBy: req.user._id
      })
      
      await conversation.save()
      await conversation.populate('participants.user', 'firstName lastName email avatar')
      
      res.json({
        success: true,
        data: conversation
      })
    } else {
      // Create group conversation
      const conversation = new Conversation({
        type: 'group',
        name,
        participants: [
          { user: req.user._id, role: 'admin' },
          ...participantIds.map(id => ({ user: id, role: 'member' }))
        ],
        vendor: req.user.vendorId,
        createdBy: req.user._id
      })
      
      await conversation.save()
      await conversation.populate('participants.user', 'firstName lastName email avatar')
      
      res.json({
        success: true,
        data: conversation
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

// Get default channels for vendor
const getDefaultChannels = async (req, res) => {
  try {
    const channels = await Conversation.find({
      vendor: req.user.vendorId,
      type: 'channel',
      channelType: { $in: ['general', 'random'] }
    }).populate('participants.user', 'firstName lastName email avatar')
    
    res.json({
      success: true,
      data: channels
    })
  } catch (error) {
    console.error('Get default channels error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default channels'
    })
  }
}

// Join channel
const joinChannel = async (req, res) => {
  try {
    const { conversationId } = req.params
    
    const conversation = await Conversation.findById(conversationId)
    if (!conversation || conversation.type !== 'channel') {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      })
    }
    
    await conversation.addParticipant(req.user._id, 'member')
    await conversation.populate('participants.user', 'firstName lastName email avatar')
    
    res.json({
      success: true,
      data: conversation
    })
  } catch (error) {
    console.error('Join channel error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to join channel'
    })
  }
}

// Create or get support conversation
const createSupportConversation = async (req, res) => {
  try {
    const { message } = req.body
    
    // Find vendor admins
    const User = require('../models/User')
    const adminUsers = await User.find({
      vendorId: req.user.vendorId,
      role: { $in: ['vendor_admin', 'super_admin'] }
    })
    
    if (adminUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin users found for this vendor'
      })
    }
    
    // Check if support conversation already exists for this user
    const existingSupport = await Conversation.findOne({
      type: 'support',
      vendor: req.user.vendorId,
      'participants.user': req.user._id
    })
    
    let conversation
    if (existingSupport) {
      conversation = existingSupport
    } else {
      // Create new support conversation
      conversation = new Conversation({
        type: 'support',
        name: `Support - ${req.user.firstName} ${req.user.lastName}`,
        participants: [
          { user: req.user._id, role: 'member' },
          ...adminUsers.map(admin => ({ user: admin._id, role: 'admin' }))
        ],
        vendor: req.user.vendorId,
        createdBy: req.user._id
      })
      await conversation.save()
    }
    
    // If initial message provided, send it
    if (message) {
      const Message = require('../models/Message')
      const newMessage = new Message({
        conversation: conversation._id,
        sender: req.user._id,
        content: message,
        messageType: 'text',
        vendor: req.user.vendorId
      })
      await newMessage.save()
      
      // Update conversation last message
      await conversation.updateLastMessage(message, req.user._id, 'text')
    }
    
    await conversation.populate('participants.user', 'firstName lastName email avatar')
    
    res.json({
      success: true,
      data: conversation
    })
  } catch (error) {
    console.error('Create support conversation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create support conversation'
    })
  }
}

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { q: query, conversationId } = req.query
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }
    
    const searchQuery = {
      vendor: req.user.vendorId,
      content: { $regex: query, $options: 'i' }
    }
    
    if (conversationId) {
      searchQuery.conversation = conversationId
    }
    
    const messages = await Message.find(searchQuery)
      .populate('sender', 'firstName lastName email avatar')
      .populate('conversation', 'name type')
      .sort({ createdAt: -1 })
      .limit(50)
    
    res.json({
      success: true,
      data: messages
    })
  } catch (error) {
    console.error('Search messages error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    })
  }
}

// Add message reaction
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
    await message.populate('reactions.user', 'firstName lastName')
    
    // Emit reaction to other participants
    const io = req.app.get('io')
    if (io) {
      io.to(`conversation_${message.conversation}`).emit('reaction:added', {
        messageId,
        reaction: message.reactions[message.reactions.length - 1]
      })
    }
    
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
    
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      })
    }
    
    await message.editContent(content)
    await message.populate('sender', 'firstName lastName email avatar')
    
    // Emit message edit to other participants
    const io = req.app.get('io')
    if (io) {
      io.to(`conversation_${message.conversation}`).emit('message:edited', {
        messageId,
        message
      })
    }
    
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
    
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      })
    }
    
    const conversationId = message.conversation
    await message.remove()
    
    // Emit message deletion to other participants
    const io = req.app.get('io')
    if (io) {
      io.to(`conversation_${conversationId}`).emit('message:deleted', {
        messageId
      })
    }
    
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
  getDefaultChannels,
  joinChannel,
  createSupportConversation,
  searchMessages,
  addReaction,
  editMessage,
  deleteMessage
} 