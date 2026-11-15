import {
  DEFAULT_MYSTERY_VAULT_PROBABILITIES,
  DEFAULT_MYSTERY_VAULT_SETTINGS,
  MysteryVaultRewardType,
  MysteryVaultSettings,
  PlayerActiveBuffs,
  VaultRewardOutcome,
} from '@alix/shared';

export class MysteryVaultEngine {
  /**
   * Validate that all reward probabilities are >= 0 and sum to 100 within a 0.01 tolerance.
   */
  static validateProbabilities(probabilities: Record<MysteryVaultRewardType, number>): boolean {
    const keys: MysteryVaultRewardType[] = [
      'double_points',
      'bonus_treasure',
      'point_trap',
      'shield',
      'lucky_escape',
      'triple_boost',
      'streak_saver',
    ];

    let total = 0;
    for (const key of keys) {
      const val = probabilities[key];
      if (typeof val !== 'number' || isNaN(val) || val < 0) {
        return false;
      }
      total += val;
    }

    return Math.abs(total - 100) < 0.01;
  }

  /**
   * Resolve the active probability distribution based on settings and allowNegative flag.
   */
  static getEffectiveProbabilities(settings: MysteryVaultSettings): Record<MysteryVaultRewardType, number> {
    const intensity = settings.intensity || 'balanced';
    const baseProbs = settings.probabilities && this.validateProbabilities(settings.probabilities)
      ? { ...settings.probabilities }
      : { ...DEFAULT_MYSTERY_VAULT_PROBABILITIES[intensity] };

    // If negative rewards (point_trap) are disabled by host:
    if (!settings.allowNegative && baseProbs.point_trap > 0) {
      const trapWeight = baseProbs.point_trap;
      baseProbs.point_trap = 0;

      // Distribute trap weight evenly to bonus_treasure and lucky_escape
      const bonusAdd = Math.floor(trapWeight / 2);
      const luckyAdd = trapWeight - bonusAdd;
      baseProbs.bonus_treasure += bonusAdd;
      baseProbs.lucky_escape += luckyAdd;
    }

    return baseProbs;
  }

  /**
   * Deterministically roll a reward type based on effective probabilities.
   * rng: optional custom random generator (returns number in [0, 1)) for unit testing.
   */
  static rollReward(
    settings: MysteryVaultSettings,
    rng: () => number = Math.random
  ): MysteryVaultRewardType {
    const probs = this.getEffectiveProbabilities(settings);
    const randPct = rng() * 100; // in [0, 100)

    const rewardOrder: MysteryVaultRewardType[] = [
      'double_points',
      'bonus_treasure',
      'point_trap',
      'shield',
      'lucky_escape',
      'triple_boost',
      'streak_saver',
    ];

    let cumulative = 0;
    for (const type of rewardOrder) {
      cumulative += probs[type] || 0;
      if (randPct < cumulative) {
        return type;
      }
    }

    return 'lucky_escape'; // fallback
  }

  /**
   * Generate reward metadata, evaluate point changes, and process shield deflection.
   */
  static generateOutcome(
    rewardType: MysteryVaultRewardType,
    settings: MysteryVaultSettings,
    activeBuffs: PlayerActiveBuffs
  ): { outcome: VaultRewardOutcome; shieldConsumed: boolean } {
    let shieldConsumed = false;
    let isBlockedByShield = false;
    let pointsDelta = 0;
    let multiplierGranted: number | undefined;
    let shieldGranted: boolean | undefined;
    let streakSaverGranted: boolean | undefined;

    const bonusAmount = settings.bonusPoints || DEFAULT_MYSTERY_VAULT_SETTINGS.bonusPoints;
    const trapAmount = Math.min(
      settings.trapPoints || DEFAULT_MYSTERY_VAULT_SETTINGS.trapPoints,
      settings.maxDeduction || DEFAULT_MYSTERY_VAULT_SETTINGS.maxDeduction
    );
    const maxMultiplier = settings.maxBonusMultiplier || DEFAULT_MYSTERY_VAULT_SETTINGS.maxBonusMultiplier;

    switch (rewardType) {
      case 'double_points':
        multiplierGranted = 2;
        return {
          outcome: {
            rewardType,
            title: '2x Double Points!',
            description: 'Doubles your earned score on your next correct answer!',
            icon: '⚡',
            pointsDelta: 0,
            multiplierGranted,
          },
          shieldConsumed,
        };

      case 'triple_boost':
        multiplierGranted = Math.min(3, maxMultiplier);
        return {
          outcome: {
            rewardType,
            title: '3x Triple Boost!',
            description: 'Triples your earned score on your next correct answer!',
            icon: '🚀',
            pointsDelta: 0,
            multiplierGranted,
          },
          shieldConsumed,
        };

      case 'bonus_treasure':
        pointsDelta = bonusAmount;
        return {
          outcome: {
            rewardType,
            title: `+${bonusAmount.toLocaleString()} Bonus Treasure!`,
            description: `Instantly awarded +${bonusAmount.toLocaleString()} points to your score!`,
            icon: '💎',
            pointsDelta,
          },
          shieldConsumed,
        };

      case 'point_trap':
        if (activeBuffs.activeShields > 0) {
          shieldConsumed = true;
          isBlockedByShield = true;
          pointsDelta = 0;
          return {
            outcome: {
              rewardType,
              title: 'Point Trap Deflected!',
              description: `A -${trapAmount} point trap was blocked by your active Shield! No points lost.`,
              icon: '🛡️',
              pointsDelta: 0,
              isBlockedByShield: true,
            },
            shieldConsumed: true,
          };
        } else {
          pointsDelta = -trapAmount;
          return {
            outcome: {
              rewardType,
              title: `-${trapAmount.toLocaleString()} Point Trap!`,
              description: `Lost ${trapAmount.toLocaleString()} points from the mystery trap!`,
              icon: '⚠️',
              pointsDelta,
            },
            shieldConsumed: false,
          };
        }

      case 'shield':
        shieldGranted = true;
        return {
          outcome: {
            rewardType,
            title: 'Vault Aegis Shield!',
            description: 'Protects you from your next negative vault penalty!',
            icon: '🛡️',
            pointsDelta: 0,
            shieldGranted: true,
          },
          shieldConsumed,
        };

      case 'streak_saver':
        streakSaverGranted = true;
        return {
          outcome: {
            rewardType,
            title: 'Streak Saver Flame!',
            description: 'Prevents your answer streak from breaking if you miss the next question!',
            icon: '🔥',
            pointsDelta: 0,
            streakSaverGranted: true,
          },
          shieldConsumed,
        };

      case 'lucky_escape':
      default:
        return {
          outcome: {
            rewardType: 'lucky_escape',
            title: 'Lucky Escape!',
            description: 'No points gained or lost. Safe passage through the vault!',
            icon: '🍀',
            pointsDelta: 0,
          },
          shieldConsumed,
        };
    }
  }

  /**
   * Authoritative calculation ensuring score never drops below 0.
   */
  static applyScoreDelta(currentScore: number, pointsDelta: number): number {
    return Math.max(0, currentScore + pointsDelta);
  }
}
