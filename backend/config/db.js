import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load backend/.env, falling back to current working directory .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config();

/**
 * Retrieve MongoDB connection URI from environment variables
 * Supports MONGO_URL (Render default), MONGO_URI, and MONGODB_URI
 * In production, strictly avoids localhost 127.0.0.1 fallback
 */
export const getRawMongoUri = () => {
  const uri = process.env.MONGO_URL || process.env.MONGO_URI || process.env.MONGODB_URI;
  if (uri && uri.trim() !== '') {
    return uri.trim();
  }

  // Only allow localhost fallback in non-production local development
  if (process.env.NODE_ENV !== 'production') {
    return 'mongodb://127.0.0.1:27017/jobnexa';
  }

  return '';
};

/**
 * Sanitize and validate MongoDB connection string
 * Ensures mongodb+srv:// URIs do not contain port numbers as per MongoDB SRV specification
 * and properly handles unescaped characters (such as #) in credentials
 */
export const sanitizeMongoUri = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') {
    return '';
  }

  let uri = rawUri.trim();

  // Strip surrounding double or single quotes
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  if (!uri) return '';

  // Validate scheme
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.warn(
      '[JobNexa Database Warning] Invalid connection string format. URI must begin with mongodb:// or mongodb+srv://'
    );
    return uri;
  }

  // Sanitize mongodb+srv:// format
  if (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) {
    const isSrv = uri.startsWith('mongodb+srv://');
    const prefix = isSrv ? 'mongodb+srv://' : 'mongodb://';
    const rest = uri.slice(prefix.length);
    const lastAt = rest.lastIndexOf('@');

    if (lastAt !== -1) {
      const userInfo = rest.slice(0, lastAt);
      const hostAndBeyond = rest.slice(lastAt + 1);

      // Handle unescaped '#' in password
      const colonIdx = userInfo.indexOf(':');
      let sanitizedUserInfo = userInfo;
      if (colonIdx !== -1) {
        const username = userInfo.slice(0, colonIdx);
        let password = userInfo.slice(colonIdx + 1);
        if (password.includes('#') && !password.includes('%23')) {
          password = password.replace(/#/g, '%23');
        }
        sanitizedUserInfo = `${username}:${password}`;
      }

      // Check for accidental port in SRV host
      const delimiterIndex = hostAndBeyond.search(/[/?]/);
      let hostPart = delimiterIndex !== -1 ? hostAndBeyond.slice(0, delimiterIndex) : hostAndBeyond;
      const tailPart = delimiterIndex !== -1 ? hostAndBeyond.slice(delimiterIndex) : '';

      if (isSrv && /:(\d+)/.test(hostPart)) {
        console.warn(
          '[JobNexa Database Notice] Detected and removed port number from mongodb+srv URI (SRV protocol resolves ports automatically via DNS).'
        );
        hostPart = hostPart.replace(/:(\d+)/g, '');
      }

      uri = `${prefix}${sanitizedUserInfo}@${hostPart}${tailPart}`;
    }
  }

  return uri;
};

/**
 * Connect to MongoDB Atlas or local MongoDB fallback
 */
export const connectDB = async () => {
  try {
    const rawUri = getRawMongoUri();

    if (!rawUri) {
      const errorMsg =
        'No MongoDB connection string detected. In your Render dashboard, please add an Environment Variable named MONGO_URL, MONGO_URI, or MONGODB_URI with your MongoDB Atlas connection string.';
      console.error(`[JobNexa Database Critical] ${errorMsg}`);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(errorMsg);
      }
    }

    const connStr = sanitizeMongoUri(rawUri);

    // Disable Mongoose command buffering so queries fail immediately with clear errors instead of hanging for 10 seconds
    mongoose.set('bufferCommands', false);

    // Connection options for optimal reliability
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(`[JobNexa Database] Connected successfully to MongoDB host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[JobNexa Database Error] Failed to connect to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        'Action required: Please ensure your Render environment variable MONGO_URL (or MONGO_URI) is correct and MongoDB Atlas Network Access has IP 0.0.0.0/0 enabled.'
      );
    }
    throw error;
  }
};

export default connectDB;
