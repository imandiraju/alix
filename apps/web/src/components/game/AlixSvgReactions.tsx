import React from 'react';

export interface SvgReactionProps {
  className?: string;
  size?: number;
}

// 1. Flame Reaction
export const FlameReactionSvg: React.FC<SvgReactionProps> = ({ className = '', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="flameOuter" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="flameInner" x1="24" y1="16" x2="24" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
    <path
      d="M24 4C24 4 28 14 34 18C40 22 42 28 40 34C38 40 32 44 24 44C16 44 10 40 8 34C6 26 12 18 16 14C20 10 24 4 24 4Z"
      fill="url(#flameOuter)"
    />
    <path
      d="M24 18C24 18 28 24 30 28C32 32 30 36 26 38C22 40 18 38 18 34C18 30 22 24 24 18Z"
      fill="url(#flameInner)"
    />
  </svg>
);

// 2. Rocket Reaction
export const RocketReactionSvg: React.FC<SvgReactionProps> = ({ className = '', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="rocketBody" x1="16" y1="8" x2="40" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    {/* Thruster Flame */}
    <path d="M14 34L8 42L16 36L14 34Z" fill="#F97316" />
    <path d="M12 36L6 44L14 38L12 36Z" fill="#FBBF24" />
    {/* Rocket Fuselage */}
    <path d="M38 10C30 10 22 18 18 26L22 30L30 26C38 22 38 10 38 10Z" fill="url(#rocketBody)" />
    {/* Cockpit Visor */}
    <circle cx="28" cy="18" r="3.5" fill="#22D3EE" stroke="#FFFFFF" strokeWidth="1.5" />
    {/* Wings */}
    <path d="M18 26L10 28L14 34L18 30V26Z" fill="#EC4899" />
    <path d="M26 18L28 10L34 14L30 18H26Z" fill="#EC4899" />
  </svg>
);

// 3. Brain Spark Reaction
export const BrainReactionSvg: React.FC<SvgReactionProps> = ({ className = '', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="brainGrad" x1="8" y1="8" x2="40" y2="40">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <path
      d="M24 10C18 10 14 14 14 18C10 20 8 26 10 30C8 34 10 38 14 40C16 42 20 42 24 40C28 42 32 42 34 40C38 38 40 34 38 30C40 26 38 20 34 18C34 14 30 10 24 10Z"
      fill="url(#brainGrad)"
      stroke="#1E1B4B"
      strokeWidth="2"
    />
    {/* Synapse Lines */}
    <path d="M24 14V36M18 22Q24 26 30 22M16 32Q24 28 32 32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="22" r="2" fill="#FBBF24" />
    <circle cx="30" cy="22" r="2" fill="#FBBF24" />
    <circle cx="24" cy="26" r="2.5" fill="#F43F5E" />
  </svg>
);

// 4. Lightning Bolt Reaction
export const LightningReactionSvg: React.FC<SvgReactionProps> = ({ className = '', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="boltGrad" x1="24" y1="4" x2="24" y2="44">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <polygon
      points="26,4 12,24 22,24 18,44 36,20 24,20"
      fill="url(#boltGrad)"
      stroke="#B45309"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

// 5. Celebration Popper Reaction
export const PartyReactionSvg: React.FC<SvgReactionProps> = ({ className = '', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Popper Cone */}
    <polygon points="12,38 26,30 20,16 6,24" fill="#F97316" stroke="#9A3412" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 38L6 24" stroke="#FBBF24" strokeWidth="3" />
    {/* Flying Confetti */}
    <circle cx="28" cy="14" r="2.5" fill="#8B5CF6" />
    <circle cx="36" cy="18" r="3" fill="#06B6D4" />
    <circle cx="38" cy="8" r="2" fill="#10B981" />
    <circle cx="32" cy="26" r="2.5" fill="#EF4444" />
    <line x1="26" y1="18" x2="36" y2="10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="22" y1="12" x2="30" y2="6" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 6. Starburst / Mindblown Reaction
export const StarburstReactionSvg: React.FC<SvgReactionProps> = ({ className = '', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="starGrad" x1="24" y1="6" x2="24" y2="42">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <polygon
      points="24,4 28,16 40,12 34,22 44,28 32,32 34,44 24,36 14,44 16,32 4,28 14,22 8,12 20,16"
      fill="url(#starGrad)"
      stroke="#4C1D95"
      strokeWidth="1.5"
    />
    <circle cx="24" cy="25" r="5" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1.5" />
  </svg>
);

export const SVG_REACTION_LIST = [
  { id: 'flame', label: 'Streak Flame', Component: FlameReactionSvg },
  { id: 'rocket', label: 'High Speed', Component: RocketReactionSvg },
  { id: 'brain', label: 'Big Brain', Component: BrainReactionSvg },
  { id: 'lightning', label: 'Lightning', Component: LightningReactionSvg },
  { id: 'party', label: 'Celebration', Component: PartyReactionSvg },
  { id: 'starburst', label: 'Mind Blown', Component: StarburstReactionSvg },
];
