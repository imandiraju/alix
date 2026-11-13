import React from 'react';

export interface AlixLogoProps {
  variant?: 'primary' | 'monochrome' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withTagline?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export const AlixLogo: React.FC<AlixLogoProps> = ({
  variant = 'primary',
  size = 'md',
  withTagline = false,
  iconOnly = false,
  className = '',
}) => {
  // Size mappings
  const heightMap = {
    sm: iconOnly ? 24 : 28,
    md: iconOnly ? 36 : 40,
    lg: iconOnly ? 48 : 56,
    xl: iconOnly ? 64 : 76,
  };

  const height = heightMap[size];

  // Colors based on variant
  const isWhite = variant === 'white';
  const isMono = variant === 'monochrome';

  const textColor = isWhite ? '#FFFFFF' : isMono ? '#1E1B4B' : '#1E1B4B';
  const dotColor = isWhite ? '#FFFFFF' : isMono ? '#1E1B4B' : '#7C3AED';

  if (iconOnly) {
    return (
      <svg
        width={height}
        height={height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="ALIX Icon"
      >
        <defs>
          <linearGradient id={`alixIconGrad-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isWhite ? '#FFFFFF' : isMono ? '#1E1B4B' : '#7C3AED'} />
            <stop offset="100%" stopColor={isWhite ? '#E2E8F0' : isMono ? '#1E1B4B' : '#4F46E5'} />
          </linearGradient>
        </defs>
        {/* Abstract Stylized A Symbol */}
        <path
          d="M18 52L30 14L34 14L46 52"
          stroke={`url(#alixIconGrad-${variant})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23 52L34 18L37 18L49 52"
          stroke={`url(#alixIconGrad-${variant})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isWhite ? '0.6' : '0.45'}
        />
        <path
          d="M21 38H43"
          stroke={`url(#alixIconGrad-${variant})`}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle
          cx="32"
          cy="20"
          r="3"
          fill={isWhite ? '#FFFFFF' : isMono ? '#1E1B4B' : '#06B6D4'}
        />
      </svg>
    );
  }

  // Full Wordmark
  const viewBoxWidth = withTagline ? 220 : 190;
  const viewBoxHeight = withTagline ? 74 : 52;
  const computedWidth = (height / viewBoxHeight) * viewBoxWidth;

  return (
    <svg
      width={computedWidth}
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ALIX Logo"
    >
      <defs>
        <linearGradient id={`alixWordmarkGrad-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isWhite ? '#FFFFFF' : isMono ? '#1E1B4B' : '#7C3AED'} />
          <stop offset="100%" stopColor={isWhite ? '#EDE9FE' : isMono ? '#1E1B4B' : '#4F46E5'} />
        </linearGradient>
      </defs>

      {/* Stylized A */}
      <g transform="translate(6, 4)">
        <path
          d="M14 40L24 8L28 8L38 40"
          stroke={`url(#alixWordmarkGrad-${variant})`}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 40L27 12L31 12L41 40"
          stroke={`url(#alixWordmarkGrad-${variant})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isWhite ? '0.6' : '0.4'}
        />
        <path
          d="M17 29H35"
          stroke={`url(#alixWordmarkGrad-${variant})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle
          cx="26"
          cy="14"
          r="2.5"
          fill={isWhite ? '#FFFFFF' : isMono ? '#1E1B4B' : '#06B6D4'}
        />
      </g>

      {/* L */}
      <path
        d="M60 12V44H76"
        stroke={textColor}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* I */}
      <path
        d="M88 12V44"
        stroke={textColor}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="88" cy="6" r="3" fill={dotColor} />

      {/* X */}
      <path
        d="M104 12L124 44M124 12L104 44"
        stroke={textColor}
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Optional Tagline */}
      {withTagline && (
        <text
          x="6"
          y="64"
          fill={isWhite ? '#CBD5E1' : '#64748B'}
          fontSize="7.5"
          fontWeight="600"
          letterSpacing="0.14em"
          fontFamily="system-ui, sans-serif"
        >
          ACTIVE LEARNING & INTERACTIVE EXPERIENCE
        </text>
      )}
    </svg>
  );
};

export default AlixLogo;
