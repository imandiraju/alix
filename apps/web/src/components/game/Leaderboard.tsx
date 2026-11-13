import React from 'react';
import { Trophy, Flame, ArrowUp, ArrowDown } from 'lucide-react';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
  streak: number;
  delta?: number; // e.g. +2 places
}

export interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  highlightPlayerId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  title = 'Live Leaderboard',
  highlightPlayerId,
}) => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 flex items-center justify-center font-black text-xs shadow-md ring-2 ring-amber-300">
            <Trophy className="w-4 h-4 text-amber-950 fill-current" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-800 flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-slate-300">
            <span className="font-heading font-black text-xs">2</span>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-amber-100 flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-amber-500">
            <span className="font-heading font-black text-xs">3</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-alix-slate-100 text-alix-slate-600 flex items-center justify-center font-bold text-sm">
            {rank}
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-alix-slate-200 shadow-alix-lg p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-alix-slate-100">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-alix-coral-500" />
          <h3 className="text-lg font-heading font-bold text-alix-indigo">{title}</h3>
        </div>
        <span className="text-xs font-semibold text-alix-slate-400 uppercase tracking-wider">
          Top Performers
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-2.5">
        {entries.map((player) => {
          const isUser = player.id === highlightPlayerId;
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                isUser
                  ? 'bg-alix-violet-50 border-2 border-alix-violet-400 shadow-sm'
                  : 'bg-alix-slate-50 hover:bg-alix-slate-100/80 border border-transparent'
              }`}
            >
              {/* Rank and Player Name */}
              <div className="flex items-center gap-3.5 min-w-0">
                {getRankBadge(player.rank)}

                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-alix-indigo truncate">
                      {player.name}
                    </span>
                    {isUser && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-alix-violet-600 text-white">
                        YOU
                      </span>
                    )}
                  </div>
                  {player.streak > 1 && (
                    <div className="flex items-center gap-1 text-xs text-alix-coral-600 font-semibold">
                      <Flame className="w-3 h-3 fill-current text-alix-coral-500" />
                      <span>{player.streak} Streak</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Score and movement */}
              <div className="flex items-center gap-3 text-right shrink-0">
                <div>
                  <span className="font-mono text-base sm:text-lg font-bold text-alix-indigo">
                    {player.score.toLocaleString()}
                  </span>
                  <span className="text-xs text-alix-slate-400 ml-1">pts</span>
                </div>

                {player.delta !== undefined && player.delta !== 0 && (
                  <span
                    className={`inline-flex items-center text-xs font-bold ${
                      player.delta > 0 ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {player.delta > 0 ? (
                      <ArrowUp className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5" />
                    )}
                    {Math.abs(player.delta)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
