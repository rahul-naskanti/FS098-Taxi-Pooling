require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { initRedis } = require('./utils/cache');

const PORT = process.env.PORT || 5000;

// Connect to Database and Redis Cache
connectDB().then(() => {
  const migrateDrivers = require('./utils/migrateDrivers');
  migrateDrivers();
});
initRedis();

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`📡 Server is running in development mode on port ${PORT}`);
});

module.exports = server;
