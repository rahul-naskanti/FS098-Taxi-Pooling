const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || mongoURI.trim() === '') {
    console.warn('\n========================================================================');
    console.warn('⚠️  WARNING: MONGO_URI is not defined or is empty in environment variables.');
    console.warn('   The backend will start, but database operations will be disabled.');
    console.warn('   To enable database connection, set MONGO_URI in Backend/.env.');
    console.warn('========================================================================\n');
    mongoose.set('bufferCommands', false);
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    mongoose.set('bufferCommands', false);
  }
};

module.exports = connectDB;
