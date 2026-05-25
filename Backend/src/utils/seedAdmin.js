const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI || mongoURI.trim() === '') {
    console.error('❌ Error: MONGO_URI is missing. Set it in Backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('📡 Connected to MongoDB for seeding...');

    const existingAdmin = await User.findOne({ email: 'admin@taxipool.com' });
    if (existingAdmin) {
      console.warn('⚠️ Warning: Admin user (admin@taxipool.com) already exists. Skipping seeding.');
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
