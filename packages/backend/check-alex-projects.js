const mongoose = require('mongoose');
const User = require('./src/models/User');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');

async function checkAlexProjects() {
  try {
    // Use the same MongoDB Atlas connection as the app
    await mongoose.connect('mongodb+srv://Shahrukh:Pakistan28*@client-portal.wqlclt3.mongodb.net/');
    console.log('Connected to MongoDB Atlas');

    // Find Alex Chen
    const alex = await User.findOne({ email: 'alex.chen@acmecorp.com' });
    if (!alex) {
      console.log('❌ Alex Chen not found');
      return;
    }

    console.log('✅ Alex Chen found:');
    console.log('  ID:', alex._id);
    console.log('  Email:', alex.email);
    console.log('  Role:', alex.role);
    console.log('  Vendor ID:', alex.vendorId);

    // Check projects Alex is assigned to
    const projects = await Project.find({ 'team.members.user': alex._id }).select('name team');
    console.log('\n📋 Projects Alex is assigned to:', projects.length);
    projects.forEach(p => {
      console.log('  -', p.name);
      console.log('    Team:', p.team);
    });

    // Check tasks assigned to Alex
    const tasks = await Task.find({ assignedTo: alex._id }).select('title project status');
    console.log('\n📝 Tasks assigned to Alex:', tasks.length);
    tasks.forEach(t => {
      console.log('  -', t.title);
      console.log('    Project:', t.project);
      console.log('    Status:', t.status);
    });

    // Check all projects in Alex's vendor
    const allProjects = await Project.find({ vendorId: alex.vendorId }).select('name team');
    console.log('\n🏢 All projects in Alex\'s vendor:', allProjects.length);
    allProjects.forEach(p => {
      console.log('  -', p.name);
      console.log('    Team:', p.team);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkAlexProjects(); 