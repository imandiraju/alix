import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  type?: string;
  timeLimit: number;
  points: number;
  options: string[];
  correctIndex: number;
  correctIndices?: number[];
}

export interface IQuiz extends Document {
  teacherId: mongoose.Types.ObjectId;
  rosterId?: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  courseCode: string;
  section: string;
  description: string;
  questions: IQuestion[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, default: 'multiple_choice' },
    timeLimit: { type: Number, default: 30 },
    points: { type: Number, default: 1000 },
    options: { type: [String], required: true },
    correctIndex: { type: Number, default: 0 },
    correctIndices: { type: [Number], default: [] },
  },
  { _id: false }
);

const QuizSchema = new Schema<IQuiz>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    rosterId: { type: Schema.Types.ObjectId, ref: 'Roster' },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    courseCode: { type: String, default: '', trim: true },
    section: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    questions: { type: [QuestionSchema], default: [] },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Quiz = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
