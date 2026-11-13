import mongoose from 'mongoose';

export async function connectDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[ALIX DB] No MONGODB_URI configured. Set MONGODB_URI to connect to MongoDB Atlas.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true,
    });
    console.log('[ALIX DB] 🍃 Successfully connected to MongoDB Atlas Cloud Cluster');
    return true;
  } catch (err: any) {
    console.error('[ALIX DB] ⚠️ MongoDB connection error:', err.message);
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('[ALIX DB] Disconnected from MongoDB');
});
