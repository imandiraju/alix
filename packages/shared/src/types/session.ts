// ─── Session Types ──────────────────────────────────────────────────────────

export enum SessionStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  REVIEWING = 'REVIEWING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

export interface PlayerAnswer {
  questionId: string;
  answer: string;
  timeMs: number;
  correct: boolean;
  points: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  icon?: string;
  score: number;
  memberCount: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  answers: PlayerAnswer[];
  rank: number;
  avatar?: string;
  isConnected: boolean;
  rollNo?: string;
  teamId?: string;
  teamName?: string;
  teamColor?: string;
}

export interface SessionSettings {
  maxPlayers: number;
  autoAdvance: boolean;
  autoAdvanceDelay: number; // seconds
  showLeaderboardAfterEach: boolean;
  gameMode?: 'classic' | 'team';
}

export interface GameSession {
  id: string;
  code: string;
  hostId: string;
  quizId: string;
  status: SessionStatus;
  players: Player[];
  currentQuestionIndex: number;
  settings: SessionSettings;
  gameMode?: 'classic' | 'team';
  teams?: Team[];
  startedAt?: string;
  finishedAt?: string;
}

export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  maxPlayers: 100,
  autoAdvance: false,
  autoAdvanceDelay: 5,
  showLeaderboardAfterEach: true,
};
