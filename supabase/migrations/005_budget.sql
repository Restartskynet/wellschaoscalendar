-- 005: Budget expenses (shared + synced, members can add)

create table if not exists public.budget_expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  description text not null,
  amount numeric(10,2) not null check (amount >= 0),
  paid_by uuid not null references public.profiles(id),
  split_with uuid[] not null default '{}',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.budget_expenses enable row level security;

-- Members can read expenses for their trip
drop policy if exists "budget_select" on public.budget_expenses;
create policy "budget_select" on public.budget_expenses
  for select using (public.is_trip_member(trip_id));

-- Members can add expenses
drop policy if exists "budget_insert" on public.budget_expenses;
create policy "budget_insert" on public.budget_expenses
  for insert with check (
    auth.uid() = created_by
    and public.is_trip_member(trip_id)
  );

-- Admins can update/delete any expense; members can update their own
drop policy if exists "budget_update" on public.budget_expenses;
create policy "budget_update" on public.budget_expenses
  for update using (
    public.is_trip_admin(trip_id) or auth.uid() = created_by
  );

drop policy if exists "budget_delete" on public.budget_expenses;
create policy "budget_delete" on public.budget_expenses
  for delete using (
    public.is_trip_admin(trip_id) or auth.uid() = created_by
  );
