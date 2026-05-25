const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required']
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true
    },
    dropLocation: {
      type: String,
      required: [true, 'Drop location is required'],
      trim: true
    },
    departureDate: {
      type: String,
      required: [true, 'Departure date is required'],
      index: true
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required'],
      index: true
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats count is required'],
      min: [0, 'Available seats cannot be negative']
    },
    pricePerSeat: {
      type: Number,
      required: [true, 'Price per seat is required'],
      min: [0, 'Price per seat cannot be negative']
    },
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for date and time search optimization
rideSchema.index({ departureDate: 1, departureTime: 1 });

// Optimize search queries with single-field indexes
rideSchema.index({ pickupLocation: 1 });
rideSchema.index({ dropLocation: 1 });
rideSchema.index({ departureDate: 1 });
rideSchema.index({ status: 1 });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
