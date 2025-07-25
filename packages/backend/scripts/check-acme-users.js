const mongoose = require('mongoose');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const config = require('../src/config');

async function checkAcmeUsers() {
  try {
    await mongoose.connect(config.mongoUri);
    
    // Find ACME vendor
    const acmeVendor = await Vendor.findOne({ slug: 'acmecorp' });
    if (!acmeVendor) {
      console.log('❌ ACME vendor not found');
      return;
    }
    
    console.log('🏢 ACME Vendor:', acmeVendor.companyName);
    console.log('   ID:', acmeVendor._id);
    
    // Find all users associated with ACME
    const acmeUsers = await User.find({ vendorId: acmeVendor._id });
    console.log('\n👥 ACME Users (' + acmeUsers.length + '):');
    
    acmeUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`     Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    // Also check for users with acme in email
    const acmeEmailUsers = await User.find({ 
      email: { $regex: 'acme', $options: 'i' } 
    });
    
    if (acmeEmailUsers.length > 0) {
      console.log('\n📧 Users with ACME in email:');
      acmeEmailUsers.forEach(user => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`     Role: ${user.role}, Vendor: ${user.vendorId}`);
      });
    }
    
    // Check all users to see the full picture
    console.log('\n👥 All Users in System:');
    const allUsers = await User.find({}).populate('vendorId', 'companyName');
    allUsers.forEach(user => {
      const vendorName = user.vendorId ? user.vendorId.companyName : 'No Vendor';
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`     Role: ${user.role}, Vendor: ${vendorName}, Active: ${user.isActive}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAcmeUsers(); 