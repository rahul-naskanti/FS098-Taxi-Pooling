const express = require('express');
const router = express.Router();
const { getCurrentUser, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/me')
  .get(protect, getCurrentUser)
  .put(protect, updateProfile);

module.exports = router;
