// ─── Mystery Vault Domain Types & Constants ──────────────────────────────────

export type MysteryVaultRewardType =
  | 'double_points'
  | 'bonus_treasure'
  | 'point_trap'
  | 'shield'
  | 'lucky_escape'
  | 'triple_boost'
  | 'streak_saver';

export type RewardIntensity = 'low' | 'balanced' | 'high';

export interface MysteryVaultSettings {
  enabled: boolean;
  frequency: number; // e.g., every 2, 3, or 5 questions
  intensity: RewardIntensity;
  allowNegative: boolean; // if false, point_trap is disabled/redistributed
  maxBonusMultiplier: number; // cap on multiplier (default 3)
  maxDeduction: number; // maximum points deducted in a trap (default 300)
  bonusPoints: number; // fixed points for bonus treasure (default 300)
  trapPoints: number; // fixed points deducted for point trap (default 200)
  durationSeconds?: number;
  timeLimitSeconds?: number;
  probabilities?: Record<MysteryVaultRewardType, number>;
}

export interface PlayerActiveBuffs {
  activeMultiplier?: {
    multiplier: number;
    remainingUses: number;
    sourceRound?: number;
    rewardType?: 'double_points' | 'triple_boost';
  };
  activeShields: number;
  activeStreakSavers: number;
}

export interface VaultRewardOutcome {
  rewardType: MysteryVaultRewardType;
  title: string;
  description: string;
  icon: string;
  pointsDelta: number; // e.g. +300, -200, or 0
  isBlockedByShield?: boolean;
  multiplierGranted?: number;
  shieldGranted?: boolean;
  streakSaverGranted?: boolean;
}

export interface VaultTransaction {
  id?: string;
  transactionId?: string;
  sessionId: string;
  playerId: string;
  playerName: string;
  rollNo?: string;
  roundIndex?: number;
  roundId?: string;
  vaultBoxIndex?: number;
  rewardType: MysteryVaultRewardType;
  pointsDelta: number;
  scoreBefore?: number;
  scoreAfter?: number;
  shieldConsumed?: boolean;
  multiplierApplied?: number;
  streakSaverConsumed?: boolean;
  activeBuffsAfter?: any;
  timestamp: string;
  reason: string;
  idempotencyKey: string;
}

export interface VaultRoundSummary {
  totalSelected: number;
  totalEligible: number;
  totalBonusAwarded: number;
  totalDeducted: number;
  shieldsConsumed: number;
  multipliersGranted: number;
  rewardCounts: Record<MysteryVaultRewardType, number>;
}

export interface VaultRoundState {
  roundIndex: number;
  roundId?: string;
  questionIndex: number;
  status: 'selecting' | 'revealed' | 'completed' | 'skipped';
  startedAt: string;
  expiresAt?: string;
  closedAt?: string;
  durationSeconds: number;
  timeLimitSeconds?: number;
  eligiblePlayerIds: string[];
  selections: Record<
    string,
    {
      playerId?: string;
      vaultIndex: number;
      outcome: VaultRewardOutcome;
      timestamp: string;
      selectedAt?: string;
      idempotencyKey?: string;
    }
  >;
  summary: VaultRoundSummary;
}

export const DEFAULT_MYSTERY_VAULT_PROBABILITIES: Record<
  RewardIntensity,
  Record<MysteryVaultRewardType, number>
> = {
  balanced: {
    double_points: 20,
    bonus_treasure: 20,
    point_trap: 15,
    shield: 15,
    lucky_escape: 15,
    triple_boost: 10,
    streak_saver: 5,
  },
  low: {
    double_points: 25,
    bonus_treasure: 25,
    point_trap: 5,
    shield: 20,
    lucky_escape: 20,
    triple_boost: 0,
    streak_saver: 5,
  },
  high: {
    double_points: 15,
    bonus_treasure: 15,
    point_trap: 25,
    shield: 10,
    lucky_escape: 10,
    triple_boost: 20,
    streak_saver: 5,
  },
};

export const DEFAULT_MYSTERY_VAULT_SETTINGS: MysteryVaultSettings = {
  enabled: false,
  frequency: 3, // every 3 questions by default
  intensity: 'balanced',
  allowNegative: true,
  maxBonusMultiplier: 3,
  maxDeduction: 300,
  bonusPoints: 300,
  trapPoints: 200,
};
