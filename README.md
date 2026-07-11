# Voice Chat App - غرف صوتية

A voice chat room application similar to Yalla or SoulChill, built with Vite + React + TypeScript + TailwindCSS + Supabase.

## Features

- Room creation (public/private with password)
- Guest login (no registration required)
- Email/password authentication
- Microphone seat selection with real-time updates
- Live chat with Supabase Realtime
- Gift system with 10 pre-configured gifts
- Independent admin dashboard at `/admin/login`
- Admin: manage rooms, users, gifts, settings
- 8 room categories (chat, music, gaming, education, religion, sports, comedy)
- Arabic RTL interface

## Tech Stack

- **Frontend**: Vite, React 18, TypeScript, TailwindCSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **State**: Zustand
- **Routing**: React Router v6

## Admin Access

- URL: `/admin/login`
- Email: `admin@voicechat.app`
- Password: `admin123456`

## Database

The app uses Supabase with the following tables:
- `profiles` - User profiles (supports both registered and guest users)
- `rooms` - Voice chat rooms
- `room_seats` - Microphone seats in each room
- `room_participants` - Room participants
- `messages` - Chat messages
- `gifts` - Gift definitions
- `gift_transactions` - Gift send records
- `admin_users` - Admin accounts

## Edge Functions

- `admin-auth` - Admin login, verify, and create_admin
- `livekit-token` - LiveKit JWT token generation (requires LIVEKIT_API_KEY and LIVEKIT_API_SECRET secrets)

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
