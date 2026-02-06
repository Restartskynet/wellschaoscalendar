-- 008: Security tables for family gate + rate limiting

-- Device gates: tracks devices that have passed the family access code
create table if not exists public.device_gates (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  device_token text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

-- Auth attempts: tracks login attempts for rate limiting + lockout
create table if not exists public.auth_attempts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  ip_address text not null default '',
  success boolean not null default false,
  attempted_at timestamptz not null default now()
);

-- Username lockouts: tracks per-username lockouts
create table if not exists public.username_lockouts (
  username text primary key,
  locked_until timestamptz not null,
  attempt_count int not null default 0,
  last_attempt_at timestamptz not null default now()
);

-- Allowed usernames (family-only allowlist)
create table if not exists public.allowed_usernames (
  username text primary key,
  created_at timestamptz not null default now()
);

-- Insert the family usernames
insert into public.allowed_usernames (username) values
  ('ben'), ('marie'), ('rachel'), ('chris'),
  ('sam'), ('jacob'), ('erika'), ('benny')
on conflict do nothing;

-- RLS: security tables are managed by service_role / edge functions only
-- No authenticated user policies needed (edge functions use service_role key)
alter table public.device_gates enable row level security;
alter table public.auth_attempts enable row level security;
alter table public.username_lockouts enable row level security;
alter table public.allowed_usernames enable row level security;

-- Index for rate limit queries
create index if not exists idx_auth_attempts_username_time
  on public.auth_attempts (username, attempted_at desc);

create index if not exists idx_auth_attempts_ip_time
  on public.auth_attempts (ip_address, attempted_at desc);
