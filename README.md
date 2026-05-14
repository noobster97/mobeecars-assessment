# Mobeecars — Technical Assessment

Mobile-first used-car browsing app with offline support, plus a Laravel admin dashboard for inventory and user-activity reporting.

Built as a 1-week technical assessment for the Mobile Developer role at Mobeecars.

---

## Stack

**Mobile** — React Native + Expo (SDK latest) + TypeScript
- `expo-router` for file-based routing
- `expo-sqlite` for offline-first local storage
- `expo-secure-store` for persistent auth tokens
- `react-native-deck-swiper` for Tinder-style swipe cards
- `nativewind` for Tailwind CSS styling
- `@tanstack/react-query` for server state + sync
- `zustand` for UI state

**Backend** — Laravel 11 + PHP 8.2
- `laravel/sanctum` for mobile token auth + admin session auth
- Custom Blade + Tailwind admin (no Filament — vanilla Laravel showcase)
- SQLite for development, MySQL-compatible schema for production

---

## Repository Structure

```
mobeecars-assessment/
├── mobile/          # Expo React Native app
├── backend/         # Laravel API + admin dashboard
└── README.md        # This file
```

Each subfolder contains its own setup instructions.

---

## Quick Start

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Backend runs at `http://127.0.0.1:8000`.
Admin login: `http://127.0.0.1:8000/admin/login`

### Mobile

```bash
cd mobile
npm install
npm start
```

Scan the QR code with **Expo Go** on iOS or Android. Update the API base URL in `mobile/src/lib/api.ts` to point at your local backend (use your machine's LAN IP, not `localhost`, for physical device testing).

---

## Features Delivered

### Mobile
- [x] Email/password login with persistent session (SecureStore)
- [x] Tinder-style swipe deck — image, brand, model, type
- [x] Offline-first browsing via SQLite cache
- [x] Like/dislike actions persisted locally and synced
- [x] Reports page — most liked brand / model / type

### Admin Dashboard
- [x] Admin authentication
- [x] User management with per-user activity view
- [x] Reports — most liked brand / model / type per user
- [x] 30+ seeded car inventory records

### API
- [x] `POST /api/auth/login` — mobile auth, returns Sanctum token
- [x] `POST /api/auth/logout`
- [x] `GET  /api/cars` — full inventory for offline sync
- [x] `POST /api/likes/sync` — bulk upload local swipes
- [x] `GET  /api/reports/me` — current user's preferences

---

## Submission

- **Repo**: https://github.com/noobster97/mobeecars-assessment
- **Author**: Muhammad Syafiq Md Asri
- **Duration**: 1 week

See `mobile/README.md` and `backend/README.md` for detailed setup, architecture notes, and design decisions.
