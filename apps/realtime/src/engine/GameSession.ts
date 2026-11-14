// ─── Game Session Manager ───────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import type { Player, PlayerAnswer, Quiz, Team, TeamLeaderboardEntry } from '@alix/shared';
import { SESSION_CONSTANTS, SessionStatus } from '@alix/shared';
import type { LeaderboardEntry } from '@alix/shared';

export const DEFAULT_TEAMS: Team[] = [
  { id: 'team-red', name: 'Red Dragons', color: '#E21B3C', icon: '🐉', score: 0, memberCount: 0 },
  { id: 'team-blue', name: 'Blue Titans', color: '#1368CE', icon: '⚡', score: 0, memberCount: 0 },
  { id: 'team-green', name: 'Emerald Knights', color: '#26890C', icon: '🛡️', score: 0, memberCount: 0 },
  { id: 'team-yellow', name: 'Golden Eagles', color: '#D89E00', icon: '🦅', score: 0, memberCount: 0 },
];

interface InternalSession {
  id: string;
  code: string;
  hostId: string;
  hostSocketId?: string;
  quizId: string;
  quiz: Quiz | null;
  status: SessionStatus;
  gameMode: 'classic' | 'team';
  teams: Team[];
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

  createSession(quizId: string, hostId: string, gameMode: 'classic' | 'team' = 'classic'): InternalSession {
    const id = uuidv4();
    const code = this.generateCode();

    const session: InternalSession = {
      id,
      code,
      hostId,
      quizId,
      quiz: null, // Loaded when game starts
      status: SessionStatus.WAITING,
      gameMode,
      teams: DEFAULT_TEAMS.map((t) => ({ ...t })),
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

  setQuiz(sessionId: string, quiz: Quiz): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.quiz = quiz;
    }
  }

  getAllSessions(): InternalSession[] {
    return Array.from(this.sessions.values());
  }

  findByCode(code: string): InternalSession | undefined {
    const sessionId = this.codeToSession.get(code.toUpperCase());
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  findByQuizId(quizId: string): InternalSession | undefined {
    return Array.from(this.sessions.values()).find(
      (s) => s.quizId === quizId && s.status !== SessionStatus.FINISHED
    );
  }

  // ─── Player Management ──────────────────────────────────────────────

  addPlayer(
    sessionId: string,
    socketId: string,
    name: string,
    avatar?: string,
    rollNo?: string,
    teamId?: string,
    teamName?: string,
    teamColor?: string
  ): Player | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const cleanName = (name || '').trim();
    const cleanRoll = rollNo ? rollNo.trim().toUpperCase() : undefined;

    // Resolve team for Team Mode
    let assignedTeamId = teamId;
    let assignedTeamName = teamName;
    let assignedTeamColor = teamColor;

    if (session.gameMode === 'team') {
      const availableTeams = session.teams.length > 0 ? session.teams : DEFAULT_TEAMS;
      if (!assignedTeamId) {
        // Auto-balance: select team with fewest members
        const counts: Record<string, number> = {};
        availableTeams.forEach((t) => { counts[t.id] = 0; });
        session.players.forEach((p) => {
          if (p.teamId && counts[p.teamId] !== undefined) {
            counts[p.teamId]++;
          }
        });
        let minTeam = availableTeams[0];
        let minCount = counts[minTeam.id] || 0;
        for (const t of availableTeams) {
          if ((counts[t.id] || 0) < minCount) {
            minTeam = t;
            minCount = counts[t.id] || 0;
          }
        }
        assignedTeamId = minTeam.id;
        assignedTeamName = minTeam.name;
        assignedTeamColor = minTeam.color;
      } else {
        const found = availableTeams.find((t) => t.id === assignedTeamId);
        if (found) {
          assignedTeamName = found.name;
          assignedTeamColor = found.color;
        }
      }
    }

    // Check if player already exists (reconnection / page refresh)
    const existingPlayer = session.players.find((p) => {
      if (cleanRoll && (p as any).rollNo && (p as any).rollNo.toUpperCase() === cleanRoll) {
        return true;
      }
      return cleanName && p.name.trim().toLowerCase() === cleanName.toLowerCase();
    });

    if (existingPlayer) {
      const oldId = existingPlayer.id;
      existingPlayer.id = socketId;
      existingPlayer.isConnected = true;
      if (avatar) existingPlayer.avatar = avatar;
      if (cleanRoll) (existingPlayer as any).rollNo = cleanRoll;
      if (assignedTeamId) {
        existingPlayer.teamId = assignedTeamId;
        existingPlayer.teamName = assignedTeamName;
        existingPlayer.teamColor = assignedTeamColor;
      }

      if (oldId && session.previousRanks.has(oldId)) {
        const prev = session.previousRanks.get(oldId);
        session.previousRanks.delete(oldId);
        if (prev !== undefined) session.previousRanks.set(socketId, prev);
      }
      return existingPlayer;
    }

    const player: Player = {
      id: socketId,
      name: cleanName || 'Student',
      score: 0,
      streak: 0,
      answers: [],
      rank: session.players.length + 1,
      avatar: avatar || 'fox',
      isConnected: true,
      teamId: assignedTeamId,
      teamName: assignedTeamName,
      teamColor: assignedTeamColor,
      ...(cleanRoll ? { rollNo: cleanRoll } : {}),
    } as any;

    session.players.push(player);
    return player;
  }

  setPlayerTeam(sessionId: string, playerId: string, teamId: string): Player | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    const player = session.players.find((p) => p.id === playerId);
    if (!player) return null;

    const availableTeams = session.teams.length > 0 ? session.teams : DEFAULT_TEAMS;
    const targetTeam = availableTeams.find((t) => t.id === teamId);
    if (targetTeam) {
      player.teamId = targetTeam.id;
      player.teamName = targetTeam.name;
      player.teamColor = targetTeam.color;
    }
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

  getTeamLeaderboard(sessionId: string): TeamLeaderboardEntry[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const teams = session.teams.length > 0 ? session.teams : DEFAULT_TEAMS;
    const teamMap = new Map<
      string,
      { id: string; name: string; color: string; icon: string; score: number; memberCount: number }
    >();

    for (const t of teams) {
      teamMap.set(t.id, {
        id: t.id,
        name: t.name,
        color: t.color,
        icon: t.icon || '🛡️',
        score: 0,
        memberCount: 0,
      });
    }

    for (const p of session.players) {
      if (p.teamId && teamMap.has(p.teamId)) {
        const t = teamMap.get(p.teamId)!;
        t.score += p.score;
        t.memberCount += 1;
      }
    }

    const sortedTeams = Array.from(teamMap.values()).sort(
      (a, b) => b.score - a.score || b.memberCount - a.memberCount
    );

    return sortedTeams.map((t, idx) => ({
      teamId: t.id,
      teamName: t.name,
      color: t.color,
      icon: t.icon,
      score: t.score,
      rank: idx + 1,
      memberCount: t.memberCount,
    }));
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
