require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const path = require('path');

// Ensure fallback secrets if environment variables are not defined
process.env.JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyfordev123!';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkeyfordev123!';

const testRoutes = require('./routes/testRoute');
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and Performance Middlewares
app.use(helmet());
app.use(compression());

// Configure CORS for Cookie credentials support
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());

// Serve static uploads
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
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', passengerRoutes);

// Base route fallback
app.get('/', (req, res) => {
  res.send('Taxi Pooling API is running');
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
