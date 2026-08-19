const mongoose = require('mongoose');
const rideService = require('../services/rideService');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { delCache } = require('../utils/cache');

// @desc    Create a new ride pool
// @route   POST /api/rides
// @access  Private (Driver only)
const createRide = async (req, res) => {
  const ride = await rideService.createRide(req.body, req.user.id);
  res.status(201).json({
    success: true,
    ride
  });
};

// @desc    Get all active ride pools
// @route   GET /api/rides
// @access  Private
const getAllRides = async (req, res) => {
  const rides = await rideService.getAllActiveRides();
  res.status(200).json({
    success: true,
    rides
  });
};

// @desc    Join an active ride pool (Atomic)
// @route   POST /api/rides/:id/join
// @access  Private (Passenger only)
const joinRide = async (req, res) => {
  const { ride, booking, payment } = await rideService.joinRide(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Joined ride pool successfully',
    ride,
    booking,
    payment
  });
};

// @desc    Get rides created by the logged-in driver
// @route   GET /api/rides/driver/my-rides
// @access  Private (Driver only)
const getDriverRides = async (req, res) => {
  const rides = await rideService.getDriverRides(req.user.id);
  res.status(200).json({
    success: true,
    rides
  });
};

// @desc    Get rides joined by the logged-in passenger
// @route   GET /api/rides/passenger/bookings
// @access  Private (Passenger only)
const getPassengerBookings = async (req, res) => {
  const bookings = await rideService.getPassengerBookings(req.user.id);
  res.status(200).json({
    success: true,
    bookings
  });
};

// @desc    Cancel a ride pool (Driver only)
// @route   PATCH /api/rides/:id/cancel
// @access  Private (Driver only)
const cancelRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    throw new AppError('Ride pool not found', 404);
  }

  if (ride.driver.toString() !== req.user.id) {
    throw new AppError('Not authorized to cancel this ride pool', 403);
  }

  ride.status = 'cancelled';
  await ride.save();

  const bookings = await Booking.find({ ride: ride._id, bookingStatus: 'active' });
  for (const booking of bookings) {
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    const payment = await Payment.findOne({ booking: booking._id });
    if (payment) {
      payment.paymentStatus = 'refunded';
      await payment.save();
    }

    await Notification.create({
      user: booking.passenger,
      userModel: 'User',
      title: 'Ride Pool Cancelled',
      message: `The ride pool from ${ride.pickupLocation} to ${ride.dropLocation} has been cancelled by the driver.`,
      type: 'cancel'
    });

    await delCache(`passenger_dashboard_stats:${booking.passenger}`);
  }

  await Notification.create({
    user: ride.driver,
    userModel: 'Driver',
    title: 'Ride Pool Cancelled',
    message: `You have cancelled your ride pool from ${ride.pickupLocation} to ${ride.dropLocation}.`,
    type: 'cancel'
  });

  await delCache('active_rides_list');
  await delCache('admin_dashboard_stats');
  await delCache(`driver_dashboard_stats:${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Ride pool cancelled successfully',
    ride
  });
};

// @desc    Leave a ride pool
// @route   POST /api/rides/:id/leave
// @access  Private (Passenger only)
const leaveRide = async (req, res) => {
  const identifier = req.params.id;

  let booking = await Booking.findOne({
    _id: mongoose.isValidObjectId(identifier) ? identifier : new mongoose.Types.ObjectId(),
    passenger: req.user.id,
    bookingStatus: 'active'
  });

  if (!booking) {
    booking = await Booking.findOne({
      ride: mongoose.isValidObjectId(identifier) ? identifier : new mongoose.Types.ObjectId(),
      passenger: req.user.id,
      bookingStatus: 'active'
    });
  }

  if (!booking) {
    throw new AppError('Active booking not found for this user', 404);
  }

  const rideId = booking.ride;
  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError('Ride pool not found', 404);
  }

  const updatedRide = await Ride.findOneAndUpdate(
    { _id: rideId, passengers: req.user.id },
    {
      $inc: { availableSeats: 1 },
      $pull: { passengers: req.user.id }
    },
    { new: true }
  );

  booking.bookingStatus = 'cancelled';
  booking.paymentStatus = 'refunded';
  await booking.save();

  const payment = await Payment.findOne({ booking: booking._id });
  if (payment) {
    payment.paymentStatus = 'refunded';
    await payment.save();
  }

  await Notification.create({
    user: req.user.id,
    userModel: 'User',
    title: 'Booking Cancelled',
    message: `You have left the ride pool from ${ride.pickupLocation} to ${ride.dropLocation}.`,
    type: 'cancel'
  });

  await Notification.create({
    user: ride.driver,
    userModel: 'Driver',
    title: 'Passenger Left',
    message: `A passenger has left your ride pool from ${ride.pickupLocation} to ${ride.dropLocation}.`,
    type: 'cancel'
  });

  await delCache('active_rides_list');
  await delCache('admin_dashboard_stats');
  await delCache(`passenger_dashboard_stats:${req.user.id}`);
  await delCache(`driver_dashboard_stats:${ride.driver}`);

  res.status(200).json({
    success: true,
    message: 'Left ride pool successfully',
    ride: updatedRide
  });
};

// @desc    Remove a passenger from a ride pool (Driver only)
// @route   POST /api/rides/:id/remove-passenger
// @access  Private (Driver only)
const removePassenger = async (req, res) => {
  const rideId = req.params.id;
  const { passengerId } = req.body;

  if (!passengerId) {
    throw new AppError('Passenger ID is required to remove passenger', 400);
  }

  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError('Ride pool not found', 404);
  }

  if (ride.driver.toString() !== req.user.id) {
    throw new AppError('Not authorized to manage passengers for this ride pool', 403);
  }

  if (!ride.passengers.includes(passengerId)) {
    throw new AppError('Passenger is not registered in this ride pool', 400);
  }

  const updatedRide = await Ride.findOneAndUpdate(
    { _id: rideId, passengers: passengerId },
    {
      $inc: { availableSeats: 1 },
      $pull: { passengers: passengerId }
    },
    { new: true }
  );

  const booking = await Booking.findOne({
    ride: rideId,
    passenger: passengerId,
    bookingStatus: 'active'
  });

  if (booking) {
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    const payment = await Payment.findOne({ booking: booking._id });
    if (payment) {
      payment.paymentStatus = 'refunded';
      await payment.save();
    }
  }

  await Notification.create({
    user: passengerId,
    userModel: 'User',
    title: 'Booking Cancelled by Driver',
    message: `The driver has removed you from the ride pool from ${ride.pickupLocation} to ${ride.dropLocation}.`,
    type: 'cancel'
  });

  await Notification.create({
    user: ride.driver,
    userModel: 'Driver',
    title: 'Passenger Removed',
    message: `You have removed a passenger from your ride pool from ${ride.pickupLocation} to ${ride.dropLocation}.`,
    type: 'cancel'
  });

  await delCache('active_rides_list');
  await delCache('admin_dashboard_stats');
  await delCache(`passenger_dashboard_stats:${passengerId}`);
  await delCache(`driver_dashboard_stats:${ride.driver}`);

  res.status(200).json({
    success: true,
    message: 'Passenger removed from ride pool successfully',
    ride: updatedRide
  });
};

// @desc    Search active ride pools with filters
// @route   GET /api/rides/search
// @access  Private
const searchRides = async (req, res) => {
  const {
    pickup,
    drop,
    date,
    passengers = 1,
    minPrice,
    maxPrice,
    vehicleType,
    rating,
    verifiedOnly,
    instantOnly,
    femaleFriendlyOnly,
    acFilter,
    timeRange
  } = req.query;

  const filter = { status: 'active' };

  if (pickup) {
    filter.pickupLocation = { $regex: pickup, $options: 'i' };
  }
  if (drop) {
    filter.dropLocation = { $regex: drop, $options: 'i' };
  }
  if (date) {
    filter.departureDate = date;
  }

  const requiredSeats = Number(passengers) || 1;
  filter.$or = [
    { remainingSeats: { $gte: requiredSeats } },
    { remainingSeats: { $exists: false }, availableSeats: { $gte: requiredSeats } }
  ];

  if (minPrice || maxPrice) {
    const priceQuery = {};
    if (minPrice) priceQuery.$gte = Number(minPrice);
    if (maxPrice) priceQuery.$lte = Number(maxPrice);
    
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { farePerSeat: priceQuery },
        { farePerSeat: { $exists: false }, pricePerSeat: priceQuery }
      ]
    });
  }

  if (vehicleType) {
    const types = Array.isArray(vehicleType) ? vehicleType : vehicleType.split(',');
    filter.vehicleType = { $in: types.map(t => new RegExp(`^${t.trim()}$`, 'i')) };
  }

  if (rating) {
    filter.driverRating = { $gte: Number(rating) };
  }

  if (verifiedOnly === 'true') {
    filter.isVerifiedDriver = true;
  }

  if (instantOnly === 'true') {
    filter.instantBooking = true;
  }

  if (femaleFriendlyOnly === 'true') {
    filter.femaleFriendly = true;
  }

  if (acFilter) {
    filter.acService = acFilter === 'ac';
  }

  let rides = await Ride.find(filter)
    .populate('driver', 'fullName phone vehicleName vehicleNumber isVerified')
    .sort({ departureTime: 1 })
    .lean();

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toUpperCase();
    const match = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3];
    
    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  if (timeRange) {
    const ranges = Array.isArray(timeRange) ? timeRange : timeRange.split(',');
    rides = rides.filter(ride => {
      const minutes = timeToMinutes(ride.departureTime);
      return ranges.some(range => {
        if (range === 'morning') return minutes >= 360 && minutes < 720;
        if (range === 'afternoon') return minutes >= 720 && minutes < 1080;
        if (range === 'evening') return minutes >= 1080 && minutes < 1440;
        if (range === 'night') return minutes >= 0 && minutes < 360;
        return true;
      });
    });
  }

  if (req.user && req.user.role === 'passenger' && pickup && drop) {
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        recentSearches: {
          $each: [{
            pickup,
            dropoff: drop,
            date: date || '',
            passengers: requiredSeats,
            searchedAt: new Date()
          }],
          $slice: -5
        }
      }
    });
  }

  res.status(200).json({
    success: true,
    rides
  });
};

// @desc    Get single ride by ID with driver info
// @route   GET /api/rides/:id
// @access  Private
const getRideById = async (req, res) => {
  const ride = await rideService.getRideById(req.params.id);
  res.status(200).json({
    success: true,
    ride
  });
};

// @desc    Create a ride booking with seat customization
// @route   POST /api/bookings
// @access  Private (Passenger only)
const createBooking = async (req, res) => {
  const { rideId, seatsBooked, totalFare } = req.body;
  const seats = Number(seatsBooked) || 1;

  const existingRide = await Ride.findById(rideId);
  if (!existingRide) {
    throw new AppError('Ride pool not found', 404);
  }

  if (existingRide.driver.toString() === req.user.id) {
    throw new AppError('Drivers cannot book their own ride pools', 400);
  }

  const currentSeats = existingRide.remainingSeats !== undefined ? existingRide.remainingSeats : existingRide.availableSeats;
  if (currentSeats < seats) {
    throw new AppError('Not enough seats available on this ride', 400);
  }

  const updatedRide = await Ride.findOneAndUpdate(
    {
      _id: rideId,
      availableSeats: { $gte: seats },
      status: 'active'
    },
    {
      $inc: { availableSeats: -seats, remainingSeats: -seats },
      $push: { passengers: req.user.id }
    },
    { new: true }
  );

  if (!updatedRide) {
    throw new AppError('Failed to book ride. Available seats might have changed.', 400);
  }

  const booking = await Booking.create({
    ride: rideId,
    passenger: req.user.id,
    driver: existingRide.driver,
    seatsBooked: seats,
    totalFare: totalFare || (existingRide.pricePerSeat * seats),
    bookingStatus: 'active',
    paymentStatus: 'paid'
  });

  const transactionId = `TXN-${new mongoose.Types.ObjectId().toString().toUpperCase()}`;
  await Payment.create({
    booking: booking._id,
    passenger: req.user.id,
    driver: existingRide.driver,
    amount: totalFare || (existingRide.pricePerSeat * seats),
    paymentMethod: 'wallet',
    paymentStatus: 'completed',
    transactionId
  });

  await Notification.create({
    user: req.user.id,
    userModel: 'User',
    title: 'Ride Booked Successfully',
    message: `Booked ${seats} seats from ${existingRide.pickupLocation} to ${existingRide.dropLocation}.`,
    type: 'join'
  });

  await Notification.create({
    user: existingRide.driver,
    userModel: 'Driver',
    title: 'New Ride Booking',
    message: `A passenger has booked ${seats} seats on your ride from ${existingRide.pickupLocation} to ${existingRide.dropLocation}.`,
    type: 'join'
  });

  await delCache('active_rides_list');
  await delCache('admin_dashboard_stats');
  await delCache(`passenger_dashboard_stats:${req.user.id}`);
  await delCache(`driver_dashboard_stats:${existingRide.driver}`);

  res.status(201).json({
    success: true,
    message: 'Ride booked successfully',
    booking,
    ride: updatedRide
  });
};

// @desc    Bookmark or save a ride for later
// @route   POST /api/rides/save
// @access  Private (Passenger only)
const saveRide = async (req, res) => {
  const { rideId } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User account not found', 404);
  }

  const rideExists = await Ride.findById(rideId);
  if (!rideExists) {
    throw new AppError('Ride pool not found', 404);
  }

  const alreadySaved = user.savedRides.some(id => id.toString() === rideId);
  if (alreadySaved) {
    user.savedRides = user.savedRides.filter(id => id.toString() !== rideId);
    await user.save();
    return res.status(200).json({
      success: true,
      isSaved: false,
      message: 'Ride removed from saved list'
    });
  } else {
    user.savedRides.push(rideId);
    await user.save();
    return res.status(200).json({
      success: true,
      isSaved: true,
      message: 'Ride saved successfully'
    });
  }
};

// @desc    Get saved rides list
// @route   GET /api/passenger/saved-rides
// @access  Private (Passenger only)
const getSavedRides = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'savedRides',
      populate: { path: 'driver', select: 'fullName phone vehicleName vehicleNumber verificationStatus isVerified' }
    })
    .lean();

  if (!user) {
    throw new AppError('User account not found', 404);
  }

  res.status(200).json({
    success: true,
    savedRides: user.savedRides || []
  });
};

// @desc    Get user's recent searches
// @route   GET /api/passenger/recent-searches
// @access  Private (Passenger only)
const getRecentSearches = async (req, res) => {
  const user = await User.findById(req.user.id).select('recentSearches').lean();
  if (!user) {
    throw new AppError('User account not found', 404);
  }

  res.status(200).json({
    success: true,
    recentSearches: user.recentSearches || []
  });
};

module.exports = {
  createRide,
  getAllRides,
  joinRide,
  getDriverRides,
  getPassengerBookings,
  cancelRide,
  leaveRide,
  removePassenger,
  searchRides,
  getRideById,
  createBooking,
  saveRide,
  getSavedRides,
  getRecentSearches
};
