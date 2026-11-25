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
  console.log('[JobNexa Cloud Storage] Cloudinary integration successfully configured.');
} else {
  console.log('[JobNexa Cloud Storage] Cloudinary credentials not detected; using local uploads directory fallback.');
}

/**
 * Uploads raw document (PDF, DOCX) to Cloudinary
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
        resource_type: 'raw',
        public_id: `${Date.now()}_${path.parse(originalName).name.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
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
 * Uploads image (JPG, PNG, WebP) to Cloudinary
 */
export const uploadImageToCloudinary = (buffer, originalName, folder = 'jobnexa_profiles') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      try {
        const uploadDir = path.resolve('uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const safeName = `img_${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadDir, safeName);
        fs.writeFileSync(filePath, buffer);

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
        resource_type: 'image',
        transformation: [{ width: 500, height: 500, crop: 'limit' }, { quality: 'auto' }],
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
 * Deletes file (raw or image) from Cloudinary by public ID
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  if (!publicId) return { result: 'ok' };

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

  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    // If raw failed, attempt image destroy
    try {
      return await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (e) {
      console.warn(`[Cloudinary delete warning for ${publicId}]:`, e.message);
      return { result: 'error' };
    }
  }
};

export default cloudinary;
