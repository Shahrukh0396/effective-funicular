const express = require('express')
const router = express.Router()

// Test route without any middleware
router.get('/test', (req, res) => {
  console.log('🔧 Test route called')
  res.json({ success: true, message: 'Test route working' })
})

// Test route with simple middleware
router.get('/test-with-middleware', (req, res, next) => {
  console.log('🔧 Test middleware called')
  next()
}, (req, res) => {
  res.json({ success: true, message: 'Test route with middleware working' })
})

module.exports = router 