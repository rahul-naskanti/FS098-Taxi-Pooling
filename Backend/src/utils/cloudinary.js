const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret'
});

/**
 * Upload binary file buffer to Cloudinary using upload streams
 */
const uploadToCloudinary = (fileBuffer, folder = 'taxi_pooling/documents', filename = 'doc') => {
  return new Promise((resolve, reject) => {
    // Return deterministic mock result during test execution or if unconfigured
    if (process.env.NODE_ENV === 'test' || !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud') {
      const publicId = `${folder}/${Date.now()}_${filename}`.replace(/\.[^/.]+$/, '');
      return resolve({
        public_id: publicId,
        secure_url: `https://res.cloudinary.com/mock_cloud/image/upload/v12345678/${publicId}.png`,
        resource_type: 'image',
        created_at: new Date().toISOString()
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete resource from Cloudinary by publicId
 */
const deleteFromCloudinary = async (publicId) => {
  if (process.env.NODE_ENV === 'test' || !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud' || !publicId) {
    return { result: 'ok' };
  }
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    return false;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
