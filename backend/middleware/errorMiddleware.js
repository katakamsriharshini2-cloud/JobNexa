/**
 * Centralized Error Handler Middleware for JobNexa Express Application
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  console.error('[JobNexa Server Error]:', err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with specified identifier.`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose Duplicate Key (Code 11000)
  if (err.code === 11000) {
    let field = Object.keys(err.keyValue)[0];
    let message = `A record with this ${field} already exists.`;
    if (field === 'job' || field === 'student') {
      message = 'You have already applied for this job opening.';
    }
    return res.status(400).json({ success: false, message });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Multer Error (e.g. file size exceeded)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowable limit of 5MB.',
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token signature.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Authentication session expired.' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error. Please contact JobNexa support.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
