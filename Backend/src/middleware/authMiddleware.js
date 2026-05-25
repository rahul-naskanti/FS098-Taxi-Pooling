const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Handle hardcoded admin case
      if (decoded.id === 'admin-static-id' || decoded.role === 'admin') {
        req.user = {
          _id: 'admin-static-id',
          id: 'admin-static-id',
          fullName: 'Platform Admin',
          email: 'admin@taxipool.com',
          role: 'admin',
          isActive: true
        };
      } else if (decoded.role === 'driver') {
        // Query Driver collection
        req.user = await Driver.findById(decoded.id).select('-password');
      } else if (decoded.role === 'passenger') {
        // Query Passenger (User) collection
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        // Fallback for legacy tokens without embedded role payload
        let foundUser = await User.findById(decoded.id).select('-password');
        if (!foundUser) {
          foundUser = await Driver.findById(decoded.id).select('-password');
        }
        req.user = foundUser;
      }

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource`);
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
