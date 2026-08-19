const { isConnected, getClient } = require('../utils/cache');

let logger;
try {
  logger = require('../utils/logger');
} catch (e) {
  logger = {
    warn: (msg) => console.warn(msg),
    error: (msg) => console.error(msg)
  };
}

/**
 * Distributed Rate Limiting Middleware powered by Redis.
 * Enforces per-IP or per-User rate limits across multiple node processes.
 * Gracefully degrades if Redis is unavailable.
 *
 * @param {Object} options - { windowSec, maxRequests, keyPrefix, useUserId }
 */
const redisRateLimiter = (options = {}) => {
  const windowSec = options.windowSec || 60; // Window size in seconds (default: 60s)
  const maxRequests = options.maxRequests || 100; // Max requests allowed per window
  const keyPrefix = options.keyPrefix || 'rate_limit';
  const useUserId = options.useUserId || false;

  return async (req, res, next) => {
    // Determine rate limit identity (Authenticated User ID or Remote IP)
    const identifier = (useUserId && req.user && req.user.id)
      ? req.user.id
      : (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1');

    const key = `${keyPrefix}:${identifier}`;

    // Graceful Degradation: If Redis is offline or disconnected, pass through
    if (!isConnected()) {
      return next();
    }

    try {
      const client = getClient();
      if (!client) return next();

      // Atomic increment in Redis
      const requests = await client.incr(key);

      if (requests === 1) {
        // Set key expiration on initial creation
        await client.expire(key, windowSec);
      }

      const ttl = await client.ttl(key);
      const remaining = Math.max(0, maxRequests - requests);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', ttl > 0 ? ttl : windowSec);

      if (requests > maxRequests) {
        res.setHeader('Retry-After', ttl > 0 ? ttl : windowSec);
        if (logger && typeof logger.warn === 'function') {
          logger.warn(`🛑 Rate limit exceeded for key [${key}]: ${requests}/${maxRequests}`);
        }

        return res.status(429).json({
          success: false,
          message: `Too many requests. Please try again in ${ttl > 0 ? ttl : windowSec} seconds.`
        });
      }

      next();
    } catch (err) {
      if (logger && typeof logger.error === 'function') {
        logger.error(`⚠️ Redis Rate Limiter error for ${key}: ${err.message}`);
      }
      next(); // Graceful fallback on error
    }
  };
};

module.exports = redisRateLimiter;
