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

## SLICE 9 - Photos Placeholder + Future Plan + README Update

**Status**: COMPLETE

**Changes**:

1. **README.md**: Comprehensive rewrite reflecting new architecture:
   - Supabase backend documentation
   - PWA-first + later Capacitor distribution plan
   - How to configure env vars
   - How to apply migrations (step by step)
   - How to deploy edge functions
   - Keepalive ping option
   - Security notes with honest residual limitations
   - Updated project structure

2. **docs/ARCHITECTURE.md**: Updated with:
   - Questionnaire system documentation
   - Photos future plan spec (storage bucket, upload limits, thumbnails, quotas)
   - Distribution roadmap (PWA -> Capacitor)

3. **Photos tab**: Remains as existing placeholder (no changes needed — already well-styled)

**Build**: PASS | **Tests**: 5/5 PASS

---

## Summary — Phase 1 Complete (Slices 0-9)

| Slice | Description | Status |
|-------|-------------|--------|
| 0 | Repo recon + invariants | DONE |
| 1 | Remove weather + viewport zoom + budget CTA | DONE |
| 2 | Supabase client + auth scaffolding | DONE |
| 3 | SQL migrations + RLS policies | DONE |
| 4 | Edge Functions (gate, login, keepalive) | DONE |
| 5 | Swap to Supabase auth (preserve login UI) | DONE |
| 6 | Realtime sync + IndexedDB cache | DONE |
| 7 | Desktop shell pass | DONE |
| 8 | Questionnaires v1 | DONE |
| 9 | Photos placeholder + docs + README | DONE |

---

# Phase 2 — Wiring + Bug Fixes + Questionnaires V2

---

## SLICE 10 - Phase 2 Recon + Baseline + Migration Idempotency

**Status**: COMPLETE

**Baseline state**:
- Build: PASS (`npm run build`)
- Tests: 5/5 PASS (`CI=1 npx vitest run --pool=forks --no-file-parallelism`)
- Branch: `claude/wire-chaos-calendar-integration-t1g91`
- `@supabase/supabase-js` confirmed in package.json dependencies

**Known issues identified**:
1. **Questionnaire "Next" tap blocked on mobile**: QuestionnaireEngine footer has `z-40`, BottomNav has `z-50` — BottomNav sits on top
2. **Budget modal actions not always reachable**: Modal actions at bottom of scrollable content, no sticky footer
3. **Supabase wiring gaps**: All features still use in-memory local state (time_blocks, rsvps, messages, budget, packing, questionnaire responses)
4. **Realtime not scoped**: `realtimeSync.ts` subscribes to all rows globally, no `trip_id` filter
5. **Migration idempotency**: 41 CREATE POLICY statements lacked DROP POLICY IF EXISTS guards

**Changes**:
- **All 7 migration files (001-007)**: Added `DROP POLICY IF EXISTS` before every `CREATE POLICY` statement (41 policies total), making all migrations idempotent and safe to re-run with `supabase db push`
- 008_security.sql was already idempotent (no changes needed)

**How to QA**:
- Migrations can now be re-applied without "policy already exists" errors
- `supabase db push` will succeed even if policies already exist on remote

**Build**: PASS | **Tests**: 5/5 PASS

---

## SLICE 11 - Questionnaire Focus Mode + Fix Next Tap (P0)

**Status**: COMPLETE

**Problem**: QuestionnaireEngine footer nav had `z-40`, BottomNav had `z-50`. On mobile, BottomNav sat on top of the Next/Finish buttons, making them untappable.

**Solution**: Option 1 — Focus Mode. Hide BottomNav entirely when a questionnaire is in progress.

**Changes**:
1. **`WellsChaosCalendar.tsx`**: Added `focusMode` state + `handleFocusModeChange` callback. BottomNav conditionally hidden when `focusMode === true`.
2. **`MorePage.tsx`**: Added `onFocusModeChange` prop, passed through to QuestionnairesPage.
3. **`QuestionnairesPage.tsx`**: Added `onFocusModeChange` prop. Uses `useEffect` to notify parent when `activeQuestionnaire` changes. Cleanup returns `false` on unmount.
4. **`QuestionnaireEngine.tsx`**: Footer nav bumped to `z-50`, added `pb-safe` for iOS safe area, added `data-testid="questionnaire-nav"` and `data-testid="questionnaire-next"`.

**How to QA**:
- Navigate to More > Questionnaires > tap any questionnaire
- BottomNav should disappear immediately
- Next/Finish button should be fully tappable on any mobile screen size
- Pressing back or completing the questionnaire restores BottomNav

**Build**: PASS | **Tests**: 10/10 PASS (5 new tests added)

---

## SLICE 12 - Budget Modal Mobile UX Fix (P0)

**Status**: COMPLETE

**Problem**: Budget modal's Save/Add buttons were at the bottom of a scrollable div, potentially pushed off-screen on small devices when the form was long.

**Solution**: Restructured modal to use flex column layout with:
- Sticky header (flex-shrink-0)
- Scrollable content area (flex-1 overflow-y-auto)
- Sticky footer with action buttons (flex-shrink-0, always visible)

**Changes**:
- **`MorePage.tsx`**: Budget form modal restructured from `overflow-y-auto` on entire modal to flex column with separate scrollable content and sticky footer. Added `data-testid="budget-modal"`, `data-testid="budget-modal-actions"`, `data-testid="budget-save"`.

**How to QA**:
- Navigate to More > Budget > tap the + FAB
- On a small screen, scroll through the split-with list
- Cancel and Save/Add Expense buttons should always be visible at the bottom
- Buttons should be tappable even on the smallest screens

**Build**: PASS | **Tests**: 10/10 PASS

---

## SLICE 13 - Supabase Auth Path Verification + Edge Function Configs

**Status**: COMPLETE

**Changes**:
- Created `config.toml` for each edge function (`family_gate`, `family_login`, `keepalive`) with `verify_jwt = false`
- Auth path verified: gate → login → edge function → session → profile hydration → trip load
- Dev mode continues to work without Supabase

**Build**: PASS | **Tests**: 10/10 PASS

---

## SLICE 14 - Wire Core Data to Supabase

**Status**: COMPLETE

**Files created**:
1. **`src/lib/supabaseData.ts`**: Full Supabase data layer:
   - Typed DB row types for all tables
   - Fetch functions: fetchActiveTrip, fetchTripMembers, fetchTripDays, fetchTimeBlocks, fetchRsvps, fetchMessages, fetchBudgetExpenses, fetchPackingItems, fetchQuestionnaireResponses
   - Mutation functions: createTrip, addTimeBlock, updateTimeBlock, deleteTimeBlock, upsertRsvp, sendMessage, addBudgetExpense, updateBudgetExpense, deleteBudgetExpense, addPackingBaseItem, deletePackingBaseItem, upsertPackingCheck, saveQuestionnaireResponse
   - `hydrateTripData()`: parallel fetch of all trip data in one call
2. **`src/hooks/useTripData.ts`**: Hook to assemble Supabase rows into app Trip type

**Files changed**:
- **`WellsChaosCalendar.tsx`**: Major rewrite:
  - Imports Supabase data/mutation functions
  - `loadSupabaseTrip()`: fetches active trip, hydrates data, sets state
  - `assembleFromSupabase()`: converts flat Supabase rows → nested Trip type
  - Supabase-backed mutation callbacks for chat, budget, packing (write-through)
  - Profile hydration from AuthProvider
  - Cleanup on logout

**How to QA**:
- **Without Supabase** (dev mode): app works exactly as before (local state)
- **With Supabase** (env vars set): login → auto-loads trip → data from DB → mutations write to Supabase

**Build**: PASS | **Tests**: 10/10 PASS

---

## SLICE 15 - Realtime Scoping + Fast-Open Local Cache

**Status**: COMPLETE

**Changes**:
1. **`src/lib/realtimeSync.ts`**: Rewritten with proper trip scoping:
   - Tables with `trip_id` (messages, budget_expenses, packing_base_items, trip_days) use filter: `trip_id=eq.<tripId>`
   - Tables without `trip_id` (time_blocks, rsvps, packing_checks) subscribe to all, RLS gates access
   - Documented DELETE filtering limitation (DELETE payloads only contain PK columns)
2. **`WellsChaosCalendar.tsx`**: Integrated cache and realtime:
   - On login: attempts IndexedDB cache load first (fast-open)
   - Then hydrates from Supabase (source of truth)
   - Writes to IndexedDB cache after hydration
   - Subscribes to realtime changes; on change, refetches full dataset
   - Cleanup on logout and unmount

**How to QA**:
- With Supabase: trip data appears quickly (cached), then refreshes from server
- Changes made by other family members appear in realtime
- Logout cleans up subscriptions

**Build**: PASS | **Tests**: 10/10 PASS

---

# Phase 3 — Realtime Gaps, Privacy Fixes, Trip-Scoped RSVPs

---

## SLICE 16 - Add trip_id to RSVPs (Schema + Backfill + RLS + Indexes)

**Status**: COMPLETE

**Files created**:
- `supabase/migrations/009_rsvps_trip_id.sql`:
  - Adds `trip_id uuid` column to rsvps (nullable, references trips)
  - Backfills from rsvps → time_blocks → trip_days → trip_id
  - Indexes: `idx_rsvps_trip_id`, `idx_rsvps_trip_block` (composite)
  - RLS policies with trip_id integrity checks (INSERT/UPDATE verify block's trip matches rsvp's trip)
  - All idempotent (DROP IF EXISTS, ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS)

**Files changed**:
- `src/lib/supabaseData.ts`: Added `trip_id` to `DbRsvp`, updated `upsertRsvp()`

---

## SLICE 17 - Realtime: Add Missing Tables + Trip-Filter RSVPs

**Status**: COMPLETE

**Files changed**:
- `src/lib/realtimeSync.ts`:
  - TRIP_FILTERED: +rsvps, +personal_packing_items, +questionnaires
  - RLS_ONLY: +questionnaire_responses
  - rsvps moved from RLS_ONLY → TRIP_FILTERED

---

## SLICE 18 - Personal Packing Items CRUD + Hydration

**Status**: COMPLETE

**Files changed**:
- `src/lib/supabaseData.ts`: DbPersonalPackingItem type, fetch + CRUD, HydratedTripData + hydrateTripData updated

---

## SLICE 19 - Fix Packing Checks Per-User Bug + Wire Personal Items

**Status**: COMPLETE

**Bug fixed**: checkMap keyed by base_item_id only → other users' checks overwrote current user.

**Files changed**:
- `src/types/wellsChaos.ts`: +PersonalPackingItem type
- `WellsChaosCalendar.tsx`: assembleFromSupabase filters checks by currentUserId, personal items state + handlers
- `useTripData.ts`: Same per-user fix

---

## SLICE 20 - UI: My Personal Items + Budget Modal Testids

**Status**: COMPLETE

**Files changed**:
- `MorePage.tsx`: +personalPackingItems props, "My Personal Items" section, budget modal testids, onFocusModeChange passthrough to QuestionnairesPage

---

## SLICE 21 - Cache: Personal Items + Questionnaire Responses

**Status**: COMPLETE

**Files changed**:
- `localCache.ts`: DB_VERSION 2, +PERSONAL_PACKING +QUESTIONNAIRE_RESPONSES stores
- `WellsChaosCalendar.tsx`: Updated cacheTripData call

---

## SLICE 22 - Tests + Documentation

**Status**: COMPLETE

**Tests added** (5 new → 15 total):
1. Personal packing section renders with items
2. onAddPersonalItem called on add
3. onTogglePersonalItem called on toggle
4. onDeletePersonalItem called on delete
5. Combined progress of shared + personal items

**Build**: PASS | **Tests**: 15/15 PASS

### Manual QA Steps
- **Mobile**: Packing tab shows "Shared List" + "My Personal Items" sections
- **Multi-user**: Two users see different packing check states (per-user checks)
- **Privacy**: Personal items visible only to owner (RLS enforced)
- **Budget**: FAB → modal with sticky footer → Save always visible
- **Realtime**: Changes to questionnaire_responses + personal_packing_items trigger refresh
