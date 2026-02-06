-- 002: Trips + trip_members

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hotel_name text,
  hotel_address text,
  notes text not null default '',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

-- RLS
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;

-- Members can read their trips
create policy "trips_select" on public.trips
  for select using (
    exists (
      select 1 from public.trip_members
      where trip_members.trip_id = trips.id
        and trip_members.user_id = auth.uid()
    )
  );

-- Admins can update trip details
create policy "trips_update" on public.trips
  for update using (
    exists (
      select 1 from public.trip_members
      where trip_members.trip_id = trips.id
        and trip_members.user_id = auth.uid()
        and trip_members.role = 'admin'
    )
  );

-- Admins can create trips
create policy "trips_insert" on public.trips
  for insert with check (auth.uid() = created_by);

-- Trip members: members can read membership
create policy "trip_members_select" on public.trip_members
  for select using (
    exists (
      select 1 from public.trip_members as tm
      where tm.trip_id = trip_members.trip_id
        and tm.user_id = auth.uid()
    )
  );

-- Only admins can manage membership
create policy "trip_members_insert" on public.trip_members
  for insert with check (
    exists (
      select 1 from public.trip_members as tm
      where tm.trip_id = trip_members.trip_id
        and tm.user_id = auth.uid()
        and tm.role = 'admin'
    )
    -- Or the creator adding themselves
    or (user_id = auth.uid())
  );
