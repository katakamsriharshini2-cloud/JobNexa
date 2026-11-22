import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Configure Cloudinary credentials if present
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[JobNexa Cloud Storage] Cloudinary integration configured.');
} else {
  console.log('[JobNexa Cloud Storage] Cloudinary credentials not detected; using local uploads directory fallback.');
}

/**
 * Uploads file buffer or file path to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} originalName - Original filename
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<Object>} { secure_url, public_id, format }
 */
export const uploadToCloudinary = (buffer, originalName, folder = 'jobnexa_resumes') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      // Local fallback storage in backend/uploads
      try {
        const uploadDir = path.resolve('uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const safeName = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadDir, safeName);
        fs.writeFileSync(filePath, buffer);

        // Resolve with local static URL format
        resolve({
          secure_url: `/uploads/${safeName}`,
          public_id: safeName,
          format: originalName.split('.').pop(),
          bytes: buffer.length,
          isLocal: true,
        });
      } catch (err) {
        reject(err);
      }
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw', // Support PDF, DOCX, DOC
        public_id: `${Date.now()}_${path.parse(originalName).name}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Deletes file from Cloudinary by public ID
 * @param {string} publicId 
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured) {
    try {
      const filePath = path.resolve('uploads', publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { result: 'ok' };
    } catch (e) {
      return { result: 'not found' };
    }
  }

  return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};

export default cloudinary;
