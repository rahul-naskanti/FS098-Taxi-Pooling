const { z } = require('zod');

const createRideSchema = z.object({
  pickupLocation: z.string({ required_error: 'Pickup location is required' }).trim().min(2, 'Pickup location must be at least 2 characters'),
  dropLocation: z.string({ required_error: 'Drop location is required' }).trim().min(2, 'Drop location must be at least 2 characters'),
  departureDate: z.string({ required_error: 'Departure date is required' }).trim().min(1, 'Departure date is required'),
  departureTime: z.string({ required_error: 'Departure time is required' }).trim().min(1, 'Departure time is required'),
  availableSeats: z.coerce.number({ required_error: 'Available seats count is required' }).int().min(1, 'Available seats must be at least 1').max(10, 'Available seats cannot exceed 10'),
  pricePerSeat: z.coerce.number({ required_error: 'Price per seat is required' }).min(0, 'Price per seat cannot be negative'),
  vehicleType: z.string({ required_error: 'Vehicle type is required' }).trim().min(2, 'Vehicle type is required'),
  notes: z.string().trim().optional(),
  instantBooking: z.boolean().optional(),
  femaleFriendly: z.boolean().optional(),
  acService: z.boolean().optional()
}).strict({ message: 'Unexpected extra fields submitted during ride creation' });

const searchRideSchema = z.object({
  pickup: z.string().trim().optional(),
  drop: z.string().trim().optional(),
  date: z.string().trim().optional(),
  passengers: z.coerce.number().int().min(1).optional().default(1),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  vehicleType: z.string().trim().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  verifiedOnly: z.enum(['true', 'false']).optional(),
  instantOnly: z.enum(['true', 'false']).optional(),
  femaleFriendlyOnly: z.enum(['true', 'false']).optional(),
  acFilter: z.string().trim().optional(),
  timeRange: z.string().trim().optional()
});

const updateRideSchema = createRideSchema.partial();

module.exports = {
  createRideSchema,
  searchRideSchema,
  updateRideSchema
};
