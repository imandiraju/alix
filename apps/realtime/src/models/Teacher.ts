import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  email: string;
  passwordHash: string;
  institution: string;
  department: string;
  subjects: string[];
  role: 'teacher' | 'admin';
  createdAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    institution: { type: String, default: 'Academic Institution' },
    department: { type: String, default: 'Academic Department' },
    subjects: { type: [String], default: [] },
    role: { type: String, enum: ['teacher', 'admin'], default: 'teacher' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Teacher = mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
