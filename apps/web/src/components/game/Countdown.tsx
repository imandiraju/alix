import React from 'react';

export interface CountdownProps {
  secondsRemaining: number;
  totalSeconds: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Countdown: React.FC<CountdownProps> = ({
  secondsRemaining,
  totalSeconds,
  size = 'md',
}) => {
  const percentage = Math.max(0, Math.min(100, (secondsRemaining / totalSeconds) * 100));
  const isUrgent = secondsRemaining <= 5 && secondsRemaining > 0;

  const sizeConfigs = {
    sm: { diameter: 44, strokeWidth: 4, textClass: 'text-sm font-bold' },
    md: { diameter: 72, strokeWidth: 6, textClass: 'text-2xl font-extrabold' },
    lg: { diameter: 104, strokeWidth: 8, textClass: 'text-3xl font-extrabold' },
    xl: { diameter: 140, strokeWidth: 10, textClass: 'text-5xl font-black' },
  };

  const { diameter, strokeWidth, textClass } = sizeConfigs[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Colors: shifts to Coral when urgent
  const strokeColor = isUrgent ? '#F97316' : '#7C3AED';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        isUrgent ? 'animate-pulse' : ''
      }`}
      style={{ width: diameter, height: diameter }}
    >
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${diameter} ${diameter}`}>
        {/* Track Circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-300 ease-linear"
        />
      </svg>

      {/* Center Countdown Digits */}
      <div
        className={`absolute inset-0 flex items-center justify-center font-mono ${textClass} ${
          isUrgent ? 'text-alix-coral-500' : 'text-alix-indigo'
        }`}
      >
        {secondsRemaining}
      </div>
    </div>
  );
};

export default Countdown;
