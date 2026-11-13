import mongoose, { Document, Schema } from 'mongoose';

export interface ISessionParticipant {
  socketId: string;
  name: string;
  avatarId: string;
  score: number;
  streak: number;
  joinedAt: Date;
}

export interface ISessionResponse {
  questionId: string;
  playerName: string;
  answer: string;
  isCorrect: boolean;
  timeMs: number;
  pointsAwarded: number;
  submittedAt: Date;
}

export interface IGameSessionDoc extends Document {
  pin: string;
  quizId?: mongoose.Types.ObjectId;
  teacherId?: mongoose.Types.ObjectId;
  status: 'waiting' | 'active' | 'completed';
  participants: ISessionParticipant[];
  responses: ISessionResponse[];
  createdAt: Date;
}

const ParticipantSchema = new Schema<ISessionParticipant>(
  {
    socketId: { type: String, required: true },
    name: { type: String, required: true },
    avatarId: { type: String, default: 'fox' },
    score: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ResponseSchema = new Schema<ISessionResponse>(
  {
    questionId: { type: String, required: true },
    playerName: { type: String, required: true },
    answer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    timeMs: { type: Number, default: 0 },
    pointsAwarded: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const GameSessionDocSchema = new Schema<IGameSessionDoc>(
  {
    pin: { type: String, required: true, unique: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
    participants: { type: [ParticipantSchema], default: [] },
    responses: { type: [ResponseSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const GameSessionModel =
  mongoose.models.GameSessionModel || mongoose.model<IGameSessionDoc>('GameSessionModel', GameSessionDocSchema);
