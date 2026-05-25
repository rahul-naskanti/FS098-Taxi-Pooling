const express = require('express');
const router = express.Router();
const { getPassengerDashboardStats, getDriverDashboardStats } = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/passenger', protect, authorizeRoles('passenger'), getPassengerDashboardStats);
router.get('/driver', protect, authorizeRoles('driver'), getDriverDashboardStats);

module.exports = router;
