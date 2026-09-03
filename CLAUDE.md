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
  shared-resource/    # Generic engine behind every shared-* deep-import entry point
    createSharedResource.ts   # module-level store + useSyncExternalStore + staleTime/dedupe
  shared-users/       # Deep-import entry: useSharedUsers() — see "Shared-resource entry points" below
  shared-departments/ # Deep-import entry: useSharedDepartments() — same pattern, full tenant list
  assets/             # Images bundled as data URLs (see tsup.config.ts)
  utils.ts            # Pure utility functions (formatting, Vietnamese text, etc.)
  declarations.d.ts   # Global type declarations
```

### Shared-resource entry points (`shared-users`, `shared-departments`, ...)

These are standalone deep-import entries (`@ptht365/shared-ui/shared-users`, `@ptht365/shared-ui/shared-departments`)
— NOT re-exported from the main barrel (`src/index.ts`) — so a minimal consumer can pull in just
a ~1-3KB module without the antd/ckeditor5/AppContext weight of the default entry.

All of them are thin, resource-typed wrappers around `createSharedResource<T>()`
(`src/shared-resource/createSharedResource.ts`), which owns the actual mechanics: a
module-level store (`useSyncExternalStore`), a staleTime-based cache (default 5 min), and
in-flight request dedupe so concurrent mounts don't fire duplicate HTTP calls. Each call to
`createSharedResource()` closes over its own independent store — one per entry file.

**Design intent**: the shell app owns fetching (calls `configureXClient()` + optionally
`fetchX()` once at startup); mini apps just call `useSharedX()` wherever they need the data —
if a mini app never renders a component that calls the hook, no HTTP request for that resource
is ever made in that session (shell-provided, mini-app-consumed-lazily). Whichever caller
mounts first actually triggers the fetch; every other mount (same app or a different one, as
long as the module is loaded once as an MF singleton) reads the shared cache and re-renders
when it updates.

**Fit constraint**: this engine only fits resources fetched as ONE flat list with no *required*
request parameter (e.g. `/users`, `/departments` with no `companyId`). A resource whose backend
mandates a scoping param has no place to key a per-param cache here — fetch its unscoped "all"
variant and filter client-side (that's what `shared-departments` does: the backend's `companyId`
query param is optional and returns the whole tenant's departments when omitted).

Adding a new one = 1 file: call `createSharedResource<T>({ defaultEndpoint })`, re-export
`configure/fetch/get.../clear...` renamed for the resource, and wrap `useResource` to rename
its generic `data` field to something resource-specific (`users`, `departments`, ...). Then
register the new entry in `tsup.config.ts` (`entry`) and `package.json` (`exports`).

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
