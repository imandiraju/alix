import React from 'react';

export interface SvgAvatarProps {
  className?: string;
  size?: number;
}

// 1. Nova Fox: Geometric Quantum Explorer
export const FoxAvatarSvg: React.FC<SvgAvatarProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Nova Fox Avatar"
  >
    <defs>
      <linearGradient id="foxGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient id="earInner" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FED7AA" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
    {/* Left Ear */}
    <path d="M12 28L20 6L30 22L12 28Z" fill="url(#foxGrad)" stroke="#C2410C" strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 24L21 11L27 20L16 24Z" fill="url(#earInner)" />
    {/* Right Ear */}
    <path d="M52 28L44 6L34 22L52 28Z" fill="url(#foxGrad)" stroke="#C2410C" strokeWidth="2" strokeLinejoin="round" />
    <path d="M48 24L43 11L37 20L48 24Z" fill="url(#earInner)" />
    {/* Head Shield */}
    <path d="M12 28L32 18L52 28L44 48L32 58L20 48L12 28Z" fill="url(#foxGrad)" stroke="#C2410C" strokeWidth="2" strokeLinejoin="round" />
    {/* White Cheeks */}
    <path d="M14 30L26 38L32 44L38 38L50 30L44 48L32 58L20 48L14 30Z" fill="#FFF7ED" opacity="0.95" />
    {/* Eyes */}
    <ellipse cx="24" cy="34" rx="3.5" ry="4.5" fill="#1E1B4B" />
    <circle cx="25.5" cy="32.5" r="1.5" fill="#FFFFFF" />
    <ellipse cx="40" cy="34" rx="3.5" ry="4.5" fill="#1E1B4B" />
    <circle cx="41.5" cy="32.5" r="1.5" fill="#FFFFFF" />
    {/* Nose & Snout */}
    <polygon points="28,46 36,46 32,51" fill="#1E1B4B" />
    {/* Forehead Star Accent */}
    <circle cx="32" cy="26" r="2.5" fill="#06B6D4" />
  </svg>
);

// 2. Cosmo Owl: Academic Thinker
export const OwlAvatarSvg: React.FC<SvgAvatarProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Cosmo Owl Avatar"
  >
    <defs>
      <linearGradient id="owlGrad" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
    </defs>
    {/* Ear Tufts */}
    <path d="M14 10L24 24L10 26L14 10Z" fill="url(#owlGrad)" stroke="#312E81" strokeWidth="2" strokeLinejoin="round" />
    <path d="M50 10L40 24L54 26L50 10Z" fill="url(#owlGrad)" stroke="#312E81" strokeWidth="2" strokeLinejoin="round" />
    {/* Round Body/Head */}
    <ellipse cx="32" cy="36" rx="24" ry="22" fill="url(#owlGrad)" stroke="#312E81" strokeWidth="2" />
    {/* Spectacles / Eye Rings */}
    <circle cx="23" cy="34" r="10" fill="#EDE9FE" stroke="#FBBF24" strokeWidth="3" />
    <circle cx="41" cy="34" r="10" fill="#EDE9FE" stroke="#FBBF24" strokeWidth="3" />
    <line x1="33" y1="34" x2="31" y2="34" stroke="#FBBF24" strokeWidth="3" />
    {/* Pupils */}
    <circle cx="23" cy="34" r="5" fill="#1E1B4B" />
    <circle cx="25" cy="32" r="2" fill="#FFFFFF" />
    <circle cx="41" cy="34" r="5" fill="#1E1B4B" />
    <circle cx="43" cy="32" r="2" fill="#FFFFFF" />
    {/* Golden Beak */}
    <polygon points="32,42 28,48 36,48" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
    {/* Academic Mortarboard/Crown Accent */}
    <polygon points="32,16 24,20 32,24 40,20" fill="#FBBF24" />
  </svg>
);

// 3. Bit Bot: Algorithm Wizard
export const BotAvatarSvg: React.FC<SvgAvatarProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Bit Bot Avatar"
  >
    <defs>
      <linearGradient id="botGrad" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#22D3EE" />
        <stop offset="100%" stopColor="#0E7490" />
      </linearGradient>
    </defs>
    {/* Antenna */}
    <line x1="32" y1="6" x2="32" y2="16" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="6" r="4" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
    {/* Ear Bolts */}
    <rect x="6" y="28" width="6" height="14" rx="2" fill="#64748B" />
    <rect x="52" y="28" width="6" height="14" rx="2" fill="#64748B" />
    {/* Head Block */}
    <rect x="12" y="16" width="40" height="38" rx="10" fill="url(#botGrad)" stroke="#155E75" strokeWidth="2.5" />
    {/* Visor Screen */}
    <rect x="18" y="24" width="28" height="16" rx="6" fill="#0F172A" />
    {/* Glowing Eyes */}
    <circle cx="26" cy="32" r="4" fill="#38BDF8" className="animate-pulse" />
    <circle cx="38" cy="32" r="4" fill="#38BDF8" className="animate-pulse" />
    {/* Soundwave Mouth */}
    <path d="M22 47H42" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
  </svg>
);

// 4. Volt Cheetah: High Velocity
export const CheetahAvatarSvg: React.FC<SvgAvatarProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Volt Cheetah Avatar"
  >
    <defs>
      <linearGradient id="cheetahGrad" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Ears */}
    <circle cx="16" cy="18" r="9" fill="url(#cheetahGrad)" stroke="#B45309" strokeWidth="2" />
    <circle cx="16" cy="18" r="5" fill="#78350F" />
    <circle cx="48" cy="18" r="9" fill="url(#cheetahGrad)" stroke="#B45309" strokeWidth="2" />
    <circle cx="48" cy="18" r="5" fill="#78350F" />
    {/* Head */}
    <ellipse cx="32" cy="36" rx="22" ry="20" fill="url(#cheetahGrad)" stroke="#B45309" strokeWidth="2" />
    {/* Speed Teardrop Markings */}
    <path d="M24 34L20 46" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 34L44 46" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
    {/* Eyes */}
    <ellipse cx="24" cy="32" rx="3.5" ry="4" fill="#1E1B4B" />
    <circle cx="25" cy="31" r="1.5" fill="#FFFFFF" />
    <ellipse cx="40" cy="32" rx="3.5" ry="4" fill="#1E1B4B" />
    <circle cx="41" cy="31" r="1.5" fill="#FFFFFF" />
    {/* Snout */}
    <ellipse cx="32" cy="45" rx="8" ry="6" fill="#FEF3C7" />
    <polygon points="30,42 34,42 32,45" fill="#78350F" />
    {/* Forehead Lightning Bolt */}
    <polygon points="33,18 29,24 33,24 31,30 36,22 32,22" fill="#EF4444" />
  </svg>
);

// 5. Astra Lion: Solar Commander
export const LionAvatarSvg: React.FC<SvgAvatarProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Astra Lion Avatar"
  >
    <defs>
      <linearGradient id="maneGrad" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>
    {/* Radiating Geometric Mane */}
    <polygon points="32,4 42,12 54,8 54,20 64,28 58,40 62,52 50,56 42,64 32,58 22,64 14,56 2,52 6,40 0,28 10,20 10,8 22,12" fill="url(#maneGrad)" stroke="#78350F" strokeWidth="1.5" />
    {/* Face Base */}
    <circle cx="32" cy="36" rx="16" ry="16" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
    {/* Ears */}
    <circle cx="20" cy="22" r="5" fill="#F59E0B" />
    <circle cx="44" cy="22" r="5" fill="#F59E0B" />
    {/* Eyes */}
    <circle cx="26" cy="34" r="3" fill="#1E1B4B" />
    <circle cx="27" cy="33" r="1.2" fill="#FFFFFF" />
    <circle cx="38" cy="34" r="3" fill="#1E1B4B" />
    <circle cx="39" cy="33" r="1.2" fill="#FFFFFF" />
    {/* Muzzle */}
    <ellipse cx="32" cy="43" rx="7" ry="5" fill="#FFFBEB" />
    <polygon points="30,40 34,40 32,43" fill="#92400E" />
    {/* Crown Badge */}
    <polygon points="26,14 28,10 32,14 36,10 38,14" stroke="#FBBF24" strokeWidth="2" fill="#FBBF24" />
  </svg>
);

// 6. Zen Panda: Calm Strategist
export const PandaAvatarSvg: React.FC<SvgAvatarProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Zen Panda Avatar"
  >
    {/* Black Ears */}
    <circle cx="16" cy="18" r="9" fill="#0F172A" stroke="#334155" strokeWidth="2" />
    <circle cx="48" cy="18" r="9" fill="#0F172A" stroke="#334155" strokeWidth="2" />
    {/* White Head */}
    <ellipse cx="32" cy="36" rx="23" ry="21" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
    {/* Black Eye Patches */}
    <ellipse cx="22" cy="34" rx="7" ry="9" transform="rotate(-15 22 34)" fill="#0F172A" />
    <ellipse cx="42" cy="34" rx="7" ry="9" transform="rotate(15 42 34)" fill="#0F172A" />
    {/* Eyes */}
    <circle cx="23" cy="33" r="2.8" fill="#10B981" />
    <circle cx="24" cy="32" r="1.2" fill="#FFFFFF" />
    <circle cx="41" cy="33" r="2.8" fill="#10B981" />
    <circle cx="42" cy="32" r="1.2" fill="#FFFFFF" />
    {/* Nose & Mouth */}
    <ellipse cx="32" cy="45" rx="4" ry="3" fill="#0F172A" />
    <path d="M29 48Q32 52 35 48" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Emerald Forehead Gem */}
    <polygon points="32,20 35,24 32,28 29,24" fill="#10B981" />
  </svg>
);

// 7. Rocket Koala: Astronaut
export const KoalaAvatarSvg: React.FC<SvgAvatarProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Rocket Koala Avatar"
  >
    <defs>
      <linearGradient id="helmetGrad" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
    </defs>
    {/* Fluffy Astronaut Ear Domes */}
    <circle cx="14" cy="22" r="10" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="2.5" />
    <circle cx="14" cy="22" r="6" fill="#F472B6" />
    <circle cx="50" cy="22" r="10" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="2.5" />
    <circle cx="50" cy="22" r="6" fill="#F472B6" />
    {/* Space Helmet Sphere */}
    <circle cx="32" cy="36" r="22" fill="url(#helmetGrad)" stroke="#CBD5E1" strokeWidth="2.5" />
    {/* Visor */}
    <ellipse cx="32" cy="36" rx="17" ry="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
    {/* Big Koala Nose Inside Visor */}
    <ellipse cx="32" cy="40" rx="5" ry="7" fill="#64748B" />
    {/* Eyes */}
    <circle cx="24" cy="32" r="3" fill="#F472B6" />
    <circle cx="25" cy="31" r="1" fill="#FFFFFF" />
    <circle cx="40" cy="32" r="3" fill="#F472B6" />
    <circle cx="41" cy="31" r="1" fill="#FFFFFF" />
    {/* Visor Reflection Streak */}
    <path d="M22 26Q32 24 42 28" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

// 8. Octo Logic: Multi-Tasker Node
export const OctopusAvatarSvg: React.FC<SvgAvatarProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Octo Logic Avatar"
  >
    <defs>
      <linearGradient id="octoGrad" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#14B8A6" />
        <stop offset="100%" stopColor="#0F766E" />
      </linearGradient>
    </defs>
    {/* Tentacles */}
    <path d="M12 46Q8 58 16 58Q22 58 20 48" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M22 48Q24 60 32 60Q40 60 42 48" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M52 46Q56 58 48 58Q42 58 44 48" stroke="#0F766E" strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Dome Head */}
    <ellipse cx="32" cy="30" rx="22" ry="20" fill="url(#octoGrad)" stroke="#115E59" strokeWidth="2.5" />
    {/* Eyes */}
    <ellipse cx="24" cy="30" rx="4.5" ry="6" fill="#FFFFFF" />
    <circle cx="25" cy="30" r="3" fill="#1E1B4B" />
    <ellipse cx="40" cy="30" rx="4.5" ry="6" fill="#FFFFFF" />
    <circle cx="41" cy="30" r="3" fill="#1E1B4B" />
    {/* Smile */}
    <path d="M28 40Q32 44 36 40" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Knowledge Nodes on Forehead */}
    <circle cx="24" cy="18" r="2" fill="#2DD4BF" />
    <circle cx="32" cy="15" r="2.5" fill="#F43F5E" />
    <circle cx="40" cy="18" r="2" fill="#2DD4BF" />
    <line x1="24" y1="18" x2="32" y2="15" stroke="#2DD4BF" strokeWidth="1" />
    <line x1="32" y1="15" x2="40" y2="18" stroke="#2DD4BF" strokeWidth="1" />
  </svg>
);

export const AVATAR_SVG_MAP: Record<string, React.FC<SvgAvatarProps>> = {
  fox: FoxAvatarSvg,
  owl: OwlAvatarSvg,
  bot: BotAvatarSvg,
  cheetah: CheetahAvatarSvg,
  lion: LionAvatarSvg,
  panda: PandaAvatarSvg,
  koala: KoalaAvatarSvg,
  octopus: OctopusAvatarSvg,
};

export const RenderAvatarSvg: React.FC<{ avatarId: string; size?: number; className?: string }> = ({
  avatarId,
  size = 40,
  className = '',
}) => {
  const Component = AVATAR_SVG_MAP[avatarId] || FoxAvatarSvg;
  return <Component size={size} className={className} />;
};

export default RenderAvatarSvg;
