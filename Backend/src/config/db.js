const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taxipooling';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Primary MongoDB Connection Error (${mongoURI}): ${error.message}`);
    
    // Attempt local MongoDB fallback if primary connection fails
    const localURI = 'mongodb://127.0.0.1:27017/taxipooling';
    if (mongoURI !== localURI) {
      console.log(`🔄 Attempting fallback to local MongoDB instance: ${localURI}...`);
      try {
        const fallbackConn = await mongoose.connect(localURI, {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`📡 MongoDB Fallback Connected: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackError) {
        console.error(`❌ Local MongoDB Fallback Connection Error: ${fallbackError.message}`);
      }
    }

    mongoose.set('bufferCommands', false);
  }
};

module.exports = connectDB;
