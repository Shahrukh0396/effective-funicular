const express = require('express')
const { body } = require('express-validator')
const { auth } = require('../middleware/auth')
const { vendorAuth } = require('../middleware/vendorAuth')
const chatController = require('../controllers/chatController')

// Import multer upload middleware directly
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
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

const router = express.Router()

// Chat routes use user authentication and get vendor info from user

/**
 * @route   POST /api/chat/support
 * @desc    Create or get support conversation
 * @access  Private
 */
router.post('/support', [
  auth,
  body('message').optional().isString().withMessage('Message must be a string')
], chatController.createSupportConversation)

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user conversations
 * @access  Private
 */
router.get('/conversations', auth, chatController.getUserConversations)

/**
 * @route   GET /api/chat/channels
 * @desc    Get default channels for vendor
 * @access  Private
 */
router.get('/channels', auth, chatController.getDefaultChannels)

/**
 * @route   POST /api/chat/conversations/:conversationId/join
 * @desc    Join a channel
 * @access  Private
 */
router.post('/conversations/:conversationId/join', auth, chatController.joinChannel)

/**
 * @route   POST /api/chat/support
 * @desc    Create or get support conversation
 * @access  Private
 */
router.post('/support', [
  auth,
  body('message').optional().isString().withMessage('Message must be a string')
], chatController.createSupportConversation)

/**
 * @route   GET /api/chat/conversations/:conversationId/messages
 * @desc    Get conversation messages
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', auth, chatController.getConversationMessages)

/**
 * @route   POST /api/chat/conversations/:conversationId/messages
 * @desc    Send text message
 * @access  Private
 */
router.post('/conversations/:conversationId/messages', [
  auth,
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Message content is required and must be less than 5000 characters')
], chatController.sendTextMessage)

/**
 * @route   POST /api/chat/messages/upload
 * @desc    Send file message
 * @access  Private
 */
router.post('/messages/upload', [
  auth,
  upload.array('files', 5)
], chatController.sendFileMessage)

/**
 * @route   POST /api/chat/conversations
 * @desc    Create conversation (direct, group, or channel)
 * @access  Private
 */
router.post('/conversations', [
  auth,
  body('type').isIn(['direct', 'group', 'channel']).withMessage('Invalid conversation type'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('participantId').optional().isMongoId().withMessage('Invalid participant ID'),
  body('participantIds').optional().isArray().withMessage('Participant IDs must be an array'),
  body('channelType').optional().isIn(['general', 'random', 'project', 'custom']).withMessage('Invalid channel type'),
  body('purpose').optional().trim().isLength({ max: 500 }).withMessage('Purpose must be less than 500 characters'),
  body('topic').optional().trim().isLength({ max: 250 }).withMessage('Topic must be less than 250 characters')
], chatController.createConversation)

/**
 * @route   GET /api/chat/users
 * @desc    Get available users for new conversations
 * @access  Private
 */
router.get('/users', auth, chatController.getAvailableUsers)

/**
 * @route   GET /api/chat/search
 * @desc    Search messages
 * @access  Private
 */
router.get('/search', auth, chatController.searchMessages)

/**
 * @route   POST /api/chat/messages/:messageId/reactions
 * @desc    Add reaction to message
 * @access  Private
 */
router.post('/messages/:messageId/reactions', [
  auth,
  body('emoji').trim().isLength({ min: 1, max: 10 }).withMessage('Emoji is required and must be less than 10 characters')
], chatController.addReaction)

/**
 * @route   PUT /api/chat/messages/:messageId
 * @desc    Edit message
 * @access  Private
 */
router.put('/messages/:messageId', [
  auth,
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Message content is required and must be less than 5000 characters')
], chatController.editMessage)

/**
 * @route   DELETE /api/chat/messages/:messageId
 * @desc    Delete message
 * @access  Private
 */
router.delete('/messages/:messageId', auth, chatController.deleteMessage)

module.exports = router 