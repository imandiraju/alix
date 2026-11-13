import React from 'react';

export interface OptionButtonProps {
  index: number; // 0, 1, 2, 3
  text: string;
  selected?: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
  count?: number;
  percentage?: number;
}

const OPTION_THEMES = [
  {
    letter: 'A',
    shape: '▲',
    colorName: 'red',
    solidBg: 'bg-[#E21B3C] hover:bg-[#D01735] text-white border-b-4 border-[#9E1329]',
    selectedRing: 'ring-4 ring-white shadow-2xl scale-[1.02]',
    badgeBg: 'bg-black/20 text-white',
  },
  {
    letter: 'B',
    shape: '◆',
    colorName: 'blue',
    solidBg: 'bg-[#1368CE] hover:bg-[#105AB3] text-white border-b-4 border-[#0D4589]',
    selectedRing: 'ring-4 ring-white shadow-2xl scale-[1.02]',
    badgeBg: 'bg-black/20 text-white',
  },
  {
    letter: 'C',
    shape: '●',
    colorName: 'yellow',
    solidBg: 'bg-[#D89E00] hover:bg-[#BF8C00] text-white border-b-4 border-[#8C6700]',
    selectedRing: 'ring-4 ring-white shadow-2xl scale-[1.02]',
    badgeBg: 'bg-black/20 text-white',
  },
  {
    letter: 'D',
    shape: '■',
    colorName: 'green',
    solidBg: 'bg-[#26890C] hover:bg-[#20740A] text-white border-b-4 border-[#175407]',
    selectedRing: 'ring-4 ring-white shadow-2xl scale-[1.02]',
    badgeBg: 'bg-black/20 text-white',
  },
];

export const OptionButton: React.FC<OptionButtonProps> = ({
  index,
  text,
  selected = false,
  isCorrect,
  isRevealed = false,
  disabled = false,
  onClick,
  showDetails = false,
  count = 0,
  percentage = 0,
}) => {
  const theme = OPTION_THEMES[index % OPTION_THEMES.length];

  let stateClasses = `${theme.solidBg} shadow-md`;

  if (selected) {
    stateClasses = `${theme.solidBg} ${theme.selectedRing}`;
  }

  if (isRevealed) {
    if (isCorrect) {
      stateClasses = `${theme.solidBg} ring-4 ring-emerald-300 shadow-xl brightness-110`;
    } else if (selected && !isCorrect) {
      stateClasses = 'bg-rose-950/80 text-rose-300 border-b-4 border-rose-900 opacity-70';
    } else {
      stateClasses = 'bg-slate-700/60 text-slate-400 border-b-4 border-slate-800 opacity-40';
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-150 flex items-center justify-between group active:border-b-0 active:translate-y-1 disabled:active:translate-y-0 disabled:cursor-not-allowed cursor-pointer ${stateClasses}`}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
        {/* Kahoot-style Shape / Letter Badge */}
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner transition-transform group-hover:scale-105 shrink-0 ${theme.badgeBg}`}
        >
          <span className="text-xl sm:text-2xl drop-shadow">{theme.shape}</span>
        </div>

        {/* Option Text */}
        <span className="text-base sm:text-lg font-heading font-extrabold leading-snug break-words drop-shadow-sm">
          {text}
        </span>
      </div>

      {/* Host distribution metrics */}
      {showDetails && (
        <div className="flex items-center gap-3 shrink-0 ml-2 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
          <div className="text-right">
            <div className="text-sm font-black text-white">{percentage}%</div>
            <div className="text-[10px] text-white/80">{count} votes</div>
          </div>
          {isCorrect && (
            <div className="w-6 h-6 rounded-full bg-white text-emerald-700 flex items-center justify-center text-xs font-black shadow-sm">
              ✓
            </div>
          )}
        </div>
      )}
    </button>
  );
};

export default OptionButton;
