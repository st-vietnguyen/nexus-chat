# Nexus Gallery

Immersive 3D art gallery built with React, Vite and Three.js.

## Overview

Nexus Gallery is a personal front-end project focused on applying team engineering standards, clean architecture, and modern web development best practices in a real-world interactive application.

The application allows users to explore a virtual 3D gallery space, view artworks fetched from public art APIs, and interact with artworks inside an immersive environment.

## Tech Stack

- React
- Vite
- TypeScript
- Three.js
- React Three Fiber
- Zustand
- TanStack Query

## Features

- Interactive 3D gallery experience
- Dynamic artwork loading from public APIs
- Artwork detail viewer
- Camera movement and navigation
- Responsive UI and loading states
- Performance-focused rendering



## Branches

| Branch           | Description                                   |
|------------------|-----------------------------------------------|
| `main`           | Basic setup with React, Vite, TypeScript, and Context API |
| `additional/apply-redux-toolkit`  | Adds Redux Toolkit for advanced state management |
| `addition/apply-swr`            | Adds SWR for data fetching and caching        |
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
