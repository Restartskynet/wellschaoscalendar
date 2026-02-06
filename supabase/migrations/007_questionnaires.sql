-- 007: Questionnaires + responses

create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null default '',
  emoji text not null default '📋',
  question_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (trip_id, slug)
);

create table if not exists public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references public.questionnaires(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}',
  completed boolean not null default false,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (questionnaire_id, user_id)
);

-- RLS
alter table public.questionnaires enable row level security;
alter table public.questionnaire_responses enable row level security;

-- Questionnaires: members can read active questionnaires for their trip
create policy "questionnaires_select" on public.questionnaires
  for select using (
    public.is_trip_member(trip_id)
  );

-- Questionnaires: admins can manage
create policy "questionnaires_insert" on public.questionnaires
  for insert with check (public.is_trip_admin(trip_id));

create policy "questionnaires_update" on public.questionnaires
  for update using (public.is_trip_admin(trip_id));

-- Responses: members can read their own responses
create policy "responses_select_own" on public.questionnaire_responses
  for select using (auth.uid() = user_id);

-- Responses: admins can read ALL responses (for aggregate dashboards)
create policy "responses_select_admin" on public.questionnaire_responses
  for select using (
    exists (
      select 1 from public.questionnaires q
      where q.id = questionnaire_responses.questionnaire_id
        and public.is_trip_admin(q.trip_id)
    )
  );

-- Responses: members can insert/update their own
create policy "responses_insert" on public.questionnaire_responses
  for insert with check (auth.uid() = user_id);

create policy "responses_update" on public.questionnaire_responses
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
