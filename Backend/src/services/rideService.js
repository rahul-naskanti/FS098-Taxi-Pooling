const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { getCache, setCache, delCache } = require('../utils/cache');

class RideService {
  /**
   * Create a new ride pool
   */
  async createRide(rideData, driverId) {
    const {
      pickupLocation,
      dropLocation,
      departureDate,
      departureTime,
      availableSeats,
      pricePerSeat,
      vehicleType,
      notes
    } = rideData;

    const ride = await Ride.create({
      driver: driverId,
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

    // Invalidate relevant caches
    await delCache('active_rides_list');
    await delCache('admin_dashboard_stats');
    await delCache(`driver_dashboard_stats:${driverId}`);

    return ride;
  }

  /**
   * Fetch all active rides (with Redis caching)
   */
  async getAllActiveRides() {
    const cacheKey = 'active_rides_list';
    const cached = await getCache(cacheKey);
    if (cached) {
      return cached.rides;
    }

    const rides = await Ride.find({ status: 'active' })
      .populate('driver', 'fullName phone vehicleName vehicleNumber')
      .sort({ createdAt: -1 })
      .lean();

    await setCache(cacheKey, { success: true, rides }, 300);
    return rides;
  }

  /**
   * Transactional & Atomic ride pool join logic with Mongoose Session support
   */
  async joinRide(rideId, passengerId) {
    const existingRide = await Ride.findById(rideId).lean();
    if (!existingRide) {
      throw new AppError('Ride pool not found', 404);
    }

    if (existingRide.driver.toString() === passengerId) {
      throw new AppError('Drivers cannot join their own ride pools', 400);
    }

    const passengersStringList = (existingRide.passengers || []).map((p) => p.toString());
    if (passengersStringList.includes(passengerId)) {
      throw new AppError('You have already joined this ride pool', 400);
    }

    if (existingRide.availableSeats <= 0) {
      throw new AppError('This ride pool has no available seats remaining', 400);
    }

    let updatedRide;
    let booking;
    let payment;

    // Initialize Mongoose session if database connection is active
    let session = null;
    if (mongoose.connection.readyState === 1 && typeof mongoose.startSession === 'function') {
      try {
        session = await mongoose.startSession();
      } catch (e) {
        session = null;
      }
    }

    const executeBookingSteps = async (sess) => {
      const options = sess ? { session: sess, new: true } : { new: true };

      // Step 1: Atomic seat reservation check-and-decrement
      updatedRide = await Ride.findOneAndUpdate(
        {
          _id: rideId,
          availableSeats: { $gt: 0 },
          passengers: { $ne: passengerId },
          status: 'active'
        },
        {
          $inc: { availableSeats: -1 },
          $push: { passengers: passengerId }
        },
        options
      );

      if (!updatedRide) {
        throw new AppError('Could not join ride pool. It might have filled up or changed status.', 400);
      }

      // Step 2: Create Booking record
      const bookingData = {
        ride: rideId,
        passenger: passengerId,
        driver: existingRide.driver,
        seatsBooked: 1,
        totalFare: existingRide.pricePerSeat,
        bookingStatus: 'active',
        paymentStatus: 'paid'
      };

      const bookingOptions = sess ? { session: sess } : {};
      const createdBookingResult = await Booking.create([bookingData], bookingOptions);
      booking = Array.isArray(createdBookingResult) ? createdBookingResult[0] : createdBookingResult;

      // Step 3: Create Payment record
      const transactionId = `TXN-${new mongoose.Types.ObjectId().toString().toUpperCase()}`;
      const paymentData = {
        booking: booking ? booking._id : new mongoose.Types.ObjectId(),
        passenger: passengerId,
        driver: existingRide.driver,
        amount: existingRide.pricePerSeat,
        paymentMethod: 'wallet',
        paymentStatus: 'completed',
        transactionId
      };

      const paymentOptions = sess ? { session: sess } : {};
      const createdPaymentResult = await Payment.create([paymentData], paymentOptions);
      payment = Array.isArray(createdPaymentResult) ? createdPaymentResult[0] : createdPaymentResult;
    };

    if (session) {
      try {
        await session.withTransaction(async () => {
          await executeBookingSteps(session);
        });
      } finally {
        await session.endSession();
      }
    } else {
      await executeBookingSteps(null);
    }

    // Side Effects OUTSIDE transaction boundary (Notifications & Cache Invalidation)
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(passengerId)) {
      await Notification.create({
        user: passengerId,
        userModel: 'User',
        title: 'Ride Joined',
        message: `Joined ride pool from ${existingRide.pickupLocation} to ${existingRide.dropLocation}.`,
        type: 'join'
      }).catch((err) => console.error('Notification creation error:', err));
    }

    if (mongoose.connection.readyState === 1 && existingRide.driver && mongoose.Types.ObjectId.isValid(existingRide.driver)) {
      await Notification.create({
        user: existingRide.driver,
        userModel: 'Driver',
        title: 'New Passenger Joined',
        message: `A passenger has joined your ride pool from ${existingRide.pickupLocation} to ${existingRide.dropLocation}.`,
        type: 'join'
      }).catch((err) => console.error('Notification creation error:', err));
    }

    await delCache('active_rides_list');
    await delCache('admin_dashboard_stats');
    await delCache(`passenger_dashboard_stats:${passengerId}`);
    await delCache(`driver_dashboard_stats:${existingRide.driver}`);

    return { ride: updatedRide, booking, payment };
  }

  /**
   * Get rides created by driver
   */
  async getDriverRides(driverId) {
    return await Ride.find({ driver: driverId })
      .populate('passengers', 'fullName phone email')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get passenger's joined bookings
   */
  async getPassengerBookings(passengerId) {
    const bookings = await Booking.find({ passenger: passengerId })
      .populate({
        path: 'ride',
        populate: { path: 'driver', select: 'fullName phone vehicleName vehicleNumber' }
      })
      .populate('driver', 'fullName phone vehicleName vehicleNumber')
      .sort({ createdAt: -1 })
      .lean();

    return bookings.map((b) => {
      const ride = b.ride || {};
      const driver = b.driver || ride.driver || {};
      return {
        _id: b._id,
        bookingId: b._id,
        driver,
        pickupLocation: ride.pickupLocation || '',
        dropLocation: ride.dropLocation || '',
        departureTime: ride.departureTime || '',
        departureDate: ride.departureDate || '',
        status: b.bookingStatus === 'active' && ride.status === 'cancelled' ? 'cancelled' : b.bookingStatus,
        pricePerSeat: b.totalFare,
        vehicleType: ride.vehicleType || ''
      };
    });
  }

  /**
   * Get single ride by ID
   */
  async getRideById(rideId) {
    const ride = await Ride.findById(rideId)
      .populate('driver', 'fullName email phone vehicleName vehicleNumber verificationStatus isVerified')
      .lean();

    if (!ride) {
      throw new AppError('Ride pool not found', 404);
    }

    return ride;
  }
}

module.exports = new RideService();
