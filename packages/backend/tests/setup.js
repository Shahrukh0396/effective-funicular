// Test setup file
const mongoose = require('mongoose')

// Set test environment
process.env.NODE_ENV = 'test'
process.env.MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test-auth'
process.env.PORT = process.env.PORT || 3001 // Use different port for tests

// Prevent app from starting server during tests
process.env.TESTING = 'true'

// Global test timeout
jest.setTimeout(30000)

// Global database connection
let isConnected = false

// Connect to test database once
beforeAll(async () => {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    isConnected = true
  }
})

// Cleanup after all tests
afterAll(async () => {
  if (isConnected) {
    await mongoose.connection.close()
    isConnected = false
  }
})

// Suppress console logs during tests unless there's an error
const originalConsoleLog = console.log
const originalConsoleError = console.error

beforeAll(() => {
  // Temporarily allow console.log for debugging
  // console.log = jest.fn()
  console.error = originalConsoleError
})

afterAll(() => {
  console.log = originalConsoleLog
}) 