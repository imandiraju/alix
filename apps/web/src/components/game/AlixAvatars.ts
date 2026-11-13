export interface AlixAvatar {
  id: string;
  name: string;
  title: string;
  emoji: string;
  svgKey: string;
  bgGradient: string;
  borderColor: string;
  colorName: string;
}

export const ALIX_AVATARS: AlixAvatar[] = [
  {
    id: 'fox',
    name: 'Nova Fox',
    title: 'Quantum Explorer',
    emoji: '🦊',
    svgKey: 'fox',
    bgGradient: 'from-orange-500 to-amber-400',
    borderColor: 'border-orange-400',
    colorName: 'orange',
  },
  {
    id: 'owl',
    name: 'Cosmo Owl',
    title: 'Deep Thinker',
    emoji: '🦉',
    svgKey: 'owl',
    bgGradient: 'from-violet-600 to-indigo-500',
    borderColor: 'border-violet-400',
    colorName: 'violet',
  },
  {
    id: 'bot',
    name: 'Bit Bot',
    title: 'Algorithm Wizard',
    emoji: '🤖',
    svgKey: 'bot',
    bgGradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400',
    colorName: 'cyan',
  },
  {
    id: 'cheetah',
    name: 'Volt Cheetah',
    title: 'Speed Demon',
    emoji: '⚡',
    svgKey: 'cheetah',
    bgGradient: 'from-amber-400 to-orange-600',
    borderColor: 'border-amber-400',
    colorName: 'amber',
  },
  {
    id: 'lion',
    name: 'Astra Lion',
    title: 'Classroom Captain',
    emoji: '🦁',
    svgKey: 'lion',
    bgGradient: 'from-yellow-400 to-amber-600',
    borderColor: 'border-yellow-400',
    colorName: 'yellow',
  },
  {
    id: 'panda',
    name: 'Zen Panda',
    title: 'Calm Strategist',
    emoji: '🐼',
    svgKey: 'panda',
    bgGradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400',
    colorName: 'emerald',
  },
  {
    id: 'koala',
    name: 'Rocket Koala',
    title: 'High Flyer',
    emoji: '🚀',
    svgKey: 'koala',
    bgGradient: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-400',
    colorName: 'purple',
  },
  {
    id: 'octopus',
    name: 'Octo Logic',
    title: 'Multi-Tasker',
    emoji: '🐙',
    svgKey: 'octopus',
    bgGradient: 'from-teal-500 to-indigo-600',
    borderColor: 'border-teal-400',
    colorName: 'teal',
  },
];

export const getRandomAvatar = (): AlixAvatar => {
  const index = Math.floor(Math.random() * ALIX_AVATARS.length);
  return ALIX_AVATARS[index];
};

export const getAvatarById = (id: string): AlixAvatar => {
  return ALIX_AVATARS.find((a) => a.id === id) || ALIX_AVATARS[0];
};
