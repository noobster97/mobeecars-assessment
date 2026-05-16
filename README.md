# Mobee Cars — Technical Assessment

Tinder-style car browsing app with offline support, built for the Mobee Cars mobile developer role.

- **Mobile**: React Native + Expo + SQLite (offline-first)
- **Backend**: Laravel 11 + Sanctum
- **Admin dashboard**: Laravel Blade + Tailwind (no Filament)

---

## Quick start

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API is now at `http://127.0.0.1:8000/api`. Demo data is auto-seeded.

> **Using a physical phone (not a simulator)?** Use `composer serve:lan`
> instead of `php artisan serve`. That binds to `0.0.0.0` so your phone
> can reach it on the LAN.

### 2. Mobile app

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

- **iOS Simulator / Android Emulator** — works out of the box (`localhost:8000`).
- **Physical phone** — open `mobile/.env` and replace `localhost` with your machine's LAN IP (e.g. `http://192.168.1.10:8000/api`). Find it with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

### 3. Admin dashboard

Open `http://127.0.0.1:8000/admin/login` in any browser.

---

## Demo credentials

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| User  | `user@mobeecars.test`    | `password` |
| Admin | `admin@mobeecars.test`   | `password` |

Demo User comes pre-seeded with 20 sample swipes so the Insights screen + admin reports show real data immediately.

---

## What's included

### Mobile app
```
[Discover] [History] [Insights] [Profile]

- Login         email/password + form validation + persistent session
- Discover      Tinder-style swipe deck, 30 cars, smooth animations
                  left = skip   center = rewind   right = like
- History       full swipe activity, liked vs skipped pills
- Insights      most-liked brand / model / type + distribution bars
- Profile       account info, haptics toggle, sync now, clear cache, sign out

Offline-first  SQLite mirrors the inventory + queues swipes for later flush.
               Works fully offline; auto-syncs on reconnect or foreground.
```

### Admin dashboard
```
[Overview]  system totals, brand & type popularity charts, top 5 cars,
            recent activity feed across all users
[Users]     all users with swipe/like/skip counts, tap for per-user detail
            (top picks + distribution bars + full activity table)
[Cars]      full inventory CRUD - search, filter, add, edit, delete.
            Image: upload JPG/PNG/WebP OR paste a URL
```

### Backend / API
```
POST /api/auth/register        sign up
POST /api/auth/login           returns bearer token
POST /api/auth/logout          invalidate token
GET  /api/auth/me              current user

GET  /api/cars                 full inventory snapshot (for offline sync)
POST /api/likes/sync           push queued swipes
GET  /api/likes                user's like history
GET  /api/reports/me           top brand / model / type for current user
```

---

## Architecture

```
+--------------------------------------------------------------+
|  MOBILE  (React Native + Expo)                               |
+--------------------------------------------------------------+
|  Zustand auth ----+                                          |
|                   +--> axios + Bearer token                  |
|  TanStack --------+                                          |
|                                                              |
|  expo-sqlite   <----- cars table   (offline inventory)       |
|                <----- user_car_likes (queued swipes)         |
|                                                              |
|  NetInfo + AppState --> auto-sync on reconnect / foreground  |
+--------------------------------------------------------------+
                          ^  HTTPS/JSON
                          v
+--------------------------------------------------------------+
|  BACKEND  (Laravel 11 + Sanctum)                             |
+--------------------------------------------------------------+
|  /api/*    Bearer-token API  -->  mobile app                 |
|  /admin/*  Session web auth  -->  Blade dashboard            |
|                                                              |
|  SQLite database (dev) - cars, users, user_car_likes         |
+--------------------------------------------------------------+
```

**Offline-first flow**: every swipe writes to local SQLite immediately. A background flush pushes queued swipes to `/api/likes/sync` when the network comes back. The UI never blocks on the network.

---

## Project structure

```
mobeecars-assessment/
|-- backend/                Laravel 11
|   |-- app/Http/Controllers/
|   |   |-- Api/            mobile API (auth, cars, likes, reports)
|   |   |-- Admin/          admin dashboard controllers
|   |-- database/
|   |   |-- migrations/     users, cars, user_car_likes, sanctum tokens
|   |   |-- seeders/        30 cars + demo users + 20 sample swipes
|   |-- resources/views/admin/   Blade views (Tailwind via CDN)
|
|-- mobile/                 React Native + Expo
    |-- app/                expo-router file-based routes
    |   |-- (auth)/login.tsx
    |   |-- (tabs)/         Discover, History, Insights, Profile
    |-- src/
    |   |-- lib/db.ts       SQLite layer
    |   |-- lib/sync.ts     online/offline sync
    |   |-- lib/api.ts      axios client
    |   |-- stores/auth.ts  Zustand auth store
    |-- .env.example        EXPO_PUBLIC_API_URL
```

---

## Environment variables

### `backend/.env`
| Variable           | Default                       | Notes                                |
|--------------------|-------------------------------|--------------------------------------|
| `APP_KEY`          | _(generated)_                 | `php artisan key:generate`           |
| `DB_CONNECTION`    | `sqlite`                      | SQLite file is auto-created          |
| `APP_URL`          | `http://localhost`            |                                      |

### `mobile/.env`
| Variable                | Example                              | Notes                                       |
|-------------------------|--------------------------------------|---------------------------------------------|
| `EXPO_PUBLIC_API_URL`   | `http://localhost:8000/api`          | Simulator/emulator                          |
|                         | `http://192.168.1.10:8000/api`       | Physical phone - use your machine's LAN IP  |

---

## Notes

- **Sanctum** runs in **token mode** for the mobile API and **session mode** for the admin dashboard - same package, two guards.
- **SQLite** is the dev DB. Production would swap in MySQL/Postgres via `DB_CONNECTION`; no schema changes needed.
- **Image uploads** in the admin save to `storage/app/public/cars/` (symlinked to `public/storage`). The mobile API resolves relative paths to absolute using the current request host, so the same image works for desktop admin previews and mobile clients on the LAN.
- **30 car records** with real model photos sourced from Wikipedia Commons.
