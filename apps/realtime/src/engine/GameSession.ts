// ─── Game Session Manager ───────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import type { Player, PlayerAnswer, Quiz } from '@alix/shared';
import { SESSION_CONSTANTS, SessionStatus } from '@alix/shared';
import type { LeaderboardEntry } from '@alix/shared';

interface InternalSession {
  id: string;
  code: string;
  hostId: string;
  quizId: string;
  quiz: Quiz | null;
  status: SessionStatus;
  players: Player[];
  currentQuestionIndex: number;
  settings: {
    maxPlayers: number;
    autoAdvance: boolean;
    autoAdvanceDelay: number;
    showLeaderboardAfterEach: boolean;
    allowLateJoin: boolean;
  };
  startedAt?: string;
  finishedAt?: string;
  previousRanks: Map<string, number>;
}

export class GameSessionManager {
  private sessions: Map<string, InternalSession> = new Map();
  private codeToSession: Map<string, string> = new Map();

  // ─── Session Lifecycle ──────────────────────────────────────────────

  createSession(quizId: string, hostId: string): InternalSession {
    const id = uuidv4();
    const code = this.generateCode();

    const session: InternalSession = {
      id,
      code,
      hostId,
      quizId,
      quiz: null, // Loaded when game starts
      status: SessionStatus.WAITING,
      players: [],
      currentQuestionIndex: -1,
      settings: {
        maxPlayers: SESSION_CONSTANTS.MAX_PLAYERS_DEFAULT,
        autoAdvance: false,
        autoAdvanceDelay: 5,
        showLeaderboardAfterEach: true,
        allowLateJoin: true,
      },
      previousRanks: new Map(),
    };

    this.sessions.set(id, session);
    this.codeToSession.set(code, id);

    return session;
  }

  getSession(sessionId: string): InternalSession | undefined {
    return this.sessions.get(sessionId);
  }

  findByCode(code: string): InternalSession | undefined {
    const sessionId = this.codeToSession.get(code.toUpperCase());
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  // ─── Player Management ──────────────────────────────────────────────

  addPlayer(sessionId: string, socketId: string, name: string): Player | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check for duplicate names
    const existingName = session.players.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() && p.isConnected,
    );
    const displayName = existingName ? `${name} (${session.players.length + 1})` : name;

    const player: Player = {
      id: socketId,
      name: displayName,
      score: 0,
      streak: 0,
      answers: [],
      rank: session.players.length + 1,
      isConnected: true,
    };

    session.players.push(player);
    return player;
  }

  removePlayer(sessionId: string, playerId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const player = session.players.find((p) => p.id === playerId);
    if (player) {
      player.isConnected = false;
    }
  }

  getPlayerStreak(sessionId: string, playerId: string): number {
    const session = this.sessions.get(sessionId);
    if (!session) return 0;

    const player = session.players.find((p) => p.id === playerId);
    return player?.streak ?? 0;
  }

  // ─── Game Flow ──────────────────────────────────────────────────────

  startGame(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = SessionStatus.PLAYING;
    session.startedAt = new Date().toISOString();
    session.currentQuestionIndex = -1;
  }

  endGame(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = SessionStatus.FINISHED;
    session.finishedAt = new Date().toISOString();
  }

  // ─── Answers & Scoring ──────────────────────────────────────────────

  recordAnswer(sessionId: string, playerId: string, answer: PlayerAnswer): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const player = session.players.find((p) => p.id === playerId);
    if (!player) return;

    // Prevent duplicate answers for same question
    if (player.answers.some((a) => a.questionId === answer.questionId)) return;

    player.answers.push(answer);
    player.score += answer.points;
    player.streak = answer.correct ? player.streak + 1 : 0;
  }

  // ─── Leaderboard ───────────────────────────────────────────────────

  getLeaderboard(sessionId: string): LeaderboardEntry[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const sorted = [...session.players]
      .filter((p) => p.isConnected)
      .sort((a, b) => b.score - a.score);

    const leaderboard: LeaderboardEntry[] = sorted.map((player, index) => {
      const rank = index + 1;
      const previousRank = session.previousRanks.get(player.id) ?? rank;

      return {
        playerId: player.id,
        playerName: player.name,
        score: player.score,
        rank,
        previousRank,
        streak: player.streak,
      };
    });

    // Store current ranks for next comparison
    for (const entry of leaderboard) {
      session.previousRanks.set(entry.playerId, entry.rank);
    }

    // Update player rank references
    for (const entry of leaderboard) {
      const player = session.players.find((p) => p.id === entry.playerId);
      if (player) player.rank = entry.rank;
    }

    return leaderboard;
  }

  // ─── Cleanup ────────────────────────────────────────────────────────

  destroySession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.codeToSession.delete(session.code);
      this.sessions.delete(sessionId);
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  private generateCode(): string {
    const chars = SESSION_CONSTANTS.CODE_CHARACTERS;
    let code: string;
    do {
      code = '';
      for (let i = 0; i < SESSION_CONSTANTS.CODE_LENGTH; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.codeToSession.has(code));
    return code;
  }
}
