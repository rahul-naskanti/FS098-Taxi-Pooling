const Driver = require('../models/Driver');
const AppError = require('../utils/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Upload or replace driver verification documents in Cloudinary
// @route   POST /api/drivers/documents
// @access  Private (Driver only)
const uploadDriverDocuments = async (req, res) => {
  const driver = await Driver.findById(req.user.id);
  if (!driver) {
    throw new AppError('Driver profile not found', 404);
  }

  const files = req.files || {};
  const licenseFile = files.licenseImage ? files.licenseImage[0] : null;
  const rcFile = files.rcDocument ? files.rcDocument[0] : null;

  if (!licenseFile && !rcFile) {
    throw new AppError('Please provide at least one document (licenseImage or rcDocument)', 400);
  }

  // Handle License Document Upload & Replacement
  if (licenseFile) {
    if (driver.licenseDocument && driver.licenseDocument.publicId) {
      await deleteFromCloudinary(driver.licenseDocument.publicId);
    }

    const licenseResult = await uploadToCloudinary(
      licenseFile.buffer,
      'taxi_pooling/driver_docs',
      `license_${driver._id}`
    );

    driver.licenseDocument = {
      publicId: licenseResult.public_id,
      secureUrl: licenseResult.secure_url,
      resourceType: licenseResult.resource_type || 'image',
      uploadedAt: new Date()
    };

    driver.uploadedDocuments = driver.uploadedDocuments || {};
    driver.uploadedDocuments.licenseImage = licenseResult.secure_url;
  }

  // Handle RC Document Upload & Replacement
  if (rcFile) {
    if (driver.rcDocument && driver.rcDocument.publicId) {
      await deleteFromCloudinary(driver.rcDocument.publicId);
    }

    const rcResult = await uploadToCloudinary(
      rcFile.buffer,
      'taxi_pooling/driver_docs',
      `rc_${driver._id}`
    );

    driver.rcDocument = {
      publicId: rcResult.public_id,
      secureUrl: rcResult.secure_url,
      resourceType: rcResult.resource_type || 'image',
      uploadedAt: new Date()
    };

    driver.uploadedDocuments = driver.uploadedDocuments || {};
    driver.uploadedDocuments.rcDocument = rcResult.secure_url;
  }

  driver.verificationStatus = 'pending';
  await driver.save();

  res.status(200).json({
    success: true,
    message: 'Verification documents uploaded successfully',
    documents: {
      licenseDocument: driver.licenseDocument,
      rcDocument: driver.rcDocument
    }
  });
};

// @desc    Retrieve driver verification document metadata with IDOR protection
// @route   GET /api/drivers/:id/documents
// @access  Private (Resource Owner or Admin only)
const getDriverDocuments = async (req, res) => {
  const targetDriverId = req.params.id;

  // Enforce Authorization & IDOR protection
  const isOwner = req.user.id === targetDriverId;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Forbidden: Not authorized to access these verification documents', 403);
  }

  const driver = await Driver.findById(targetDriverId).select('licenseDocument rcDocument verificationStatus rejectionReason');
  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  res.status(200).json({
    success: true,
    verificationStatus: driver.verificationStatus,
    documents: {
      licenseDocument: driver.licenseDocument,
      rcDocument: driver.rcDocument
    }
  });
};

module.exports = {
  uploadDriverDocuments,
  getDriverDocuments
};
