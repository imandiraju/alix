import confetti from 'canvas-confetti';

/**
 * Fires an explosive celebratory cannon burst using ALIX brand colors:
 * Electric Violet (#7C3AED), Cyan (#06B6D4), Coral (#F97316), Gold (#FBBF24).
 */
export const triggerCorrectAnswerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#7C3AED', '#06B6D4', '#F97316', '#FBBF24', '#10B981'],
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
  });
};

/**
 * High-intensity victory podium celebration cannon (dual sides + center burst).
 */
export const triggerVictoryPodiumCelebration = () => {
  const duration = 3.5 * 1000;
  const end = Date.now() + duration;

  const colors = ['#7C3AED', '#06B6D4', '#F97316', '#FBBF24', '#FFFFFF'];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

/**
 * Streak multiplier flame burst.
 */
export const triggerStreakBurst = () => {
  confetti({
    particleCount: 50,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#F97316', '#EF4444', '#F59E0B'],
    shapes: ['circle'],
    ticks: 150,
  });
};
