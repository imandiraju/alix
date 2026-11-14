// ─── Quiz Types ─────────────────────────────────────────────────────────────

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  MULTI_SELECT = 'MULTI_SELECT',
  SHORT_ANSWER = 'SHORT_ANSWER',
  POLL = 'POLL',
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuizOption[];
  correctAnswer: string;
  correctIndices?: number[];
  timeLimit: number; // seconds
  points: number;
  explanation?: string;
  mediaUrl?: string;
}

export interface QuizSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showLeaderboard: boolean;
  showCorrectAnswer: boolean;
  allowLateJoin: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  tags: string[];
  settings: QuizSettings;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  shuffleQuestions: false,
  shuffleOptions: false,
  showLeaderboard: true,
  showCorrectAnswer: true,
  allowLateJoin: true,
};

export const DEFAULT_QUESTION: Omit<Question, 'id'> = {
  text: '',
  type: QuestionType.MULTIPLE_CHOICE,
  options: [
    { id: 'a', text: '', isCorrect: true },
    { id: 'b', text: '', isCorrect: false },
    { id: 'c', text: '', isCorrect: false },
    { id: 'd', text: '', isCorrect: false },
  ],
  correctAnswer: 'a',
  timeLimit: 30,
  points: 1000,
};
