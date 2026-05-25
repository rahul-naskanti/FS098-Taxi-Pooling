const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || mongoURI.trim() === '') {
    console.warn('\n========================================================================');
    console.warn('⚠️  WARNING: MONGO_URI is not defined or is empty in environment variables.');
    console.warn('   The backend will start, but database operations will be disabled.');
    console.warn('   To enable database connection, set MONGO_URI in Backend/.env.');
    console.warn('========================================================================\n');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Graceful handling during dev - don't crash the server so other routes still work
  }
};

module.exports = connectDB;
