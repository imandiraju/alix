// ─── Socket.IO Event Types ──────────────────────────────────────────────────

import type { Player, SessionStatus } from './session.js';
import type { Question } from './quiz.js';

// ─── Event Payloads ─────────────────────────────────────────────────────────

export interface CreateSessionPayload {
  quizId: string;
  hostId: string;
  gameMode?: 'classic' | 'team';
}

export interface JoinSessionPayload {
  code: string;
  playerName: string;
  teamId?: string;
  teamName?: string;
  teamColor?: string;
}

export interface SubmitAnswerPayload {
  sessionId: string;
  questionId: string;
  answer: string;
  timeMs: number;
}

export interface StartGamePayload {
  sessionId: string;
}

export interface NextQuestionPayload {
  sessionId: string;
}

export interface EndGamePayload {
  sessionId: string;
}

// ─── Server → Client Event Payloads ────────────────────────────────────────

export interface SessionCreatedPayload {
  sessionId: string;
  code: string;
}

export interface PlayerJoinedPayload {
  player: Player;
  playerCount: number;
}

export interface QuestionStartedPayload {
  question: Omit<Question, 'correctAnswer'>;
  questionIndex: number;
  totalQuestions: number;
  timeLimit: number;
}

export interface AnswerResultPayload {
  correct: boolean;
  points: number;
  streak: number;
  totalScore: number;
  correctAnswer: string;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
  previousRank: number;
  streak: number;
  teamId?: string;
  teamName?: string;
  teamColor?: string;
}

export interface TeamLeaderboardEntry {
  teamId: string;
  teamName: string;
  color: string;
  icon?: string;
  score: number;
  rank: number;
  memberCount: number;
}

export interface LeaderboardUpdatePayload {
  leaderboard: LeaderboardEntry[];
  teamLeaderboard?: TeamLeaderboardEntry[];
  gameMode?: 'classic' | 'team';
  questionResults: {
    questionId: string;
    correctCount: number;
    totalCount: number;
    distribution: Record<string, number>;
  };
}

export interface GameEndedPayload {
  finalLeaderboard: LeaderboardEntry[];
  teamLeaderboard?: TeamLeaderboardEntry[];
  gameMode?: 'classic' | 'team';
  sessionSummary: {
    totalQuestions: number;
    totalPlayers: number;
    averageScore: number;
    highestScore: number;
    completionRate: number;
  };
}

export interface PlayerDisconnectedPayload {
  playerId: string;
  playerName: string;
  playerCount: number;
}

export interface TimerTickPayload {
  remaining: number;
  total: number;
}

export interface SessionStatusPayload {
  status: SessionStatus;
}

// ─── Typed Event Maps ──────────────────────────────────────────────────────

export interface ClientToServerEvents {
  'create-session': (payload: CreateSessionPayload) => void;
  'join-session': (payload: JoinSessionPayload) => void;
  'select-team': (payload: { sessionId?: string; code?: string; teamId: string }) => void;
  'configure-teams': (payload: { sessionId?: string; code?: string; teamCount: number; maxMembersPerTeam?: number; teams?: any[] }) => void;
  'trigger-peer-instruction': (payload: { sessionId?: string; code?: string; duration?: number; questionIndex?: number }) => void;
  'broadcast-concept-card': (payload: { sessionId?: string; code?: string; concept: { title: string; trap: string; takeaway: string; formula?: string } }) => void;
  'start-game': (payload: StartGamePayload) => void;
  'next-question': (payload: NextQuestionPayload) => void;
  'submit-answer': (payload: SubmitAnswerPayload) => void;
  'end-game': (payload: EndGamePayload) => void;
  'host-show-leaderboard': (payload: any) => void;
}

export interface ServerToClientEvents {
  'session-created': (payload: SessionCreatedPayload) => void;
  'player-joined': (payload: PlayerJoinedPayload) => void;
  'player-disconnected': (payload: PlayerDisconnectedPayload) => void;
  'teams-updated': (payload: { teams: any[]; maxMembersPerTeam?: number; teamCount?: number }) => void;
  'peer-instruction-started': (payload: { duration: number; questionIndex: number }) => void;
  'concept-card-received': (payload: { concept: { title: string; trap: string; takeaway: string; formula?: string } }) => void;
  'question-started': (payload: QuestionStartedPayload) => void;
  'timer-tick': (payload: TimerTickPayload) => void;
  'answer-result': (payload: AnswerResultPayload) => void;
  'leaderboard-update': (payload: LeaderboardUpdatePayload) => void;
  'show-leaderboard': (payload: { leaderboard: LeaderboardEntry[]; sessionId?: string; code?: string }) => void;
  'game-ended': (payload: GameEndedPayload) => void;
  'session-status': (payload: SessionStatusPayload) => void;
  error: (payload: { message: string; code: string }) => void;
}
