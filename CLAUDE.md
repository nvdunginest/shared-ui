# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@ptht365/shared-ui` is a shared UI component library published as an npm package for use across ptht365 micro-frontend apps. It ships as ESM + CJS dual format via `tsup`, with tree-shaking enabled. All peer dependencies (React, Antd, styled-components, CKEditor, etc.) are externalized — consuming apps provide them.

## Commands

```bash
npm run build          # Build dist/ (tsup, ESM + CJS + .d.ts)
npm run build:watch    # Watch mode for local development
npm run type-check     # TypeScript check without emit
npm publish            # Runs build first via prepublishOnly hook
```

There are no tests in this repo.

## Architecture

### Entry point

`src/index.ts` is the single barrel that re-exports everything consumers need. All public API additions must be added here.

### Source tree

```
src/
  platform/           # App infrastructure (non-UI)
    axios.instance.ts           # AxiosBuilder singleton
    contexts/AppContext/        # Global React Context + reducer
    controllers/                # API wrappers (app, files, users, userRoles)
    helpers/                    # userRoles.helper, files.helper
    models/                     # TypeScript interfaces (IUser, IUserRole, etc.)
  components/         # Shared React components
    Editor/           # CKEditor wrappers (CustomEditor, DocumentEditor, MinimalEditor, CustomView)
    FileViewer/       # PDF / Office / generic file viewer
  layout/             # App shell components
    desktop/          # DesktopLayout + Navigation + NavItem + AppInfo
    mobile/           # MobileLayout + Navigation + NavItem + MoreButton
  assets/             # Images bundled as data URLs (see tsup.config.ts)
  utils.ts            # Pure utility functions (formatting, Vietnamese text, etc.)
  declarations.d.ts   # Global type declarations
```

### Key design decisions

**AxiosBuilder** (`src/platform/axios.instance.ts`) — singleton that must be configured with `axiosBuilder.configure({ baseUrl })` before any component mounts. It injects JWT from `sessionStorage` and auto-refreshes via `localStorage` refresh token on 401 (when the default token getter is used).

**AppContext** — a `useReducer`-based React Context that holds global app state (userId, userRoles, users, sideMenu, logoUrl, loading, logs). Must be a Module Federation singleton to avoid duplicate context instances across micro-apps.

**AppLoader** — a render-null component placed inside `<AppProvider>` that fetches user roles, admin status, and users on mount. It calls `setUserId` by JWT-decoding the access token (reads `oid` claim).

**AclCheck** — role-gate component. `roles` prop is `string[][]` (OR of AND groups): any inner array where all roles match grants access. An empty outer array grants access to everyone.

**Asset bundling** — `.png`/`.jpg`/`.jpeg`/`.svg` files are inlined as data URLs at build time (configured in `tsup.config.ts` esbuildOptions). Do not import large images.

**Responsive layout** — `ResponsiveWrapper` renders either `DesktopLayout` or `MobileLayout` based on `useDeviceType`. Both layout trees read from AppContext for nav items/logo.

### Module Federation constraint

`@ptht365/shared-ui` must always be declared as `singleton: true` in the consuming app's Module Federation `shared` config. The library exports a React Context — multiple instances will cause `useAppContext()` to return empty state.

### Publishing

Publishes to npm (or GitHub Packages — see INTEGRATION.md §6). The `dist/` directory is already committed; `files` in `package.json` restricts the published artifact to `dist/` only.
