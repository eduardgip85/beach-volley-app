# Sandset

Sandset is a React + TypeScript + Supabase project for organizing beach volleyball matches, open play sessions, player profiles, private access flows, and competitive tracking.

Live app:

- https://sandset.app/

## What The App Does

The current product focuses on two active event types:

- `match`: structured match flow with teams, results and validation
- `open_play`: flexible meetup flow with optional unlimited capacity

There is also future-facing support for:

- `tournament`: present in product planning and UI direction, but not fully active yet

## Current Features

### Events

- Create, edit and delete events
- Public and private visibility
- Match mode selection: `casual` or `competitive`
- Open play with flexible or unlimited spots
- Location picking from map search + map pinning
- Private event link sharing
- Private join requests
- Private invitations

### Match Flow

- Match creator joins automatically
- Team A / Team B assignment
- Result entry by sets
- Competitive matches fixed to best-of-3:
  - sets 1 and 2 to 21
  - set 3 to 15
  - win by 2
- Result validation by the opposing side
- Accepted results only count for rating and stats
- Stale unvalidated matches can be cancelled by SQL maintenance rule

### Competitive Rating

- Competitive rating on a `0.00 - 10.00` scale
- Individual per-player gain/loss logic
- Accepted competitive results only
- Rating history and backfill support
- Ranking views:
  - global
  - country
  - friends
- Competitive insights and rating evolution chart

### Profile

- Public profile with safe sharing
- Player preferences:
  - preferred hand
  - preferred court side
  - preferred match type
  - availability
  - preferred play days
- Recent match history
- Premium-history style section:
  - competitive / casual toggle
  - filters
  - full history page
- Equipment badges
- Private event invitations and join requests overview

### Discovery

- Events page
- Calendar page
- Map page
- Shared filters
- "My events" filtering
- Private events visible only to the right user contexts

### Admin

- User management
- Event management
- Search and pagination in admin events
- Admin analytics dashboard
- Mobile-friendly stats UI

### Auth And Account

- Email/password auth
- Google OAuth
- Forgot password flow
- Reset password flow
- Account settings and delete-account flow

### Localization

- English and Spanish
- Automatic defaulting based on browser/timezone heuristics
- User preference persisted in profile/settings

### Observability

- Vercel Analytics
- Vercel Speed Insights

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React i18next
- Recharts
- Leaflet / React Leaflet
- FullCalendar

### Backend / Platform

- Supabase Auth
- Supabase Postgres
- Supabase RLS

### Testing

- Vitest
- Testing Library

## Project Structure

The app uses a feature-based structure:

```text
src/
  app/
  config/
  features/
    admin/
    auth/
    calendar/
    event-invitations/
    event-join-requests/
    events/
    friends/
    home/
    map/
    match-players/
    match-results/
    players/
    profile/
    ratings/
    registrations/
    settings/
    stats/
  layouts/
  routes/
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

### 3. Run the app

```bash
npm run dev
```

### 4. Run tests

```bash
npm run test -- --run
```

### 5. Build

```bash
npm run build
```

## SQL Notes

This repo keeps project SQL that still needs to be applied manually in Supabase inside:

```text
sql/
```

Current SQL files include:

- `2026-05-19_profile_player_preferences.sql`
- `2026-05-19_stale_match_cancellation_rule.sql`

Use these for:

- player preference columns on `profiles`
- stale unvalidated match cancellation helper

There is also a short note in:

- [sql/README.md](./sql/README.md)

## Product Rules Worth Remembering

- Private events are not public browseable by default
- Accepted competitive results are the source of truth for rating/stats
- A past match without an accepted result should not count as completed competitive history
- Open play is social/participation oriented, not rating oriented
- Country is intended to be public for ranking/local discovery

## Recommended QA Before Big New Features

Before adding chat or tournaments, it is worth re-checking:

- auth and password recovery
- private event access via shared links
- edit/delete flows
- competitive rating and accepted-result rules
- profile history and filters
- mobile UI for calendar, profile and admin stats
- all SQL applied in Supabase

## Near-Future Ideas

- friend chat with short retention
- tournament activation
- richer premium gating
- deeper competitive analytics
- stronger notifications / realtime

## Author

Eduard Goma
