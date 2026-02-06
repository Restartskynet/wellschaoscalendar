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
- 3 content packs: Park Priorities, Food Preferences, Travel Comfort
- Engine supports: single choice, multi choice, slider, budget allocation
- Knowledge cards with informative park tips for first-timers
- Admin-only results: aggregate dashboards + per-person drilldown

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

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

3. Apply database migrations (in order):
```bash
# Via Supabase SQL editor or psql
psql $DATABASE_URL -f supabase/migrations/001_profiles.sql
psql $DATABASE_URL -f supabase/migrations/002_trips.sql
psql $DATABASE_URL -f supabase/migrations/003_days_blocks.sql
psql $DATABASE_URL -f supabase/migrations/004_rsvps_messages.sql
psql $DATABASE_URL -f supabase/migrations/005_budget.sql
psql $DATABASE_URL -f supabase/migrations/006_packing.sql
psql $DATABASE_URL -f supabase/migrations/007_questionnaires.sql
psql $DATABASE_URL -f supabase/migrations/008_security.sql
```

4. Deploy Edge Functions:
```bash
supabase functions deploy family_gate
supabase functions deploy family_login
supabase functions deploy keepalive
```

5. Set secrets:
```bash
supabase secrets set FAMILY_ACCESS_CODE=your-secret-family-code
```

6. Disable signups in Supabase Dashboard > Auth > Settings

7. Create user accounts using Supabase Admin API or Dashboard:
   - Email format: `username@wellschaos.family`
   - Insert matching row in `profiles` table

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
    localCache.ts                   IndexedDB cache layer
    realtimeSync.ts                 Supabase Realtime subscriptions
  providers/
    AuthProvider.tsx                 Auth context
  content/
    questionnaires/                 Questionnaire content packs (JSON)
  components/
    WellsChaosCalendar/             All UI components
supabase/
  migrations/                       SQL migrations (001-008)
  functions/
    family_gate/                    Access code verification
    family_login/                   Login with rate limiting
    keepalive/                      Health check
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
