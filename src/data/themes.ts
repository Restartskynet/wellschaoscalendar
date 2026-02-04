import type { Account, Theme, ThemeKey } from '../types/wellsChaos';

export const THEMES: Record<ThemeKey, Theme> = {
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
};

export const STICKERS = ['🎉', '❤️', '😂', '🔥', '⭐', '👍', '🎢', '🍕'];

export const PRESET_ACCOUNTS: Account[] = [
  {
    username: 'ben',
    password: 'magic2024',
    name: 'Ben',
    role: 'admin',
    defaultAvatar: '👨',
    color: 'blue',
    customAvatar: null,
    theme: 'Default'
  },
  {
    username: 'marie',
    password: 'disney123',
    name: 'Marie',
    role: 'admin',
    defaultAvatar: '👩',
    color: 'pink',
    customAvatar: null,
    theme: 'Default'
  },
  {
    username: 'rachel',
    password: 'rides4eva',
    name: 'Rachel',
    role: 'user',
    defaultAvatar: '👧',
    color: 'purple',
    customAvatar: null,
    theme: 'Default'
  },
  {
    username: 'chris',
    password: 'universal1',
    name: 'Chris',
    role: 'user',
    defaultAvatar: '👦',
    color: 'green',
    customAvatar: null,
    theme: 'Default'
  },
  {
    username: 'sam',
    password: 'vacation!',
    name: 'Sam',
    role: 'user',
    defaultAvatar: '🧒',
    color: 'yellow',
    customAvatar: null,
    theme: 'Default'
  },
  {
    username: 'jacob',
    password: 'funtime99',
    name: 'Jacob',
    role: 'user',
    defaultAvatar: '👶',
    color: 'orange',
    customAvatar: null,
    theme: 'Default'
  },
  {
    username: 'erika',
    password: 'princess2',
    name: 'Erika',
    role: 'user',
    defaultAvatar: '👧',
    color: 'pink',
    customAvatar: null,
    theme: 'Default'
  },
  {
    username: 'benny',
    password: 'explorer7',
    name: 'Benny',
    role: 'user',
    defaultAvatar: '🧑',
    color: 'teal',
    customAvatar: null,
    theme: 'Default'
  }
];
