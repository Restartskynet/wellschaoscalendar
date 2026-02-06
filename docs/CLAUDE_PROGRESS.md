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
