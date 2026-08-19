const express = require('express');
const router = express.Router();
const { getCurrentUser, updateProfile } = require('../controllers/userController');
const { protect, authorizeOwnerOrAdmin } = require('../middleware/authMiddleware');

router.route('/me')
  .get(protect, getCurrentUser)
  .put(protect, updateProfile);

// Endpoint with IDOR protection asserting owner or admin authorization
router.route('/:id')
  .get(protect, authorizeOwnerOrAdmin('id'), getCurrentUser);

module.exports = router;
