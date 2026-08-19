const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshSession, logoutUser } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { registerSchema, loginSchema } = require('../validators/auth.schema');

// Wrapper middleware to execute multer only for multipart/form-data requests (e.g. driver signup with file uploads)
const handleUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.fields([
      { name: 'licenseImage', maxCount: 1 },
      { name: 'rcDocument', maxCount: 1 }
    ])(req, res, next);
  } else {
    next();
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', handleUpload, validate(registerSchema, 'body'), registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validate(loginSchema, 'body'), loginUser);

// @route   POST /api/auth/refresh
// @desc    Refresh session & get new access token (Token Rotation)
// @access  Public (via HTTP-Only Cookie or Payload)
router.post('/refresh', refreshSession);

// @route   POST /api/auth/logout
// @desc    Clear refresh token cookie & end session
// @access  Public
router.post('/logout', logoutUser);

module.exports = router;
