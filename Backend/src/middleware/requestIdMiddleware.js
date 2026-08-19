const crypto = require('crypto');

/**
 * Middleware that assigns or preserves a unique Request Correlation ID (X-Request-ID)
 * for every incoming HTTP request.
 */
const requestIdMiddleware = (req, res, next) => {
  const incomingRequestId = req.headers['x-request-id'] || req.headers['X-Request-ID'];

  let requestId;
  if (
    typeof incomingRequestId === 'string' &&
    incomingRequestId.trim().length >= 8 &&
    incomingRequestId.trim().length <= 128 &&
    /^[a-zA-Z0-9_\-]+$/.test(incomingRequestId.trim())
  ) {
    requestId = incomingRequestId.trim();
  } else {
    requestId = `req_${crypto.randomBytes(8).toString('hex')}`;
  }

  req.id = requestId;
  req.requestId = requestId;
  req._startTime = Date.now();

  res.setHeader('X-Request-ID', requestId);

  next();
};

module.exports = requestIdMiddleware;
