const mongoose = require('mongoose')
const User = require('./src/models/User')
const bcrypt = require('bcryptjs')

async function resetEmployeePassword() {
  try {
    await mongoose.connect('mongodb+srv://Shahrukh:Pakistan28*@client-portal.wqlclt3.mongodb.net/')
    console.log('Connected to MongoDB')
    
    // Find the employee
    const employee = await User.findOne({ email: 'alex.chen@acmecorp.com' })
    
    if (!employee) {
      console.log('Employee not found')
      return
    }
    
    console.log('Found employee:', employee.email)
    
    // Hash the correct password
    const hashedPassword = await bcrypt.hash('TestPass123!', 12)
    
    // Update the password directly using updateOne to bypass pre-save middleware
    await User.updateOne(
      { email: 'alex.chen@acmecorp.com' },
      { 
        password: hashedPassword,
        'security.lastPasswordChange': new Date()
      }
    )
    
    console.log('Password reset successfully for:', employee.email)
    console.log('New password: TestPass123!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

resetEmployeePassword() 