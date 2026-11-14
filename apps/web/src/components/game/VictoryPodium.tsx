import React, { useEffect } from 'react';
import { Trophy, Crown, Sparkles, RotateCcw } from 'lucide-react';
import { triggerVictoryPodiumCelebration } from './CelebrationEffects';
import { RenderAvatarSvg } from './AlixSvgAvatars';

export interface PodiumWinner {
  rank: number;
  name: string;
  score: number;
  avatarId?: string;
  streak: number;
}

export interface VictoryPodiumProps {
  winners: PodiumWinner[];
  onRestart?: () => void;
}

export const VictoryPodium: React.FC<VictoryPodiumProps> = ({
  winners,
  onRestart,
}) => {
  useEffect(() => {
    // Fire confetti cannon automatically on podium entrance
    triggerVictoryPodiumCelebration();
  }, []);

  const first = winners.find((w) => w.rank === 1);
  const second = winners.find((w) => w.rank === 2);
  const third = winners.find((w) => w.rank === 3);

  return (
    <div className="w-full flex flex-col items-center animate-fade-in text-white select-none">
      {/* Banner */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Active Learning Champions</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white">
          Classroom Victory Podium
        </h2>
        <p className="text-sm text-slate-300">
          Where every learner participated and mastery was achieved!
        </p>
      </div>

      {/* 3D-Styled Pedestals */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 w-full max-w-2xl px-4 pt-12 pb-6">
        {/* 2nd Place (Silver) */}
        <div className="flex-1 flex flex-col items-center animate-[alix-fade-up_0.6s_ease-out]">
          {/* Avatar & Info */}
          {second ? (
            <div className="flex flex-col items-center mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 flex items-center justify-center shadow-lg border-2 border-slate-300 relative p-1.5">
                <RenderAvatarSvg avatarId={second.avatarId || 'bot'} size={56} />
                <div className="absolute -top-2.5 -right-2 w-6 h-6 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-heading font-black text-[11px] text-slate-800">
                  2
                </div>
              </div>
              <div className="font-heading font-bold text-sm sm:text-base text-white mt-2 truncate max-w-[110px] text-center">
                {second.name}
              </div>
              <div className="font-mono text-xs sm:text-sm text-slate-300 font-bold">
                {(second.score ?? 0).toLocaleString()} pts
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-3 opacity-40">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-slate-400/50 flex items-center justify-center">
                <span className="text-slate-400 font-mono text-lg">—</span>
              </div>
              <div className="font-heading font-bold text-xs text-slate-400 mt-2">
                Unclaimed
              </div>
              <div className="font-mono text-[11px] text-slate-500">—</div>
            </div>
          )}
          {/* Silver Step */}
          <div className="w-full h-36 sm:h-44 rounded-t-2xl bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700 border-t-4 border-slate-300 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="text-4xl sm:text-6xl font-black font-heading text-slate-200/50">
              2
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Silver
            </div>
          </div>
        </div>

        {/* 1st Place (Gold / Champion) */}
        <div className="flex-1 flex flex-col items-center -mt-8 animate-[alix-fade-up_0.8s_ease-out]">
          {/* Crown & Avatar */}
          {first ? (
            <div className="flex flex-col items-center mb-3 relative">
              <Crown className="w-8 h-8 text-amber-400 animate-bounce absolute -top-8" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-alix-glow ring-4 ring-amber-400/80 border-2 border-white relative p-1.5">
                <RenderAvatarSvg avatarId={first.avatarId || 'fox'} size={68} />
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 border-2 border-white shadow-md flex items-center justify-center font-heading font-black text-xs text-amber-950">
                  1
                </div>
              </div>
              <div className="font-heading font-black text-base sm:text-lg text-amber-300 mt-2 truncate max-w-[130px] text-center">
                {first.name}
              </div>
              <div className="font-mono text-sm sm:text-base text-white font-black">
                {(first.score ?? 0).toLocaleString()} pts
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-3 opacity-40">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-amber-400/50 flex items-center justify-center">
                <span className="text-amber-300 font-mono text-xl">—</span>
              </div>
              <div className="font-heading font-bold text-xs text-amber-300 mt-2">
                Awaiting Players
              </div>
              <div className="font-mono text-[11px] text-amber-400/60">—</div>
            </div>
          )}
          {/* Gold Step */}
          <div className="w-full h-48 sm:h-60 rounded-t-2xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 border-t-4 border-yellow-200 flex flex-col items-center justify-center shadow-alix-glow relative overflow-hidden">
            <div className="text-5xl sm:text-7xl font-black font-heading text-amber-900/40">
              1
            </div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-amber-100">
              Champion
            </div>
          </div>
        </div>

        {/* 3rd Place (Bronze) */}
        <div className="flex-1 flex flex-col items-center animate-[alix-fade-up_0.5s_ease-out]">
          {/* Avatar & Info */}
          {third ? (
            <div className="flex flex-col items-center mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-700 to-orange-400 flex items-center justify-center shadow-lg border-2 border-amber-600 relative p-1.5">
                <RenderAvatarSvg avatarId={third.avatarId || 'owl'} size={56} />
                <div className="absolute -top-2.5 -right-2 w-6 h-6 rounded-full bg-amber-600 border-2 border-white shadow-sm flex items-center justify-center font-heading font-black text-[11px] text-amber-100">
                  3
                </div>
              </div>
              <div className="font-heading font-bold text-sm sm:text-base text-white mt-2 truncate max-w-[110px] text-center">
                {third.name}
              </div>
              <div className="font-mono text-xs sm:text-sm text-slate-300 font-bold">
                {(third.score ?? 0).toLocaleString()} pts
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-3 opacity-40">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-amber-600/50 flex items-center justify-center">
                <span className="text-amber-400 font-mono text-lg">—</span>
              </div>
              <div className="font-heading font-bold text-xs text-amber-400 mt-2">
                Unclaimed
              </div>
              <div className="font-mono text-[11px] text-amber-500/60">—</div>
            </div>
          )}
          {/* Bronze Step */}
          <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-b from-amber-700 via-orange-800 to-stone-900 border-t-4 border-amber-500 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="text-3xl sm:text-5xl font-black font-heading text-amber-300/30">
              3
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-200">
              Bronze
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => triggerVictoryPodiumCelebration()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-alix-violet-600 to-alix-cyan-600 hover:from-alix-violet-500 hover:to-alix-cyan-500 font-bold text-sm text-white shadow-md flex items-center gap-2 cursor-pointer transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Fire Celebration Cannon</span>
        </button>

        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-sm text-slate-200 flex items-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VictoryPodium;
