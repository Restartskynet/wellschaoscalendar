# Wells Chaos Calendar ✨

**WellsChaosCalendar.com** is a **cute, stylized, visual trip calendar** designed to reduce *vacation chaos* while making planning feel like part of the fun.

It's built for trips where everyone wants both:

* **Family anchor time** (rides, dinners, shows, photos, must-dos)
* **Personal freedom time** (solo adventures, naps, thrill rides, pool breaks, shopping)

The goal is simple:

✅ **Everyone knows where to be and when**
✅ **Everyone gets guilt-free personal time**
✅ **No confusion, no arguing, no "wait… what's the plan?"**

> This shouldn't feel like a corporate scheduling tool.
> It should feel like a cute little "trip brain" you actually enjoy opening.

---

## Architecture

**Frontend**: Vite + React 18 + TypeScript + Tailwind CSS
**Backend**: Supabase (Auth, Postgres, Realtime, Edge Functions)
**Local Cache**: IndexedDB via `idb` for offline-first fast open
**Distribution**: PWA first; later Capacitor wrap for App Store / Play Store

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical architecture.

---

## Features

### Authentication & Security
- **Family-only access**: 3-layer security system
  - Level 1: Disabled signups, strong passwords, RLS on all tables
  - Level 2: Username allowlist, rate limiting (5 attempts -> 20min lock)
  - Level 3: Family access code gate (server-enforced, once per device)
- Login via username + password (maps to Supabase Auth under the hood)
- No signups, no email flows, no forgot-password
- Admin accounts (Ben & Marie) control everything

### Home Page
- Animated trip countdown
- Live clock with next event preview
- Park schedule with admin park assignments
- Trip details (hotel, notes, member count)

### Calendar
- Day-by-day timeline navigation
- Family blocks (ticket-style, orange/pink) vs Personal blocks (cloud-style, blue/purple)
- Location auto-fill from Disney/Universal preset library (100+ attractions, 80+ restaurants)
- RSVP system with quips
- Per-event chat

### Questionnaires
- 5 V2 content packs: Park Day Adventures, Dining Dreams, Comfort & Planning, Budget & Style, Magical Moments
- Engine supports: single choice, multi choice, slider, budget allocation
- Knowledge cards with Disney/Universal tips for first-timers
- Celebration finish screen with animations
- Focus mode: BottomNav hides during questionnaire for unobstructed mobile UX
- Admin-only results: aggregate dashboards, outlier highlights, per-person drilldown
- Responses persisted to Supabase when connected

### Budget Tracker
- Shared expense tracking (all members can add)
- Split calculations with balance summary
- Edit/delete for admins and expense creators

### Packing List
- Admin-managed base list (shared across trip)
- Checkbox progress tracking

### Photos (Placeholder)
- Coming soon: Supabase Storage upload with per-user limits
- See `docs/ARCHITECTURE.md` for future spec

### Desktop Support
- Mobile-first with bottom navigation
- Desktop (>= 1024px): sidebar layout with centered content
- iOS safe area handling preserved

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Development (no Supabase needed)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

In dev mode, the app works with preset accounts and in-memory state. No Supabase project required.

### Development Accounts (dev mode only)

**Admins**: ben/magic2024, marie/disney123
**Users**: rachel/rides4eva, chris/universal1, sam/vacation!, jacob/funtime99, erika/princess2, benny/explorer7

### Configuring Supabase (production)

#### Path A: Supabase CLI

```bash
# 1. Link to your project
supabase link --project-ref <your-ref>

# 2. Apply migrations
supabase db push

# 3. Deploy Edge Functions
supabase functions deploy family_gate
supabase functions deploy family_login
supabase functions deploy keepalive

# 4. Set secrets
supabase secrets set FAMILY_ACCESS_CODE=your-secret-family-code
```

#### Path B: Supabase Dashboard (SQL Editor)

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

3. Apply database migrations in order via SQL Editor:
```
supabase/migrations/001_profiles.sql
supabase/migrations/002_trips.sql
supabase/migrations/003_days_blocks.sql
supabase/migrations/004_rsvps_messages.sql
supabase/migrations/005_budget.sql
supabase/migrations/006_packing.sql
supabase/migrations/007_questionnaires.sql
supabase/migrations/008_security.sql
```

All migrations are idempotent (safe to re-run). Policies use `DROP POLICY IF EXISTS` before `CREATE POLICY`.

4. Deploy Edge Functions via CLI (requires Supabase CLI even with Dashboard path):
```bash
supabase functions deploy family_gate
supabase functions deploy family_login
supabase functions deploy keepalive
```
Each function has a `config.toml` setting `verify_jwt = false` (public endpoints with their own auth logic).

5. Set secrets:
```bash
supabase secrets set FAMILY_ACCESS_CODE=your-secret-family-code
```

#### Post-Setup Steps

6. **Disable signups** in Supabase Dashboard > Auth > Settings

7. **Enable Realtime** on these tables (Database > Replication > Supabase Realtime):
   - `messages`, `budget_expenses`, `packing_base_items`, `trip_days`, `time_blocks`, `rsvps`, `packing_checks`
   - Note: DELETE events bypass column filters in Supabase Realtime — the app handles this client-side

8. **Create user accounts** using Supabase Admin API or Dashboard:
   - Email format: `username@wellschaos.family`
   - Insert matching row in `profiles` table

9. **Profile backfill** (if you created auth users before running 001_profiles.sql):
```sql
INSERT INTO profiles (id, username, display_name, role, avatar_emoji, color)
SELECT id, split_part(email, '@', 1), split_part(email, '@', 1), 'user', '🧑', 'purple'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

#### Deploying to Vercel

Set these environment variables in Vercel project settings:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/publishable key

#### Migration Repair

If you hit "policy already exists" errors (e.g. after a partial migration run), all migrations are safe to re-run — they use `DROP POLICY IF EXISTS` before every `CREATE POLICY`.

### Keepalive (optional)

To prevent Supabase free tier from pausing, set up a free uptime monitor (UptimeRobot, Cron-Job.org) to ping:
```
https://your-project.supabase.co/functions/v1/keepalive
```
Every 5-10 minutes.

---

## Distribution Plan

### PWA (current)
Ships as a progressive web app. Install from browser on any device.

### App Store / Play Store (later milestone)
Wrap with **Capacitor** for native distribution without rewriting:
- Reuse the same Vite/React codebase
- Add native push notifications
- App store presence for easier family access

---

## Security Notes

### What's enforced server-side
- Family access code gate (Edge Function validates, issues device token)
- Username allowlist (only family usernames can attempt login)
- Rate limiting: 5 attempts/username -> 20min lock, 30 attempts/IP per 10min
- RLS on all database tables (members can only access their trip data)
- Disabled signups at the Supabase Auth level

### Residual limitations (documented honestly)
- The Supabase anon key is visible in client-side JavaScript
- A determined attacker who reverse-engineers the key could attempt direct Supabase Auth calls, bypassing the edge function rate limiting
- **Mitigation**: Strong passwords + RLS policies remain the critical last line of defense
- This is a family app, not a banking app — the security model is appropriate for the threat level

---

## Design Philosophy

### Visual Identity
* Cute, warm, pastel colors, playful (but not childish)
* Vacation energy: bright, airy, happy
* Calendar that feels like a **storybook itinerary**
* Visual clarity at a glance

### Non-Negotiable Rules
1. **Mobile-first, thumb-friendly** — used while walking, sweating, holding snacks
2. **Glanceable clarity** — read the day in 2 seconds
3. **Fun visuals without clutter** — cute + clean
4. **Animations must help comprehension** — no flashy junk
5. **Flexible by default** — most time is personal/free

---

## Project Structure

```
src/
  main.tsx                          Entry point
  App.tsx                           Root wrapper (AuthProvider)
  lib/
    supabaseClient.ts               Supabase client singleton
    supabaseData.ts                 Full CRUD data layer (typed queries + mutations)
    localCache.ts                   IndexedDB cache layer (via idb)
    realtimeSync.ts                 Supabase Realtime subscriptions (trip-scoped)
  hooks/
    useTripData.ts                  Hook: assembles Supabase rows into app types
  providers/
    AuthProvider.tsx                 Auth context (session, user, profile)
  content/
    questionnaires/
      index.ts                      Exports V2 questionnaire packs
      v2/                           5 V2 questionnaire JSON files
  components/
    WellsChaosCalendar/             All UI components
supabase/
  migrations/                       SQL migrations (001-008, all idempotent)
  functions/
    family_gate/                    Access code verification (config.toml: verify_jwt=false)
    family_login/                   Login with rate limiting (config.toml: verify_jwt=false)
    keepalive/                      Health check (config.toml: verify_jwt=false)
docs/
  ARCHITECTURE.md                   Technical architecture
  CLAUDE_PROGRESS.md                Implementation progress log
```

---

## Design Credits

All Disney and Universal park names, attraction names, and restaurant names are used for trip-planning reference only. This is a personal planning tool and is **not affiliated with** Disney or Universal.

---

**Built with ❤️ by Ben & Marie**
*Organized by Ben & Marie ✨*
