import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

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

const saveLocal = (buffer, originalName, prefix = '') => {
  const uploadDir = path.resolve('uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const safeName = `${prefix}${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
  fs.writeFileSync(path.join(uploadDir, safeName), buffer);
  return {
    secure_url: `/uploads/${safeName}`,
    public_id: safeName,
    format: originalName.split('.').pop(),
    bytes: buffer.length,
    isLocal: true,
  };
};

/**
 * Uploads raw document (PDF, DOCX, DOC) to Cloudinary
 */
export const uploadToCloudinary = (buffer, originalName, folder = 'jobnexa_resumes') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      try {
        return resolve(saveLocal(buffer, originalName));
      } catch (err) {
        return reject(err);
      }
    }

    const { name, ext } = path.parse(originalName);
    const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '_');

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        // raw files need the extension in public_id so the link keeps .pdf/.docx
        public_id: `${Date.now()}_${cleanName}${ext.toLowerCase()}`,
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
        return resolve(saveLocal(buffer, originalName, 'img_'));
      } catch (err) {
        return reject(err);
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
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

  const otherType = resourceType === 'raw' ? 'image' : 'raw';

  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (res.result === 'ok') return res;
    // Not found under this type, so try the other one
    return await cloudinary.uploader.destroy(publicId, { resource_type: otherType });
  } catch (err) {
    console.warn(`[Cloudinary delete warning for ${publicId}]:`, err.message);
    return { result: 'error' };
  }
};

export default cloudinary;