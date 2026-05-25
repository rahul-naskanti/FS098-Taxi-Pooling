const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getRecentActivity,
  getUsers,
  getDrivers,
  updateVerificationStatus,
  toggleUserStatus,
  getRevenueAnalytics,
  getRides,
  getBookings
} = require('../controllers/adminController');

// Enforce role checks globally on admin router routes
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);
router.get('/users', getUsers);
router.get('/drivers', getDrivers);
router.patch('/drivers/:id/verify', updateVerificationStatus);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/revenue', getRevenueAnalytics);
router.get('/rides', getRides);
router.get('/bookings', getBookings);

module.exports = router;
