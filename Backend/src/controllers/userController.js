const User = require('../models/User');
const Driver = require('../models/Driver');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res) => {
  if (req.user.id === 'admin-static-id') {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  }

  // req.user is already hydrated by protect middleware with the correct model record
  res.status(200).json({
    success: true,
    user: req.user
  });
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res) => {
  if (req.user.id === 'admin-static-id') {
    return res.status(200).json({
      success: true,
      user: {
        id: 'admin-static-id',
        fullName: req.body.fullName || 'Platform Admin',
        email: 'admin@taxipool.com',
        phone: req.body.phone || '',
        role: 'admin',
        company: req.body.company || '',
        sosContact: req.body.sosContact || ''
      }
    });
  }

  const { 
    fullName, 
    phone, 
    company, 
    sosContact, 
    vehicleName, 
    vehicleNumber, 
    licenseNumber, 
    availableSeats,
    password
  } = req.body;

  // Validate generic fields
  if (!fullName || !phone) {
    res.status(400);
    throw new Error('Full name and phone number are required');
  }

  if (req.user.role === 'driver') {
    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      res.status(404);
      throw new Error('Driver profile not found');
    }

    driver.fullName = fullName;
    driver.phone = phone;
    driver.company = company !== undefined ? company : driver.company;
    driver.sosContact = sosContact !== undefined ? sosContact : driver.sosContact;

    if (!vehicleName || !vehicleNumber || !licenseNumber) {
      res.status(400);
      throw new Error('Drivers must provide vehicle details (model, plate number, license number)');
    }
    driver.vehicleName = vehicleName;
    driver.vehicleNumber = vehicleNumber;
    driver.licenseNumber = licenseNumber;
    driver.availableSeats = Number(availableSeats) || 0;

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
      }
      driver.password = password;
    }

    const updatedDriver = await driver.save();
    res.status(200).json({
      success: true,
      user: {
        id: updatedDriver._id,
        fullName: updatedDriver.fullName,
        email: updatedDriver.email,
        phone: updatedDriver.phone,
        role: 'driver',
        company: updatedDriver.company,
        sosContact: updatedDriver.sosContact,
        vehicleName: updatedDriver.vehicleName,
        vehicleNumber: updatedDriver.vehicleNumber,
        licenseNumber: updatedDriver.licenseNumber,
        availableSeats: updatedDriver.availableSeats
      }
    });
  } else {
    // Passenger role
    const passenger = await User.findById(req.user.id);
    if (!passenger) {
      res.status(404);
      throw new Error('Passenger profile not found');
    }

    passenger.fullName = fullName;
    passenger.phone = phone;
    passenger.company = company !== undefined ? company : passenger.company;
    passenger.sosContact = sosContact !== undefined ? sosContact : passenger.sosContact;

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
      }
      passenger.password = password;
    }

    const updatedPassenger = await passenger.save();
    res.status(200).json({
      success: true,
      user: {
        id: updatedPassenger._id,
        fullName: updatedPassenger.fullName,
        email: updatedPassenger.email,
        phone: updatedPassenger.phone,
        role: 'passenger',
        company: updatedPassenger.company,
        sosContact: updatedPassenger.sosContact
      }
    });
  }
};

module.exports = {
  getCurrentUser,
  updateProfile
};
