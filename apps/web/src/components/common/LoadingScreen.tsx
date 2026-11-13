import React from 'react';
import AlixLogo from './AlixLogo';

export interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Connecting to ALIX Live...',
  subMessage = 'Active Learning & Interactive Experience',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-alix-slate-50 text-alix-slate-900 px-4">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-alix-violet-100/40 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-sm text-center">
        {/* Animated Brand Logo */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-alix-violet-500 to-alix-cyan-400 rounded-full blur-xl opacity-20 animate-pulse" />
          <AlixLogo size="xl" withTagline={false} />
        </div>

        {/* Custom SVG Geometric Spinner */}
        <div className="relative w-14 h-14 mb-6">
          <svg className="w-full h-full animate-spin" viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="#E2E8F0"
              strokeWidth="4"
            />
            <path
              d="M32 6C46.3594 6 58 17.6406 58 32"
              stroke="#7C3AED"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="58" cy="32" r="3" fill="#06B6D4" />
          </svg>
        </div>

        {/* Messages */}
        <h3 className="text-lg font-semibold text-alix-indigo tracking-tight mb-1">
          {message}
        </h3>
        <p className="text-sm text-alix-slate-500">
          {subMessage}
        </p>

        {/* Brand indicator pill */}
        <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-alix-violet-50 border border-alix-violet-200 text-xs font-medium text-alix-violet-700">
          <span className="w-2 h-2 rounded-full bg-alix-violet-600 animate-ping" />
          Where Every Learner Participates.
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
