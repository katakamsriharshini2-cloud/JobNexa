import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas or local MongoDB fallback
 */
export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobnexa';
    
    // Connection options for optimal performance
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`[JobNexa Database] Connected successfully to MongoDB host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[JobNexa Database Error] Failed to connect to MongoDB: ${error.message}`);
    // In production or Render deployment, let process handle or report
    if (process.env.NODE_ENV === 'production') {
      console.warn('Please verify that MONGODB_URI is correctly configured in your Render environment variables and Network Access allows 0.0.0.0/0.');
    }
  }
};

export default connectDB;
