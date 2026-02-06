-- 004: RSVPs + messages (trip chat + event chat)

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.time_blocks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('going', 'not-going')),
  quip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (block_id, user_id)
);

-- Messages: used for both trip-level chat and per-event chat
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  block_id uuid references public.time_blocks(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  message text not null,
  created_at timestamptz not null default now(),
  -- Either trip_id or block_id must be set (not both null)
  check (trip_id is not null or block_id is not null)
);

-- RLS
alter table public.rsvps enable row level security;
alter table public.messages enable row level security;

-- RSVPs: members can read all RSVPs for blocks in their trip
create policy "rsvps_select" on public.rsvps
  for select using (
    exists (
      select 1 from public.time_blocks b
      join public.trip_days d on d.id = b.day_id
      where b.id = rsvps.block_id
        and public.is_trip_member(d.trip_id)
    )
  );

-- RSVPs: members can insert/update their own RSVP only
create policy "rsvps_insert" on public.rsvps
  for insert with check (auth.uid() = user_id);

create policy "rsvps_update" on public.rsvps
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Messages: members can read messages in their trip
create policy "messages_select" on public.messages
  for select using (
    -- Trip chat
    (trip_id is not null and public.is_trip_member(trip_id))
    or
    -- Event chat
    (block_id is not null and exists (
      select 1 from public.time_blocks b
      join public.trip_days d on d.id = b.day_id
      where b.id = messages.block_id
        and public.is_trip_member(d.trip_id)
    ))
  );

-- Messages: members can insert messages (append-only)
create policy "messages_insert" on public.messages
  for insert with check (
    auth.uid() = user_id
    and (
      (trip_id is not null and public.is_trip_member(trip_id))
      or
      (block_id is not null and exists (
        select 1 from public.time_blocks b
        join public.trip_days d on d.id = b.day_id
        where b.id = messages.block_id
          and public.is_trip_member(d.trip_id)
      ))
    )
  );
