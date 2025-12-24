/**
 * Database connection singleton
 * Ensures a single MongoDB connection throughout the application lifecycle
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * Get or create MongoDB connection
 */
export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000,
      maxIdleTimeMS: 60000,
      retryWrites: true,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        const dbName = mongoose.connection.db?.databaseName || 'unknown';
        console.log(`✅ MongoDB connected successfully to database: ${dbName}`);
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Connect to database with timeout protection
 * Prevents hanging connections to MongoDB Atlas
 * @param timeout - Connection timeout in milliseconds (default: 10000ms)
 */
export async function connectDBWithTimeout(timeout: number = 10000) {
  const connectPromise = connectDB();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database connection timeout')), timeout)
  );
  return Promise.race([connectPromise, timeoutPromise]);
}

/**
 * Disconnect from MongoDB (useful for testing and graceful shutdown)
 */
export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('✅ MongoDB disconnected');
  }
}
