const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const cache = require('../utils/cache');
const notificationQueue = require('../queues/notificationQueue');

// Helper to compute Haversine distance in kilometers
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6378.1; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

class RideService {
  /**
   * Create a new ride pool with optional GeoJSON coordinates
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
      notes,
      pickupCoordinates,
      dropCoordinates
    } = rideData;

    let pickupPoint;
    if (pickupCoordinates && pickupCoordinates.latitude !== undefined && pickupCoordinates.longitude !== undefined) {
      pickupPoint = {
        type: 'Point',
        coordinates: [Number(pickupCoordinates.longitude), Number(pickupCoordinates.latitude)]
      };
    }

    let dropPoint;
    if (dropCoordinates && dropCoordinates.latitude !== undefined && dropCoordinates.longitude !== undefined) {
      dropPoint = {
        type: 'Point',
        coordinates: [Number(dropCoordinates.longitude), Number(dropCoordinates.latitude)]
      };
    }

    const ride = await Ride.create({
      driver: driverId,
      pickupLocation,
      dropLocation,
      ...(pickupPoint && { pickupPoint }),
      ...(dropPoint && { dropPoint }),
      departureDate,
      departureTime,
      availableSeats: Number(availableSeats),
      pricePerSeat: Number(pricePerSeat),
      vehicleType,
      notes: notes || '',
      passengers: []
    });

    // Invalidate relevant caches after ride creation
    await cache.delCache('active_rides_list');
    await cache.delCache('admin_dashboard_stats');
    await cache.delCache(`driver_dashboard_stats:${driverId}`);

    return ride;
  }

  /**
   * Fetch all active rides (Cache-Aside pattern)
   */
  async getAllActiveRides() {
    const cacheKey = 'active_rides_list';
    const cached = await cache.getCache(cacheKey);
    if (cached) {
      return { rides: cached.rides, _fromCache: true };
    }

    const rides = await Ride.find({ status: 'active' })
      .populate('driver', 'fullName phone vehicleName vehicleNumber')
      .sort({ createdAt: -1 })
      .lean();

    await cache.setCache(cacheKey, { success: true, rides }, 300);
    return { rides, _fromCache: false };
  }

  /**
   * Fetch single ride details by ID (Cache-Aside pattern)
   */
  async getRideById(rideId) {
    const cacheKey = `ride:${rideId}`;
    const cached = await cache.getCache(cacheKey);
    if (cached) {
      return { ride: cached, _fromCache: true };
    }

    const ride = await Ride.findById(rideId)
      .populate('driver', 'fullName email phone vehicleName vehicleNumber verificationStatus isVerified')
      .lean();

    if (!ride) {
      throw new AppError('Ride pool not found', 404);
    }

    await cache.setCache(cacheKey, ride, 300); // 5 minutes TTL
    return { ride, _fromCache: false };
  }

  /**
   * Geospatial search using MongoDB $near operator (sorted by distance)
   */
  async getNearbyRides({ latitude, longitude, radiusKm = 5, limit = 10 }) {
    const maxDistanceMeters = radiusKm * 1000;

    let rides = [];
    try {
      rides = await Ride.find({
        status: 'active',
        availableSeats: { $gt: 0 },
        pickupPoint: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(longitude), Number(latitude)]
            },
            $maxDistance: maxDistanceMeters
          }
        }
      })
      .populate('driver', 'fullName phone vehicleName vehicleNumber isVerified')
      .limit(Number(limit))
      .lean();
    } catch (e) {
      rides = [];
    }

    return (rides || []).map((ride) => {
      let distanceKm = null;
      if (ride.pickupPoint && ride.pickupPoint.coordinates) {
        const [lng, lat] = ride.pickupPoint.coordinates;
        distanceKm = calculateHaversineDistanceKm(latitude, longitude, lat, lng);
      }
      return { ...ride, distanceKm };
    });
  }

  /**
   * Geospatial search using MongoDB $geoWithin with $centerSphere operator
   */
  async getRidesWithinArea({ latitude, longitude, radiusKm = 5, limit = 10 }) {
    const radiusRadians = radiusKm / 6378.1;

    let rides = [];
    try {
      rides = await Ride.find({
        status: 'active',
        availableSeats: { $gt: 0 },
        pickupPoint: {
          $geoWithin: {
            $centerSphere: [[Number(longitude), Number(latitude)], radiusRadians]
          }
        }
      })
      .populate('driver', 'fullName phone vehicleName vehicleNumber isVerified')
      .limit(Number(limit))
      .lean();
    } catch (e) {
      rides = [];
    }

    return (rides || []).map((ride) => {
      let distanceKm = null;
      if (ride.pickupPoint && ride.pickupPoint.coordinates) {
        const [lng, lat] = ride.pickupPoint.coordinates;
        distanceKm = calculateHaversineDistanceKm(latitude, longitude, lat, lng);
      }
      return { ...ride, distanceKm };
    });
  }

  /**
   * Transactional & Atomic ride pool join logic with Mongoose Session & Post-Commit Message Queue Job Enqueuing
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

    // POST-COMMIT ASYNCHRONOUS SIDE EFFECTS: Enqueue notification job into BullMQ Queue
    await notificationQueue.addNotificationJob('BOOKING_CONFIRMATION', {
      bookingId: booking ? booking._id : null,
      rideId,
      passengerId,
      driverId: existingRide.driver,
      pickupLocation: existingRide.pickupLocation,
      dropLocation: existingRide.dropLocation
    });

    // POST-COMMIT CACHE INVALIDATION
    await cache.delCache(`ride:${rideId}`);
    await cache.delCache('active_rides_list');
    await cache.delCache('admin_dashboard_stats');
    await cache.delCache(`passenger_dashboard_stats:${passengerId}`);
    await cache.delCache(`driver_dashboard_stats:${existingRide.driver}`);

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
}

module.exports = new RideService();
