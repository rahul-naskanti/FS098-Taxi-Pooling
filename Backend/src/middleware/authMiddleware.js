const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'supersecretjwtkeyfordev123!';
      const decoded = jwt.verify(token, secret);

      if (decoded.role === 'driver') {
        req.user = await Driver.findById(decoded.id).select('-password');
      } else {
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user && !decoded.role) {
          req.user = await Driver.findById(decoded.id).select('-password');
        }
      }

      if (!req.user) {
        throw new AppError('Not authorized, user account not found', 401);
      }

      if (req.user.isActive === false) {
        throw new AppError('User account is deactivated. Please contact support.', 403);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Access token expired. Please refresh your session.', 401);
      }
      throw new AppError('Not authorized, token failed', 401);
    }
  }

  if (!token) {
    throw new AppError('Not authorized, no token provided', 401);
  }
};

const protectOptional = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'supersecretjwtkeyfordev123!';
      const decoded = jwt.verify(token, secret);

      if (decoded.role === 'driver') {
        req.user = await Driver.findById(decoded.id).select('-password');
      } else {
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user && !decoded.role) {
          req.user = await Driver.findById(decoded.id).select('-password');
        }
      }
    } catch (error) {
      req.user = null;
    }
  }
  next();
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(
        `Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource`,
        403
      );
    }
    next();
  };
};

const requireVerifiedDriver = (req, res, next) => {
  if (!req.user || req.user.role !== 'driver') {
    throw new AppError('Access denied: Driver privileges required', 403);
  }

  const isVerified = req.user.isVerified || req.user.verificationStatus === 'verified';
  if (!isVerified) {
    throw new AppError('Driver account is pending verification by an administrator', 403);
  }

  next();
};

const authorizeOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    const resourceUserId = req.params[paramName];
    if (!req.user) {
      throw new AppError('Not authorized', 401);
    }

    if (req.user.role === 'admin') {
      return next(); // Admins have full access
    }

    if (req.user._id.toString() !== resourceUserId && req.user.id !== resourceUserId) {
      throw new AppError('Forbidden: You do not have permission to access another user\'s resource', 403);
    }

    next();
  };
};

module.exports = {
  protect,
  protectOptional,
  authorizeRoles,
  requireVerifiedDriver,
  authorizeOwnerOrAdmin
};
