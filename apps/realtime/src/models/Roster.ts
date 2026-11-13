import mongoose, { Document, Schema } from 'mongoose';

export interface IRosterStudent {
  rollNo: string;
  name: string;
  email: string;
  section?: string;
}

export interface IRoster extends Document {
  teacherId: mongoose.Types.ObjectId;
  courseCode: string;
  courseName: string;
  section: string;
  academicYear?: string;
  students: IRosterStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const RosterStudentSchema = new Schema<IRosterStudent>(
  {
    rollNo: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    section: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const RosterSchema = new Schema<IRoster>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    courseCode: { type: String, required: true, trim: true, uppercase: true },
    courseName: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    academicYear: { type: String, default: '2025-2026', trim: true },
    students: { type: [RosterStudentSchema], default: [] },
  },
  { timestamps: true }
);

// Index for rapid student lookup by rollNo within teacher's rosters
RosterSchema.index({ teacherId: 1, courseCode: 1, section: 1 });
RosterSchema.index({ 'students.rollNo': 1 });

export const Roster = mongoose.models.Roster || mongoose.model<IRoster>('Roster', RosterSchema);
