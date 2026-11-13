import React from 'react';
import { CheckCircle2, XCircle, Zap, Flame } from 'lucide-react';

export interface ScorePopupProps {
  isCorrect: boolean;
  basePoints: number;
  speedBonus: number;
  streak: number;
  rank: number;
  onNext?: () => void;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  isCorrect,
  basePoints,
  speedBonus,
  streak,
  rank,
  onNext,
}) => {
  const totalEarned = isCorrect ? basePoints + speedBonus : 0;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-alix-slate-200 shadow-alix-lg p-6 sm:p-8 text-center animate-scale-in">
      {/* Icon result header */}
      <div className="flex justify-center mb-4">
        {isCorrect ? (
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center ring-8 ring-rose-50">
            <XCircle className="w-10 h-10" />
          </div>
        )}
      </div>

      <h3 className="text-2xl font-heading font-black text-alix-indigo mb-1">
        {isCorrect ? 'Outstanding!' : 'Not Quite!'}
      </h3>
      <p className="text-sm text-alix-slate-500 mb-6">
        {isCorrect
          ? 'Speed bonus awarded for rapid response.'
          : 'Review the concept breakdown in the host discussion.'}
      </p>

      {/* Points Breakdown Box */}
      {isCorrect && (
        <div className="bg-alix-slate-50 rounded-xl p-4 mb-6 space-y-2 border border-alix-slate-200">
          <div className="flex justify-between text-sm text-alix-slate-600">
            <span>Accuracy Points</span>
            <span className="font-mono font-semibold text-alix-indigo">+{basePoints}</span>
          </div>
          <div className="flex justify-between text-sm text-alix-slate-600">
            <span className="flex items-center gap-1 text-alix-cyan-600">
              <Zap className="w-3.5 h-3.5" /> Speed Bonus
            </span>
            <span className="font-mono font-semibold text-alix-cyan-600">+{speedBonus}</span>
          </div>
          <div className="pt-2 border-t border-alix-slate-200 flex justify-between text-base font-bold text-alix-indigo">
            <span>Total Gained</span>
            <span className="font-mono text-alix-violet-700">+{totalEarned} pts</span>
          </div>
        </div>
      )}

      {/* Rank & Streak summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-alix-violet-50 text-alix-violet-900 border border-alix-violet-200">
          <div className="text-xs font-semibold text-alix-violet-600 uppercase">Rank</div>
          <div className="text-2xl font-black font-mono">#{rank}</div>
        </div>
        <div className="p-3 rounded-lg bg-alix-coral-50 text-alix-coral-900 border border-alix-coral-200">
          <div className="text-xs font-semibold text-alix-coral-600 uppercase flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 fill-current" /> Streak
          </div>
          <div className="text-2xl font-black font-mono">{streak}x</div>
        </div>
      </div>

      {onNext && (
        <button
          onClick={onNext}
          className="w-full py-3 px-4 rounded-xl bg-alix-indigo hover:bg-alix-indigo/90 text-white font-semibold text-sm transition-all shadow-sm"
        >
          View Standings →
        </button>
      )}
    </div>
  );
};

export default ScorePopup;
