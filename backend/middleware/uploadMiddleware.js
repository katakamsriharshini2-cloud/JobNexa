import multer from 'multer';
import path from 'path';

// Memory storage so buffers can be streamed directly to Cloudinary or disk
const storage = multer.memoryStorage();

// Resume file filter: PDF, DOCX, DOC (up to 5MB)
const resumeFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid document format. Only PDF and DOCX resumes are supported.'),
      false
    );
  }
};

// Profile image file filter: JPG, JPEG, PNG, WEBP (up to 3MB)
const imageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid image format. Only JPG, JPEG, PNG, and WebP files are allowed.'),
      false
    );
  }
};

export const uploadResumeMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: resumeFilter,
});

export const uploadImageMiddleware = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit
  },
  fileFilter: imageFilter,
});

export default uploadResumeMiddleware;
