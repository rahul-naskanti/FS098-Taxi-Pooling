const express = require('express');
const router = express.Router();
const {
  createBooking,
  getSavedRides,
  getRecentSearches
} = require('../controllers/rideController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Enforce role authorization for passengers
router.use(protect, authorizeRoles('passenger'));

router.post('/bookings', createBooking);
router.get('/passenger/saved-rides', getSavedRides);
router.get('/passenger/recent-searches', getRecentSearches);

module.exports = router;
