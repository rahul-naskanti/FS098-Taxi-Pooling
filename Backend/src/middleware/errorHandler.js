const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with invalid id format: ${err.value}`;
    error = new AppError(message, 404);
  }

  // Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A record with this ${field} already exists.`;
    error = new AppError(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT Verification Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token authentication signature.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Authentication token expired.', 401);
  }

  const statusCode = error.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  console.error(`💥 Error Caught [${statusCode}]: ${error.message}`);

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(error.errors && { errors: error.errors }),
    ...(!isProd && { stack: err.stack })
  });
};

module.exports = errorHandler;
