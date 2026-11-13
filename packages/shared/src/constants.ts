// ─── ALIX Constants ─────────────────────────────────────────────────────────

export const ALIX_BRAND = {
  name: 'ALIX',
  fullName: 'Active Learning & Interactive Experience',
  tagline: 'Where Every Learner Participates.',
  positioning:
    'A premium, modern, interactive classroom learning platform designed to transform traditional lectures into engaging, collaborative and measurable learning experiences.',
  description:
    'Turn lectures into engaging experiences where every learner participates.',
  landingHeadline: 'Make Every Classroom Interactive.',
  landingSubtext: 'Turn lectures into engaging experiences where every learner participates.',
  browserTitle: 'ALIX – Active Learning & Interactive Experience',
  teacherDashboard: 'Welcome to ALIX',
  studentJoin: 'Join ALIX',
  liveSession: 'ALIX Live',
  quizLibrary: 'My ALIX Activities',
  reports: 'ALIX Insights',
  url: 'https://alix.edu',
} as const;

export const ALIX_MODULES = {
  PLAY: {
    id: 'play',
    name: 'ALIX Play',
    shortName: 'Play',
    icon: '🎮',
    description: 'Live quizzes, timed competitions, multiplayer games and leaderboards.',
    color: '#7C3AED',
  },
  POLL: {
    id: 'poll',
    name: 'ALIX Poll',
    shortName: 'Poll',
    icon: '📊',
    description: 'Live polls, opinion collection, classroom voting and response visualization.',
    color: '#06B6D4',
  },
  THINK: {
    id: 'think',
    name: 'ALIX Think',
    shortName: 'Think',
    icon: '💡',
    description: 'Concept checks, critical-thinking exercises, debugging challenges and peer instruction.',
    color: '#10B981',
  },
  TEAMS: {
    id: 'teams',
    name: 'ALIX Teams',
    shortName: 'Teams',
    icon: '👥',
    description: 'Team-based competitions, collaborative challenges and classroom activities.',
    color: '#F97316',
  },
  INSIGHTS: {
    id: 'insights',
    name: 'ALIX Insights',
    shortName: 'Insights',
    icon: '📈',
    description: 'Student participation, question-wise performance, misconceptions and learning analytics.',
    color: '#1E1B4B',
  },
  CREATE: {
    id: 'create',
    name: 'ALIX Create',
    shortName: 'Create',
    icon: '🛠️',
    description: 'Quiz creation, activity creation, question banks, imports and AI-assisted question generation.',
    color: '#7C3AED',
  },
} as const;

export const SCORE_CONSTANTS = {
  BASE_POINTS: 1000,
  MIN_POINTS: 100,
  SPEED_BONUS_MAX: 500,
  STREAK_BONUS_MULTIPLIER: 0.1,
  MAX_STREAK_BONUS: 0.5,
} as const;

export const SESSION_CONSTANTS = {
  CODE_LENGTH: 6,
  CODE_CHARACTERS: '0123456789',
  MAX_PLAYERS_DEFAULT: 100,
  MIN_PLAYERS: 1,
  DEFAULT_TIME_LIMIT: 30,
  MAX_TIME_LIMIT: 120,
  MIN_TIME_LIMIT: 5,
} as const;

export const DEFAULT_SETTINGS = {
  maxPlayers: SESSION_CONSTANTS.MAX_PLAYERS_DEFAULT,
  autoAdvance: false,
  autoAdvanceDelay: 5,
  showLeaderboardAfterEach: true,
  shuffleQuestions: false,
  shuffleOptions: false,
  showCorrectAnswer: true,
  allowLateJoin: true,
} as const;
