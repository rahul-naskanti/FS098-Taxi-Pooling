const express = require('express');
const router = express.Router();
const { getCurrentUser, updateProfile } = require('../controllers/userController');
const { protect, authorizeOwnerOrAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { objectIdParamSchema } = require('../validators/common.schema');

router.route('/me')
  .get(protect, getCurrentUser)
  .put(protect, updateProfile);

// Endpoint with IDOR protection asserting owner or admin authorization & MongoDB ObjectId validation
router.route('/:id')
  .get(protect, validate(objectIdParamSchema, 'params'), authorizeOwnerOrAdmin('id'), getCurrentUser);

module.exports = router;
