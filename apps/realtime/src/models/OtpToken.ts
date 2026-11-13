import mongoose, { Document, Schema } from 'mongoose';

export interface IOtpToken extends Document {
  email: string;
  code: string;
  createdAt: Date;
}

const OtpTokenSchema = new Schema<IOtpToken>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // Automatically deleted by MongoDB after 10 mins (600s)
  },
  { timestamps: false }
);

export const OtpToken = mongoose.models.OtpToken || mongoose.model<IOtpToken>('OtpToken', OtpTokenSchema);
