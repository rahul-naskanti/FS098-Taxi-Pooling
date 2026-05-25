const mongoose = require('mongoose');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { getCache, setCache, delCache } = require('../utils/cache');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  const cacheKey = 'admin_dashboard_stats';
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  // Count Metrics
  const totalUsers = await User.countDocuments({ role: 'passenger' });
  const totalDrivers = await Driver.countDocuments();
  const verifiedDrivers = await Driver.countDocuments({ isVerified: true });
  const pendingVerifications = await Driver.countDocuments({ verificationStatus: 'pending' });
  
  const activeRides = await Ride.countDocuments({ status: 'active' });
  const completedRides = await Ride.countDocuments({ status: 'completed' });

  // Bookings Metric
  const totalBookings = await Booking.countDocuments({ bookingStatus: { $ne: 'cancelled' } });

  // Platform Revenue Metric
  const revenueResult = await Payment.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, totalRevenue: { $sum: "$platformCommission" } } }
  ]);
  const platformRevenue = revenueResult[0] ? revenueResult[0].totalRevenue : 0;

  // Weekly Revenue, Ride Growth, and Booking Trends Chart Data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Aggregations
  const weeklyRevenueResult = await Payment.aggregate([
    { $match: { paymentStatus: 'completed', createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$platformCommission" }
      }
    }
  ]);

  const weeklyRidesResult = await Ride.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    }
  ]);

  const weeklyBookingsResult = await Booking.aggregate([
    { $match: { bookingStatus: { $ne: 'cancelled' }, createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        bookings: { $sum: 1 }
      }
    }
  ]);

  // Construct charts
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyRevenue = [];
  const rideGrowth = [];
  const bookingTrends = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    const revEntry = weeklyRevenueResult.find(r => r._id === dateString);
    const rideEntry = weeklyRidesResult.find(r => r._id === dateString);
    const bookingEntry = weeklyBookingsResult.find(b => b._id === dateString);

    weeklyRevenue.push({
      day: dayName,
      amount: revEntry ? Math.round(revEntry.revenue) : 0,
      date: dateString
    });

    rideGrowth.push({
      day: dayName,
      count: rideEntry ? rideEntry.count : 0,
      date: dateString
    });

    bookingTrends.push({
      day: dayName,
      bookings: bookingEntry ? bookingEntry.bookings : 0,
      date: dateString
    });
  }

  const responseData = {
    success: true,
    stats: {
      totalUsers,
      totalDrivers,
      verifiedDrivers,
      pendingVerifications,
      activeRides,
      completedRides,
      totalBookings,
      platformRevenue: Math.round(platformRevenue)
    },
    charts: {
      weeklyRevenue,
      rideGrowth,
      bookingTrends
    }
  };

  await setCache(cacheKey, responseData, 300);

  res.json(responseData);
};

// @desc    Get Recent Registrants Activity Feed
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
const getRecentActivity = async (req, res) => {
  const users = await User.find({ role: 'passenger' })
    .select('fullName email role createdAt isActive')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const drivers = await Driver.find()
    .select('fullName email role verificationStatus createdAt isActive')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const combined = [
    ...users.map(u => ({ ...u, role: 'passenger', verificationStatus: 'verified' })),
    ...drivers.map(d => ({ ...d, role: 'driver' }))
  ];

  combined.sort((a, b) => b.createdAt - a.createdAt);
  const activities = combined.slice(0, 5);

  res.json({
    success: true,
    activities
  });
};

// @desc    Get Paginated Passengers
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || '';
  const query = {
    role: 'passenger',
    $or: [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  };

  if (req.query.status) {
    query.isActive = req.query.status === 'active';
  }

  const totalUsers = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Map detail estimates only for paginated users
  const paginatedUsers = await Promise.all(users.map(async (u) => {
    const joinedRidesCount = await Booking.countDocuments({ passenger: u._id });
    const completedBookings = await Booking.find({ passenger: u._id, bookingStatus: 'completed' }).lean();
    const savingsEstimate = completedBookings.reduce((sum, b) => sum + (b.totalFare || 0), 0) * 2;

    return {
      ...u,
      bookingCount: joinedRidesCount,
      savingsEstimate
    };
  }));

  res.json({
    success: true,
    users: paginatedUsers,
    page,
    totalPages: Math.ceil(totalUsers / limit),
    totalUsers
  });
};

// @desc    Get Paginated and Sorted Drivers
// @route   GET /api/admin/drivers
// @access  Private/Admin
const getDrivers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || '';
  const query = {
    $or: [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  };

  if (req.query.verificationStatus) {
    query.verificationStatus = req.query.verificationStatus;
  }
  if (req.query.status) {
    query.isActive = req.query.status === 'active';
  }

  const totalDrivers = await Driver.countDocuments(query);

  let drivers;
  if (req.query.sortBy === 'earnings' || req.query.sortBy === 'rides') {
    const allDrivers = await Driver.find(query).select('-password').lean();
    const mapped = await Promise.all(allDrivers.map(async (d) => {
      const ridesCreated = await Ride.countDocuments({ driver: d._id });
      const activeRidesCount = await Ride.countDocuments({ driver: d._id, status: 'active' });
      
      const completedPayments = await Payment.find({ driver: d._id, paymentStatus: 'completed' }).lean();
      const earnings = completedPayments.reduce((sum, p) => sum + (p.amount - p.platformCommission), 0);
      
      const uniquePassengers = await Booking.find({ driver: d._id, bookingStatus: 'completed' }).distinct('passenger');
      const passengersServed = uniquePassengers.length;

      return {
        ...d,
        ridesCreated,
        passengersServed,
        earnings: Math.round(earnings),
        activeRidesCount
      };
    }));

    if (req.query.sortBy === 'earnings') {
      mapped.sort((a, b) => b.earnings - a.earnings);
    } else {
      mapped.sort((a, b) => b.ridesCreated - a.ridesCreated);
    }
    const paginatedDrivers = mapped.slice(skip, skip + limit);
    return res.json({
      success: true,
      drivers: paginatedDrivers,
      page,
      totalPages: Math.ceil(totalDrivers / limit),
      totalDrivers
    });
  } else {
    const sortObj = {};
    if (req.query.sortBy === 'verified') {
      sortObj.isVerified = -1;
    }
    sortObj.createdAt = -1;

    drivers = await Driver.find(query)
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const paginatedDrivers = await Promise.all(drivers.map(async (d) => {
      const ridesCreated = await Ride.countDocuments({ driver: d._id });
      const activeRidesCount = await Ride.countDocuments({ driver: d._id, status: 'active' });
      
      const completedPayments = await Payment.find({ driver: d._id, paymentStatus: 'completed' }).lean();
      const earnings = completedPayments.reduce((sum, p) => sum + (p.amount - p.platformCommission), 0);
      
      const uniquePassengers = await Booking.find({ driver: d._id, bookingStatus: 'completed' }).distinct('passenger');
      const passengersServed = uniquePassengers.length;

      return {
        ...d,
        ridesCreated,
        passengersServed,
        earnings: Math.round(earnings),
        activeRidesCount
      };
    }));

    return res.json({
      success: true,
      drivers: paginatedDrivers,
      page,
      totalPages: Math.ceil(totalDrivers / limit),
      totalDrivers
    });
  }
};

// @desc    Approve or Reject Driver Verifications
// @route   PATCH /api/admin/drivers/:id/verify
// @access  Private/Admin
const updateVerificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!['verified', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid verification status');
  }

  const user = await Driver.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('Driver profile not found');
  }

  user.verificationStatus = status;
  user.isVerified = status === 'verified';
  user.rejectionReason = status === 'rejected' ? rejectionReason : '';
  await user.save();

  // Cache invalidation
  await delCache('admin_dashboard_stats');
  await delCache(`driver_dashboard_stats:${id}`);

  res.json({
    success: true,
    message: `Driver status successfully updated to ${status}`,
    user
  });
};

// @desc    Toggle user active/inactive status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  
  let user = await User.findById(id);
  if (!user) {
    user = await Driver.findById(id);
  }
  
  if (!user) {
    res.status(404);
    throw new Error('User or Driver not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  // Cache invalidation
  await delCache('admin_dashboard_stats');
  await delCache(`driver_dashboard_stats:${id}`);
  await delCache(`passenger_dashboard_stats:${id}`);

  res.json({
    success: true,
    message: `User accounts status successfully toggled to ${user.isActive ? 'Active' : 'Inactive'}`,
    isActive: user.isActive,
    user
  });
};

// @desc    Get Platform Revenue Analytics
// @route   GET /api/admin/revenue
// @access  Private/Admin
const getRevenueAnalytics = async (req, res) => {
  const completedPayments = await Payment.find({ paymentStatus: 'completed' })
    .populate('driver', 'fullName')
    .populate('passenger', 'fullName')
    .lean();

  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.platformCommission, 0);
  const totalCompletedRides = await Ride.countDocuments({ status: 'completed' });

  // Aggregate Driver Commission mapping
  const driverRevenueMap = {};
  completedPayments.forEach(p => {
    if (!p.driver) return;
    const driverId = p.driver._id.toString();
    const rideRevenue = p.amount;
    const commission = p.platformCommission;
    const net = p.amount - p.platformCommission;

    if (!driverRevenueMap[driverId]) {
      driverRevenueMap[driverId] = {
        driverId,
        driverName: p.driver.fullName,
        grossEarnings: 0,
        platformCommission: 0,
        netEarnings: 0,
        ridesCompletedCount: 0
      };
    }
    driverRevenueMap[driverId].grossEarnings += rideRevenue;
    driverRevenueMap[driverId].platformCommission += commission;
    driverRevenueMap[driverId].netEarnings += net;
    driverRevenueMap[driverId].ridesCompletedCount += 1;
  });

  const driverRevenues = Object.values(driverRevenueMap);
  driverRevenues.sort((a, b) => b.platformCommission - a.platformCommission);

  const topDrivers = [...driverRevenues].slice(0, 5);

  const allCompletedRides = await Ride.find({ status: 'completed' }).lean();
  const averagePricePerSeat = allCompletedRides.length > 0
    ? allCompletedRides.reduce((sum, r) => sum + r.pricePerSeat, 0) / allCompletedRides.length
    : 0;

  const averagePassengersPerRide = allCompletedRides.length > 0
    ? allCompletedRides.reduce((sum, r) => sum + (r.passengers ? r.passengers.length : 0), 0) / allCompletedRides.length
    : 0;

  // Monthly Revenue calculations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const weeklyAgg = await Payment.aggregate([
    { $match: { paymentStatus: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$platformCommission" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    totalRevenue: Math.round(totalRevenue),
    totalCompletedRides,
    driverRevenues,
    topDrivers,
    weeklyRevenueAgg: weeklyAgg,
    profitability: {
      averagePricePerSeat: Math.round(averagePricePerSeat),
      averagePassengersPerRide: parseFloat(averagePassengersPerRide.toFixed(1))
    }
  });
};

// @desc    Get Paginated Rides logs
// @route   GET /api/admin/rides
// @access  Private/Admin
const getRides = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || '';
  const query = {};

  if (search) {
    query.$or = [
      { pickupLocation: { $regex: search, $options: 'i' } },
      { dropLocation: { $regex: search, $options: 'i' } }
    ];
  }

  if (req.query.status) {
    query.status = req.query.status;
  }
  
  if (req.query.filter === 'full') {
    query.availableSeats = 0;
  }

  const totalRides = await Ride.countDocuments(query);

  let rides;
  if (req.query.sortBy === 'revenue' || req.query.sortBy === 'passengers') {
    const allRides = await Ride.find(query)
      .populate('driver', 'fullName vehicleName vehicleNumber')
      .sort({ createdAt: -1 })
      .lean();

    const mappedRides = allRides.map(r => {
      const passengersCount = r.passengers ? r.passengers.length : 0;
      const grossRevenue = passengersCount * r.pricePerSeat;
      const platformCommission = grossRevenue * 0.10;

      return {
        ...r,
        passengersCount,
        grossRevenue,
        platformCommission: Math.round(platformCommission)
      };
    });

    if (req.query.sortBy === 'revenue') {
      mappedRides.sort((a, b) => b.grossRevenue - a.grossRevenue);
    } else {
      mappedRides.sort((a, b) => b.passengersCount - a.passengersCount);
    }

    const paginatedRides = mappedRides.slice(skip, skip + limit);
    return res.json({
      success: true,
      rides: paginatedRides,
      page,
      totalPages: Math.ceil(totalRides / limit),
      totalRides
    });
  } else {
    rides = await Ride.find(query)
      .populate('driver', 'fullName vehicleName vehicleNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const paginatedRides = rides.map(r => {
      const passengersCount = r.passengers ? r.passengers.length : 0;
      const grossRevenue = passengersCount * r.pricePerSeat;
      const platformCommission = grossRevenue * 0.10;

      return {
        ...r,
        passengersCount,
        grossRevenue,
        platformCommission: Math.round(platformCommission)
      };
    });

    return res.json({
      success: true,
      rides: paginatedRides,
      page,
      totalPages: Math.ceil(totalRides / limit),
      totalRides
    });
  }
};

// @desc    Get Paginated Bookings logs (New Admin Endpoint)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalBookings = await Booking.countDocuments();
  const bookings = await Booking.find()
    .populate('passenger', 'fullName email')
    .populate('driver', 'fullName vehicleName vehicleNumber')
    .populate('ride', 'pickupLocation dropLocation departureDate departureTime')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    bookings,
    page,
    totalPages: Math.ceil(totalBookings / limit),
    totalBookings
  });
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getUsers,
  getDrivers,
  updateVerificationStatus,
  toggleUserStatus,
  getRevenueAnalytics,
  getRides,
  getBookings
};
