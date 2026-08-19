const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

// Memory storage engine keeps uploaded binary buffers in RAM (req.file.buffer) for Cloudinary stream processing
const storage = multer.memoryStorage();

// Strict MIME type & extension validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.pdf'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeTypeValid = allowedMimeTypes.includes(file.mimetype);
  const extValid = allowedExtensions.includes(ext);

  if (mimeTypeValid && extValid) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file format. Only JPG, JPEG, PNG, and PDF files are allowed.', 400), false);
  }
};

// Initialize Multer upload handler
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Enforce 5 MB maximum file size limit
  }
});

module.exports = upload;
