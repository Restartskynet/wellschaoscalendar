-- 001: Profiles table (1:1 with auth.users)
-- Each Supabase Auth user gets a profile with app-specific data.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  avatar_emoji text not null default '🧑',
  color text not null default 'purple',
  custom_avatar_url text,
  theme text not null default 'Default',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;

-- Everyone authenticated can read all profiles (family app)
create policy "profiles_select" on public.profiles
  for select using (auth.role() = 'authenticated');

-- Users can update only their own profile (avatar, theme, color)
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Only service_role can insert (admin creates accounts)
-- No insert policy for authenticated users = no self-signup
