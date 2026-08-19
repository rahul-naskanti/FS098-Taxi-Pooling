const AppError = require('../utils/AppError');

/**
 * Reusable Zod validation middleware factory.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'params' | 'query'} source - Request property to validate ('body', 'params', 'query')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source] || {});

      if (!result.success) {
        const issues = result.error.issues || result.error.errors || [];
        const fieldErrors = issues.map((err) => ({
          field: err.path && err.path.length > 0 ? err.path.join('.') : 'payload',
          message: err.message
        }));

        const errorMessage = `Validation Error: ${fieldErrors.map((e) => e.message).join(', ')}`;
        return next(new AppError(errorMessage, 400, fieldErrors));
      }

      // Replace req[source] with sanitized and coerced data output by Zod
      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validate
};
