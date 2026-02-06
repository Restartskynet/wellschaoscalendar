# Claude Progress Log

Append-only log of implementation slices. Each slice records what changed, why, and how to QA.

---

## SLICE 0 - Repo Recon + Invariants

**Status**: COMPLETE

**Baseline state**:
- Build: PASS (`npm run build`)
- Tests: PASS (1 test — smoke test for login header)
- Branch: `claude/add-supabase-backend-msqWg`

**What exists now**:
- Fully functional React prototype with in-memory state
- 8 preset accounts (ben, marie, rachel, chris, sam, jacob, erika, benny)
- Login screen with username/password + quick-login dev buttons
- Welcome -> Create Trip -> App flow
- App pages: Home, Calendar, Photos (placeholder), Chat, More (Packing + Budget)
- RSVP + event chat on time blocks
- 6 themes, custom avatars, profile editor
- Weather widget (static placeholder) on Home page
- No persistence (all state in React hooks)

**Do-Not-Break checklist**:
- [ ] Login screen header: "Wells Chaos Calendar" + "Family Trip Planning"
- [ ] Login screen layout/styling unchanged
- [ ] Bottom nav renders and navigates (5 tabs)
- [ ] iOS safe area handling preserved
- [ ] Admin can add/edit time blocks
- [ ] RSVP modal works
- [ ] Event chat works
- [ ] Build passes
- [ ] Tests pass

**Files created**:
- `docs/ARCHITECTURE.md` — living architecture doc
- `docs/CLAUDE_PROGRESS.md` — this file
- `.env.example` — env var template for Supabase

---

## SLICE 1 - Remove Weather + Viewport Zoom Fix + Mobile Budget CTA

**Status**: COMPLETE

**Changes**:

1. **Weather removed entirely**:
   - `src/types/wellsChaos.ts`: Removed `weather: string | null` from Trip type
   - `src/components/WellsChaosCalendar/HomePage.tsx`: Removed weather widget (Sun/Cloud imports, weather div)
   - `src/components/WellsChaosCalendar/CalendarView.tsx`: Removed weather banner (Cloud import, weather div)
   - `src/components/WellsChaosCalendar/CreateTripForm.tsx`: Removed `weather: null` from trip creation

2. **Viewport zoom disabled**:
   - `index.html`: Updated viewport meta to `width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover`

3. **Budget "Add Expense" mobile fix**:
   - `src/components/WellsChaosCalendar/MorePage.tsx`:
     - Removed inline "Add" button from expenses header (was admin-only, easily missed on small screens)
     - Added sticky FAB (floating action button) positioned above bottom nav (`bottom-24 right-4`)
     - FAB visible to ALL members (not just admins), per spec: "members can add expenses"
     - FAB has `data-testid="budget-fab"` for testing
     - Edit/delete expense remain admin-only

**How to QA**:
- Verify weather is gone from Home page and Calendar page
- Verify no pinch-to-zoom on mobile (iOS/Android)
- Navigate to More > Budget tab — FAB should appear as a purple "+" circle above bottom nav
- FAB should be tappable on any screen size
- Non-admin users can now add expenses

**Build**: PASS | **Tests**: PASS

---

## SLICE 2 - Supabase Client + Auth Scaffolding

**Status**: COMPLETE

**Changes**:

1. **Dependencies**: Added `@supabase/supabase-js`
2. **`src/lib/supabaseClient.ts`**: Supabase client singleton with:
   - Graceful fallback when env vars not configured (returns null)
   - Session persistence + auto refresh enabled
   - Edge function URL helper
3. **`src/providers/AuthProvider.tsx`**: React context providing:
   - `session`, `user`, `profile` state
   - `signIn(username, password, deviceId, deviceToken)` via edge function
   - `signOut()`
   - `isLoading`, `isConfigured` flags
   - Auto-listens for auth state changes
   - Auto-fetches profile from `profiles` table when user changes
4. **`src/App.tsx`**: Wrapped `WellsChaosCalendar` with `AuthProvider`

**No behavior change**: Existing prototype auth still works. Supabase auth is wired but dormant (no env vars configured = null client).

**How to QA**:
- App should function exactly as before (no visible changes)
- No errors in console about missing Supabase config

**Build**: PASS | **Tests**: PASS

---

## SLICE 3 - Core Schema SQL Migrations + RLS Policies

**Status**: COMPLETE

**Files created** in `supabase/migrations/`:

1. `001_profiles.sql` - Profiles (1:1 with auth.users), RLS: read all, update own
2. `002_trips.sql` - Trips + trip_members, RLS: members read, admins write
3. `003_days_blocks.sql` - Trip days + time blocks, helper functions `is_trip_member()` / `is_trip_admin()`, RLS: members read, admins write blocks
4. `004_rsvps_messages.sql` - RSVPs + messages (trip chat + event chat), RLS: members read, own RSVP write, append-only messages
5. `005_budget.sql` - Budget expenses, RLS: members read + add, admins/creators edit/delete
6. `006_packing.sql` - Base items (admin-managed) + per-user checks + personal items, RLS: admin manages base, users manage own checks/personal
7. `007_questionnaires.sql` - Questionnaires + responses (jsonb answers), RLS: members see their own responses, admins see all
8. `008_security.sql` - Device gates, auth attempts, username lockouts, allowed usernames allowlist, indexes for rate limit queries

**Key design decisions**:
- Packing: base items shared (admin writes), packed state per-user via `packing_checks`, personal items per-user only
- Messages table handles both trip chat and event chat (via trip_id / block_id)
- Security tables have no authenticated policies (managed by edge functions with service_role)
- Budget: all members can add expenses

**Build**: PASS | **Tests**: PASS

---

## SLICE 4 - Edge Functions: Family Gate + Rate Limit + Login

**Status**: COMPLETE

**Files created**:

1. **`supabase/functions/family_gate/index.ts`**: Family access code verification
   - POST `{ familyCode, deviceId }`
   - Validates code against `FAMILY_ACCESS_CODE` secret
   - Creates/upserts device_gates row
   - Returns `{ deviceToken }` for local storage

2. **`supabase/functions/family_login/index.ts`**: Server-enforced login
   - POST `{ username, password, deviceId, deviceToken }`
   - Validates device token (gate must be passed first)
   - Checks username allowlist
   - Rate limiting: 5 attempts/username -> 20min lock, 30/IP per 10min
   - Performs Supabase Auth `signInWithPassword` using `username@wellschaos.family`
   - Returns session tokens on success

3. **`supabase/functions/keepalive/index.ts`**: Health check endpoint
   - Light DB touch for uptime monitoring

4. **`src/components/WellsChaosCalendar/FamilyGateScreen.tsx`**: Gate UI
   - Shows before login on new devices
   - Stores device token in localStorage after success
   - Helpers: `getDeviceId()`, `getDeviceToken()`, `hasPassedGate()`

**Security documented limitation**: Anon key is visible in client JS. A determined attacker could bypass edge functions and call Supabase Auth directly. Strong passwords + RLS remain critical.

**How to deploy**:
```bash
supabase functions deploy family_gate
supabase functions deploy family_login
supabase functions deploy keepalive
supabase secrets set FAMILY_ACCESS_CODE=your-secret-code
```

**Build**: PASS | **Tests**: PASS

---

## SLICE 5 - Swap Prototype Auth to Supabase Auth

**Status**: COMPLETE

**Changes**:

1. **`LoginScreen.tsx`**: Updated to support dual-mode auth:
   - New props: `onSupabaseLogin`, `isSupabaseMode`
   - When Supabase configured: calls edge function via `onSupabaseLogin`
   - When not configured: uses existing preset account matching
   - Case-sensitive username (no trim, no normalize) — `autoCapitalize="off"`
   - Quick-login picker now dev-only (`import.meta.env.DEV`)
   - Brief cooldown after failed login attempts
   - `onKeyPress` replaced with `onKeyDown` (non-deprecated)

2. **`WellsChaosCalendar.tsx`**: Integrated gate + Supabase auth:
   - New `'gate'` view state
   - Shows FamilyGateScreen before login when Supabase configured + no device token
   - `handleSupabaseLogin()` calls `auth.signIn()` with device ID/token
   - AccountSwitcher now dev-only
   - Logout calls `auth.signOut()` in Supabase mode

3. **`App.test.tsx`**: Added 4 new tests (5 total):
   - Login fields render
   - Invalid login shows error
   - Case-sensitive username validation
   - Gate screen skipped when Supabase not configured

**Key behavior**:
- Without env vars (dev): everything works exactly as before
- With env vars (prod): gate -> login -> edge function -> session
- Login UI visually identical in both modes

**Build**: PASS | **Tests**: 5/5 PASS

---

## SLICE 6 - Realtime Sync + IndexedDB Local Cache

**Status**: COMPLETE

**Dependencies added**: `idb` (lightweight IndexedDB wrapper)

**Files created**:

1. **`src/lib/localCache.ts`**: IndexedDB cache layer
   - DB: `wcc-cache` with stores for trip, days, blocks, rsvps, messages, budget, packing, meta
   - Generic helpers: `cacheGet`, `cacheSet`, `cacheGetAll`, `cacheBulkPut`, `cacheClear`
   - Trip-specific: `cacheTripData()` (bulk save), `getCachedTripData()` (load cached state)
   - Tracks last sync timestamp per trip
   - All operations are best-effort (silent fail if IndexedDB unavailable)

2. **`src/lib/realtimeSync.ts`**: Supabase Realtime subscription layer
   - `subscribeToTrip(tripId, onChange)`: subscribes to postgres_changes on all sync tables
   - Tables: time_blocks, rsvps, messages, budget_expenses, packing_base_items, packing_checks, trip_days
   - Returns cleanup function for unmount
   - Graceful no-op when Supabase not configured

**Architecture**: On login, the app will:
1. Load cached state from IndexedDB (instant open)
2. Hydrate from Supabase (fresh data)
3. Subscribe to realtime changes
4. Apply updates to UI state + cache

**How to QA**: No visible changes yet — these are plumbing modules. Integration happens when Supabase is connected.

**Build**: PASS | **Tests**: 5/5 PASS

---

## SLICE 7 - Desktop Shell Pass

**Status**: COMPLETE

**Files created**:
- `src/components/WellsChaosCalendar/DesktopLayout.tsx`: Desktop sidebar layout

**Changes**:
- `WellsChaosCalendar.tsx`: Added DesktopLayout wrapper for `lg:` breakpoint

**Design**:
- Mobile (`< lg`): Bottom nav preserved exactly as before
- Desktop (`>= lg`): Fixed left sidebar (w-64) with nav items + centered main content (max-w-4xl)
- Sidebar shows trip name, nav items styled like the bottom nav but vertical
- Uses Tailwind `hidden lg:flex` / `lg:hidden` for responsive toggle (no JS media queries)
- iOS safe area handling preserved (only active on mobile)

**How to QA**:
- On mobile viewport: bottom nav visible, no sidebar
- On desktop viewport (>= 1024px): sidebar visible, no bottom nav
- Navigation works in both layouts

**Build**: PASS | **Tests**: 5/5 PASS

---

## SLICE 8 - Questionnaires v1

**Status**: COMPLETE

**Content packs** (`src/content/questionnaires/`):
1. `park-priorities.json` — Ride thrill level, pacing, must-dos, daily budget, group splitting (5 questions)
2. `food-preferences.json` — Dining style, dietary needs, snack budget allocation, reservations (4 questions)
3. `travel-comfort.json` — Wake-up time, walking tolerance, heat handling, midday breaks, special needs (5 questions)

All include knowledge cards with informative park tips.

**Components**:
1. `QuestionnairesPage.tsx` — Hub page with styled list, progress tracker, admin results access
2. `QuestionnaireEngine.tsx` — Full questionnaire engine supporting:
   - Single choice (radio-style)
   - Multi choice (checkbox-style)
   - Slider / scale
   - Budget allocation (100 points split)
   - Knowledge cards (expandable info panels)
   - Progress bar, animated transitions, completion screen
3. `QuestionnaireResults.tsx` — Admin-only results view:
   - Aggregate view: bar charts, consensus indicators, averages
   - Per-person drilldown: individual answers with outlier context
4. `src/content/questionnaires/index.ts` — Content pack loader with TypeScript types

**Integration**: Added as "Surveys" tab in the More page (alongside Packing and Budget)

**How to QA**:
- Navigate to More > Surveys tab
- Complete a questionnaire — progress bar, knowledge cards, all question types
- As admin user: view aggregate results after submitting
- Verify celebratory completion screen

**Build**: PASS | **Tests**: 5/5 PASS

---
