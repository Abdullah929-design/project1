const cloudinary = require('cloudinary').v2;

/**
 * Uploads a file buffer to Cloudinary and returns the secure URL.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} filename - The original filename (for extension/type).
 * @param {string} folder - (Optional) Cloudinary folder to upload to.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
async function uploadToCloudinary(fileBuffer, filename, folder = '') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: filename ? filename.split('.')[0] : undefined,
        overwrite: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
}

module.exports = { uploadToCloudinary }; 