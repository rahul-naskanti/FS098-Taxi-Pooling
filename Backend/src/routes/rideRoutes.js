const express = require('express');
const router = express.Router();
const {
  createRide,
  getAllRides,
  joinRide,
  getDriverRides,
  getPassengerBookings,
  cancelRide,
  leaveRide,
  removePassenger
} = require('../controllers/rideController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// NOTE: Non-parameterized routes registered FIRST to prevent route parameter collision (Express matches top-to-bottom)

// @route   GET /api/rides/driver/my-rides
// @desc    Get rides created by the logged-in driver
// @access  Private (Driver only)
router.get('/driver/my-rides', protect, authorizeRoles('driver'), getDriverRides);

// @route   GET /api/rides/passenger/bookings
// @desc    Get bookings joined by the logged-in passenger
// @access  Private (Passenger only)
router.get('/passenger/bookings', protect, authorizeRoles('passenger'), getPassengerBookings);

// @route   POST /api/rides
// @desc    Create a new ride pool
// @access  Private (Driver only)
router.post('/', protect, authorizeRoles('driver'), createRide);

// @route   GET /api/rides
// @desc    Get all active ride pools
// @access  Private (All authenticated users)
router.get('/', protect, getAllRides);

// @route   POST /api/rides/:id/remove-passenger
// @desc    Remove a passenger from a ride pool (Driver only)
// @access  Private (Driver only)
router.post('/:id/remove-passenger', protect, authorizeRoles('driver'), removePassenger);

// @route   POST /api/rides/:id/join
// @desc    Join an active ride pool (Atomic)
// @access  Private (Passenger only)
router.post('/:id/join', protect, authorizeRoles('passenger'), joinRide);

// @route   POST /api/rides/:id/leave
// @desc    Leave a joined ride pool
// @access  Private (Passenger only)
router.post('/:id/leave', protect, authorizeRoles('passenger'), leaveRide);

// @route   PATCH /api/rides/:id/cancel
// @desc    Cancel a ride pool
// @access  Private (Driver only)
router.patch('/:id/cancel', protect, authorizeRoles('driver'), cancelRide);

module.exports = router;
