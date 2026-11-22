import multer from 'multer';
import path from 'path';

// Use memory storage so buffers can be streamed directly to Cloudinary or disk
const storage = multer.memoryStorage();

// Validate file types: PDF and DOCX only
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid document format. Only PDF and DOCX resumes are supported.'),
      false
    );
  }
};

export const uploadResumeMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

export default uploadResumeMiddleware;
