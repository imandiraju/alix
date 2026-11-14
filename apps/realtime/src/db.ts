import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Teacher } from './models/Teacher.js';

export let lastDbError: string | null = null;

export async function seedPlatformAdmin() {
  try {
    const adminEmail = 'alixadmin@gmail.com';
    const existing = await Teacher.findOne({ email: adminEmail });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Ialix@123', salt);

    if (!existing) {
      const admin = new Teacher({
        name: 'Platform Administrator',
        email: adminEmail,
        passwordHash,
        institution: 'RKGlobal EdTech Headquarters',
        department: 'Executive Governance',
        subjects: ['System Administration'],
        role: 'admin',
      });
      await admin.save();
      console.log('[ALIX DB] 👑 Platform Admin account initialized: alixadmin@gmail.com');
    } else {
      let needsSave = false;
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        needsSave = true;
      }
      const isMatch = await bcrypt.compare('Ialix@123', existing.passwordHash);
      if (!isMatch) {
        existing.passwordHash = passwordHash;
        needsSave = true;
      }
      if (needsSave) {
        await existing.save();
        console.log('[ALIX DB] 👑 Platform Admin account verified: alixadmin@gmail.com (role: admin)');
      }
    }
  } catch (err: any) {
    console.warn('[ALIX DB] Seed admin warning:', err.message);
  }
}

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
    
    // Seed and ensure Platform Admin account exists
    await seedPlatformAdmin();
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
