-- 003: Days + time blocks

create table if not exists public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  park text,
  day_index int not null default 0,
  created_at timestamptz not null default now(),
  unique (trip_id, date)
);

create table if not exists public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.trip_days(id) on delete cascade,
  type text not null default 'FAMILY' check (type in ('FAMILY', 'PERSONAL')),
  title text not null,
  start_time text not null,
  end_time text not null,
  location text not null default '',
  park text not null default '',
  notes text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.trip_days enable row level security;
alter table public.time_blocks enable row level security;

-- Helper: is user a member of the trip that owns this day?
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid()
  );
$$;

-- Helper: is user an admin of the trip?
create or replace function public.is_trip_admin(p_trip_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid() and role = 'admin'
  );
$$;

-- Days: members can read
drop policy if exists "trip_days_select" on public.trip_days;
create policy "trip_days_select" on public.trip_days
  for select using (public.is_trip_member(trip_id));

-- Days: admins can insert/update
drop policy if exists "trip_days_insert" on public.trip_days;
create policy "trip_days_insert" on public.trip_days
  for insert with check (public.is_trip_admin(trip_id));

drop policy if exists "trip_days_update" on public.trip_days;
create policy "trip_days_update" on public.trip_days
  for update using (public.is_trip_admin(trip_id));

-- Blocks: members can read
drop policy if exists "time_blocks_select" on public.time_blocks;
create policy "time_blocks_select" on public.time_blocks
  for select using (
    exists (
      select 1 from public.trip_days d
      where d.id = time_blocks.day_id
        and public.is_trip_member(d.trip_id)
    )
  );

-- Blocks: admins can insert/update/delete
drop policy if exists "time_blocks_insert" on public.time_blocks;
create policy "time_blocks_insert" on public.time_blocks
  for insert with check (
    exists (
      select 1 from public.trip_days d
      where d.id = time_blocks.day_id
        and public.is_trip_admin(d.trip_id)
    )
  );

drop policy if exists "time_blocks_update" on public.time_blocks;
create policy "time_blocks_update" on public.time_blocks
  for update using (
    exists (
      select 1 from public.trip_days d
      where d.id = time_blocks.day_id
        and public.is_trip_admin(d.trip_id)
    )
  );

drop policy if exists "time_blocks_delete" on public.time_blocks;
create policy "time_blocks_delete" on public.time_blocks
  for delete using (
    exists (
      select 1 from public.trip_days d
      where d.id = time_blocks.day_id
        and public.is_trip_admin(d.trip_id)
    )
  );
