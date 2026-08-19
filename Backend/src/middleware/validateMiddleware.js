const AppError = require('../utils/AppError');

// Validation helper for user registration
const validateRegistration = (req, res, next) => {
  const { fullName, email, phone, password, role, vehicleName, vehicleNumber, licenseNumber } = req.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    return next(new AppError('Full name is required', 400));
  }

  if (!email || !email.includes('@')) {
    return next(new AppError('A valid email address is required', 400));
  }

  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return next(new AppError('Phone number is required', 400));
  }

  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  const userRole = role || 'passenger';
  if (!['passenger', 'driver'].includes(userRole)) {
    return next(new AppError('Invalid user role specified', 400));
  }

  if (userRole === 'driver') {
    if (!vehicleName || !vehicleNumber || !licenseNumber) {
      return next(new AppError('Drivers must provide vehicle model, license plate, and license number', 400));
    }
  }

  next();
};

// Validation helper for user login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.includes('@')) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (!password) {
    return next(new AppError('Please provide a password', 400));
  }

  next();
};

// Validation helper for ride creation
const validateCreateRide = (req, res, next) => {
  const { pickupLocation, dropLocation, departureDate, departureTime, availableSeats, pricePerSeat, vehicleType } = req.body;

  if (!pickupLocation || !dropLocation || !departureDate || !departureTime || availableSeats === undefined || pricePerSeat === undefined || !vehicleType) {
    return next(new AppError('Please fill in all required ride parameters', 400));
  }

  if (Number(availableSeats) <= 0) {
    return next(new AppError('Available seats must be at least 1', 400));
  }

  if (Number(pricePerSeat) < 0) {
    return next(new AppError('Price per seat cannot be negative', 400));
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateCreateRide
};
