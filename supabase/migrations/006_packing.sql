-- 006: Packing - base items (admin-managed, shared) + per-user checks + personal items

-- Admin-managed base packing list (shared across trip)
create table if not exists public.packing_base_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  item text not null,
  added_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Per-user packed state for base items
create table if not exists public.packing_checks (
  id uuid primary key default gen_random_uuid(),
  base_item_id uuid not null references public.packing_base_items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  packed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (base_item_id, user_id)
);

-- Personal packing items (per-user, not shared)
create table if not exists public.personal_packing_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  item text not null,
  packed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.packing_base_items enable row level security;
alter table public.packing_checks enable row level security;
alter table public.personal_packing_items enable row level security;

-- Base items: members can read
create policy "packing_base_select" on public.packing_base_items
  for select using (public.is_trip_member(trip_id));

-- Base items: admins can manage
create policy "packing_base_insert" on public.packing_base_items
  for insert with check (public.is_trip_admin(trip_id));

create policy "packing_base_update" on public.packing_base_items
  for update using (public.is_trip_admin(trip_id));

create policy "packing_base_delete" on public.packing_base_items
  for delete using (public.is_trip_admin(trip_id));

-- Checks: members can read all checks for their trip's items
create policy "packing_checks_select" on public.packing_checks
  for select using (
    exists (
      select 1 from public.packing_base_items b
      where b.id = packing_checks.base_item_id
        and public.is_trip_member(b.trip_id)
    )
  );

-- Checks: users can manage their own checks
create policy "packing_checks_insert" on public.packing_checks
  for insert with check (auth.uid() = user_id);

create policy "packing_checks_update" on public.packing_checks
  for update using (auth.uid() = user_id);

-- Personal items: users can only see/manage their own
create policy "personal_packing_select" on public.personal_packing_items
  for select using (auth.uid() = user_id);

create policy "personal_packing_insert" on public.personal_packing_items
  for insert with check (auth.uid() = user_id and public.is_trip_member(trip_id));

create policy "personal_packing_update" on public.personal_packing_items
  for update using (auth.uid() = user_id);

create policy "personal_packing_delete" on public.personal_packing_items
  for delete using (auth.uid() = user_id);
