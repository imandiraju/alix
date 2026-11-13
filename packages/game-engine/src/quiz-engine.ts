// ─── Quiz Game Engine ───────────────────────────────────────────────────────
// State machine for managing the lifecycle of a live quiz session.

import type { Question, Quiz } from '@alix/shared';
import { SCORE_CONSTANTS } from '@alix/shared';

export type QuizPhase = 'idle' | 'lobby' | 'countdown' | 'question' | 'review' | 'leaderboard' | 'finished';

export interface QuizEngineState {
  phase: QuizPhase;
  quiz: Quiz | null;
  currentQuestionIndex: number;
  timeRemaining: number;
  totalQuestions: number;
  isLastQuestion: boolean;
}

export interface QuizEngineCallbacks {
  onPhaseChange: (phase: QuizPhase) => void;
  onTimerTick: (remaining: number, total: number) => void;
  onQuestionStart: (question: Question, index: number) => void;
  onQuestionEnd: (questionId: string) => void;
  onGameFinish: () => void;
}

export class QuizEngine {
  private state: QuizEngineState;
  private callbacks: Partial<QuizEngineCallbacks>;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(callbacks: Partial<QuizEngineCallbacks> = {}) {
    this.callbacks = callbacks;
    this.state = {
      phase: 'idle',
      quiz: null,
      currentQuestionIndex: -1,
      timeRemaining: 0,
      totalQuestions: 0,
      isLastQuestion: false,
    };
  }

  getState(): Readonly<QuizEngineState> {
    return { ...this.state };
  }

  loadQuiz(quiz: Quiz): void {
    this.state.quiz = quiz;
    this.state.totalQuestions = quiz.questions.length;
    this.state.currentQuestionIndex = -1;
    this.setPhase('lobby');
  }

  startGame(): void {
    if (!this.state.quiz || this.state.phase !== 'lobby') return;
    this.state.currentQuestionIndex = -1;
    this.nextQuestion();
  }

  nextQuestion(): void {
    if (!this.state.quiz) return;

    this.clearTimer();
    this.state.currentQuestionIndex++;

    if (this.state.currentQuestionIndex >= this.state.totalQuestions) {
      this.finishGame();
      return;
    }

    const question = this.state.quiz.questions[this.state.currentQuestionIndex];
    this.state.isLastQuestion =
      this.state.currentQuestionIndex === this.state.totalQuestions - 1;

    this.setPhase('countdown');

    // 3-second countdown before question starts
    setTimeout(() => {
      this.setPhase('question');
      this.state.timeRemaining = question.timeLimit;
      this.callbacks.onQuestionStart?.(question, this.state.currentQuestionIndex);
      this.startTimer(question.timeLimit);
    }, 3000);
  }

  endQuestion(): void {
    this.clearTimer();
    const question = this.state.quiz?.questions[this.state.currentQuestionIndex];
    if (question) {
      this.callbacks.onQuestionEnd?.(question.id);
    }
    this.setPhase('review');
  }

  showLeaderboard(): void {
    this.setPhase('leaderboard');
  }

  finishGame(): void {
    this.clearTimer();
    this.setPhase('finished');
    this.callbacks.onGameFinish?.();
  }

  destroy(): void {
    this.clearTimer();
    this.state.phase = 'idle';
    this.state.quiz = null;
  }

  // ─── Score Calculation ──────────────────────────────────────────────────

  static calculateScore(
    correct: boolean,
    timeMs: number,
    timeLimitMs: number,
    streak: number,
  ): number {
    if (!correct) return 0;

    const { BASE_POINTS, SPEED_BONUS_MAX, STREAK_BONUS_MULTIPLIER, MAX_STREAK_BONUS, MIN_POINTS } =
      SCORE_CONSTANTS;

    // Speed bonus: faster answers get more points
    const timeRatio = Math.max(0, 1 - timeMs / timeLimitMs);
    const speedBonus = Math.round(timeRatio * SPEED_BONUS_MAX);

    // Streak bonus: consecutive correct answers earn a multiplier
    const streakMultiplier = 1 + Math.min(streak * STREAK_BONUS_MULTIPLIER, MAX_STREAK_BONUS);

    const rawScore = (BASE_POINTS + speedBonus) * streakMultiplier;
    return Math.max(MIN_POINTS, Math.round(rawScore));
  }

  // ─── Private ────────────────────────────────────────────────────────────

  private setPhase(phase: QuizPhase): void {
    this.state.phase = phase;
    this.callbacks.onPhaseChange?.(phase);
  }

  private startTimer(seconds: number): void {
    this.state.timeRemaining = seconds;
    const total = seconds;

    this.timerInterval = setInterval(() => {
      this.state.timeRemaining--;
      this.callbacks.onTimerTick?.(this.state.timeRemaining, total);

      if (this.state.timeRemaining <= 0) {
        this.endQuestion();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
