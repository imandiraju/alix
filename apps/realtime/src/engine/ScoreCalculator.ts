// ─── Score Calculator ────────────────────────────────────────────────────────
// Calculates points awarded for a quiz answer based on correctness, speed,
// and answer streak.

import { SCORE_CONSTANTS } from '@alix/shared';

/**
 * Calculate score for a single answer.
 *
 * @param correct   Whether the answer was correct
 * @param timeMs    Time taken to answer in milliseconds
 * @param timeLimitMs  Total time limit for the question in milliseconds
 * @param streak    Current consecutive correct answer streak (before this answer)
 * @returns         Points awarded (0 if incorrect)
 */
export function calculateScore(
  correct: boolean,
  timeMs: number,
  timeLimitMs: number,
  streak: number,
): number {
  if (!correct) return 0;

  const { BASE_POINTS, SPEED_BONUS_MAX, STREAK_BONUS_MULTIPLIER, MAX_STREAK_BONUS, MIN_POINTS } =
    SCORE_CONSTANTS;

  // ─── Speed Bonus ────────────────────────────────────────────────────
  // Answering faster gives a higher bonus, linearly scaled.
  // If answered instantly → full bonus. At time limit → 0 bonus.
  const timeRatio = Math.max(0, Math.min(1, 1 - timeMs / timeLimitMs));
  const speedBonus = Math.round(timeRatio * SPEED_BONUS_MAX);

  // ─── Streak Bonus ──────────────────────────────────────────────────
  // Each consecutive correct answer adds a 10% multiplier,
  // capped at 50% (5 streak).
  const streakMultiplier = 1 + Math.min(streak * STREAK_BONUS_MULTIPLIER, MAX_STREAK_BONUS);

  // ─── Final Score ───────────────────────────────────────────────────
  const rawScore = (BASE_POINTS + speedBonus) * streakMultiplier;
  return Math.max(MIN_POINTS, Math.round(rawScore));
}

/**
 * Calculate the theoretical maximum score for a question.
 */
export function getMaxPossibleScore(streak: number): number {
  return calculateScore(true, 0, 1, streak);
}

/**
 * Calculate the minimum score for a correct answer.
 */
export function getMinCorrectScore(): number {
  return SCORE_CONSTANTS.MIN_POINTS;
}
