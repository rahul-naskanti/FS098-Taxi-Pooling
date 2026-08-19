const { z } = require('zod');

const registerSchema = z.object({
  fullName: z.string({ required_error: 'Full name is required' }).trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string({ required_error: 'Email is required' }).trim().lowercase().email('Invalid email address format'),
  phone: z.string({ required_error: 'Phone number is required' }).trim().min(7, 'Phone number must be at least 7 digits').max(15),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['passenger', 'driver'], { invalid_type_error: 'Role must be passenger or driver' }).optional().default('passenger'),
  company: z.string().trim().optional(),
  sosContact: z.string().trim().optional(),
  vehicleName: z.string().trim().optional(),
  vehicleNumber: z.string().trim().optional(),
  licenseNumber: z.string().trim().optional(),
  availableSeats: z.union([z.number(), z.string()]).optional()
}).strict({ message: 'Unexpected extra fields submitted during registration' });

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().lowercase().email('Invalid email address format'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty')
}).strict({ message: 'Unexpected extra fields submitted during login' });

module.exports = {
  registerSchema,
  loginSchema
};
