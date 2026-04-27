# 🏐 Beach Volley App  
### Projecte 4 → Dashboard + Data Visualization  
### Projecte 5 → Producte final (evolució)

---

# 1. Project Overview

## 1.1 Goal

- Product goal: Crear una plataforma web per organitzar partits i tornejos de voley platja.
- User goal: Permetre als usuaris crear, descobrir i unir-se a esdeveniments.
- Technical goal: Desenvolupar un dashboard complet amb gestió de dades, mapa, calendari i estadístiques.

---

## 1.2 Scope

### In scope (Projecte 4)
- Autenticació (Supabase)
- CRUD d’esdeveniments
- Mapa interactiu
- Calendari
- Estadístiques
- Inscripcions
- Sistema de rols

### Out of scope
- IA
- Sistema d’equips avançat
- Notificacions

---

# 2. Users & Roles

- Player: Crear events, unir-se
- Admin: Control total

---

# 3. Core Features

## 3.1 Functional
## Events
Crear event
Editar event
Eliminar event
Veure detall event
## Mapa
Mostrar events amb markers
Clic → popup
Navegar a detall
## Calendari
Vista mensual
Mostrar events
Clic → detall
## Estadístiques
events totals
per tipus
per mes
ocupació
## Inscripcions
Usuari s’inscriu
Límit de participants
## Auth
Login/Register
Rutes protegides
Rol admin/player

---

# 4. Data Model & tables

- Event:
export type EventType = "match" | "tournament";
export type EventStatus = "active" | "cancelled" | "completed";
export interface Event {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  locationName: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string | null;
  maxParticipants: number;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

- Registration:
export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
}

- User:
export type UserRole = "player" | "admin";
export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
}
---

# tables

- Profile table
id uuid primary key
full_name text
role text -- "player" | "admin"
avatar_url text nullable
created_at timestamp

- Event table
id uuid primary key
title text
description text nullable
type text -- "match" | "tournament"
location_name text
latitude numeric
longitude numeric
start_date timestamp
end_date timestamp nullable
max_participants integer
status text -- "active" | "cancelled" | "completed"
created_by uuid references profiles(id)
created_at timestamp
updated_at timestamp

- Registration table
id uuid primary key
event_id uuid references events(id)
user_id uuid references profiles(id)
created_at timestamp

# 5. Routes

/
├─ /login
├─ /register
│
├─ /dashboard
├─ /events
├─ /events/create
├─ /events/:eventId
├─ /events/:eventId/edit
├─ /map
├─ /calendar
├─ /stats
├─ /profile
│
└─ /admin
   ├─ /admin/users
   └─ /admin/events

---

# 6. Structure

beach-volley-app/
├─ public/
│  └─ logo.svg
│
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ router.tsx
│  │  └─ providers.tsx
│  │
│  ├─ assets/
│  │  └─ images/
│  │
│  ├─ config/
│  │  ├─ env.ts
│  │  └─ supabase.ts
│  │
│  ├─ layouts/
│  │  ├─ AuthLayout.tsx
│  │  ├─ DashboardLayout.tsx
│  │  └─ PublicLayout.tsx
│  │
│  ├─ routes/
│  │  ├─ ProtectedRoute.tsx
│  │  └─ AdminRoute.tsx
│  │
│  ├─ shared/
│  │  ├─ components/
│  │  │  ├─ Button.tsx
│  │  │  ├─ Input.tsx
│  │  │  ├─ Select.tsx
│  │  │  ├─ Modal.tsx
│  │  │  ├─ LoadingSpinner.tsx
│  │  │  ├─ EmptyState.tsx
│  │  │  ├─ ConfirmDialog.tsx
│  │  │  └─ PageHeader.tsx
│  │  │
│  │  ├─ hooks/
│  │  │  ├─ useDebounce.ts
│  │  │  └─ usePagination.ts
│  │  │
│  │  ├─ types/
│  │  │  ├─ role.types.ts
│  │  │  └─ common.types.ts
│  │  │
│  │  └─ utils/
│  │     ├─ date.utils.ts
│  │     ├─ format.utils.ts
│  │     └─ permissions.utils.ts
│  │
│  ├─ features/
│  │  ├─ auth/
│  │  │  ├─ pages/
│  │  │  │  ├─ LoginPage.tsx
│  │  │  │  └─ RegisterPage.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ LoginForm.tsx
│  │  │  │  └─ RegisterForm.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useAuth.ts
│  │  │  ├─ services/
│  │  │  │  └─ auth.service.ts
│  │  │  ├─ context/
│  │  │  │  └─ AuthContext.tsx
│  │  │  └─ types/
│  │  │     └─ auth.types.ts
│  │  │
│  │  ├─ dashboard/
│  │  │  ├─ pages/
│  │  │  │  └─ DashboardHomePage.tsx
│  │  │  └─ components/
│  │  │     ├─ DashboardCard.tsx
│  │  │     ├─ RecentEvents.tsx
│  │  │     └─ QuickActions.tsx
│  │  │
│  │  ├─ events/
│  │  │  ├─ pages/
│  │  │  │  ├─ EventsPage.tsx
│  │  │  │  ├─ EventDetailPage.tsx
│  │  │  │  ├─ CreateEventPage.tsx
│  │  │  │  └─ EditEventPage.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ EventForm.tsx
│  │  │  │  ├─ EventTable.tsx
│  │  │  │  ├─ EventFilters.tsx
│  │  │  │  ├─ EventCard.tsx
│  │  │  │  ├─ EventStatusBadge.tsx
│  │  │  │  ├─ EventTypeBadge.tsx
│  │  │  │  ├─ EventCapacityBar.tsx
│  │  │  │  └─ LocationPickerMap.tsx
│  │  │  ├─ hooks/
│  │  │  │  ├─ useEvents.ts
│  │  │  │  ├─ useEventDetail.ts
│  │  │  │  └─ useEventFilters.ts
│  │  │  ├─ services/
│  │  │  │  └─ events.service.ts
│  │  │  └─ types/
│  │  │     └─ event.types.ts
│  │  │
│  │  ├─ registrations/
│  │  │  ├─ components/
│  │  │  │  ├─ RegisterToEventButton.tsx
│  │  │  │  └─ RegistrationList.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useRegistrations.ts
│  │  │  ├─ services/
│  │  │  │  └─ registrations.service.ts
│  │  │  └─ types/
│  │  │     └─ registration.types.ts
│  │  │
│  │  ├─ map/
│  │  │  ├─ pages/
│  │  │  │  └─ MapPage.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ EventsMap.tsx
│  │  │  │  ├─ EventMarker.tsx
│  │  │  │  └─ MapPopupContent.tsx
│  │  │  └─ hooks/
│  │  │     └─ useMapEvents.ts
│  │  │
│  │  ├─ calendar/
│  │  │  ├─ pages/
│  │  │  │  └─ CalendarPage.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ EventsCalendar.tsx
│  │  │  │  └─ CalendarEventContent.tsx
│  │  │  └─ hooks/
│  │  │     └─ useCalendarEvents.ts
│  │  │
│  │  ├─ stats/
│  │  │  ├─ pages/
│  │  │  │  └─ StatsPage.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ StatsCards.tsx
│  │  │  │  ├─ EventsByTypeChart.tsx
│  │  │  │  ├─ EventsByMonthChart.tsx
│  │  │  │  ├─ TopLocationsChart.tsx
│  │  │  │  └─ OccupancyChart.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useStats.ts
│  │  │  └─ services/
│  │  │     └─ stats.service.ts
│  │  │
│  │  ├─ profile/
│  │  │  ├─ pages/
│  │  │  │  └─ ProfilePage.tsx
│  │  │  ├─ components/
│  │  │  │  └─ ProfileForm.tsx
│  │  │  └─ services/
│  │  │     └─ profile.service.ts
│  │  │
│  │  └─ admin/
│  │     ├─ pages/
│  │     │  ├─ AdminUsersPage.tsx
│  │     │  └─ AdminEventsPage.tsx
│  │     ├─ components/
│  │     │  ├─ UsersTable.tsx
│  │     │  └─ AdminEventActions.tsx
│  │     └─ services/
│  │        └─ admin.service.ts
│  │
│  ├─ styles/
│  │  └─ index.css
│  │
│  ├─ tests/
│  │  ├─ gherkin/
│  │  │  ├─ auth.feature
│  │  │  ├─ events.feature
│  │  │  ├─ map.feature
│  │  │  └─ calendar.feature
│  │  └─ setupTests.ts
│  │
│  ├─ main.tsx
│  └─ vite-env.d.ts
│
├─ .env.example
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
└─ README.md

---

# 7. Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase Auth
- Supabase Database
- React Router
- Leaflet per mapa
- FullCalendar per calendari
- Recharts per estadístiques
- Vitest + React Testing Library per tests

---

# 8. MVP + Orden logico

Must:
- Auth
- CRUD events
- Map
- Calendar
- Stats

# Orden logico de desarrollo
Setup React + TS + Tailwind
Supabase config
AuthContext
Login/register
ProtectedRoute
DashboardLayout
Models + services
CRUD events
Event detail
Registrations
Map page
Calendar page
Stats page
Admin routes
Testing + Gherkin
README + deploy

---

# 9. Projecte 5 (Future)

- IA
- Equips
- Ranking
- UX avançada

---

# 10. Rol permises

- Player
Puede:
ver eventos
crear eventos
editar sus propios eventos
eliminar sus propios eventos
inscribirse a eventos
cancelar su inscripción

No puede:

editar eventos de otros
eliminar eventos de otros
ver panel de usuarios admin

- Admin
Puede:
ver todo
editar cualquier evento
eliminar cualquier evento
ver estadísticas globales
gestionar usuarios

# 11. MVP

- Must
    auth
    CRUD events
    mapa
    calendari
    stats
    inscripcions
- Should
    filtres
    UX millorada
- Nice
    animacions
    optimitzacions

# 12. Conclusion

Projecte escalable preparat per evolució a producte real.

- diagrama de entidades
- chart flow
- user flow
