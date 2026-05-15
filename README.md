# Beach Volley App

Beach Volley App is a personal project built with React, TypeScript and Supabase to organize beach volleyball matches, open play sessions and player connections.

It currently includes:

- Public and private events
- Match and open play flows
- Match team assignment
- Match results with validation
- Competitive Elo rating
- Friends and public player profiles
- AI equipment verification
- Admin and stats tooling

Live app:

- https://beach-volley-app-blush.vercel.app/

## Product Overview

The app is designed around two active event types:

- `match`: structured 4-player match with teams, result validation and optional competitive rating
- `open_play`: flexible meetup with configurable participants

There is also future-facing support for:

- `tournament`: kept in the data model, not active in the product flow yet

## Current Features

### Events

- Create, edit and delete events
- Public or private visibility
- Match mode selection: `casual` or `competitive`
- Open play sessions with flexible capacity
- Direct private event links
- Private event join requests
- Private event invitations

### Match Flow

- Auto-assigned teams for matches
- Team A / Team B roster management
- Match result entry by creator
- Result validation by opposing team
- Locked match state after accepted result
- Finished/completed event display

### Competitive Rating

- Competitive Elo rating for accepted competitive matches
- Team rating based on average player rating
- Rating applied once per accepted result
- Rating games tracked separately from general matches played

### Profile

- Personal profile with created events
- Upcoming joined events
- Equipment badges
- Competitive/casual performance toggle
- Last 5 matches
- Pending private event requests and invitations

### Friends and Players

- Player search
- Friend requests
- Friends list
- Public player profiles at `/players/:userId`
- Public/private-safe match summaries on player profiles

### Discovery

- Events page
- Map page
- Calendar page
- Shared filtering system

### AI Equipment Verification

- Ball verification
- Net verification
- Supabase Edge Function based flow

### Admin

- User management
- Event management
- Stats dashboard

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React

### Backend

- Supabase Auth
- Supabase Postgres
- Supabase Edge Functions
- Supabase RLS

### Other

- Leaflet / React Leaflet
- FullCalendar
- Vitest
- React Testing Library

## Project Structure

The codebase follows a feature-based structure.

```bash
src/
├── app/
├── features/
│   ├── admin/
│   ├── auth/
│   ├── calendar/
│   ├── event-invitations/
│   ├── event-join-requests/
│   ├── events/
│   ├── friends/
│   ├── home/
│   ├── map/
│   ├── match-players/
│   ├── match-results/
│   ├── players/
│   ├── profile/
│   ├── ratings/
│   ├── registrations/
│   └── stats/
├── config/
├── layouts/
├── routes/
└── tests/
```

Each feature keeps:

- components
- hooks
- services
- types
- utilities when needed

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in `beach-volley-app/`:

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
npm run test
```

### 5. Build

```bash
npm run build
```

## Supabase Notes

This project relies on manual SQL migrations stored in:

```bash
supabase/migrations/
```

Key migrations already added in the project include:

- event visibility and mode support
- friends MVP
- private event invitations
- private event join requests
- match players
- match results and validation
- pending match result maintenance
- public player match summaries
- public profile mode stats and unfriend policy
- competitive Elo rating

If you are applying them manually in Supabase SQL Editor, use them in chronological order and make sure the later `create or replace function ...` migrations are also executed, because some functions were intentionally refined over time.

## Supabase Auth Notes

The app supports:

- email/password auth
- Google OAuth

For Google OAuth you need to configure:

- Google provider in Supabase Auth
- Client ID / Client Secret in Supabase dashboard
- redirect URLs for local and production environments

## Edge Functions

Current Supabase function in the project:

- `check-pending-match-results`

Related docs live here:

- [supabase/functions/check-pending-match-results/README.md](./supabase/functions/check-pending-match-results/README.md)

## Privacy Model

The app intentionally separates:

- full private event detail access
- safe public player profile access
- public browsing of events

Current privacy behavior includes:

- private events hidden from public listings
- direct private event URLs still supported
- public player profiles do not show email
- public player profiles only show safe match summaries, not private event detail pages

## Testing

Current automated coverage includes service, hook and utility tests for:

- auth
- events
- event invitations
- event join requests
- friends
- match players
- match results
- player public profiles
- profile stats
- ratings

## Roadmap Ideas

Possible future directions:

- tighter public/private privacy rules for player history
- richer notifications
- real-time chat
- tournament activation
- deeper match analytics
- code-splitting and bundle optimization

## Author

Eduard Goma
