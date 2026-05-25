const express = require('express');
const router = express.Router();

// @route   GET /api/test
// @desc    Check if API is running
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: "Taxi Pooling Backend Running"
  });
});

// @route   GET /api/test-error
// @desc    Test global error handler middleware via express-async-errors
// @access  Public
router.get('/test-error', async (req, res) => {
  throw new Error("This is a simulated backend error to test the central handler.");
});

module.exports = router;
