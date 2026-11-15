// ─── Game Session Manager ───────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import type {
  Player,
  PlayerAnswer,
  Quiz,
  Team,
  TeamLeaderboardEntry,
  LeaderboardEntry,
  MysteryVaultRewardType,
  MysteryVaultSettings,
  VaultRoundState,
  VaultTransaction,
  VaultAggregateSummaryPayload,
  VaultRewardOutcome,
} from '@alix/shared';
import {
  SESSION_CONSTANTS,
  SessionStatus,
  DEFAULT_MYSTERY_VAULT_SETTINGS,
} from '@alix/shared';
import { MysteryVaultEngine } from './MysteryVaultEngine.js';

export const DEFAULT_TEAMS: Team[] = [
  { id: 'team-red', name: 'Red Dragons', color: '#E21B3C', icon: '🐉', score: 0, memberCount: 0 },
  { id: 'team-blue', name: 'Blue Titans', color: '#1368CE', icon: '⚡', score: 0, memberCount: 0 },
  { id: 'team-green', name: 'Emerald Knights', color: '#26890C', icon: '🛡️', score: 0, memberCount: 0 },
  { id: 'team-yellow', name: 'Golden Eagles', color: '#D89E00', icon: '🦅', score: 0, memberCount: 0 },
  { id: 'team-purple', name: 'Purple Phantoms', color: '#864CBF', icon: '🔮', score: 0, memberCount: 0 },
  { id: 'team-orange', name: 'Orange Blaze', color: '#E65100', icon: '🔥', score: 0, memberCount: 0 },
  { id: 'team-cyan', name: 'Cyan Comets', color: '#00A896', icon: '☄️', score: 0, memberCount: 0 },
  { id: 'team-silver', name: 'Silver Wolves', color: '#546E7A', icon: '🐺', score: 0, memberCount: 0 },
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
    teamCount?: number;
    maxMembersPerTeam?: number;
  };
  mysteryVault: MysteryVaultSettings;
  vaultRound: VaultRoundState | null;
  vaultTransactions: VaultTransaction[];
  vaultRoundCounter: number;
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
      mysteryVault: { ...DEFAULT_MYSTERY_VAULT_SETTINGS },
      vaultRound: null,
      vaultTransactions: [],
      vaultRoundCounter: 0,
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

  configureTeams(
    sessionId: string,
    teamCount: number,
    maxMembersPerTeam: number = 0,
    customTeams?: Team[]
  ): Team[] {
    const session = this.sessions.get(sessionId);
    if (!session) return DEFAULT_TEAMS;

    session.settings.teamCount = teamCount;
    session.settings.maxMembersPerTeam = maxMembersPerTeam;

    if (customTeams && customTeams.length > 0) {
      session.teams = customTeams.map((t) => ({ ...t, maxMembers: maxMembersPerTeam }));
    } else {
      const count = Math.max(2, Math.min(teamCount, DEFAULT_TEAMS.length));
      session.teams = DEFAULT_TEAMS.slice(0, count).map((t) => ({ ...t, maxMembers: maxMembersPerTeam }));
    }

    // Reassign players whose team was removed
    const validTeamIds = new Set(session.teams.map((t) => t.id));
    session.players.forEach((p) => {
      if (p.teamId && !validTeamIds.has(p.teamId)) {
        const fallback = session.teams[0];
        p.teamId = fallback.id;
        p.teamName = fallback.name;
        p.teamColor = fallback.color;
      }
    });

    return session.teams;
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
      const maxCap = session.settings.maxMembersPerTeam || 0;

      // Count existing members per team
      const counts: Record<string, number> = {};
      availableTeams.forEach((t) => { counts[t.id] = 0; });
      session.players.forEach((p) => {
        if (p.teamId && counts[p.teamId] !== undefined) {
          counts[p.teamId]++;
        }
      });

      // Filter teams that haven't reached capacity
      const eligibleTeams = maxCap > 0
        ? availableTeams.filter((t) => (counts[t.id] || 0) < maxCap)
        : availableTeams;

      const viableTeams = eligibleTeams.length > 0 ? eligibleTeams : availableTeams;

      if (!assignedTeamId || (maxCap > 0 && (counts[assignedTeamId] || 0) >= maxCap)) {
        // Auto-balance: select viable team with fewest members
        let minTeam = viableTeams[0];
        let minCount = counts[minTeam.id] || 0;
        for (const t of viableTeams) {
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

      if (!existingPlayer.activeBuffs) {
        existingPlayer.activeBuffs = { activeShields: 0, activeStreakSavers: 0 };
      }
      if (typeof existingPlayer.vaultPointsEarned !== 'number') existingPlayer.vaultPointsEarned = 0;
      if (typeof existingPlayer.vaultPointsDeducted !== 'number') existingPlayer.vaultPointsDeducted = 0;

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
      activeBuffs: {
        activeShields: 0,
        activeStreakSavers: 0,
      },
      vaultPointsEarned: 0,
      vaultPointsDeducted: 0,
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
    if (!targetTeam) return null;

    // Check capacity cap
    const maxCap = session.settings.maxMembersPerTeam || 0;
    if (maxCap > 0) {
      const currentCount = session.players.filter((p) => p.id !== playerId && p.teamId === teamId).length;
      if (currentCount >= maxCap) {
        return null; // Team is full
      }
    }

    player.teamId = targetTeam.id;
    player.teamName = targetTeam.name;
    player.teamColor = targetTeam.color;
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

  // ─── Mystery Vault Engine ──────────────────────────────────────────

  configureMysteryVault(
    sessionId: string,
    settings: Partial<MysteryVaultSettings>
  ): MysteryVaultSettings | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.mysteryVault = {
      ...session.mysteryVault,
      ...settings,
    };

    return session.mysteryVault;
  }

  getMysteryVaultSettings(sessionId: string): MysteryVaultSettings | null {
    const session = this.sessions.get(sessionId);
    return session ? session.mysteryVault : null;
  }

  startMysteryVaultRound(sessionId: string, questionIndex: number): VaultRoundState | null {
    const session = this.sessions.get(sessionId);
    if (!session || !session.mysteryVault.enabled) return null;

    session.vaultRoundCounter = (session.vaultRoundCounter || 0) + 1;
    const roundIndex = session.vaultRoundCounter;
    const roundId = `vault-${session.code}-${roundIndex}`;
    const durationSeconds = session.mysteryVault.durationSeconds || session.mysteryVault.timeLimitSeconds || 15;

    const roundState: VaultRoundState = {
      roundIndex,
      roundId,
      questionIndex,
      status: 'selecting',
      startedAt: new Date().toISOString(),
      durationSeconds,
      timeLimitSeconds: durationSeconds,
      eligiblePlayerIds: session.players.filter((p) => p.isConnected).map((p) => p.id),
      selections: {},
      summary: {
        totalSelected: 0,
        totalEligible: session.players.filter((p) => p.isConnected).length,
        totalBonusAwarded: 0,
        totalDeducted: 0,
        shieldsConsumed: 0,
        multipliersGranted: 0,
        rewardCounts: {
          double_points: 0,
          bonus_treasure: 0,
          point_trap: 0,
          shield: 0,
          lucky_escape: 0,
          triple_boost: 0,
          streak_saver: 0,
        },
      },
    };

    session.vaultRound = roundState;
    return roundState;
  }

  recordVaultSelection(
    sessionId: string,
    playerId: string,
    vaultIndex: number,
    rng: () => number = Math.random
  ): {
    outcome: VaultRewardOutcome;
    isNew: boolean;
    round: VaultRoundState;
    transaction?: VaultTransaction;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session || !session.vaultRound || session.vaultRound.status !== 'selecting') {
      return null;
    }

    const player = session.players.find((p) => p.id === playerId);
    if (!player) return null;

    if (!player.activeBuffs) {
      player.activeBuffs = { activeShields: 0, activeStreakSavers: 0 };
    }

    const round = session.vaultRound;

    // Idempotency: If player already made a selection in this round, return existing outcome
    if (round.selections[playerId]) {
      return {
        outcome: round.selections[playerId].outcome,
        isNew: false,
        round,
      };
    }

    // Deterministically roll reward based on session probabilities & intensity
    const rewardType = MysteryVaultEngine.rollReward(session.mysteryVault, rng);
    const { outcome, shieldConsumed } = MysteryVaultEngine.generateOutcome(
      rewardType,
      session.mysteryVault,
      player.activeBuffs
    );

    // Apply buffs / consumables
    if (shieldConsumed) {
      player.activeBuffs.activeShields = Math.max(0, (player.activeBuffs.activeShields || 1) - 1);
    }
    if (outcome.shieldGranted) {
      player.activeBuffs.activeShields = (player.activeBuffs.activeShields || 0) + 1;
    }
    if (outcome.streakSaverGranted) {
      player.activeBuffs.activeStreakSavers = (player.activeBuffs.activeStreakSavers || 0) + 1;
    }
    if (outcome.multiplierGranted) {
      player.activeBuffs.activeMultiplier = {
        multiplier: outcome.multiplierGranted,
        remainingUses: 1,
        sourceRound: round.roundIndex,
        rewardType: outcome.rewardType as 'double_points' | 'triple_boost',
      };
    }

    // Apply immediate score modifications (Bonus Treasure or Point Trap)
    const prevScore = player.score;
    if (outcome.pointsDelta !== 0) {
      player.score = MysteryVaultEngine.applyScoreDelta(player.score, outcome.pointsDelta);
      if (outcome.pointsDelta > 0) {
        player.vaultPointsEarned = (player.vaultPointsEarned || 0) + outcome.pointsDelta;
      } else {
        const actualDeduction = prevScore - player.score;
        player.vaultPointsDeducted = (player.vaultPointsDeducted || 0) + actualDeduction;
      }
    }

    // Create auditable immutable transaction
    const transaction: VaultTransaction = {
      id: `tx-${round.roundIndex}-${playerId}`,
      transactionId: `tx-${round.roundIndex}-${playerId}`,
      sessionId: session.id,
      roundIndex: round.roundIndex,
      roundId: round.roundId,
      playerId,
      playerName: player.name,
      vaultBoxIndex: vaultIndex,
      rewardType: outcome.rewardType,
      pointsDelta: outcome.pointsDelta,
      scoreBefore: prevScore,
      scoreAfter: player.score,
      shieldConsumed,
      activeBuffsAfter: {
        activeShields: player.activeBuffs.activeShields,
        activeStreakSavers: player.activeBuffs.activeStreakSavers,
        ...(player.activeBuffs.activeMultiplier
          ? { activeMultiplier: { ...player.activeBuffs.activeMultiplier } }
          : {}),
      },
      timestamp: new Date().toISOString(),
      reason: `Mystery Vault selection (Chest #${vaultIndex + 1})`,
      idempotencyKey: `vault-claim-${round.roundIndex}-${playerId}`,
    };

    session.vaultTransactions.push(transaction);

    // Record selection in round
    round.selections[playerId] = {
      playerId,
      vaultIndex,
      outcome,
      timestamp: new Date().toISOString(),
      selectedAt: new Date().toISOString(),
      idempotencyKey: transaction.idempotencyKey,
    };

    return {
      outcome,
      isNew: true,
      round,
      transaction,
    };
  }

  closeVaultSelection(sessionId: string): {
    summary: VaultAggregateSummaryPayload;
    round: VaultRoundState;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session || !session.vaultRound) return null;

    const round = session.vaultRound;
    round.status = 'revealed';
    round.closedAt = new Date().toISOString();

    // Any eligible connected player who did not pick gets a default safe escape
    for (const pid of round.eligiblePlayerIds) {
      if (!round.selections[pid]) {
        const fallbackOutcome = MysteryVaultEngine.generateOutcome(
          'lucky_escape',
          session.mysteryVault,
          { activeShields: 0, activeStreakSavers: 0 }
        ).outcome;
        round.selections[pid] = {
          playerId: pid,
          vaultIndex: 0,
          outcome: fallbackOutcome,
          timestamp: new Date().toISOString(),
          selectedAt: new Date().toISOString(),
          idempotencyKey: `auto-${round.roundIndex}-${pid}`,
        };
      }
    }

    const selectionsList = Object.values(round.selections);
    const rewardDistribution: Record<any, number> = {
      double_points: 0,
      bonus_treasure: 0,
      point_trap: 0,
      shield: 0,
      lucky_escape: 0,
      triple_boost: 0,
      streak_saver: 0,
    };

    let totalPointsAwarded = 0;
    let totalPointsDeducted = 0;

    for (const sel of selectionsList) {
      const type = sel.outcome.rewardType;
      rewardDistribution[type] = (rewardDistribution[type] || 0) + 1;
      if (sel.outcome.pointsDelta > 0) {
        totalPointsAwarded += sel.outcome.pointsDelta;
      } else if (sel.outcome.pointsDelta < 0) {
        totalPointsDeducted += Math.abs(sel.outcome.pointsDelta);
      }
    }

    const shieldsActive = session.players.reduce(
      (acc, p) => acc + (p.activeBuffs?.activeShields || 0),
      0
    );

    round.summary = {
      totalSelected: selectionsList.length,
      totalEligible: round.eligiblePlayerIds.length,
      totalBonusAwarded: totalPointsAwarded,
      totalDeducted: totalPointsDeducted,
      shieldsConsumed: 0,
      multipliersGranted: (rewardDistribution.double_points || 0) + (rewardDistribution.triple_boost || 0),
      rewardCounts: rewardDistribution as any,
    };

    const summaryPayload: VaultAggregateSummaryPayload = {
      roundIndex: round.roundIndex,
      roundId: round.roundId,
      questionIndex: round.questionIndex,
      totalParticipants: round.eligiblePlayerIds.length,
      totalSelected: selectionsList.length,
      rewardDistribution,
      totalPointsAwarded,
      totalPointsDeducted,
      shieldsActive,
      summary: round.summary,
      leaderboard: this.getLeaderboard(sessionId),
      teamLeaderboard: this.getTeamLeaderboard(sessionId),
    };

    return { summary: summaryPayload, round };
  }

  skipVaultRound(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.vaultRound) return false;
    session.vaultRound.status = 'skipped';
    session.vaultRound = null;
    return true;
  }

  completeVaultRound(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.vaultRound) return false;
    session.vaultRound.status = 'completed';
    session.vaultRound = null;
    return true;
  }

  applyMultiplierToAnswer(
    sessionId: string,
    playerId: string,
    basePoints: number,
    questionId: string
  ): {
    finalPoints: number;
    multiplierApplied: number;
    bonusPoints: number;
    transaction?: VaultTransaction;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) return { finalPoints: basePoints, multiplierApplied: 1, bonusPoints: 0 };

    const player = session.players.find((p) => p.id === playerId);
    if (!player || !player.activeBuffs?.activeMultiplier || player.activeBuffs.activeMultiplier.remainingUses <= 0) {
      return { finalPoints: basePoints, multiplierApplied: 1, bonusPoints: 0 };
    }

    const buff = player.activeBuffs.activeMultiplier;
    const maxMultiplier = session.mysteryVault.maxBonusMultiplier || 3;
    const effectiveMultiplier = Math.min(buff.multiplier, maxMultiplier);
    const calculated = Math.round(basePoints * effectiveMultiplier);
    const bonus = calculated - basePoints;

    // Consume multiplier
    delete player.activeBuffs.activeMultiplier;

    // Log transaction
    const transaction: VaultTransaction = {
      id: `tx-mult-${session.id}-${questionId}-${playerId}`,
      transactionId: `tx-mult-${session.id}-${questionId}-${playerId}`,
      sessionId: session.id,
      roundIndex: session.vaultRoundCounter,
      playerId,
      playerName: player.name,
      vaultBoxIndex: 0,
      rewardType: (buff.rewardType || 'double_points') as MysteryVaultRewardType,
      pointsDelta: bonus,
      scoreBefore: player.score,
      scoreAfter: player.score + bonus,
      shieldConsumed: false,
      multiplierApplied: effectiveMultiplier,
      activeBuffsAfter: { ...player.activeBuffs },
      timestamp: new Date().toISOString(),
      reason: `${effectiveMultiplier}x Multiplier applied on correct answer for question ${questionId}`,
      idempotencyKey: `mult-apply-${questionId}-${playerId}`,
    };
    session.vaultTransactions.push(transaction);

    return {
      finalPoints: calculated,
      multiplierApplied: effectiveMultiplier,
      bonusPoints: bonus,
      transaction,
    };
  }

  applyStreakSaver(sessionId: string, playerId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const player = session.players.find((p) => p.id === playerId);
    if (!player || !player.activeBuffs || (player.activeBuffs.activeStreakSavers || 0) <= 0) {
      return false;
    }

    // Consume 1 streak saver
    player.activeBuffs.activeStreakSavers = Math.max(0, player.activeBuffs.activeStreakSavers - 1);
    return true;
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
