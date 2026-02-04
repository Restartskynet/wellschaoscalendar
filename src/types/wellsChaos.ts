import type { Theme, ThemeKey } from '../data/themes';

export type AccountRole = 'admin' | 'user';

export type Account = {
  username: string;
  password: string;
  name: string;
  role: AccountRole;
  defaultAvatar: string;
  color: string;
  customAvatar: string | null;
  theme: ThemeKey;
};

export type RSVP = {
  username: string;
  status: 'going' | 'not-going';
  quip?: string;
};

export type ChatMessage = {
  username: string;
  message: string;
  timestamp: Date;
};

export type BlockType = 'FAMILY' | 'PERSONAL';

export type TimeBlock = {
  type: BlockType;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  park: string;
  notes: string;
  rsvps: RSVP[];
  chats: ChatMessage[];
};

export type TripDay = {
  date: Date;
  park: string | null;
  blocks: TimeBlock[];
};

export type Trip = {
  name: string;
  members: Account[];
  days: TripDay[];
  hotel: {
    name: string;
    address: string;
  } | null;
  notes: string;
  weather: string | null;
};

export type PackingItem = {
  id: string;
  item: string;
  packed: boolean;
  addedBy: string;
};

export type BudgetItem = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitWith: string[];
};

export type EventTheme = Theme;
