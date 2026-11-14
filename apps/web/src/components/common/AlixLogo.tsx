import React from 'react';

export interface AlixLogoProps {
  variant?: 'primary' | 'monochrome' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withTagline?: boolean;
  withCompanyTag?: boolean;
  showEduBadge?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export const AlixLogo: React.FC<AlixLogoProps> = ({
  variant = 'primary',
  size = 'md',
  withTagline = false,
  withCompanyTag = false,
  showEduBadge = true,
  iconOnly = false,
  className = '',
}) => {
  // Size mappings
  const heightMap = {
    sm: iconOnly ? 24 : 26,
    md: iconOnly ? 36 : 34,
    lg: iconOnly ? 48 : 46,
    xl: iconOnly ? 64 : 58,
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
  const viewBoxWidth = 145;
  const viewBoxHeight = 52;
  const computedWidth = (height / viewBoxHeight) * viewBoxWidth;

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <svg
            width={computedWidth}
            height={height}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="ALIX Logo"
            className="shrink-0"
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
          </svg>

          {/* Consistent Cyan EDU Pill */}
          {showEduBadge && (
            <span
              className={`px-1.5 py-0.5 rounded-md font-black tracking-wider shadow-sm shrink-0 ${
                size === 'sm' ? 'text-[8px]' : size === 'lg' || size === 'xl' ? 'text-xs' : 'text-[10px]'
              } bg-[#00D2D3] text-[#0A1A2F] border border-cyan-300/40`}
            >
              EDU
            </span>
          )}
        </div>

        {/* Company Subtitle: RKGlobal EdTech */}
        {(withCompanyTag || withTagline) && (
          <div
            className={`font-heading font-black tracking-wider uppercase mt-0.5 ${
              isWhite ? 'text-cyan-300/90' : 'text-[#7C3AED]'
            } ${size === 'sm' ? 'text-[7px]' : 'text-[9px]'}`}
          >
            RKGlobal EdTech
          </div>
        )}
      </div>
    </div>
  );
};

export default AlixLogo;
