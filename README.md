# Wells Chaos Calendar ✨

**WellsChaosCalendar.com** is a **cute, stylized, visual trip calendar** designed to reduce *vacation chaos* while making planning feel like part of the fun.

It's built for trips where everyone wants both:

* **Family anchor time** (rides, dinners, shows, photos, must-dos)
* **Personal freedom time** (solo adventures, naps, thrill rides, pool breaks, shopping)

The goal is simple:

✅ **Everyone knows where to be and when**  
✅ **Everyone gets guilt-free personal time**  
✅ **No confusion, no arguing, no "wait… what's the plan?"**

But the *vibe* matters too:

> This shouldn't feel like a corporate scheduling tool.
> It should feel like a cute little "trip brain" you actually enjoy opening and gives you all the information you need while on the trip.

---

## What this is for

This calendar is built specifically for theme park trips—especially trips to:

* Walt Disney World Resort
* Universal Studios Florida

Where:

* plans change fast,
* people split up often,
* energy levels vary wildly,
* and a "plan in someone's head" becomes an instant disaster.

### The core philosophy

> Plan the anchors (family blocks).  
> Leave the rest as flexible personal blocks.  
> Everyone wins.

---

## Current Features ✨

### 🔐 Authentication & Roles
- **Admin Accounts** (Ben & Marie): Full calendar control, create/edit/delete events, assign parks
- **User Accounts** (Rachel, Chris, Sam, Jacob, Erika, Benny): RSVP to events, add comments
- Quick test login for easy development
- Account switcher for testing different user perspectives
- Custom profile pictures with circular crop
- Crown badges for admins 👑

### 🏠 Home Page
- **Trip Countdown**: Animated days until trip starts
- **Current Time Widget**: Live clock with next event preview
- **Excitement Meter**: Family members rate their excitement (1-5 ⭐)
- **Park Schedule**: View all trip days, admins can assign parks
- **Trip Details**: Hotel info, duration, custom notes
- **Weather Widget (placeholder)**: Orlando weather copy until live data is wired up

### 📅 Calendar Page
- **Day-by-Day Timeline**: Navigate through trip days
- **Smart Time Blocks**:
  - 🎟️ **Family Blocks**: Ticket-style design (orange/pink gradient)
  - ☁️ **Personal Blocks**: Cloud-style design (blue/purple gradient)
- **Location Details**: Auto-filled with specific directions (e.g., "Fantasyland, Beast's Castle")
- **Next Event Banner**: Always visible with time remaining

### 🎢 Disney & Universal Integration
- **Massive Preset Library**:
  - 100+ attractions across all parks
  - 80+ restaurants
  - Shows, parades, and fireworks
  - Common activities (pool time, shopping, etc.)
- **Auto-Fill Location**: Specific park directions included
- **Park Assignment**: Track which park you're visiting each day

### 💬 Interactive Features
- **RSVP System**: 
  - "Going!" or "Can't Make It" options
  - Add fun 50-character quips
  - See who's attending with avatars
- **Event Chat**: Mini chat for each event block
- **Admin & User Parity**: Admins can RSVP and interact just like regular users

### 🎨 Personalization
- **6 Gorgeous Themes**:
  - 🏰 Magic Kingdom (pink/purple)
  - 🌍 EPCOT (blue/cyan)
  - 🎬 Hollywood Studios (yellow/orange)
  - 🌳 Animal Kingdom (green/emerald)
  - ⚡ Universal (indigo/purple)
  - 💜 Classic Purple
- **Enhanced Theme Selector**: Clear visual indication with ring, scale, and checkmark
- **Custom Avatars**: Upload and crop circular profile pictures
- **Personal Theme Settings**: Each family member picks their favorite

### 📱 Mobile-First Design
- **Bottom Navigation**: Easy switching between pages
- **Touch-Friendly**: Large tap targets, optimized for on-the-go
- **Responsive**: Works beautifully on phones, tablets, and desktop
- **Safe Area Support**: Respects device notches and home indicators

---

## Design Philosophy

### ✦ Visual Identity

* Cute, warm, pastel colors, playful (but not childish)
* Vacation energy: bright, airy, happy
* Calendar that feels like a **storybook itinerary**
* Visual clarity at a glance (no dense lists)

### ✦ Animation Goals

Animations are **decoration** and **communication**:

* Soft transitions between days (swipe/slide)
* Blocks "snap" into place with slideIn animation
* Gentle "pulse" for upcoming events
* Pop-in animations for RSVPs
* Bounce animation for countdown timer
* Delightful empty states (clouds instead of "no events")

**Rule:** Animations stay lightweight (mobile-first), never laggy or distracting.

---

## Design Rules (Non-Negotiable)

This project dies if it becomes ugly, confusing, or corporate.

1. **Mobile-first, thumb-friendly**  
   Used while walking, sweating, holding snacks, wrangling people.

2. **Glanceable clarity**  
   Your eyes should "read the day" in 2 seconds.

3. **Fun visuals without clutter**  
   Cute ≠ messy. Cute + clean is the goal.

4. **Animations must help comprehension**  
   No flashy junk. No lag. No "app store scam vibes."

5. **Flexible by default**  
   Most of the day should be personal/free time. Anchors are intentional.

---

## Information Model (Data Structure)

### Trip
* name
* start date, end date
* members (array of account objects)
* hotel (name, address)
* notes
* days (array)

### Day
* date
* park (optional - assigned by admins)
* blocks (array of time blocks)

### Block
* type: `FAMILY` or `PERSONAL`
* title
* start time, end time
* location (with specific directions)
* park
* notes
* rsvps (array of { username, status, quip })
* chats (array of { username, message, timestamp })

### User Account
* username
* password (preset for testing)
* name
* role: `admin` or `user`
* defaultAvatar (emoji)
* customAvatar (uploaded image URL)
* theme (selected theme name)

---

## Tech Stack

### Frontend
- **React 18** with Hooks
- **Tailwind CSS** for styling
- **Lucide React** for icons
- Custom animations with CSS keyframes

### Future Backend (Planned)
- **Next.js** for server-side rendering
- **NextAuth.js** for authentication
- **Vercel** for deployment
- **GitHub** for version control

### Current State
- Fully functional React prototype
- In-memory state management
- No backend required for testing

---

## Roadmap

### ✅ v1 — "We will use this on the trip" (COMPLETED)
- [x] Timeline per day with navigation
- [x] Create/edit/delete blocks (admin only)
- [x] Strong visual distinction between block types
- [x] Family & personal time blocks
- [x] RSVP system with quips
- [x] Location details with park-specific directions
- [x] Event chat
- [x] Park schedule
- [x] Excitement meter
- [x] Trip countdown
- [x] Weather widget
- [x] Theme customization

### 🚧 v2 — "Make it delightful" (IN PROGRESS)
- [x] Better day navigation
- [x] Per-person customization (themes, avatars)
- [x] Quick add templates (extensive presets for Disney/Universal)
- [x] "Next event" banner
- [ ] Photos page with memory sharing allowing users to upload photos to a gallery
- [ ] A page to chat and have conversations
- [ ] Packing checklist (admin managed)
- [ ] Budget splitter
- [ ] Shareable read-only links

### 🔮 v3 — "Trip brain mode" (PLANNED)
- [ ] Push notifications for upcoming events
- [ ] Offline support with service workers
- [ ] Real-time sync across devices
- [ ] Check-in/status updates
- [ ] Export to calendar (ICS)
- [ ] Trip recap video/slideshow
- [ ] Other ideas not thought of yet

---

## Family Accounts

### Admins
- **Ben** (`ben` / `magic2024`) 👨 - Can manage entire calendar
- **Marie** (`marie` / `disney123`) 👩 - Can manage entire calendar

### Users
- **Rachel** (`rachel` / `rides4eva`) 👧
- **Chris** (`chris` / `universal1`) 👦
- **Sam** (`sam` / `vacation!`) 🧒
- **Jacob** (`jacob` / `funtime99`) 👶
- **Erika** (`erika` / `princess2`) 👧
- **Benny** (`benny` / `explorer7`) 🧑

---

## Getting Started

### Development
1. Clone the repository
2. Open in your development environment
3. Quick test login as any family member
4. Create a trip and start planning!

### Creating Your First Trip
1. Login as **Ben** or **Marie** (admins)
2. Click "Create Your Trip"
3. Enter trip name, dates, and optional hotel details
4. Start adding events using the massive Disney/Universal preset library!

### Testing Features
1. Login as admin, create events
2. Switch accounts (Users icon) to test as regular user
3. RSVP to events, add fun quips
5. Chat on events
6. Rate your excitement level

---

## Deployment (Future)

Planned deployment on **Vercel**:
- GitHub repository: `main` branch → production
- Automatic deployments on push
- Preview deployments for pull requests

---

## Design Credits

All Disney and Universal park names, attraction names, and restaurant names are used for trip-planning reference only. This is a personal planning tool and is **not affiliated with** Disney or Universal.

---

## Why This Exists (The Honest Version)

Family trips are amazing — but the logistics can get dumb fast.

This is a lightweight, cute, visual system that:

* prevents misunderstandings,
* protects personal downtime,
* and makes together moments intentional.

**No more "wait, what was the plan?"**  
**No more guilt about needing a break.**  
**Just a happy family, having fun, together and apart.**

---

**Built with ❤️ by Ben & Marie**  
*Organized by Ben & Marie ✨*
