const crypto = require('crypto');
const mongoose = require('mongoose');
const IdempotencyKey = require('../models/IdempotencyKey');
const AppError = require('../utils/AppError');

/**
 * Middleware enforcing Idempotency for critical state-changing API endpoints.
 * @param {boolean} required - Whether X-Idempotency-Key header is strictly required or optional
 */
const checkIdempotency = (required = false) => {
  return async (req, res, next) => {
    const key = req.headers['x-idempotency-key'] || req.headers['X-Idempotency-Key'];

    if (!key) {
      if (required) {
        throw new AppError('X-Idempotency-Key header is required for this operation', 400);
      }
      return next();
    }

    // Validate key string length and character constraints
    if (typeof key !== 'string' || key.trim().length < 8 || key.length > 128) {
      throw new AppError('X-Idempotency-Key must be a string between 8 and 128 characters', 400);
    }

    const userId = req.user ? (req.user._id || req.user.id) : null;
    if (!userId) {
      throw new AppError('User authentication required for idempotent operations', 401);
    }

    // Compute request payload signature hash
    const payloadString = `${req.originalUrl}-${JSON.stringify(req.body || {})}-${JSON.stringify(req.params || {})}`;
    const requestHash = crypto.createHash('sha256').update(payloadString).digest('hex');

    let existingKeyRecord = null;
    try {
      existingKeyRecord = await IdempotencyKey.findOne({ key });
    } catch (e) {
      existingKeyRecord = null;
    }

    if (existingKeyRecord) {
      // Security Check 1: Ensure key is not reused by a different user
      if (existingKeyRecord.user && existingKeyRecord.user.toString() !== userId.toString()) {
        throw new AppError('Idempotency key cannot be shared across different user accounts', 400);
      }

      // Security Check 2: Ensure key is not reused for a different payload or endpoint
      if (existingKeyRecord.requestHash && existingKeyRecord.requestHash !== requestHash) {
        throw new AppError('Idempotency key reused for a different payload or endpoint', 400);
      }

      // If previous operation completed successfully, serve cached response directly
      if (existingKeyRecord.status === 'completed') {
        return res.status(existingKeyRecord.statusCode || 200).json(existingKeyRecord.responseBody);
      }

      // If previous operation is still executing concurrently
      if (existingKeyRecord.status === 'processing') {
        return res.status(409).json({
          success: false,
          message: 'A request with this idempotency key is currently being processed. Please retry shortly.'
        });
      }
    }

    let idempotencyRecord = null;
    try {
      idempotencyRecord = await IdempotencyKey.create({
        key,
        user: userId,
        endpoint: req.originalUrl,
        requestHash,
        status: 'processing'
      });
    } catch (e) {
      idempotencyRecord = null;
    }

    // Intercept res.json to capture response payload and complete idempotency record
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const statusCode = res.statusCode || 200;

      if (idempotencyRecord && idempotencyRecord._id) {
        const targetStatus = statusCode >= 200 && statusCode < 300 ? 'completed' : 'failed';
        IdempotencyKey.findByIdAndUpdate(idempotencyRecord._id, {
          status: targetStatus,
          statusCode,
          responseBody: body
        }).catch((err) => console.error('Failed to update idempotency key status:', err));
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = {
  checkIdempotency
};
