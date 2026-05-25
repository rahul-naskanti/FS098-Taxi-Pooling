const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
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
    amount: {
      type: Number,
      required: true
    },
    platformCommission: {
      type: Number,
      required: true,
      default: function () {
        return this.amount * 0.10;
      }
    },
    paymentMethod: {
      type: String,
      default: 'wallet'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ driver: 1 });
paymentSchema.index({ paymentStatus: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
