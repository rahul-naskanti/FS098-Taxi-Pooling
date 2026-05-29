require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const connectDB = require('./config/db');
const testRoutes = require('./routes/testRoute');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initRedis } = require('./utils/cache');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database and Redis Cache
connectDB().then(() => {
  const migrateDrivers = require('./utils/migrateDrivers');
  migrateDrivers();
});
initRedis();

// Security and Performance Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(mongoSanitize());

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Health Check Endpoint (pre-rate limiting for monitoring stability)
app.get('/api/health', (req, res) => {
  const mongooseState = mongoose.connection.readyState;
  const mongoStatus = mongooseState === 1 ? 'connected' : 'disconnected';
  
  const cache = require('./utils/cache');
  const redisStatus = cache.isConnected() ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'OK',
    mongodb: mongoStatus,
    redis: redisStatus,
    uptime: process.uptime()
  });
});

// Request Rate Limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', limiter);

// API Routes
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api', require('./routes/passengerRoutes'));

// Base route fallback
app.get('/', (req, res) => {
  res.send('Taxi Pooling API is running');
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`📡 Server is running in development mode on port ${PORT}`);
});
