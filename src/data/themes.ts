export type Theme = {
  primary: string;
  bg: string;
  accent: string;
};

export const THEMES = {
  'Magic Kingdom': {
    primary: 'from-pink-500 to-purple-500',
    bg: 'from-pink-50 via-purple-50 to-pink-50',
    accent: 'pink'
  },
  EPCOT: {
    primary: 'from-blue-500 to-cyan-500',
    bg: 'from-blue-50 via-cyan-50 to-blue-50',
    accent: 'blue'
  },
  'Hollywood Studios': {
    primary: 'from-yellow-500 to-orange-500',
    bg: 'from-yellow-50 via-orange-50 to-yellow-50',
    accent: 'yellow'
  },
  'Animal Kingdom': {
    primary: 'from-green-500 to-emerald-500',
    bg: 'from-green-50 via-emerald-50 to-green-50',
    accent: 'green'
  },
  Universal: {
    primary: 'from-indigo-500 to-purple-500',
    bg: 'from-indigo-50 via-purple-50 to-indigo-50',
    accent: 'indigo'
  },
  Default: {
    primary: 'from-purple-500 to-pink-500',
    bg: 'from-purple-50 via-pink-50 to-orange-50',
    accent: 'purple'
  }
} as const satisfies Record<string, Theme>;

export type ThemeKey = keyof typeof THEMES;
