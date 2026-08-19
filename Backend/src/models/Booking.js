const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true
    },
    seatsBooked: {
      type: Number,
      required: true,
      default: 1
    },
    totalFare: {
      type: Number,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    bufferCommands: false
  }
);

// Database-level compound unique index preventing duplicate active bookings for the same passenger and ride
bookingSchema.index({ passenger: 1, ride: 1 }, { unique: true });
bookingSchema.index({ driver: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
