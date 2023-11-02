# b-react-vite-ts
Boilerplate React with Vite

## Based

- Node `^18.16.0`
- npm `^9.5.1`

## Libraries

### Core

- [Typescript](https://www.typescriptlang.org/) `^5.0.2`
- [React](https://facebook.github.io/react/) `^18.2.0`
- [Redux](https://github.com/reactjs/redux) `^4.2.1` - Manages application state.
- [React Redux](https://github.com/reactjs/react-redux) `^8.1.3` - React-Redux bindings.
- [React Router DOM](https://reactrouter.com/web/guides) `^6.17.0`

### Utilities

- [Redux Saga](https://github.com/redux-saga/redux-saga) `^1.2.3` - Asynchronous things like data fetching
- [I18next](https://www.i18next.com/) `^23.6.0` - Providing the standard i18n features
- [Axios](https://github.com/axios/axios) `^1.6.0` - Promise based HTTP client for the browser and node.js

## Build System

- [Vite](https://vitejs.dev/) `^4.4.5`

### Plugins

- [vite-plugin-html](https://www.npmjs.com/package/vite-plugin-html) `^3.2.0`

## Development extensions

- [eslint](https://github.com/eslint/eslint) `^8.45.0`
- [@typescript-eslint](https://typescript-eslint.io) `^6.0.0`
  
## Install
Copy env and run npm install
```sh
 cp .env.example .env && npm install
```
Check linter
```sh
 npm run lint
```
Run dev
```sh
 npm run dev
```
Run build
```sh
 npm run build
```
Run preview
```sh
 npm run preview
```
