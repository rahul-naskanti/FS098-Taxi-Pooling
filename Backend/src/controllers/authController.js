const User = require('../models/User');
const Driver = require('../models/Driver');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getCookieOptions
} = require('../utils/generateToken');
const AppError = require('../utils/AppError');

// Helper to issue tokens and set HTTP-only cookie
const sendAuthResponse = (res, statusCode, userRecord, role) => {
  const userId = userRecord._id || userRecord.id;
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);

  // Set Refresh Token in HTTP-Only Cookie
  res.cookie('refreshToken', refreshToken, getCookieOptions());

  const userPayload = {
    id: userId,
    fullName: userRecord.fullName,
    email: userRecord.email,
    phone: userRecord.phone,
    role: role,
    ...(userRecord.company && { company: userRecord.company }),
    ...(userRecord.sosContact && { sosContact: userRecord.sosContact }),
    ...(role === 'driver' && {
      vehicleName: userRecord.vehicleName,
      vehicleNumber: userRecord.vehicleNumber,
      licenseNumber: userRecord.licenseNumber,
      availableSeats: userRecord.availableSeats,
      verificationStatus: userRecord.verificationStatus,
      isVerified: userRecord.isVerified
    })
  };

  res.status(statusCode).json({
    success: true,
    token: accessToken, // Access token for Authorization header
    role: role,
    user: userPayload
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { 
    fullName, 
    email, 
    phone, 
    password, 
    role,
    vehicleName,
    vehicleNumber,
    licenseNumber,
    availableSeats
  } = req.body;

  const userRole = role || 'passenger';

  // Check email uniqueness across both Passenger (User) and Driver collections
  const userExists = await User.findOne({ email });
  const driverExists = await Driver.findOne({ email });
  if (userExists || driverExists) {
    throw new AppError('A user with this email address already exists', 400);
  }

  if (userRole === 'driver') {
    const licenseImageFile = req.files && req.files['licenseImage'] ? req.files['licenseImage'][0] : null;
    const rcDocumentFile = req.files && req.files['rcDocument'] ? req.files['rcDocument'][0] : null;

    if (!licenseImageFile) {
      throw new AppError('Drivers must upload a driving license image', 400);
    }

    const licenseImagePath = `uploads/${licenseImageFile.filename}`;
    const rcDocumentPath = rcDocumentFile ? `uploads/${rcDocumentFile.filename}` : '';

    const driver = await Driver.create({
      fullName,
      email,
      phone,
      password,
      vehicleName,
      vehicleNumber,
      licenseNumber,
      availableSeats: parseInt(availableSeats, 10) || 0,
      uploadedDocuments: {
        licenseImage: licenseImagePath,
        rcDocument: rcDocumentPath,
        idProof: ''
      }
    });

    if (driver) {
      sendAuthResponse(res, 201, driver, 'driver');
    } else {
      throw new AppError('Internal server error during driver creation', 500);
    }
  } else {
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'passenger'
    });

    if (user) {
      sendAuthResponse(res, 201, user, 'passenger');
    } else {
      throw new AppError('Internal server error during passenger creation', 500);
    }
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Search passenger or admin in users collection
  const passengerOrAdmin = await User.findOne({ email });
  if (passengerOrAdmin) {
    const isMatch = await passengerOrAdmin.matchPassword(password);
    if (isMatch) {
      return sendAuthResponse(res, 200, passengerOrAdmin, passengerOrAdmin.role);
    } else {
      throw new AppError('Invalid email or password coordinates', 401);
    }
  }

  // Search driver in drivers collection
  const driver = await Driver.findOne({ email });
  if (driver) {
    const isMatch = await driver.matchPassword(password);
    if (isMatch) {
      return sendAuthResponse(res, 200, driver, 'driver');
    } else {
      throw new AppError('Invalid email or password coordinates', 401);
    }
  }

  throw new AppError('Invalid email or password coordinates', 401);
};

// @desc    Refresh session tokens (Token Rotation)
// @route   POST /api/auth/refresh
// @access  Public (via HTTP-Only Cookie or Payload)
const refreshSession = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token missing or expired', 401);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    let user;

    if (decoded.role === 'driver') {
      user = await Driver.findById(decoded.id).select('-password');
    } else {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      throw new AppError('User not found during token refresh', 401);
    }

    // Issue rotated access and refresh tokens
    sendAuthResponse(res, 200, user, decoded.role);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }
};

// @desc    Logout user & clear refresh token cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  res.clearCookie('refreshToken', getCookieOptions());
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser
};
