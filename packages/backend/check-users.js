const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUsers() {
  try {
    // Use the same MongoDB Atlas connection as the app
    await mongoose.connect('mongodb+srv://Shahrukh:Pakistan28*@client-portal.wqlclt3.mongodb.net/');
    console.log('Connected to MongoDB Atlas');

    // Find all users
    const users = await User.find({}).select('firstName lastName email role vendorId');
    console.log('📋 All users in database:', users.length);
    
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`    Role: ${user.role}, Vendor: ${user.vendorId}`);
    });

    // Check for any Alex users
    const alexUsers = await User.find({ firstName: 'Alex' }).select('firstName lastName email role');
    console.log('\n👤 Users named Alex:', alexUsers.length);
    alexUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    // Check for any Chen users
    const chenUsers = await User.find({ lastName: 'Chen' }).select('firstName lastName email role');
    console.log('\n👤 Users with last name Chen:', chenUsers.length);
    chenUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUsers(); 