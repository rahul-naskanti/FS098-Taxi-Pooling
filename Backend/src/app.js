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
const { graphql } = require('graphql');

// Ensure fallback secrets if environment variables are not defined
process.env.JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyfordev123!';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkeyfordev123!';

const requestIdMiddleware = require('./middleware/requestIdMiddleware');
const requestLoggerMiddleware = require('./middleware/requestLoggerMiddleware');
const { protectOptional } = require('./middleware/authMiddleware');
const testRoutes = require('./routes/testRoute');
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const errorHandler = require('./middleware/errorHandler');

const schema = require('./graphql/schema');
const rootResolver = require('./graphql/resolvers');
const createDataLoaders = require('./graphql/dataloader');

const app = express();

// Request Correlation ID & HTTP Logging Middlewares
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Security and Performance Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
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

// Serve static uploads (legacy fallback)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Endpoint (pre-rate limiting for infrastructure monitoring)
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
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', limiter);

// GraphQL HTTP Endpoint Handler (Runs parallel to REST APIs)
app.post('/graphql', protectOptional, async (req, res) => {
  const { query, variables } = req.body || {};
  if (!query) {
    return res.status(400).json({ errors: [{ message: 'Must provide query string.' }] });
  }

  const result = await graphql({
    schema,
    source: query,
    rootValue: rootResolver,
    variableValues: variables,
    contextValue: {
      user: req.user,
      id: req.id,
      dataLoaders: createDataLoaders()
    }
  });

  return res.status(200).json(result);
});

// REST API Routes
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
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
