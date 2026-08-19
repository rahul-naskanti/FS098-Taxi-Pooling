const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taxipooling';

  try {
    try {
      await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
      console.log('📡 Connected to primary MongoDB for seeding...');
    } catch (primaryErr) {
      console.warn(`⚠️ Primary MongoDB connection failed (${primaryErr.message}). Falling back to local MongoDB...`);
      await mongoose.connect('mongodb://127.0.0.1:27017/taxipooling', { serverSelectionTimeoutMS: 3000 });
      console.log('📡 Connected to fallback local MongoDB for seeding...');
    }

    const existingAdmin = await User.findOne({ email: 'admin@taxipool.com' });
    if (existingAdmin) {
      console.warn('⚠️ Warning: Admin user (admin@taxipool.com) already exists in database.');
      mongoose.connection.close();
      process.exit(0);
    }

    const adminUser = new User({
      fullName: 'System Admin',
      email: 'admin@taxipool.com',
      phone: '9999999999',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      verificationStatus: 'verified'
    });

    await adminUser.save();
    console.log('✅ Success: Admin user created successfully!');
    console.log('   Email: admin@taxipool.com');
    console.log('   Password: Admin@123');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
