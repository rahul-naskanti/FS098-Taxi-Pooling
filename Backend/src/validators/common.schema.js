const { z } = require('zod');

// Schema for validating MongoDB 24-character hex ObjectId route parameters
const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: 'Invalid MongoDB ObjectId format'
});

const objectIdParamSchema = z.object({
  id: mongoIdSchema
});

// Schema for paginated queries with coercions and upper bounds
const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

module.exports = {
  mongoIdSchema,
  objectIdParamSchema,
  paginationQuerySchema
};
