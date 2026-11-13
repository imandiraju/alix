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
    colorName: 'coral',
    bg: 'bg-alix-coral-500 hover:bg-alix-coral-600',
    selectedBorder: 'ring-4 ring-alix-coral-400',
    softBg: 'bg-orange-50 border-orange-200 text-orange-950',
    badgeBg: 'bg-alix-coral-500 text-white',
  },
  {
    letter: 'B',
    shape: '◆',
    colorName: 'violet',
    bg: 'bg-alix-violet-600 hover:bg-alix-violet-700',
    selectedBorder: 'ring-4 ring-alix-violet-400',
    softBg: 'bg-purple-50 border-purple-200 text-purple-950',
    badgeBg: 'bg-alix-violet-600 text-white',
  },
  {
    letter: 'C',
    shape: '●',
    colorName: 'cyan',
    bg: 'bg-alix-cyan-600 hover:bg-alix-cyan-700',
    selectedBorder: 'ring-4 ring-alix-cyan-400',
    softBg: 'bg-cyan-50 border-cyan-200 text-cyan-950',
    badgeBg: 'bg-alix-cyan-600 text-white',
  },
  {
    letter: 'D',
    shape: '■',
    colorName: 'emerald',
    bg: 'bg-emerald-600 hover:bg-emerald-700',
    selectedBorder: 'ring-4 ring-emerald-400',
    softBg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    badgeBg: 'bg-emerald-600 text-white',
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

  // Visual state styling
  let containerStyles = 'bg-white border-2 border-alix-slate-200 hover:border-alix-slate-400 text-alix-slate-900 shadow-sm';

  if (selected) {
    containerStyles = `${theme.softBg} border-2 ${theme.selectedBorder} shadow-md`;
  }

  if (isRevealed) {
    if (isCorrect) {
      containerStyles = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-md ring-2 ring-emerald-400/50';
    } else if (selected && !isCorrect) {
      containerStyles = 'bg-rose-50 border-2 border-rose-400 text-rose-950 opacity-80';
    } else {
      containerStyles = 'bg-alix-slate-50 border-2 border-alix-slate-200 text-alix-slate-400 opacity-60';
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative w-full text-left p-4 sm:p-5 rounded-xl transition-all duration-150 flex items-center justify-between group active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed ${containerStyles}`}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
        {/* Shape / Letter Badge */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105 shrink-0 ${theme.badgeBg}`}
        >
          <span className="mr-0.5 text-xs opacity-75">{theme.shape}</span>
          <span>{theme.letter}</span>
        </div>

        {/* Option Text */}
        <span className="text-base sm:text-lg font-medium leading-snug break-words">
          {text}
        </span>
      </div>

      {/* Host distribution metrics */}
      {showDetails && (
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <div className="text-right">
            <div className="text-sm font-bold text-alix-indigo">{percentage}%</div>
            <div className="text-xs text-alix-slate-400">{count} votes</div>
          </div>
          {isCorrect && (
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
              ✓
            </div>
          )}
        </div>
      )}
    </button>
  );
};

export default OptionButton;
