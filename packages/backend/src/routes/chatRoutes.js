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
 * @route   GET /api/chat/conversations
 * @desc    Get user conversations
 * @access  Private
 */
router.get('/conversations', auth, chatController.getUserConversations)

/**
 * @route   GET /api/chat/users
 * @desc    Get available users for new conversations
 * @access  Private
 */
router.get('/users', auth, chatController.getAvailableUsers)

/**
 * @route   GET /api/chat/conversations/:conversationId/messages
 * @desc    Get conversation messages
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', auth, chatController.getConversationMessages)

/**
 * @route   POST /api/chat/conversations
 * @desc    Create conversation (direct or group)
 * @access  Private
 */
router.post('/conversations', [
  auth,
  body('type')
    .isIn(['direct', 'group'])
    .withMessage('Type must be either direct or group'),
  body('participantId')
    .if(body('type').equals('direct'))
    .isMongoId()
    .withMessage('Valid participant ID is required for direct conversations'),
  body('name')
    .if(body('type').equals('group'))
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Conversation name must be between 1 and 100 characters'),
  body('participantIds')
    .if(body('type').equals('group'))
    .isArray({ min: 1 })
    .withMessage('At least one participant is required for group conversations'),
  body('participantIds.*')
    .if(body('type').equals('group'))
    .isMongoId()
    .withMessage('Valid participant IDs are required')
], chatController.createConversation)

/**
 * @route   POST /api/chat/conversations/direct
 * @desc    Create direct conversation
 * @access  Private
 */
router.post('/conversations/direct', [
  auth,
  body('participantId')
    .isMongoId()
    .withMessage('Valid participant ID is required')
], chatController.createDirectConversation)

/**
 * @route   POST /api/chat/conversations/group
 * @desc    Create group conversation
 * @access  Private
 */
router.post('/conversations/group', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Conversation name must be between 1 and 100 characters'),
  body('participantIds')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participantIds.*')
    .isMongoId()
    .withMessage('Valid participant IDs are required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean')
], chatController.createGroupConversation)

/**
 * @route   POST /api/chat/conversations/:conversationId/messages
 * @desc    Send text message
 * @access  Private
 */
router.post('/conversations/:conversationId/messages', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content must be between 1 and 5000 characters'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Valid reply message ID is required')
], chatController.sendTextMessage)

/**
 * @route   POST /api/chat/messages/text
 * @desc    Send text message
 * @access  Private
 */
router.post('/messages/text', [
  auth,
  body('conversationId')
    .isMongoId()
    .withMessage('Valid conversation ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content must be between 1 and 5000 characters'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Valid reply message ID is required')
], chatController.sendTextMessage)

/**
 * @route   POST /api/chat/conversations/:conversationId/files
 * @desc    Send file message
 * @access  Private
 */
router.post('/conversations/:conversationId/files', [
  auth,
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Valid reply message ID is required')
], upload.array('files', 5), chatController.sendFileMessage)

/**
 * @route   POST /api/chat/messages/file
 * @desc    Send file message
 * @access  Private
 */
router.post('/messages/file', [
  auth,
  body('conversationId')
    .isMongoId()
    .withMessage('Valid conversation ID is required'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Valid reply message ID is required')
], upload.array('files', 5), chatController.sendFileMessage)

/**
 * @route   POST /api/chat/messages/:messageId/reactions
 * @desc    Add reaction to message
 * @access  Private
 */
router.post('/messages/:messageId/reactions', [
  auth,
  body('emoji')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji must be between 1 and 10 characters')
], chatController.addReaction)

/**
 * @route   PUT /api/chat/messages/:messageId
 * @desc    Edit message
 * @access  Private
 */
router.put('/messages/:messageId', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content must be between 1 and 5000 characters')
], chatController.editMessage)

/**
 * @route   DELETE /api/chat/messages/:messageId
 * @desc    Delete message
 * @access  Private
 */
router.delete('/messages/:messageId', auth, chatController.deleteMessage)

module.exports = router 