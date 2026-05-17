# Nexus Chat

Real-time chat application built with React, TypeScript, Redux Toolkit, SWR, and Supabase.

## Overview

Nexus Chat is a personal front-end project focused on applying production-level frontend architecture, clean code practices, scalable state management, and realtime data synchronization in a real-world application.

The app allows users to:

- Authenticate with Supabase Auth
- Join and manage chat rooms
- Send and receive realtime messages
- See online users and typing indicators
- Experience optimistic UI updates and responsive interactions

This project emphasizes implementation quality, maintainability, and engineering standards over feature quantity.

## Tech Stack

- React
- Vite
- TypeScript
- React Router
- Redux Toolkit
- SWR
- React Hook Form
- Zod
- Supabase
- Vitest
- React Testing Library

## Features

- Authentication (Sign up / Login / Logout)
- Protected routes
- Realtime chat rooms
- Realtime message synchronization
- Optimistic message updates
- Typing indicators
- Online/offline presence
- Infinite message pagination
- Loading, empty, and error states
- Row Level Security (RLS)

## Architecture

```txt
React App
  ↓
Supabase SDK
  ↓
Auth + Postgres + Realtime + RLS
```

## Branches

| Branch           | Description                                   |
|------------------|-----------------------------------------------|
| `main`           | Basic setup with React, Vite, TypeScript, and Context API |
| `additional/apply-redux-toolkit`  | Adds Redux Toolkit for advanced state management |
| `additional/apply-swr`            | Adds SWR for data fetching and caching        |
| `additional/apply-storybook`    | Adds Storybook for isolated UI component development and docs |
| `additional/apply-unit-test`        | Adds testing setup with Vitest, React Testing Library, and setup utilities |


## Based

- Node `^18.16.0`
- npm `^9.5.1`

## Libraries

#### Core

- [Typescript](https://www.typescriptlang.org/) `^5.8.2`
- [React](https://facebook.github.io/react/) `^19.0.0`
- [React Router DOM](https://reactrouter.com/web/guides) `^7.3.0`

#### Utilities

- [I18next](https://www.i18next.com/) `^24.2.2` - Providing the standard i18n features
- [Axios](https://github.com/axios/axios) `^1.8.2` - Promise based HTTP client for the browser and node.js

#### Build System

- [Vite](https://vitejs.dev/) `^6.2.1`

#### Plugins

- [vite-plugin-html](https://www.npmjs.com/package/vite-plugin-html) `^3.2.0`

#### Development extensions

- [eslint](https://github.com/eslint/eslint) `^9.22.0`
- [@typescript-eslint](https://typescript-eslint.io) `^8.26.1`

## Get started

Clone the repository

```sh
git clone git@github.com:st-fe-rd/b-react-vite-ts.git
cd b-react-vite-ts
```

Checkout the branch you want

```sh
git checkout additional/apply-redux-toolkit # or additional/apply-swr, or main
```

Copy env and run npm install

```sh
 cp .env.example .env && npm install
```

Run dev

```sh
 npm run dev
```

Check linter

```sh
 npm run lint
```

Run build

```sh
 npm run build
```

Run preview

```sh
 npm run preview
```
