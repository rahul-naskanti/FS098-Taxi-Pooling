const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    endpoint: {
      type: String,
      required: true
    },
    requestHash: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing'
    },
    statusCode: {
      type: Number
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours TTL
      expires: 0
    }
  },
  {
    timestamps: true,
    bufferCommands: false // Disable buffering to prevent test timeouts when running without DB connection
  }
);

idempotencyKeySchema.index({ key: 1, user: 1 });

const IdempotencyKey = mongoose.model('IdempotencyKey', idempotencyKeySchema);

module.exports = IdempotencyKey;
