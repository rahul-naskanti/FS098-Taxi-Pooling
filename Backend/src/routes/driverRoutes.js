const express = require('express');
const router = express.Router();
const { uploadDriverDocuments, getDriverDocuments } = require('../controllers/driverController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { objectIdParamSchema } = require('../validators/common.schema');

// @route   POST /api/drivers/documents
// @desc    Upload or replace driver verification documents in Cloudinary
// @access  Private (Driver only)
router.post(
  '/documents',
  protect,
  authorizeRoles('driver'),
  upload.fields([
    { name: 'licenseImage', maxCount: 1 },
    { name: 'rcDocument', maxCount: 1 }
  ]),
  uploadDriverDocuments
);

// @route   GET /api/drivers/:id/documents
// @desc    Get driver verification documents (Owner or Admin only)
// @access  Private
router.get(
  '/:id/documents',
  protect,
  validate(objectIdParamSchema, 'params'),
  getDriverDocuments
);

module.exports = router;
