const rideService = require('../services/rideService');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const AppError = require('../utils/AppError');

const rootResolver = {
  me: async (args, context) => {
    if (!context.user) {
      throw new AppError('Authentication required', 401);
    }
    const user = await User.findById(context.user.id).select('fullName email phone role').lean();
    if (!user) return null;
    return { id: user._id.toString(), ...user };
  },

  ride: async ({ id }, context) => {
    const { ride } = await rideService.getRideById(id);
    if (!ride) return null;

    let driverObj = null;
    if (ride.driver) {
      const driverId = ride.driver._id ? ride.driver._id.toString() : ride.driver.toString();
      if (context.dataLoaders && context.dataLoaders.driverLoader) {
        driverObj = await context.dataLoaders.driverLoader.load(driverId);
      } else {
        const driver = await Driver.findById(driverId).select('fullName email phone vehicleName vehicleNumber isVerified').lean();
        if (driver) driverObj = { id: driver._id.toString(), ...driver };
      }
    }

    return {
      id: ride._id.toString(),
      pickupLocation: ride.pickupLocation,
      dropLocation: ride.dropLocation,
      departureDate: ride.departureDate,
      departureTime: ride.departureTime,
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
      vehicleType: ride.vehicleType,
      notes: ride.notes || '',
      status: ride.status,
      driver: driverObj
    };
  },

  rides: async (args, context) => {
    const { rides } = await rideService.getAllActiveRides();
    const result = [];

    for (const r of (rides || [])) {
      let driverObj = null;
      if (r.driver) {
        const driverId = r.driver._id ? r.driver._id.toString() : r.driver.toString();
        if (context.dataLoaders && context.dataLoaders.driverLoader) {
          driverObj = await context.dataLoaders.driverLoader.load(driverId);
        } else {
          const driver = await Driver.findById(driverId).select('fullName email phone vehicleName vehicleNumber isVerified').lean();
          if (driver) driverObj = { id: driver._id.toString(), ...driver };
        }
      }

      result.push({
        id: r._id.toString(),
        pickupLocation: r.pickupLocation,
        dropLocation: r.dropLocation,
        departureDate: r.departureDate,
        departureTime: r.departureTime,
        availableSeats: r.availableSeats,
        pricePerSeat: r.pricePerSeat,
        vehicleType: r.vehicleType,
        notes: r.notes || '',
        status: r.status,
        driver: driverObj
      });
    }

    return result;
  },

  createRide: async (args, context) => {
    if (!context.user) {
      throw new AppError('Authentication required', 401);
    }
    if (context.user.role !== 'driver') {
      throw new AppError('Forbidden: Only verified drivers can create ride pools', 403);
    }

    const driver = await Driver.findById(context.user.id);
    if (!driver || !driver.isVerified) {
      throw new AppError('Driver account pending verification', 403);
    }

    const ride = await rideService.createRide(args, context.user.id);
    return {
      id: ride._id.toString(),
      pickupLocation: ride.pickupLocation,
      dropLocation: ride.dropLocation,
      departureDate: ride.departureDate,
      departureTime: ride.departureTime,
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
      vehicleType: ride.vehicleType,
      notes: ride.notes || '',
      status: ride.status,
      driver: {
        id: driver._id.toString(),
        fullName: driver.fullName,
        email: driver.email,
        phone: driver.phone,
        vehicleName: driver.vehicleName,
        vehicleNumber: driver.vehicleNumber,
        isVerified: driver.isVerified
      }
    };
  },

  joinRide: async ({ rideId }, context) => {
    if (!context.user) {
      throw new AppError('Authentication required', 401);
    }
    if (context.user.role !== 'passenger') {
      throw new AppError('Forbidden: Only passengers can join ride pools', 403);
    }

    const { ride } = await rideService.joinRide(rideId, context.user.id);
    return {
      success: true,
      message: 'Joined ride pool successfully',
      ride: {
        id: ride._id.toString(),
        pickupLocation: ride.pickupLocation,
        dropLocation: ride.dropLocation,
        departureDate: ride.departureDate,
        departureTime: ride.departureTime,
        availableSeats: ride.availableSeats,
        pricePerSeat: ride.pricePerSeat,
        vehicleType: ride.vehicleType,
        status: ride.status
      }
    };
  },

  cancelRide: async ({ rideId }, context) => {
    if (!context.user) {
      throw new AppError('Authentication required', 401);
    }
    if (context.user.role !== 'driver') {
      throw new AppError('Forbidden: Only drivers can cancel ride pools', 403);
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new AppError('Ride pool not found', 404);
    }
    if (ride.driver.toString() !== context.user.id) {
      throw new AppError('Not authorized to cancel this ride pool', 403);
    }

    ride.status = 'cancelled';
    await ride.save();

    return {
      id: ride._id.toString(),
      pickupLocation: ride.pickupLocation,
      dropLocation: ride.dropLocation,
      departureDate: ride.departureDate,
      departureTime: ride.departureTime,
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
      vehicleType: ride.vehicleType,
      status: ride.status
    };
  }
};

module.exports = rootResolver;
