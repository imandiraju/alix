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
  showEduBadge = false,
  iconOnly = false,
  className = '',
}) => {
  // Colors based on variant
  const isWhite = variant === 'white';
  const isMono = variant === 'monochrome';

  const textColor = isWhite ? 'text-white' : isMono ? 'text-[#252525]' : 'text-[#46178F]';
  const taglineColor = isWhite ? 'text-white/80' : isMono ? 'text-[#626262]' : 'text-[#46178F]';

  // Typography scaling
  const textSizes = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-7xl',
  };

  const tagSizes = {
    sm: 'text-[7px]',
    md: 'text-[8px] sm:text-[9px]',
    lg: 'text-[10px] sm:text-xs',
    xl: 'text-xs sm:text-sm',
  };

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center font-heading font-black tracking-tight leading-none select-none ${className}`}>
        <span className={textColor}>A</span>
        <span className="text-[#00D2D3] animate-bounce ml-0.5">!</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="flex items-center leading-none">
        <span className={`font-heading font-black tracking-tight leading-none ${textColor} ${textSizes[size]}`}>
          ALIX
        </span>
        <span className={`font-heading font-black tracking-tight leading-none text-[#00D2D3] animate-bounce ml-0.5 ${textSizes[size]}`}>
          !
        </span>
        {showEduBadge && (
          <span
            className={`ml-1.5 px-1.5 py-0.5 rounded-md font-heading font-black tracking-wider shadow-xs shrink-0 ${
              size === 'sm' ? 'text-[8px]' : 'text-[10px]'
            } bg-[#00D2D3] text-[#0A1A2F] border border-cyan-300/40`}
          >
            EDU
          </span>
        )}
      </div>

      {/* Brand Subtitle: Active Learning Platform (RKGlobal EdTech kept strictly for footer/bottom) */}
      {(withCompanyTag || withTagline) && (
        <div
          className={`font-heading font-black tracking-wider uppercase mt-1 leading-none ${taglineColor} ${tagSizes[size]}`}
        >
          {withCompanyTag && !withTagline ? 'RKGlobal EdTech' : 'Active Learning Platform'}
        </div>
      )}
    </div>
  );
};

export default AlixLogo;
