export type ThemeKey =
  | 'Magic Kingdom'
  | 'EPCOT'
  | 'Hollywood Studios'
  | 'Animal Kingdom'
  | 'Universal'
  | 'Default';

export type Theme = {
  primary: string;
  bg: string;
  accent: string;
};

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
  reactions: Record<string, string[]>;
  chats: ChatMessage[];
};

export type TripDay = {
  date: Date;
  blocks: TimeBlock[];
};

export type Trip = {
  name: string;
  members: Account[];
  days: TripDay[];
  weather: string | null;
};

export type EventTheme = Theme;
