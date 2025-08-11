const mongoose = require('mongoose')
const User = require('./src/models/User')

async function unlockEmployeeAccount() {
  try {
    await mongoose.connect('mongodb+srv://Shahrukh:Pakistan28*@client-portal.wqlclt3.mongodb.net/')
    console.log('Connected to MongoDB')
    
    // Find the employee
    const employee = await User.findOne({ email: 'alex.chen@acmecorp.com' })
    
    if (!employee) {
      console.log('❌ Employee not found')
      return
    }
    
    console.log('✅ Found employee:', employee.email)
    console.log('Current failed attempts:', employee.security?.failedLoginAttempts || 0)
    console.log('Account locked until:', employee.security?.accountLockedUntil)
    console.log('Is account locked:', employee.security?.accountLockedUntil && new Date() < employee.security.accountLockedUntil)
    
    // Unlock the account
    if (employee.security) {
      employee.security.failedLoginAttempts = 0
      employee.security.accountLockedUntil = null
      employee.security.lockedUntil = null
      employee.security.suspiciousActivity = false
      employee.security.riskScore = 0
    }
    
    await employee.save()
    console.log('✅ Employee account unlocked successfully')
    console.log('Failed attempts reset to 0')
    console.log('Account lock removed')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

unlockEmployeeAccount() 