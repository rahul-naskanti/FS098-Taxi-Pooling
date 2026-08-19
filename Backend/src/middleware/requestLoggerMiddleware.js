/**
 * Middleware that logs HTTP request activity cleanly.
 */
const requestLoggerMiddleware = (req, res, next) => {
  res.on('finish', () => {
    const durationMs = Date.now() - (req._startTime || Date.now());
    const statusCode = res.statusCode;
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} ${statusCode} - ${durationMs}ms`);
    }
  });

  next();
};

module.exports = requestLoggerMiddleware;
