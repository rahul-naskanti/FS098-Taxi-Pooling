require('dotenv').config();
const http = require('http');
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

module.exports = server;
