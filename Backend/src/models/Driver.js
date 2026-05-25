const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    vehicleName: {
      type: String,
      required: [true, 'Vehicle model name is required'],
      trim: true
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle plate number is required'],
      trim: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'Driver license number is required'],
      trim: true
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats count is required'],
      default: 0
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    sosContact: {
      type: String,
      trim: true,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    uploadedDocuments: {
      licenseImage: { type: String, default: '' },
      rcDocument: { type: String, default: '' },
      idProof: { type: String, default: '' }
    },
    role: {
      type: String,
      default: 'driver'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving to database
driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password in database
driverSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
