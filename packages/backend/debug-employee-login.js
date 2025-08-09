const mongoose = require('mongoose')
const User = require('./src/models/User')
const bcrypt = require('bcryptjs')

async function debugEmployeeLogin() {
  try {
    await mongoose.connect('mongodb+srv://Shahrukh:Pakistan28*@client-portal.wqlclt3.mongodb.net/')
    console.log('Connected to MongoDB')
    
    // Find the employee
    const user = await User.findOne({ 
      email: 'alex.chen@acmecorp.com',
      $or: [
        { role: 'employee' },
        { role: 'admin' },
        { role: 'super_admin' },
        { isSuperAccount: true }
      ]
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found:', user.email)
    console.log('Role:', user.role)
    console.log('Is Active:', user.isActive)
    console.log('Has password:', !!user.password)
    
    // Test password comparison with correct password
    const testPassword = 'TestPass123!'
    const isPasswordValid = await user.comparePassword(testPassword)
    console.log('Password valid:', isPasswordValid)
    
    // Test bcrypt directly
    const directCompare = await bcrypt.compare(testPassword, user.password)
    console.log('Direct bcrypt compare:', directCompare)
    
    // Test with wrong password
    const wrongPassword = 'wrongpassword'
    const wrongPasswordValid = await user.comparePassword(wrongPassword)
    console.log('Wrong password valid:', wrongPasswordValid)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

debugEmployeeLogin() 