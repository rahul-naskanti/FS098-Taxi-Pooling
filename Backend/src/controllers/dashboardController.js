const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { getCache, setCache } = require('../utils/cache');

// @desc    Get passenger dashboard statistics
// @route   GET /api/dashboard/passenger
// @access  Private (Passenger only)
const getPassengerDashboardStats = async (req, res) => {
  const passengerId = req.user.id;
  const cacheKey = `passenger_dashboard_stats:${passengerId}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  // Find all bookings for this passenger with lean() optimization
  const bookings = await Booking.find({ passenger: passengerId }).lean();

  const totalRidesJoined = bookings.length;
  const activeBookingsCount = bookings.filter(b => b.bookingStatus === 'active').length;

  // Calculate moneySaved estimate: sum of booking fares * 2 for non-cancelled bookings
  const moneySaved = bookings
    .filter(b => b.bookingStatus !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalFare * 2), 0);

  // CO2 saved: 1.2kg per booking
  const co2Reduced = Number((totalRidesJoined * 1.2).toFixed(1));

  // Fetch populated recent bookings for view
  const recentBookings = await Booking.find({ passenger: passengerId })
    .populate({
      path: 'ride',
      populate: { path: 'driver', select: 'fullName phone vehicleName vehicleNumber' }
    })
    .populate('driver', 'fullName phone vehicleName vehicleNumber')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const responseData = {
    success: true,
    stats: {
      totalRides: totalRidesJoined,
      moneySaved: moneySaved,
      co2Reduced: co2Reduced,
      activePools: activeBookingsCount
    },
    recentBookings
  };

  await setCache(cacheKey, responseData, 300);

  res.status(200).json(responseData);
};

// @desc    Get driver dashboard statistics
// @route   GET /api/dashboard/driver
// @access  Private (Driver only)
const getDriverDashboardStats = async (req, res) => {
  const driverId = req.user.id;
  const cacheKey = `driver_dashboard_stats:${driverId}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  // Find all rides created by driver
  const rides = await Ride.find({ driver: driverId })
    .populate('passengers', 'fullName phone email company')
    .sort({ createdAt: -1 })
    .lean();

  const totalRidesCreated = rides.length;
  const activePools = rides.filter(r => r.status === 'active').length;

  // Calculate total earnings from completed payments
  const payments = await Payment.find({ driver: driverId, paymentStatus: 'completed' }).lean();
  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount - p.platformCommission), 0);

  // Passengers served
  const uniquePassengers = await Booking.find({
    driver: driverId,
    bookingStatus: { $ne: 'cancelled' }
  }).distinct('passenger');
  const totalPassengersServed = uniquePassengers.length;

  // Active rides list
  const activeRides = rides.filter(r => r.status === 'active');

  // Map joined poolers dynamically from active rides
  const joinedPassengers = [];
  activeRides.forEach(ride => {
    ride.passengers.forEach(passenger => {
      joinedPassengers.push({
        id: `${ride._id}-${passenger._id}`,
        passengerName: passenger.fullName,
        passengerCompany: passenger.company || 'Not specified',
        pickup: ride.pickupLocation,
        dropoff: ride.dropLocation,
        match: 90 + Math.floor(Math.random() * 10),
        rideId: ride._id,
        passengerId: passenger._id
      });
    });
  });

  // Calculate weekly earnings using MongoDB aggregation group by day
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const weeklyEarningsAggregation = await Payment.aggregate([
    {
      $match: {
        driver: new mongoose.Types.ObjectId(driverId),
        paymentStatus: 'completed',
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $project: {
        dayOfWeek: { $dayOfWeek: '$createdAt' },
        netAmount: { $subtract: ['$amount', '$platformCommission'] }
      }
    },
    {
      $group: {
        _id: '$dayOfWeek',
        amount: { $sum: '$netAmount' }
      }
    }
  ]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  weeklyEarningsAggregation.forEach(item => {
    const dayName = daysOfWeek[item._id - 1];
    if (weeklyMap[dayName] !== undefined) {
      weeklyMap[dayName] = item.amount;
    }
  });

  const weeklyEarnings = Object.keys(weeklyMap).map(day => ({
    day,
    amount: weeklyMap[day]
  }));

  const responseData = {
    success: true,
    stats: {
      ridesGiven: totalRidesCreated,
      monthlyEarnings: totalEarnings,
      totalPassengers: totalPassengersServed,
      activePools: activePools
    },
    activeRides,
    rideRequests: joinedPassengers,
    weeklyEarnings
  };

  await setCache(cacheKey, responseData, 300);

  res.status(200).json(responseData);
};

module.exports = {
  getPassengerDashboardStats,
  getDriverDashboardStats
};
