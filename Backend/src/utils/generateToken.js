const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'supersecretjwtkeyfordev123!';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'supersecretrefreshkeyfordev123!';

// Generate Short-Lived Access Token (15 minutes)
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    getJwtSecret(),
    { expiresIn: '15m' }
  );
};

// Generate Longer-Lived Refresh Token (7 days)
const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, tokenType: 'refresh' },
    getRefreshSecret(),
    { expiresIn: '7d' }
  );
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

// Helper for HTTP-Only Cookie options
const getCookieOptions = () => ({
  httpOnly: true, // Prevents JavaScript XSS access
  secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
  sameSite: 'lax', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getCookieOptions
};
