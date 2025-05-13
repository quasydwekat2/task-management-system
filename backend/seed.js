import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    console.log('Admin user created');

    // Create student users
    const student1 = new User({
      username: 'student1',
      password: await bcrypt.hash('student123', salt),
      role: 'student',
      universityId: 'U001'
    });
    
    const student2 = new User({
      username: 'student2',
      password: await bcrypt.hash('student123', salt),
      role: 'student',
      universityId: 'U002'
    });
    
    await student1.save();
    await student2.save();
    console.log('Student users created');

    // Create a project
    const project = new Project({
      title: 'Sample Project',
      description: 'This is a sample project for testing',
      students: [student1._id, student2._id],
      category: 'Web Development',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'In Progress',
      progress: 0
    });
    
    await project.save();
    console.log('Sample project created');

    // Create tasks
    const task1 = new Task({
      name: 'Design Homepage',
      description: 'Create a responsive design for the homepage',
      projectId: project._id,
      assignedTo: student1._id,
      status: 'In Progress',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    
    const task2 = new Task({
      name: 'Implement Authentication',
      description: 'Set up user authentication system',
      projectId: project._id,
      assignedTo: student2._id,
      status: 'Pending',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    });
    
    await task1.save();
    await task2.save();
    console.log('Sample tasks created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();