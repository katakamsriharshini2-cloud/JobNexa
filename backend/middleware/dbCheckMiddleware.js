import mongoose from 'mongoose';

/**
 * Middleware ensuring MongoDB is connected before processing requests
 * Completely prevents 10-second Mongoose command buffering timeouts
 */
export const ensureDbConnected = async (req, res, next) => {
  // If already connected, proceed immediately
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // If in 'connecting' state (state 2), wait up to 4 seconds for connection to establish
  if (mongoose.connection.readyState === 2) {
    try {
      await Promise.race([
        mongoose.connection.asPromise(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection wait timeout')), 4000)
        ),
      ]);
      if (mongoose.connection.readyState === 1) {
        return next();
      }
    } catch (e) {
      // Fall through to error response below
    }
  }

  // If disconnected or connection failed (state 0, 2, or 3)
  return res.status(503).json({
    success: false,
    message:
      'Database service is currently connecting or unavailable. Please check that MONGO_URL is properly configured in your Render dashboard.',
  });
};

export default ensureDbConnected;
