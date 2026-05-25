const User = require('../models/User');
const Driver = require('../models/Driver');
const generateToken = require('../utils/generateToken');

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

  // Validate generic required fields
  if (!fullName || !email || !phone || !password) {
    res.status(400);
    throw new Error('Please enter all required generic registration fields');
  }

  // Validate role
  const userRole = role || 'passenger';
  if (!['passenger', 'driver'].includes(userRole)) {
    res.status(400);
    throw new Error('Invalid registration role provided');
  }

  // Check email uniqueness across both Passenger (User) and Driver collections
  const userExists = await User.findOne({ email });
  const driverExists = await Driver.findOne({ email });
  if (userExists || driverExists) {
    res.status(400);
    throw new Error('A user with this email address already exists');
  }

  if (userRole === 'driver') {
    // Validate driver-specific requirements
    if (!vehicleName || !vehicleNumber || !licenseNumber) {
      res.status(400);
      throw new Error('Drivers must provide vehicle spec details, license number, and available seat counts');
    }

    // Create new driver in Driver collection
    const driver = await Driver.create({
      fullName,
      email,
      phone,
      password,
      vehicleName,
      vehicleNumber,
      licenseNumber,
      availableSeats: parseInt(availableSeats, 10) || 0
    });

    if (driver) {
      res.status(201).json({
        success: true,
        token: generateToken(driver._id, 'driver'),
        user: {
          id: driver._id,
          fullName: driver.fullName,
          email: driver.email,
          phone: driver.phone,
          role: 'driver',
          vehicleName: driver.vehicleName,
          vehicleNumber: driver.vehicleNumber,
          licenseNumber: driver.licenseNumber,
          availableSeats: driver.availableSeats
        }
      });
    } else {
      res.status(500);
      throw new Error('Internal server error during driver creation');
    }
  } else {
    // Create passenger in User collection
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'passenger'
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id, 'passenger'),
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: 'passenger'
        }
      });
    } else {
      res.status(500);
      throw new Error('Internal server error during passenger creation');
    }
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password coordinates');
  }

  // STEP 1: Check for hardcoded admin credentials
  if (email === 'admin@taxipool.com' && password === 'Admin@123') {
    return res.status(200).json({
      success: true,
      token: generateToken('admin-static-id', 'admin'),
      role: "admin",
      user: {
        id: "admin-static-id",
        fullName: "Platform Admin",
        email: "admin@taxipool.com",
        role: "admin"
      }
    });
  }

  // STEP 2: Search passenger in users collection
  const passenger = await User.findOne({ email });
  if (passenger) {
    const isMatch = await passenger.matchPassword(password);
    if (isMatch) {
      return res.status(200).json({
        success: true,
        token: generateToken(passenger._id, passenger.role),
        role: passenger.role,
        user: {
          id: passenger._id,
          fullName: passenger.fullName,
          email: passenger.email,
          phone: passenger.phone,
          role: passenger.role,
          company: passenger.company,
          sosContact: passenger.sosContact
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password coordinates');
    }
  }

  // STEP 3: Search driver in drivers collection
  const driver = await Driver.findOne({ email });
  if (driver) {
    const isMatch = await driver.matchPassword(password);
    if (isMatch) {
      return res.status(200).json({
        success: true,
        token: generateToken(driver._id, 'driver'),
        role: 'driver',
        user: {
          id: driver._id,
          fullName: driver.fullName,
          email: driver.email,
          phone: driver.phone,
          role: 'driver',
          vehicleName: driver.vehicleName,
          vehicleNumber: driver.vehicleNumber,
          licenseNumber: driver.licenseNumber,
          availableSeats: driver.availableSeats,
          company: driver.company,
          sosContact: driver.sosContact
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password coordinates');
    }
  }

  // If not found in either collection
  res.status(401);
  throw new Error('Invalid email or password coordinates');
};

module.exports = {
  registerUser,
  loginUser
};
