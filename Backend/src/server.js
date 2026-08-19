require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
const { initRedis } = require('./utils/cache');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

// Connect to Database and Redis Cache
connectDB().then(() => {
  const migrateDrivers = require('./utils/migrateDrivers');
  migrateDrivers();
});
initRedis();

// Create HTTP Server & Attach Socket.IO Engine
const server = http.createServer(app);
initSocket(server);

// Start HTTP Server
server.listen(PORT, () => {
  console.log(`📡 Server with Real-Time WebSockets is running on port ${PORT}`);
});

// Production Graceful Shutdown Handlers
const gracefulShutdown = async (signal) => {
  console.log(`⚠️ [Server] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('✅ [Server] HTTP server & Socket.IO closed.');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ [Server] MongoDB connection closed.');
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error('💥 [Server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
