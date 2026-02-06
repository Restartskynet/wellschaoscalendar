# Wells Chaos Calendar — Product Vision, Principles, and Build Plan (Family-Only)

Last updated: 2026-02-06  
Owner/Organizers: Ben & Marie  
Primary goal: a **fast, delightful, mobile-first trip companion** that opens instantly and shows the family exactly what matters **right now**.

---

## 1) What this app is (and isn’t)

### It *is*
- A **family-only** trip planner + live schedule for Disney/Universal-style park trips.
- A **mobile-first** “pull phone out → instantly see what’s next” tool.
- A lightweight hub for:
  - Calendar/time blocks (primary)
  - “Next up” + “Today at a glance”
  - Shared RSVP coordination + shared event chat (**multi-device sync**)
  - Packing list + shared budget (secondary)
  - Questionnaires to capture everyone’s preferences before the trip (high-value planning tool)

### It is *not* (for now)
- A public multi-tenant SaaS.
- A security-first auth product — this is family-only, but we still use real auth for compatibility with cloud sync and database policies.
- A “works with no signal” offline-first app (cellular is expected), though it should behave gracefully with spotty service.

---

## 2) Non-negotiable product principles

### Mobile-first, instant clarity
- **Calendar is king.**
- The UI prioritizes:
  1) What’s next
  2) Where to be
  3) When
  4) Who’s in / RSVP status

### Minimal bloat
- Only show what the family needs to act on.
- Everything else is secondary or tucked away.

### Fast on cellular
- Defer non-essential features.
- Lazy-load heavy screens.
- Avoid big payloads on first load.

### Delight matters (the app lives or dies here)
- Not “corporate form app”.
- Cute, animated, playful, but still readable in sun and fast on phones.
- Questionnaires must feel like an interactive experience, not homework.

### “Claude can improve it”
- We give principles + guardrails; Claude Code is encouraged to propose better UX and implementations.
- Don’t micromanage; do enforce invariants and verification.

---

## 3) Roles + editing policy

- Ben & Marie are the only **admins/organizers**.
- Members can do lots of “participation” actions, but cannot change “big structure”:
  - ✅ RSVP
  - ✅ chat
  - ✅ complete questionnaires
  - ✅ view schedule + details
  - ✅ manage their **own** personal packing items
  - ✅ add shared budget expenses
  - ✅ (future) upload photos (with strict limits)
  - ❌ modify trip structure or schedule blocks
  - ❌ view questionnaire results

---

## 4) Authentication (real sessions, keep the same login screen UI)

### UX requirement
- Keep the **exact same Login screen page UI** you have today (same layout/style), but:
  - remove the debug “quick profile picker” buttons under the form in production
  - remove any production “account switcher” debug UI
- Login must feel like: **Username + Password**, no email concepts exposed to users.
- No signup UI, no email confirmation, no “forgot password”.
- Users stay logged in “forever” (until they clear storage / reinstall).

### Strict login input rules (explicit decision)
- **Case-sensitive usernames** (no normalization).
- **No whitespace forgiving** (no trimming).
- Usernames are strict fixed tokens: `ben`, `marie`, `grandma`, etc.

### Tech choice
- **Supabase backend** + **Supabase Auth**.

### Username + password requirement (how we do it with Supabase)
Supabase password auth requires **email+password** or **phone+password**.  
So we implement a mapping:
- UI: user types `username` + password.
- Under the hood: we convert username → pseudo-email:
  - `ben` → `ben@wellschaos.family` (internal-only; users never see this)
- Then call `signInWithPassword({ email, password })`.

**Internal pseudo-email domain:** `wellschaos.family` (chosen).

### Account creation model (admin-only)
- Ben/Marie pre-create every family user account (unique username/password).
- Public signups disabled.
- Email confirmation disabled.
- Password resets handled manually by Ben/Marie (no UI flow).

### Dev-only helpers (allowed)
- Keep quick-login picker + account switcher **only in dev builds**:
  - shown only when `import.meta.env.DEV` is true
  - never included in production UI

---

## 5) Anti-bruteforce and family-only access gate (enforced)

Important: a **UI-only** “cryptic key page” does *not* stop attackers from hitting Supabase auth endpoints directly,
because your anon key exists in the shipped JS bundle.

So: the “family-only gate” must be enforced server-side.

### Required security model (Level 1 + Level 2 + Level 3)

**Level 1 (baseline)**
- Disable public signups
- Strong passwords
- RLS everywhere
- Client UX cooldown messaging after failed attempts (smooth, non-scary)

**Level 2 (hardening)**
- Allowlist usernames (only known family usernames can attempt auth)
- Rate limit per-IP
- Lockout per-username after repeated failures

Defaults:
- attempts before lock: **5**
- lock duration: **20 minutes**
- per-IP limit: **30 attempts / 10 minutes**

**Level 3 (family access code gate — actually enforced)**
- Add a **Supabase Edge Function** that mediates login:
  - requires a shared **Family Access Code**
  - validates allowlisted usernames
  - enforces rate limits + lockouts
  - only then attempts Supabase auth

**UX requirement:** keep the existing login page UI.  
So we implement a **one-time per-device** “Family Access Code” gate screen **before** the login screen:
- first launch on a device → enter family code once
- server returns a signed **family gate token**
- app stores the token locally
- subsequent logins send the token automatically (no repeated code entry)

This preserves a smooth login flow while keeping the gate server-enforced.

---

## 6) Regression-avoidance invariants (Claude Code must never break these)

**UI invariants**
- Login screen renders and works
- Admin can still add/edit time blocks
- RSVP modal works
- Per-event chat works
- Bottom nav works and respects iOS safe area

**Engineering invariants**
- `vite build` passes
- Tests pass using:
  - `CI=1 npx vitest run --pool=forks --no-file-parallelism`
- Any new feature must include either:
  - at least one test, OR
  - an explicit manual QA checklist (step-by-step)

---

## 7) Desktop + mobile: “two setups, one codebase”

- Mobile is primary.
- Desktop should have a distinct layout that feels native:
  - likely sidebar nav instead of bottom nav
  - wider “Today overview” panels
  - calendar + details side-by-side
- Same underlying pages + data; different **layout shell**.

---

## 8) Mobile UX fixes to prioritize
- Budget: “Add expense” button is hard/impossible to click on small mobile screens.
  - Fix with a sticky/fixed CTA, FAB, or bottom-sheet “Add expense” flow.
- Prevent “iOS zoom-in on input focus” **without changing font sizes**:
  - Disable zoom via viewport config (accepting reduced accessibility).
- Also remove pinch-to-zoom (family app preference), if feasible.

---

## 9) Low-data mode (future, high value idea)
A toggle that makes the app load even faster on cellular:
- Prioritize Home + Calendar
- Defer/lazy-load:
  - Photos
  - heavy questionnaire media
  - large images
- Optionally reduce animation intensity
- Keep UX pleasant, not “broken”

---

## 10) Persistence + multi-device sync (must-have)

### Architecture
- Local-first cache on each device (IndexedDB) for instant load and resilience.
- Cloud backend for shared sync.
- Realtime subscriptions so everyone sees changes quickly.

### Cloud data (Supabase)
Shared truth in Postgres:
- trips
- trip_members (role: admin/member)
- days
- blocks (admin-only writes)
- rsvps (members can write only their own RSVP)
- messages (append-only; members can write)
- questionnaires, questions, responses, answers
- budgets + expenses (members can add expenses)
- packing list (shared admin “base list” only; personal items stay local)
- (future) photos + metadata + storage bucket

### Conflict rules (simple by design)
- chat = append-only
- RSVP = last-write-wins per user/event
- schedule blocks = admin-only (minimal conflicts)

### Free-tier pausing mitigation
- Add a scheduled “keep alive” ping while on the free plan.
- Later: switch to Pro.

---

## 11) Photos (future launch milestone; keep placeholder for now)
Before launch (future milestone), implement:
- photo upload to storage
- automatic sorting (by day/time, optionally by person)
- fun, cute gallery UX

Cost-control requirements:
- strict upload size limits
- strict per-user quotas / rate limits
- compress images on-device + generate thumbnails
- respect low-data mode (don’t auto-load full-size)

---

## 12) Weather (removed)
Weather widget/system is removed to avoid cost and complexity.

---

## 13) The questionnaire system (major feature — must be delightful)

### Why it matters
This is how Ben & Marie design a trip that fits what the group actually wants, *without* the group needing park expertise.

### Requirement: assume participants know nothing
Treat every participant as:
- first-time visitors
- no idea about rides, resorts, costs, food, logistics

So questionnaires must be:
- **fun**
- **short**
- **informative**
- **interactive**
- “decision-helping,” not “busywork”

### The key concept: “Question + Knowledge Card”
Each question includes:
- short explanation
- “what this means in real life”
- pros/cons
- simple ranges (cost/effort) where safe
- examples and context so they never have to leave the app

### Content strategy
- Build the questionnaire engine + delightful UI/UX
- Put “park knowledge” into editable content packs (JSON/MD)
- Start with general guidance (avoid fragile pricing claims)
- Later: optional content refresh workflow

### Results visibility and outputs (admin-only)
- Only admins can view results.
- Default view: **aggregate dashboards** (clean, beautiful, decision-ready infographics).
- Secondary view: **per-person drilldowns** for edge cases and outliers.

---

## 14) Proposed build roadmap (safe + realistic)

### Milestone 1 — UX polish for “in-park daily use”
- Home: “Next up” is perfect
- Calendar: editing is smooth (admins) and reading is effortless (members)
- Modals: RSVP/chat feel instant
- Mobile layout is flawless; desktop layout shell introduced
- Fix key mobile issues (Budget CTA, input zoom / pinch zoom)

### Milestone 2 — Persistence + sync foundation
- local DB implemented (IndexedDB)
- cloud sync implemented (Supabase + Realtime)
- stable IDs, timestamps, migrations
- tests for persistence boundaries + basic sync flows

### Milestone 3 — Questionnaires (engine + first set + dashboards)
- questionnaire list page
- first 3 questionnaires
- aggregate dashboards + per-person drilldowns (admin-only)
- emphasis: delight, animation, “knowledge cards”

### Milestone 4 — Photos (future)
- storage + uploads
- gallery UX
- low-data mode integration

---

## 15) Claude Code prompt strategy (how we’ll drive it)
- Use structured prompts (XML sections).
- Require repo recon first.
- Implement in small slices.
- After each slice:
  - run build
  - run tests with the known-good Vitest command
- Require a “what changed + why + how to verify” report.
---

## 16) Distribution: PWA vs App Store / Play Store (goal and path)

### What a PWA is (what you have now)
- A **web app** that can be “installed” from the browser (Add to Home Screen).
- It can run full-screen, have an icon, cache assets, and feel app-like.
- Updates are instant (ship a new web build → everyone gets it).

### What an App Store / Play Store app is
- A **packaged app** submitted to Apple/Google, reviewed, and installed from the stores.
- You can still use your same web code if you wrap it, but it’s a different distribution pipeline.

### Recommended path for Wells Chaos Calendar
- **Build as PWA first** (fast iteration, perfect for family/private use).
- When ready for stores:
  - Wrap the existing Vite/React app using **Capacitor** (or similar WebView wrapper),
  - add store metadata, icons, splash screens, and any native permission glue you want.
- Important: the “disable pinch-to-zoom / input zoom” behavior can be enforced in both the PWA and a wrapped app.

Decision: target **PWA-first**, with an explicit future milestone to wrap for iOS App Store + Google Play.
