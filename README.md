# 🏐 Beach Volley App

## 🌐 Demo

Aplicació desplegada a Vercel:
👉 https://beach-volley-app-blush.vercel.app/

---

## 📌 Descripció

Beach Volley App és una plataforma web per organitzar partits i tornejos de vòlei platja.

Permet als usuaris:

* Crear esdeveniments
* Inscriure's a partits
* Visualitzar esdeveniments en mapa i calendari
* Gestionar informació de forma centralitzada

També inclou un panell d’administració amb estadístiques i control de la plataforma.

---

## 🧱 Tecnologies

* ⚛️ React + Vite
* 🎨 Tailwind CSS
* 🧠 Supabase (Auth + Database)
* 🗺️ Leaflet (mapa)
* 📅 FullCalendar
* 📊 Recharts (estadístiques)
* 🧪 Vitest (testing + coverage)

---

## 🚀 Funcionalitats

### 👤 Autenticació

* Registre i login d’usuaris
* Gestió de sessió
* Rols:

  * `player`
  * `admin`

---

### 🏐 Esdeveniments

* Crear, editar i eliminar esdeveniments
* Tipus:

  * Match
  * Tournament
* Camps:

  * Títol
  * Descripció
  * Data i hora
  * Ubicació (mapa)
  * Participants màxims

---

### 🗺️ Mapa

* Visualització d’esdeveniments en mapa
* Selecció d’ubicació en crear event
* Cerca de localització (geocoding)

---

### 📅 Calendari

* Visualització mensual / setmanal
* Esdeveniments sincronitzats
* Accés directe al detall

---

### 📊 Estadístiques (Admin)

* Total d’esdeveniments
* Esdeveniments actius
* Matches vs Tournaments
* Total d’inscripcions
* Total d’usuaris
* Gràfiques:

  * Events per tipus
  * Events per mes
  * Top localitzacions

---

### ⚙️ Admin Panel

* Gestió d’usuaris
* Gestió d’esdeveniments
* Eliminació d’esdeveniments
* Accés restringit per rol

---

### 📱 Responsive

* Mobile-first
* Sidebar desktop + bottom navigation mobile
* Cards optimitzades per mòbil

---

## 🧪 Testing

S'han implementat tests de lògica amb **Vitest**:

Cobertura de:

* events.service
* registrations.service
* stats.service
* auth.service
* adminUsers.service
* geocoding.service

👉 Objectiu: **≥ 80% coverage**

---

## 📂 Estructura

```
src/
├── features/
│   ├── auth/
│   ├── events/
│   ├── registrations/
│   ├── stats/
│   ├── admin/
│   ├── map/
│   └── calendar/
│
├── tests/
│   ├── events/
│   ├── registrations/
│   ├── stats/
│   ├── auth/
│   ├── admin/
│   └── geocoding/
```

---

## 🔐 Control d'accés

* Usuari no autenticat:

  * Pot veure events, mapa i calendari
  * ❌ No pot crear ni inscriure's

* Usuari autenticat:

  * Pot crear events
  * Pot inscriure's

* Admin:

  * Accés a `/stats`
  * Accés a `/admin/users`
  * Accés a `/admin/events`

---

## 🚀 Deploy

Aplicació desplegada amb:

* Vercel

👉 https://beach-volley-app-blush.vercel.app/

---

## 📈 Millores futures (Projecte 5)

* IA per validar equipament (pilota + xarxa)
* Sistema d’equips
* Filtres avançats
* Millora UI/UX

---

