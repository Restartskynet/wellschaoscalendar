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
  App.tsx                           # Root wrapper
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
  providers/
    AuthProvider.tsx                 # Auth context (session, user, profile)
  components/
    WellsChaosCalendar/
      index.ts                      # Barrel export
      WellsChaosCalendar.tsx        # Root state container
      LoginScreen.tsx               # Username + password login
      WelcomeScreen.tsx             # Post-login welcome
      CreateTripForm.tsx            # Trip setup wizard
      HomePage.tsx                  # Dashboard: countdown, schedule, details
      CalendarView.tsx              # Day-by-day timeline
      ChatPage.tsx                  # Group messaging
      PhotosPage.tsx                # Placeholder
      MorePage.tsx                  # Packing + Budget tabs
      BottomNav.tsx                 # Fixed bottom navigation
      TimeBlock.tsx                 # Individual event card
      ProfileEditor.tsx             # User settings
      AccountSwitcher.tsx           # Dev-only multi-user switcher
      BlockFormModal.tsx            # Event create/edit
      RsvpModal.tsx                 # RSVP dialog
      EventChatModal.tsx            # Per-event chat
      AnimationStyles.tsx           # CSS animation definitions
supabase/
  migrations/                       # SQL migrations (apply in order)
  functions/                        # Edge Functions
    family_gate/                    # Family access code verification
    family_login/                   # Login with rate limiting
docs/
  ARCHITECTURE.md                   # This file
  CLAUDE_PROGRESS.md                # Slice-by-slice progress log
  WellsChaosCalendar_Vision_and_BuildPlan.md  # Original vision doc
```

## Navigation

No router library. State-driven:

- **ViewState**: `login` | `welcome` | `createTrip` | `app`
- **PageType** (within app): `home` | `calendar` | `photos` | `chat` | `more`

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

## Data Flow (Target)

1. App opens -> load cached state from IndexedDB (instant)
2. Auth check -> if session valid, hydrate from Supabase
3. Subscribe to Supabase Realtime channels for live updates
4. All mutations go through Supabase -> RLS enforced -> broadcast to subscribers
5. Local cache updated on each change

## Key Types

Defined in `src/types/wellsChaos.ts`:
- `Account` (username, role, theme, avatar)
- `Trip` (name, members, days, hotel, notes)
- `TripDay` (date, park, blocks)
- `TimeBlock` (type, title, times, location, rsvps, chats)
- `PackingItem`, `BudgetItem`, `ChatMessage`, `RSVP`
