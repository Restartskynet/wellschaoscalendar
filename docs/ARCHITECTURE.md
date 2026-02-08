# Architecture

## Overview

Wells Chaos Calendar is a family trip planner built with **Vite + React 18 + TypeScript + Tailwind CSS**. It targets mobile-first usage at theme parks (Disney World, Universal Studios).

## Stack

| Layer | Tech |
|-------|------|
| Build | Vite 5.4 |
| UI | React 18.3, Tailwind 3.4, Lucide icons |
| State | React hooks (prop drilling from root container) |
| Backend | **Supabase** (Auth, Postgres, Realtime, Edge Functions) |
| Local cache | IndexedDB (via `idb`) for offline-first fast open |
| Testing | Vitest 2.1 + React Testing Library |
| Distribution | PWA first; later Capacitor wrap for App Store / Play Store |

## Directory Structure

```
src/
  main.tsx                          # Entry point
  App.tsx                           # Root wrapper (AuthProvider)
  App.test.tsx                      # Smoke tests
  index.css                         # Tailwind imports
  types/
    wellsChaos.ts                   # All TypeScript types
  data/
    accounts.ts                     # Preset accounts (dev-only in prod)
    themes.ts                       # 6 theme configs
    parks.ts                        # Disney/Universal park data
  lib/
    supabaseClient.ts               # Supabase client singleton
    supabaseData.ts                 # Full CRUD data layer (typed queries + mutations)
    localCache.ts                   # IndexedDB cache layer (via idb)
    realtimeSync.ts                 # Supabase Realtime subscriptions (trip-scoped)
  hooks/
    useTripData.ts                  # Hook: assembles Supabase rows into app types
  providers/
    AuthProvider.tsx                 # Auth context (session, user, profile)
  content/
    questionnaires/
      index.ts                      # Exports V2 questionnaire packs + types
      v2/                           # 5 V2 questionnaire JSON files
  components/
    WellsChaosCalendar/
      index.ts                      # Barrel export
      WellsChaosCalendar.tsx        # Root state container + Supabase data wiring
      FamilyGateScreen.tsx          # Family access code gate
      LoginScreen.tsx               # Username + password login
      WelcomeScreen.tsx             # Post-login welcome
      CreateTripForm.tsx            # Trip setup wizard
      HomePage.tsx                  # Dashboard: countdown, schedule, details
      CalendarView.tsx              # Day-by-day timeline
      ChatPage.tsx                  # Group messaging
      PhotosPage.tsx                # Placeholder
      MorePage.tsx                  # Packing + Budget + Questionnaires tabs
      QuestionnairesPage.tsx        # Questionnaire listing + focus mode
      QuestionnaireEngine.tsx       # Questionnaire runner (z-50 footer)
      QuestionnaireResults.tsx      # Admin results (aggregate + outliers)
      BottomNav.tsx                 # Fixed bottom navigation (z-50)
      DesktopLayout.tsx             # Sidebar layout for desktop (>=1024px)
      TimeBlock.tsx                 # Individual event card
      ProfileEditor.tsx             # User settings
      AccountSwitcher.tsx           # Dev-only multi-user switcher
      BlockFormModal.tsx            # Event create/edit
      RsvpModal.tsx                 # RSVP dialog
      EventChatModal.tsx            # Per-event chat
      AnimationStyles.tsx           # CSS animation definitions
supabase/
  migrations/                       # SQL migrations (001-008, all idempotent)
  functions/                        # Edge Functions (all verify_jwt=false)
    family_gate/                    # Family access code verification
    family_login/                   # Login with rate limiting
    keepalive/                      # Health check endpoint
docs/
  ARCHITECTURE.md                   # This file
  CLAUDE_PROGRESS.md                # Slice-by-slice progress log
  WellsChaosCalendar_Vision_and_BuildPlan.md  # Original vision doc
```

## Navigation

No router library. State-driven:

- **ViewState**: `gate` | `login` | `welcome` | `createTrip` | `app`
- **PageType** (within app): `home` | `calendar` | `photos` | `chat` | `more`
- **Focus mode**: When a questionnaire is active, BottomNav hides so the questionnaire footer (z-50) is unobstructed on mobile

## Auth Model (Supabase)

- Login UI: Username + Password (visually unchanged)
- Under the hood: `username@wellschaos.family` pseudo-email mapped to Supabase Auth
- No signups, no email flows, no forgot-password
- Family gate: one-time access code per device (server-enforced via Edge Function)
- Rate limiting: 5 attempts/username -> 20min lock; 30 attempts/IP per 10min
- Device token stored in localStorage after gate passed

## Security Layers

1. **Level 1**: Disabled signups, strong passwords, RLS on all tables
2. **Level 2**: Username allowlist, rate limiting + lockout (Edge Function + DB)
3. **Level 3**: Family access code gate (server-verified, once per device)

**Residual limitation**: A determined attacker who reverse-engineers the Supabase anon key could attempt direct auth calls. Strong passwords + RLS remain critical last lines of defense.

## Data Flow

1. App opens -> try loading cached trip data from IndexedDB (fast-open)
2. Auth check -> if session valid, hydrate full trip data from Supabase via `hydrateTripData()`
3. Assemble flat Supabase rows into nested app types via `assembleFromSupabase()`
4. Subscribe to Supabase Realtime channels (`postgres_changes`) scoped to active trip
5. All mutations are write-through: update local state + write to Supabase
6. On realtime change, refetch and re-assemble the full dataset
7. Write to IndexedDB cache after each successful hydration

### Realtime Subscription Strategy

- **Trip-filtered tables** (have `trip_id` column): filtered with `trip_id=eq.<ACTIVE_TRIP_ID>`
  - messages, budget_expenses, packing_base_items, trip_days, rsvps, personal_packing_items, questionnaires
- **RLS-only tables** (no direct `trip_id`): subscribe to all rows, RLS gates access
  - time_blocks, packing_checks, questionnaire_responses
- rsvps now has `trip_id` (migration 009) — trip-filtered for realtime
- personal_packing_items: private to owner via RLS, trip-filtered for realtime
- **DELETE limitation**: Supabase Realtime DELETE payloads only contain primary key columns, so column filters don't work for DELETE events — handled defensively client-side

## Key Types

Defined in `src/types/wellsChaos.ts`:
- `Account` (username, role, theme, avatar)
- `Trip` (name, members, days, hotel, notes)
- `TripDay` (date, park, blocks)
- `TimeBlock` (type, title, times, location, rsvps, chats)
- `PackingItem`, `BudgetItem`, `ChatMessage`, `RSVP`, `PersonalPackingItem`

## Questionnaire System

V2 content packs stored in `src/content/questionnaires/v2/` as JSON:
- 5 packs: Park Day Adventures, Dining Dreams, Comfort & Planning, Budget & Style, Magical Moments
- Each pack has: slug, title, description, emoji, questions[]
- Question types: single-choice, multi-choice, slider, budget-allocation
- Knowledge cards: embedded Disney/Universal info cards per question for park newcomers
- Celebration finish screen with floating emoji animations
- Responses stored locally and persisted to `questionnaire_responses` table (jsonb answers) via Supabase
- Results (admin-only): aggregate dashboards with consensus indicators, outlier highlights (unique picks flagged with amber badge), and per-person drilldown with outlier markers

## Photos (Future Plan)

Photos tab is currently a placeholder. Future implementation spec:

- **Storage**: Supabase Storage bucket (`trip-photos`)
- **Upload limits**: Max 5MB per image, 50 photos per user per trip
- **Thumbnails**: Generate on upload via Supabase Edge Function or client-side (sharp/canvas)
- **Organization**: By trip day, with optional captions
- **Quota enforcement**: Track upload count in DB, reject over-quota
- **RLS**: Trip members can read all photos; users can only delete their own uploads
- **Display**: Masonry grid or horizontal scroll per day

## Distribution Roadmap

1. **PWA** (current): Installable from browser, works on all devices
2. **Capacitor wrap** (future milestone):
   - Same Vite/React codebase
   - Native push notifications via Capacitor Push
   - App Store / Play Store distribution
   - Deep linking support
