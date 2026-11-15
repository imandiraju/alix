import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_MYSTERY_VAULT_SETTINGS,
  DEFAULT_MYSTERY_VAULT_PROBABILITIES,
  MysteryVaultSettings,
} from '@alix/shared';
import { MysteryVaultEngine } from '../engine/MysteryVaultEngine.js';
import { GameSessionManager } from '../engine/GameSession.js';

describe('ALIX Mystery Vault Engine & Mechanics', () => {
  it('validates reward probabilities summing to 100%', () => {
    const validProbs = { ...DEFAULT_MYSTERY_VAULT_PROBABILITIES.balanced };
    assert.strictEqual(MysteryVaultEngine.validateProbabilities(validProbs), true);

    const invalidProbs = { ...validProbs, point_trap: 50 }; // Sums to 135
    assert.strictEqual(MysteryVaultEngine.validateProbabilities(invalidProbs), false);

    const negativeProbs = { ...validProbs, shield: -15, lucky_escape: 30 }; // Has negative
    assert.strictEqual(MysteryVaultEngine.validateProbabilities(negativeProbs), false);
  });

  it('redistributes point_trap probabilities when allowNegative is false', () => {
    const settings: MysteryVaultSettings = {
      ...DEFAULT_MYSTERY_VAULT_SETTINGS,
      intensity: 'balanced',
      allowNegative: false,
    };

    const effective = MysteryVaultEngine.getEffectiveProbabilities(settings);
    assert.strictEqual(effective.point_trap, 0, 'Point trap must be zeroed');
    assert.strictEqual(MysteryVaultEngine.validateProbabilities(effective), true, 'Redistributed total must still be 100%');
    assert.ok(effective.bonus_treasure > DEFAULT_MYSTERY_VAULT_PROBABILITIES.balanced.bonus_treasure);
    assert.ok(effective.lucky_escape > DEFAULT_MYSTERY_VAULT_PROBABILITIES.balanced.lucky_escape);
  });

  it('guarantees score floor at zero (score never drops negative)', () => {
    assert.strictEqual(MysteryVaultEngine.applyScoreDelta(100, -200), 0);
    assert.strictEqual(MysteryVaultEngine.applyScoreDelta(0, -300), 0);
    assert.strictEqual(MysteryVaultEngine.applyScoreDelta(500, -200), 300);
    assert.strictEqual(MysteryVaultEngine.applyScoreDelta(200, 300), 500);
  });

  it('deflects point traps when player has an active shield', () => {
    const settings: MysteryVaultSettings = { ...DEFAULT_MYSTERY_VAULT_SETTINGS };

    // With active shield
    const shielded = MysteryVaultEngine.generateOutcome('point_trap', settings, {
      activeShields: 1,
      activeStreakSavers: 0,
    });
    assert.strictEqual(shielded.shieldConsumed, true);
    assert.strictEqual(shielded.outcome.pointsDelta, 0);
    assert.strictEqual(shielded.outcome.isBlockedByShield, true);

    // Without shield
    const unshielded = MysteryVaultEngine.generateOutcome('point_trap', settings, {
      activeShields: 0,
      activeStreakSavers: 0,
    });
    assert.strictEqual(unshielded.shieldConsumed, false);
    assert.strictEqual(unshielded.outcome.pointsDelta, -settings.trapPoints);
    assert.strictEqual(unshielded.outcome.isBlockedByShield, undefined);
  });

  it('handles full round selection, idempotency, and duplicate claim rejection in GameSession', () => {
    const manager = new GameSessionManager();
    const session = manager.createSession('quiz-test-1', 'host-1');
    const player = manager.addPlayer(session.id, 'socket-player-1', 'Alex Hero', 'fox');
    assert.ok(player);

    // Configure mystery vault
    manager.configureMysteryVault(session.id, {
      enabled: true,
      frequency: 2,
      intensity: 'balanced',
      allowNegative: true,
    });

    // Start round
    const round = manager.startMysteryVaultRound(session.id, 1);
    assert.ok(round);
    assert.strictEqual(round.status, 'selecting');
    assert.strictEqual(round.eligiblePlayerIds.includes(player.id), true);

    // Player selects vault index 1 (rng 0.05 -> double_points in balanced distribution)
    const selectRes1 = manager.recordVaultSelection(session.id, player.id, 1, () => 0.05);
    assert.ok(selectRes1);
    assert.strictEqual(selectRes1.isNew, true);
    assert.strictEqual(selectRes1.outcome.rewardType, 'double_points');
    assert.strictEqual(player.activeBuffs?.activeMultiplier?.multiplier, 2);

    // Duplicate selection attempt by same player in same round
    const selectRes2 = manager.recordVaultSelection(session.id, player.id, 2, () => 0.99);
    assert.ok(selectRes2);
    assert.strictEqual(selectRes2.isNew, false, 'Duplicate selection must be flagged as not new');
    assert.strictEqual(selectRes2.outcome.rewardType, 'double_points', 'Outcome must remain idempotent');

    // Close vault round
    const closeRes = manager.closeVaultSelection(session.id);
    assert.ok(closeRes);
    assert.strictEqual(closeRes.round.status, 'revealed');
    assert.strictEqual(closeRes.summary.totalSelected, 1);

    // Answer next question correctly and test multiplier consumption
    const multRes = manager.applyMultiplierToAnswer(session.id, player.id, 1000, 'q-2');
    assert.strictEqual(multRes.multiplierApplied, 2);
    assert.strictEqual(multRes.finalPoints, 2000);
    assert.strictEqual(multRes.bonusPoints, 1000);
    assert.strictEqual(player.activeBuffs?.activeMultiplier, undefined, 'Multiplier must be consumed');

    // A second answer should receive 1x base points (multiplier was consumed)
    const multRes2 = manager.applyMultiplierToAnswer(session.id, player.id, 1000, 'q-3');
    assert.strictEqual(multRes2.multiplierApplied, 1);
    assert.strictEqual(multRes2.finalPoints, 1000);
  });

  it('preserves answer streak when streak saver is active and consumed on wrong answer', () => {
    const manager = new GameSessionManager();
    const session = manager.createSession('quiz-test-2', 'host-2');
    const player = manager.addPlayer(session.id, 'socket-player-2', 'Sam Champion', 'wolf');
    assert.ok(player);

    // Grant streak saver
    player.activeBuffs = { activeShields: 0, activeStreakSavers: 1 };
    player.streak = 5;

    // Apply streak saver on incorrect answer
    const saved = manager.applyStreakSaver(session.id, player.id);
    assert.strictEqual(saved, true, 'Streak saver must successfully trigger');
    assert.strictEqual(player.activeBuffs.activeStreakSavers, 0, 'Streak saver count must decrement to 0');

    // Next streak saver attempt fails because none left
    const savedAgain = manager.applyStreakSaver(session.id, player.id);
    assert.strictEqual(savedAgain, false, 'Streak saver cannot trigger when count is 0');
  });
});
