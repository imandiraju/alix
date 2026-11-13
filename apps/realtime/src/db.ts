import mongoose from 'mongoose';

export let lastDbError: string | null = null;

export async function connectDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    lastDbError = 'No MONGODB_URI found in environment variables.';
    console.warn('[ALIX DB] ' + lastDbError);
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
    });
    lastDbError = null;
    console.log('[ALIX DB] 🍃 Successfully connected to MongoDB Atlas Cloud Cluster');
    return true;
  } catch (err: any) {
    lastDbError = err.message || 'Unknown MongoDB connection error';
    console.error('[ALIX DB] ⚠️ MongoDB connection error:', lastDbError);
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('[ALIX DB] Disconnected from MongoDB. Attempting reconnection...');
  setTimeout(() => {
    connectDatabase();
  }, 10000);
});

mongoose.connection.on('error', (err) => {
  lastDbError = err.message;
  console.error('[ALIX DB] Runtime MongoDB error:', err.message);
});
