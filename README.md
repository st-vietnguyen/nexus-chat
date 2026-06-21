# Nexus Chat

Real-time chat application built with React, TypeScript, SWR, and Supabase.

## Overview

Nexus Chat is a personal front-end project focused on applying production-level frontend architecture, clean code practices, scalable state management, and realtime data synchronization in a real-world application.

The app allows users to:

- Authenticate with Supabase Auth
- Join, create, and search chat rooms (direct + group)
- Send and receive realtime messages with optimistic updates
- Share images via Supabase Storage
- See online presence and typing indicators
- Paginate message history with infinite scroll

This project emphasizes implementation quality, maintainability, and engineering standards over feature quantity.

## Tech Stack

- React 19
- Vite 6
- TypeScript
- React Router 7
- SWR (server state)
- React Context (cross-cutting client state)
- React Hook Form + Zod
- Supabase (Auth + Postgres + Realtime + Storage + RLS)
- i18next (en / ja)
- Vitest + React Testing Library

## Features

- Authentication (Sign up / Login / Logout)
- Protected routes
- Direct and group chat rooms
- Chat room search
- Realtime message synchronization
- Optimistic message updates with retry on failure
- Image messages (Supabase Storage)
- Typing indicators (broadcast channel)
- Online/offline presence
- Infinite message pagination (keyset)
- Avatar upload
- i18n (English, Japanese)
- Row Level Security (RLS)

## Architecture

Layered Clean Architecture. Strict dependency flow:

```
pages/  →  shared/hooks/  →  core/services/  →  libs/supabase
       ↘                  ↘
        shared/components   shared/types / shared/utils / core/constants
```

See `CLAUDE.md` and `docs/frontend-architecture.md` for full rules.

```txt
React App
  ↓
Supabase SDK
  ↓
Auth + Postgres + Realtime + Storage + RLS
```

## Requirements

- Node `>=18.18`
- pnpm `>=9`

## Get started

Clone the repository:

```sh
git clone <repo-url>
cd nexus-chat
```

Copy env and install:

```sh
cp .env.example .env && pnpm install
```

Required env vars:

| Var | Purpose |
|-----|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_API_BASE_URL` | REST API base (default: `https://dummyjson.com/`) |
| `VITE_APP_ENV` | App environment tag |

## Scripts

```sh
pnpm dev          # dev server
pnpm build        # production build
pnpm preview      # preview built output
pnpm lint         # ESLint (0 warnings allowed)
pnpm format       # Prettier + ESLint fix
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest (run once)
pnpm test:watch   # Vitest watch mode
```

Pre-commit runs `lint-staged`: ESLint + Prettier on staged `.ts/.tsx`, Prettier on `.js/.json/.css/.scss/.md`.

## Project structure

```
src/app/
├── core/
│   ├── auth/           ← auth route containers
│   ├── constants/      ← Supabase tables, storage buckets, ...
│   ├── contexts/       ← cross-cutting React Context
│   ├── errors/         ← AppError + mapSupabaseError
│   ├── mappers/        ← Postgres row → domain type
│   ├── modules/        ← custom router (PageRoute, PrivateRoute, ...)
│   └── services/       ← HTTP/RPC + business logic + realtime subscribe
├── libs/supabase/      ← Supabase client + realtime helper
├── pages/              ← route entry points
└── shared/
    ├── components/     ← UI primitives
    ├── hooks/data/     ← SWR-based data hooks
    ├── types/          ← domain types + typed enums
    └── utils/          ← pure framework-agnostic helpers
```

## Branches

| Branch           | Description                                   |
|------------------|-----------------------------------------------|
| `main`           | Current implementation (React + SWR + Supabase) |
| `additional/apply-redux-toolkit`  | Variant with Redux Toolkit for state management |
| `additional/apply-swr`            | Variant focusing on SWR data fetching         |
| `additional/apply-storybook`      | Storybook for isolated UI component docs      |
| `additional/apply-unit-test`      | Testing setup with Vitest + RTL               |
