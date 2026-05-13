# 🏐 Beach Volley App

A modern beach volleyball community platform built with React, TypeScript and Supabase.

Users can:

* Explore beach volleyball events
* Join matches and tournaments
* View events on an interactive map
* Use a responsive monthly calendar
* Manage their profile
* Verify volleyball equipment using AI
* Access admin dashboards and statistics

---

# 🌍 Live Demo

## Web App

Beach Volley App Live Demo[https://beach-volley-app-blush.vercel.app/](https://beach-volley-app-blush.vercel.app/)

---
# User Stories 
* US-01 — Explorar esdeveniments
Com a visitant ➡️
vull veure els esdeveniments disponibles ➡️
per descobrir partits i tornejos de vòlei platja.

* US-02 — Veure mapa
Com a visitant➡️
vull veure els esdeveniments en un mapa➡️
per saber on es realitzen.

* US-03 — Consultar calendari
Com a visitant➡️
vull consultar els esdeveniments en un calendari➡️
per veure les dates disponibles.

* US-04 — Registrar-se
Com a usuari➡️
vull crear un compte➡️
per poder participar a la plataforma.

* US-05 — Iniciar sessió
Com a usuari➡️
vull iniciar sessió➡️
per accedir a les funcionalitats privades.

* US-06 — Crear esdeveniments
Com a usuari registrat➡️
vull crear esdeveniments➡️
per organitzar partits o tornejos.

* US-07 — Editar els meus esdeveniments
Com a usuari registrat➡️
vull editar els meus esdeveniments➡️
per actualitzar-ne la informació.

* US-08 — Eliminar els meus esdeveniments
Com a usuari registrat➡️
vull eliminar esdeveniments creats per mi➡️
si ja no es realitzaran.

* US-09 — Apuntar-me a un esdeveniment
Com a usuari registrat➡️
vull apuntar-me a un esdeveniment➡️
per participar-hi.

* US-10 — Veure els meus esdeveniments
Com a usuari registrat➡️
vull veure els esdeveniments als quals estic apuntat➡️
per gestionar la meva activitat.

* US-11 — Verificar pilota
Com a usuari registrat➡️
vull verificar que tinc una pilota➡️
per mostrar-ho al meu perfil.

* US-12 — Verificar xarxa
Com a usuari registrat➡️
vull verificar que tinc una xarxa➡️
per mostrar-ho al meu perfil.

* US-13 — Rebre badges
Com a usuari registrat➡️
vull rebre badges d’equipament verificat➡️
perquè altres usuaris sàpiguen què tinc disponible.

---

# 🚀 Features

## 🏠 Home Page

* Modern responsive hero section
* Upcoming featured events
* Mobile-first design
* Quick navigation cards

## 🏆 Events System

* Create events
* Edit events
* Delete events
* Join events
* Event details page
* Upcoming events filtering
* Match and tournament support

## 🔎 Advanced Filters

Reusable filtering system shared between:

* Events page
* Map page
* Calendar page

Filters include:

* Search by title
* Filter by event type
* Filter by location

Mobile version includes collapsible filters UI.

## 🗺️ Interactive Map

* Interactive event map using Leaflet
* Custom markers depending on event type
* Responsive mobile popup cards
* Event detail popup information
* Shared filtering system

## 📅 Calendar System

Custom responsive calendar implementation:

* Monthly calendar view
* Event indicators
* Mobile selected-day events section
* Desktop monthly events section
* Past events visualization
* Match / tournament color indicators

## 👤 Profile System

* User profile page
* Registered events section
* Admin dashboard access
* Equipment badges
* Logout system

## 🤖 AI Equipment Verification

Users can verify:

* 🏐 Volleyball ball
* 🥅 Volleyball net

Features:

* AI image recognition with Gemini Vision
* Supabase Edge Functions
* Secure API handling
* Equipment badges on profile
* Separate verification flow for each equipment type

## 🛠️ Admin Dashboard

### Admin Events

* Responsive management view
* Mobile cards UI
* Desktop table view
* View and edit actions

### Admin Users

* Responsive user management
* User roles visualization
* User statistics

### Statistics Dashboard

* Total events
* Active events
* Registrations count
* Users count
* Top locations
* Events by month
* Events by type

Optimized to reduce unnecessary database calls.

---

# 🧱 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router DOM
* Lucide React

## Backend & Database

* Supabase
* Supabase Auth
* Supabase Database
* Supabase Edge Functions
* Row Level Security (RLS)

## Maps & Calendar

* React Leaflet
* OpenStreetMap

## AI

* Gemini Vision API

## Testing

* Vitest
* React Testing Library
* jsdom

## Deployment

* Vercel

---
# User diagram
<img width="5532" height="1979" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/d4d1c5cb-9242-4cfd-a247-7d1a949efc45" />


# 🧠 Architecture

The project follows a feature-based architecture.

```bash
src/
├── features/
│   ├── auth/
│   ├── events/
│   ├── map/
│   ├── calendar/
│   ├── profile/
│   ├── registrations/
│   ├── stats/
│   └── admin/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── config/
└── tests/
```

The project separates:

* UI components
* Hooks / business logic
* Services / API calls
* Shared reusable components

---

# 🔒 Security

## Row Level Security (RLS)

Supabase RLS policies are used to:

* Protect user data
* Restrict event modifications
* Restrict admin functionality
* Secure registrations

## Edge Functions

AI verification is handled using Supabase Edge Functions.

This allows:

* Hidden API keys
* User validation
* Secure AI requests
* Controlled database updates

---

# 🧪 Testing

Implemented tests include:

* events.service
* registrations.service
* stats.service
* auth.service
* geocoding.service
* equipment.service

## Run tests

```bash
npm run test
```

## Run coverage

```bash
npm run test:coverage
```

---

# ⚙️ Installation

## 1. Clone repository

```bash
git clone https://github.com/eduardgip85/beach-volley-app.git
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

# ▶️ Run Project

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

---

# 🤖 AI Verification Flow

1. User uploads image
2. React service converts image to Base64
3. Supabase Edge Function validates user
4. Gemini Vision analyzes image
5. Database updates user equipment status
6. Profile badges update automatically

---

# 📱 Responsive Design

The application is fully responsive:

* Mobile-first UI
* Floating action buttons
* Responsive navbar
* Mobile calendar layout
* Responsive admin pages
* Optimized map popups

---

# 🛣️ Future Improvements

Planned future features:

* Friends system
* Public profiles
* Teams system
* Real-time chat
* Weekly AI verification limits
* Notifications
* Advanced statistics
* Event recommendations

---

# 👨‍💻 Author

Eduard Goma

---

# 📄 License

This project is for educational and portfolio purposes.
