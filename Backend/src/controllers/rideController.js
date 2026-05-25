const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { getCache, setCache, delCache } = require('../utils/cache');

// @desc    Create a new ride pool
// @route   POST /api/rides
// @access  Private (Driver only)
const createRide = async (req, res) => {
  const {
    pickupLocation,
    dropLocation,
    departureDate,
    departureTime,
    availableSeats,
    pricePerSeat,
    vehicleType,
    notes
  } = req.body;

  if (
    !pickupLocation ||
    !dropLocation ||
    !departureDate ||
    !departureTime ||
    !availableSeats ||
    !pricePerSeat ||
    !vehicleType
  ) {
    res.status(400);
    throw new Error('Please fill in all required ride parameters');
  }

  const ride = await Ride.create({
    driver: req.user.id,
    pickupLocation,
    dropLocation,
    departureDate,
    departureTime,
    availableSeats: Number(availableSeats),
    pricePerSeat: Number(pricePerSeat),
    vehicleType,
    notes: notes || '',
    passengers: []
  });

  // Cache invalidation
  await delCache('active_rides_list');
  await delCache('admin_dashboard_stats');
  await delCache(`driver_dashboard_stats:${req.user.id}`);

  res.status(201).json({
    success: true,
    ride
  });
};

// @desc    Get all active ride pools
// @route   GET /api/rides
// @access  Private
const getAllRides = async (req, res) => {
  const cacheKey = 'active_rides_list';
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  // Query only active ride pools using lean for optimization
  const rides = await Ride.find({ status: 'active' })
    .populate('driver', 'fullName phone vehicleName vehicleNumber')
    .sort({ createdAt: -1 })
    .lean();

  const responseData = {
    success: true,
    rides
  };

  await setCache(cacheKey, responseData, 300);

  res.status(200).json(responseData);
};

// @desc    Join an active ride pool (Atomic)
// @route   POST /api/rides/:id/join
// @access  Private (Passenger only)
const joinRide = async (req, res) => {
  const rideId = req.params.id;

  // 1. Fetch the ride to check edge cases & provide meaningful error responses
  const existingRide = await Ride.findById(rideId).lean();
  if (!existingRide) {
    res.status(404);
    throw new Error('Ride pool not found');
  }

  // 2. Enforce constraint: Drivers cannot join their own ride
  if (existingRide.driver.toString() === req.user.id) {
    res.status(400);
    throw new Error('Drivers cannot join their own ride pools');
  }

  // 3. Enforce constraint: Passengers cannot join duplicate times
  const passengersStringList = existingRide.passengers.map(p => p.toString());
  if (passengersStringList.includes(req.user.id)) {
    res.status(400);
    throw new Error('You have already joined this ride pool');
  }

  // 4. Enforce constraint: Active seats capacity limit check
  if (existingRide.availableSeats <= 0) {
    res.status(400);
    throw new Error('This ride pool has no available seats remaining');
  }

  // 5. Execute atomic database update using findOneAndUpdate to prevent race conditions
  const updatedRide = await Ride.findOneAndUpdate(
    {
      _id: rideId,
      availableSeats: { $gt: 0 },
      passengers: { $ne: req.user.id },
      status: 'active'
    },
    {
      $inc: { availableSeats: -1 },
      $push: { passengers: req.user.id }
    },
    { new: true }
  );

  if (!updatedRide) {
    res.status(400);
    throw new Error('Could not join ride pool. It might have filled up or changed status.');
  }

  // 6. Create Booking record
  const booking = await Booking.create({
    ride: rideId,
    passenger: req.user.id,
    driver: existingRide.driver,
    seatsBooked: 1,
    totalFare: existingRide.pricePerSeat,
    bookingStatus: 'active',
    paymentStatus: 'paid'
  });

  // 7. Create Payment record
  const transactionId = `TXN-${new mongoose.Types.ObjectId().toString().toUpperCase()}`;
  const payment = await Payment.create({
    booking: booking._id,
    passenger: req.user.id,
    driver: existingRide.driver,
    amount: existingRide.pricePerSeat,
    paymentMethod: 'wallet',
    paymentStatus: 'completed',
    transactionId
  });

  // 8. Create Notifications
  await Notification.create({
    user: req.user.id,
    userModel: 'User',
    title: 'Ride Joined',
    message: `Joined ride pool from ${existingRide.pickupLocation} to ${existingRide.dropLocation}.`,
    type: 'join'
  });

  await Notification.create({
    user: existingRide.driver,
    userModel: 'Driver',
    title: 'New Passenger Joined',
    message: `A passenger has joined your ride pool from ${existingRide.pickupLocation} to ${existingRide.dropLocation}.`,
    type: 'join'
  });

  // Cache invalidation
  await delCache('active_rides_list');
  await delCache('admin_dashboard_stats');
  await delCache(`passenger_dashboard_stats:${req.user.id}`);
  await delCache(`driver_dashboard_stats:${existingRide.driver}`);

  res.status(200).json({
    success: true,
    message: 'Joined ride pool successfully',
    ride: updatedRide,
    booking,
    payment
  });
};

// @desc    Get rides created by the logged-in driver
// @route   GET /api/rides/driver/my-rides
// @access  Private (Driver only)
const getDriverRides = async (req, res) => {
  const rides = await Ride.find({ driver: req.user.id })
    .populate('passengers', 'fullName phone email')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    rides
  });
};

// @desc    Get rides joined by the logged-in passenger
// @route   GET /api/rides/passenger/bookings
// @access  Private (Passenger only)
const getPassengerBookings = async (req, res) => {
  const bookings = await Booking.find({ passenger: req.user.id })
    .populate({
      path: 'ride',
      populate: { path: 'driver', select: 'fullName phone vehicleName vehicleNumber' }
    })
    .populate('driver', 'fullName phone vehicleName vehicleNumber')
    .sort({ createdAt: -1 })
    .lean();

  // Map to match structure expected by frontend
  const formattedBookings = bookings.map(b => {
    const ride = b.ride || {};
    const driver = b.driver || ride.driver || {};
    return {
      _id: b._id, // Return Booking ID
      bookingId: b._id,
      driver: driver,
      pickupLocation: ride.pickupLocation || '',
      dropLocation: ride.dropLocation || '',
      departureTime: ride.departureTime || '',
      departureDate: ride.departureDate || '',
      status: b.bookingStatus === 'active' && ride.status === 'cancelled' ? 'cancelled' : b.bookingStatus,
      pricePerSeat: b.totalFare,
      vehicleType: ride.vehicleType || ''
    };
  });

  res.status(200).json({
    success: true,
    bookings: formattedBookings
  });
};

// @desc    Cancel a ride pool (Driver only)
// @route   PATCH /api/rides/:id/cancel
// @access  Private (Driver only)
const cancelRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    res.status(404);
    throw new Error('Ride pool not found');
  }

  // Enforce constraint: Only the creating driver can cancel the ride
  if (ride.driver.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to cancel this ride pool');
  }

  ride.status = 'cancelled';
  await ride.save();

  // Find all active bookings for this ride and cancel them
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

    // Notify passenger
    await Notification.create({
      user: booking.passenger,
      userModel: 'User',
      title: 'Ride Pool Cancelled',
      message: `The ride pool from ${ride.pickupLocation} to ${ride.dropLocation} has been cancelled by the driver.`,
      type: 'cancel'
    });

    // Invalidate passenger cache
    await delCache(`passenger_dashboard_stats:${booking.passenger}`);
  }

  // Notify driver
  await Notification.create({
    user: ride.driver,
    userModel: 'Driver',
    title: 'Ride Pool Cancelled',
    message: `You have cancelled your ride pool from ${ride.pickupLocation} to ${ride.dropLocation}.`,
    type: 'cancel'
  });

  // Cache invalidation
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
  const identifier = req.params.id; // Could be Booking ID or Ride ID

  // Find booking
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
    res.status(404);
    throw new Error('Active booking not found for this user');
  }

  const rideId = booking.ride;
  const ride = await Ride.findById(rideId);
  if (!ride) {
    res.status(404);
    throw new Error('Ride pool not found');
  }

  // Atomically pull passenger and increment seats
  const updatedRide = await Ride.findOneAndUpdate(
    { _id: rideId, passengers: req.user.id },
    {
      $inc: { availableSeats: 1 },
      $pull: { passengers: req.user.id }
    },
    { new: true }
  );

  // Update Booking status
  booking.bookingStatus = 'cancelled';
  booking.paymentStatus = 'refunded';
  await booking.save();

  // Update Payment status
  const payment = await Payment.findOne({ booking: booking._id });
  if (payment) {
    payment.paymentStatus = 'refunded';
    await payment.save();
  }

  // Create notifications
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

  // Cache invalidation
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
    res.status(400);
    throw new Error('Passenger ID is required to remove passenger');
  }

  const ride = await Ride.findById(rideId);
  if (!ride) {
    res.status(404);
    throw new Error('Ride pool not found');
  }

  // Check if logged-in user is the driver of the ride
  if (ride.driver.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to manage passengers for this ride pool');
  }

  // Check if passenger has joined the ride
  if (!ride.passengers.includes(passengerId)) {
    res.status(400);
    throw new Error('Passenger is not registered in this ride pool');
  }

  // Atomically pull passenger and increment seats
  const updatedRide = await Ride.findOneAndUpdate(
    { _id: rideId, passengers: passengerId },
    {
      $inc: { availableSeats: 1 },
      $pull: { passengers: passengerId }
    },
    { new: true }
  );

  // Find and cancel booking
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

  // Create notifications
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

  // Cache invalidation
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

module.exports = {
  createRide,
  getAllRides,
  joinRide,
  getDriverRides,
  getPassengerBookings,
  cancelRide,
  leaveRide,
  removePassenger
};
