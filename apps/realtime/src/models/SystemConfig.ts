import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
  key: string;
  value: string;
  maskedValue?: string;
  category: 'ai' | 'system' | 'email';
  description?: string;
  status?: 'active' | 'untested' | 'invalid' | 'rate_limited';
  lastTestedAt?: Date;
  testDetails?: any;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfig>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, required: true },
    maskedValue: { type: String, default: '' },
    category: { type: String, enum: ['ai', 'system', 'email'], default: 'ai' },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'untested', 'invalid', 'rate_limited'],
      default: 'untested',
    },
    lastTestedAt: { type: Date },
    testDetails: { type: Schema.Types.Mixed },
    updatedBy: { type: String, default: 'Platform Admin' },
  },
  { timestamps: true }
);

export const SystemConfig =
  mongoose.models.SystemConfig || mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
