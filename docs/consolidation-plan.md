# Consolidating the five document apps into `@ptht365/shared-ui`

Status: proposal (nothing has been moved yet). Date of analysis: 2026-10-22.

Apps analysed (frontend only): `vpi-adm-appr-final` ("appr"), `vpi-adm-rept`, `vpi-adm-idoc`, `vpi-adm-odoc`, `vpi-adm-trip`.
Library: `libs/shared-ui` v1.3.0. Method: content hash and line-diff of every `.ts/.tsx/.css` file, compared by path across the apps, then spot reading of the clusters. The numbers are reproducible with the scripts listed in section 9.

## 1. Findings

1. **~69,000 lines of redundant code.** Counting each extra copy once, the same-path files across the five apps add up to: 16.0k lines byte-identical, 12.6k lines near-identical (>= 90% same), 20.1k lines similar (60-90%), 20.1k lines divergent (< 60%, mostly domain-specific).
2. **shared-ui is barely used.** Apps import only `module-contract`, `shared-users` and (appr) `platform`. None of its components (`TitleBar`, `UserInfo`, `MasterPage`, editors, viewers...) is imported; every app carries its own copy under `presentation/`.
3. **shared-ui has fallen behind the apps in places.** Its `platform/*`, `utils.ts`, `UserInfo`, `MasterPage`, editors differ from the app copies (formatting, plus real changes: `MasterPage` 289 changed lines, `utils.ts` 283). The apps evolved after the copy was made, so the library cannot simply be adopted as is.
4. **Two families, not five.**
   - Family A: appr, rept, trip. Near twins (e.g. `DocumentTable` differs by 75/91 lines between appr and rept/trip, `GlobalCompanySelector` by 9-11). Same workflow: list, detail, approve / reject / transfer / give back / cancel, followers, attachments, comments.
   - Family B: idoc, odoc (incoming / outgoing documents). Older fork of appr (their comments say "synchronised with vpi-adm-appr"). They differ from appr by 160-370 lines per list file, have fewer actions and add their own pages (Issuer, Category, ClerkConfig, Recipient, RoleModeGate).
5. **Visual drift is already visible in small things.** `theme.ts` has 5 variants (appr/rept/trip differ by 2-3 lines, idoc/odoc by ~70 lines of comments and tweaks), `BaseActivityItem` has 8 variants across 5 apps, `CommentAction`, `ListHost`, `OutlookShell`, `menu.tsx`, `documentListTabs.tsx`, `panelPersistence.ts` have 5 variants each, `ApproveAction` wording differs ("phê duyệt" vs "chỉ đạo").
6. **The real differences are small and mostly textual**: labels ("tờ trình" / "báo cáo"), API slug (`/hubs/vpi-adm-<app>/document-hub`), status enum values, which actions exist, which tabs and filters exist, extra fields on create/edit. These are configuration, not different code.

## 2. What is shared today, by domain

Redundant LOC = (number of copies - 1) x lines. I = identical, N = near (>= 90%), S = similar (60-90%), D = divergent.

| Domain (path) | I | N | S | D | Notes |
|---|---|---|---|---|---|
| `platform/*` (AppContext, controllers, helpers, models, axios) | 2544 | 0 | 56 | 352 | shared-ui already has an older copy; extend it |
| `external/dtaMdms/*` (companies, departments, projects, sectors, tiers) | 487 | 68 | 293 | 172 | 10 files identical in all apps |
| `application/signalR/*` | 908 | 280 | 2140 | 0 | `SignalRConnector`, `constants` identical; only the hub URL and a few event types differ |
| `presentation/theme.ts`, `StyleProvider`, `mixins`, `utils.ts`, `popoverWidth` | 1904 | 0 | 724 | 0 | design tokens: the main source of visual drift |
| `presentation/components/*` (TitleBar, UserInfo, SelectUser, ExpandingTabBar, avatarColor, GlobalCompanySelector, Forbidden, AclCheck, Section*, PropertyRender*, DebugFrameLabel) | 2029 | 1180 | 1190 | 0 | |
| Editors (CKEditor: `CustomView`, `MinimalEditor`, `ReferenceLinks*`, `FileAttachmentPlugin`, `pasteAutoLink`, `safeLinkOpening`, css) | 2406 | 2332 | 830 | 0 | also duplicated inside shared-ui |
| File viewers (`FileViewer`, `PdfViewer`, `OfficeViewer`) | in components | | | | identical in all apps, duplicated inside shared-ui |
| `presentation/layout/*` (ListHost, OutlookShell, MasterPage, DocumentListPanel/Mobile/Screen, FooterIconNav, CollapsedPanelStrip, MobileFilterSheet, documentListTabs, panelPersistence) | 3072 | 2612 | 2856 | 1284 | the list shell; the largest block that is almost the same everywhere |
| `presentation/navigation/*` (Navigator, useBackToList, useUnsavedChangesGuard, navigation) | 472 | 0 | 0 | 284 | `menu.tsx` is per app |
| `application/contexts/*` (Global*, DocumentList*, Document*) | 322 | 408 | 2244 | 2960 | |
| `application/{models,enums,controllers,helpers}` | ~200 | ~410 | ~1700 | ~3200 | divergent because of domain fields; see section 4 |
| `pages/Home/*` (DocumentTable, filters, ItemView) | 741 | 640 | 1264 | 3400 | |
| `pages/Document/*` (detail: Main, Extra, Discussion, Attachments, History, actions) | 480 | 2785 | 4344 | 4228 | |
| `pages/Create`, `pages/Edit` | 0 | 1081 | 0 | 4826 | mostly domain forms: keep in apps |

## 3. Target layout in shared-ui

Rule: **new code goes in separate subpath entries**, not in the main barrel. The shell lazy-loads the barrel and shares it as a singleton; adding editors, viewers and pages to it makes every module that touches it heavier (this is the exact problem we just removed by moving `axiosBuilder` to `./platform`).

| Entry | Contents | Weight |
|---|---|---|
| `./platform` (unchanged) | `axiosBuilder` only. It stays minimal because the shell loads it eagerly as a host singleton; every byte added here is paid by the shell's first load | light |
| `./platform-kit` (new) | app-level platform code: AppContext + AppLoader, controllers (`app`, `files`, `users`, `userRoles`), helpers, models, status messages | light |
| `./signalr` (new) | document hub connector, provider, toast connector; `configureDocumentHub({ hubUrl })` | light |
| `./mdms` (new) | dtaMdms models + controllers, `GlobalLoader` logic as a hook/provider factory | light |
| `./theme` (new) | `colors/radii/shadows/spacing` tokens, `StyleProvider`, `mixins`, `popoverWidth`, text utils (`removeVietnameseTones`, `getShortName`...) | light |
| `./utils` (new) | pure text/number/date helpers (`utils.ts`, identical in all five apps) | light |
| `./ui` (new) | `TitleBar`, `ExpandingTabBar`, `CollapsedPanelStrip`, `FooterIconNav`, `UserInfo`, `SelectUser(Chip)`, `avatarColor`, `MasterPage`, `AppLayout`, `ResponsiveWrapper`, `useDeviceType`, `BackToListButton`, `panelPersistence`, `Loading` + `BrandedLoading` (replace the dark `ModuleLoadingOverlay`), `DebugFrameLabel`, navigation helpers (`Navigator`, `navigateTo`, `useBackToList`, `useUnsavedChangesGuard`); per-app wording and storage keys through `configureUi({ documentName, panelStoragePrefix })`. Not in it yet: `GlobalCompanySelector` (needs `GlobalContext`, Phase 4) and the trip/idoc/odoc-only `AclCheck`, `Forbidden`, `Section`, `CollapsedSection`, `PropertyRender*` | medium, no CKEditor |
| `./editor` (new) | CKEditor stack: `CustomView`, `MinimalEditor`, `ReferenceLinks*`, `FileAttachmentPlugin`, `pasteAutoLink`, `safeLinkOpening`, css | heavy, lazy |
| `./file-viewer` (new) | `FileViewer`, `PdfViewer`, `OfficeViewer` | heavy, lazy |
| `./document-kit` (new) | the document workflow: list side done (Phase 4: `GlobalProvider/GlobalLoader`, `DocumentListProvider`, `GlobalCompanySelector`, `ListHost`, `OutlookShell`, `DocumentListPanel/Mobile/Screen`, `DocumentTable`, filters; `<DocumentKitProvider config>`), detail side to come (Phase 5: `Main`, `Extra`, discussion, attachments, history, action bar and the common actions) | **light, bundled into each app** (changed from heavy, see Phase 4 status) |
| main `.` | stays as is; only re-exports kept for compatibility | unchanged |

`./document-kit` takes a single typed config instead of forks:

```ts
createDocumentModule({
  api: { baseUrl, hubPath },           // /hubs/vpi-adm-<app>/document-hub
  labels: { documentName: 'tờ trình', approve: 'phê duyệt', ... },
  statuses: DocumentStatusEnum,         // app-owned enum + display map
  tabs: [...], filters: [...],          // which list tabs and filters exist
  actions: [approve, reject, transfer, giveBack, cancel, ...extraActions],
  sections: [...extraDetailSections],   // e.g. trip expense tables
  menu: [...],
})
```

Anything domain-specific (trip expense/plan/report tables and prints, idoc/odoc Issuer/Category/ClerkConfig/Recipient/RoleModeGate, appr Create/Edit forms, status enums, per-app controllers) stays in the app and plugs in through this config.

## 4. Plan

Order by risk: identical code first, near-identical next, behaviour-bearing code last. Each phase ends with every touched app building and its docs/tests unchanged.

**Phase 0 - Foundations (no app change)**
- **Existing entries are frozen.** `scripts/check-exports.mjs` pins the public surface of `.`, `./platform`, `./shared-users` and the bytes of `src/index.ts` and `src/layout/*` (the shell and legacy modules depend on them). So the old, drifted shared-ui copies (`MasterPage`, `UserInfo`, `utils.ts`, old editors) are **not** "synced"; the app-derived code goes into the new entries and the old files stay as legacy until nothing imports them.
- Source of truth per file: generated, not guessed. `npm run check:duplication -- --sot` lists, for every file that exists in several apps, which app changed it last (git date) and how far each copy is from it; the result is committed as `docs/source-of-truth.md`.
- Entry policy: `scripts/check-entry-isolation.mjs` is driven by an explicit table (light entries `./ui`, `./theme`, `./mdms`, `./platform-kit`, `./signalr` must not import CKEditor or the PDF viewer and may reach only the `@ptht365/shared-ui/{platform,module-contract,shared-users}` singletons; heavy entries may). Planned entries are listed there now and are checked as soon as they are built.
- `scripts/check-duplication.mjs` (report mode) measures duplication between the apps and against shared-ui, so progress and regressions are visible.
- Tests for code that exists and is untested (`createSharedResource`, `utils`) so the vitest harness is proven for pure code; component smoke tests arrive with each component in its phase.
- Registering a new entry is a 4-file change (`tsup.config.ts`, `package.json#exports`, isolation table, shell `shared` list for heavy entries); this is written down in `CLAUDE.md` of this repo.

**Phase 1 - Identical files (3-4 days)**: `platform/*`, `external/dtaMdms/*`, `signalR` core (`SignalRConnector`, `constants`, `signalr.connector` taking `hubPath`), `StyleProvider`, `popoverWidth`, `statusMessages`, enums that are identical. Pilot on **rept** (closest twin of appr), then trip, appr, idoc, odoc. App change per file: replace the local file by a re-export or import, then delete it.

**Phase 2 - Presentational UI (4-5 days)**: everything in `./ui` and `./theme`. Unify `theme.ts` first, with one `colors` object and per-app overrides only for brand colour if ever needed. This is the step that removes the visual drift (5 `theme.ts`, 8 `BaseActivityItem`, wording of buttons).

**Phase 3 - Editor and viewers (2-3 days)**: `./editor`, `./file-viewer`. They already exist twice (inside shared-ui and in each app); keep one. Keep `ckeditor5` and `@react-pdf-viewer/core` in the Module Federation `shared` list so there is one copy at runtime.

**Phase 4 - Document kit, list side (1-1.5 weeks)**: `ListHost`, `OutlookShell`, `DocumentListPanel/Mobile/Screen`, `DocumentTable`, filters, `ItemView`, list tabs, `panelPersistence`, `menu` wiring, `GlobalProvider/GlobalLoader/DocumentListProvider`. Introduce the config object. Migrate rept and trip first (diff against appr is 40-90 lines), then appr. The bugs fixed on 2026-10-22 in appr's `DocumentTable` (refetch on every navigation) and `GlobalCompanySelector` (clears the saved company while loading) are still present in rept and trip (both bugs) and in idoc and odoc (the `GlobalCompanySelector` one; their `DocumentTable` is a different fork): moving to one implementation fixes them everywhere at once.

**Phase 5 - Document kit, detail side (1.5-2 weeks)**: `Main`, `Extra`, discussion (`CommentAction`, `BaseActivityItem`), attachments, history, `ActionBar` and the common actions (approve, reject, transfer, give back, cancel, followers, attachments, share, copy title). Extra actions and sections plug in (trip's report/expense actions and tables).

**Phase 6 - Family B alignment (optional, see D5; 1-2 weeks)**: idoc and odoc first catch up with appr on the pieces they lack (actions, theme) behind the new kit, then drop their forks. Do not start before phases 1-5 are stable in appr/rept/trip.

**Phase 7 - Guard rails (1 day)**: lint rule or CI check that forbids re-creating a file whose name exists in shared-ui; update each app's `CLAUDE.md` / `docs/07-development-guide.md` (new components go to shared-ui first); changelog entry per app.

Rough effort: 5-7 weeks for one developer, phases 1-3 deliver most of the visual consistency in ~2 weeks.

### Phase 5 status (2026-10-22)

The detail side of `./document-kit` is in (rept `4f0634a`, trip, appr-final, all on main, not pushed): `DocumentProvider` / `DocumentListenChanged` / `useDocumentContext<T>()`, the shared actions (approve, reject, transfer, give back, cancel, share, copy title, followers, attachments), the discussion, history, attachments and reference-links sections, and the activities, attachments and followers controllers (identical in every app, now in the kit). Each app keeps its own pages (`Document`, `Main`, `Extra`, `InfoSection`, trip's tables and trip-only actions) and a typed wrapper `application/contexts/DocumentContext/index.ts` (`useDocumentContext()` typed with the app's `IDocument`). About 3.0k lines left rept, 2.9k trip and appr.

`config.detail` carries what differs between apps (the status enums are not interchangeable: 2 is APPROVED in rept and appr but PLAN_APPROVED in trip, 6 is VIEWED, REPORT_SUBMITTED or absent, so the kit never imports an enum): `api` (the app's documents controller), `statuses` (`processing`, `notEnded`, `cancelable`, `canComment`, `finished`: which statuses allow approve/reject/give back, attachments and transfer, cancel, comments, and private-only comments), `wording` (`approveVerb`: "phê duyệt" or "chỉ đạo"; `tierName`) and `activities` (history texts). Values: appr processing [PROCESSING], comments also after APPROVED/REJECTED (private only); rept processing and comments include VIEWED, cancel does not; trip as appr without the finished statuses. The activity type numbers the kit uses (COMMENT 501, APPROVE 802, ...) are identical in all three backends and live in `ActivityType`.

Behaviour: the actions now show the backend's error message (trip's behaviour) instead of a fixed text; nothing else changed. Not moved: `Document`, `Main`, `Extra`, `InfoSection`, `DocumentHeader`, `PrintAction`, `documents.controller` / `documents.helper` / `IDocument` (domain; trip differs from rept by 213 and 271 lines in `Main` and `InfoSection`) and `activities.helper` (still holds the history texts and a duplicate of two helpers the kit now has). Verified in the shell on rept with a real draft (action bar, transfer dialog, discussion box, history, attachments); trip and appr only show the kit's not-found state because their backends are off.

### Phase 4 status (2026-10-22)

`./document-kit` (list side) is in shared-ui and rept, trip and appr-final use it (rept `831bce2`, trip, appr-final; all on main, not pushed). Each app keeps only its row components (`ItemView`, `WaitingItemView`) and one file, `application/documentKit.config.tsx`: tabs (labels, titles, api methods, row component, which filters), statuses, menu, waiting-counts call, company storage key, page-size wording, which master data to load (`sectors`, principal positions as `scopes` or `ids`) and three flags (`autoOpenFirst`, `backToShell`, `createShortcut`). About 3.7k lines left rept alone; the three bundles are 578 to 605 kB (the list code moved from the app into the entry, nothing is shared at runtime).

**Decision D1 amended for this entry:** `./document-kit` is a light entry bundled into each app, not shared through the shell. It owns React contexts (`GlobalContext`, `DocumentListContext`) and reads the `platform-kit` AppContext and the `signalr` context. A copy provided by the shell would create its own instances of those contexts and never see the app's providers. Sharing it would also need `platform-kit` and `signalr` shared singletons. If the byte saving ever matters, share all three together. `./editor` and `./file-viewer` stay shell-provided (they hold no context of the app).

Behaviour reconciled (the three copies had drifted): the fixes made in appr (parallel loading of sectors, projects and companies; the remembered company is no longer cleared while the list loads; list loading is local, not a module-wide overlay; stable navigate, no refetch when opening another document) now apply to rept and trip too. Auto-open of the first document uses trip's rules (once per entry into the module, only on a wide frame at "/", not on a deep link or an empty result) for appr and trip; rept keeps it off. The "create" and "open full list" buttons of rept and the back arrow of the full list screen (rept and trip) are flags, set as before; appr has neither and appr's screen gets trip's footer icons (empty when the menu has no extra entry). Flip a flag in an app's config to unify.

Not moved: the row components, `documents.controller`, `DocumentStatusEnum`, `documents.helper` (domain), and trip's unused `pages/Home/Home.tsx`.

### Phase 3 status (2026-10-22)

Heavy entries added: `./editor` (CustomView, MinimalEditor, ReferenceLinks editor/view, FileAttachmentPlugin, paste auto link, safe link opening) and `./file-viewer` (FileViewer, PdfViewer, OfficeViewer); the rich-text helpers moved to `./utils`. Both heavy entries are provided by the shell: `Content.tsx` lazy-imports them and `rsbuild.config.ts` declares them as singletons (the module federation plugin only emits a shared entry that the host code imports; declaring it in the config alone, or importing it without declaring it, does not work). Shell initial bundle +1.9 kB; the entries are async chunks. Apps (rept `8a3dc97`, trip, appr-final, all on main) import them and build with `import: false`, so their production bundles drop from 926.1, 957.2 and 934.5 kB to 575.8, 601.1 and 575.1 kB.

**Deploy order:** the shell must be released before any app build that imports `./editor` or `./file-viewer`; an app deployed first fails to load (`c is not a function` in its `remoteEntry.js`, shown as a blank module).

Verified end to end: the production build of rept (served statically) in the shell dev server, with the document page and its CKEditor comment box working and no editor chunk requested from the app's origin. Not verified: PDF preview (no document with a PDF in the dev data), trip and appr production builds in the shell (their backends are down).

Behaviour changes: trip gets the accent-insensitive mention search of the other apps; the `MinimalEditor` typing error that every app carried is fixed once in the entry (the apps are now `tsc` clean); `resolve.dedupe` must not list `ckeditor5` or `@react-pdf-viewer/*` (it breaks their sub-path css imports); the `src/utils` folder was renamed `src/text-utils` because relative imports of `utils` resolved to the legacy `src/utils.ts` (the Phase 2 `ui` entry had been importing the legacy helpers; the cases it uses are identical).

### Phase 2 status (2026-10-22)

Entries added: `./utils` (the helpers every app carried, identical in all five) and `./ui` (components, layout pieces, branded loading, navigation helpers; `configureUi({ documentName, panelStoragePrefix })` keeps each app's wording and its existing `<app>.panel.` localStorage keys). Migrated on branch `refactor/shared-ui-phase2` of each repo: rept (`fdd5d43`), trip (`b90176d`), appr-final (`ef5956c`); 56 to 63 files each, about 1.6k lines removed per app. The apps' local copies differed only in import order, the wording and the storage prefix, so nothing had to be folded into the entries. Bundles: rept 926.1 kB (906.5), trip 957.2 kB (943.8), appr 934.5 kB (929.4); the growth is the loading logo, which tsup inlines as a data URL (about 15 kB), now also in rept and trip.

Behaviour changes to know about: rept and trip now show the branded loading (logo and progress bar) at startup and for list loads, like appr; `Loading` shows the first load at once and delays later ones (the version first written for appr never took the "first load" branch because its flag flipped on the first render; fixed in the entry). Apps need `react-router-dom` and `@ant-design/icons` in `resolve.dedupe`.

Not moved (kept for the phases that need them): `GlobalCompanySelector` (depends on `GlobalContext`, Phase 4), `FileViewer`, `PdfViewer`, `OfficeViewer` (heavy, Phase 3), trip/idoc/odoc-only `AclCheck`, `Forbidden`, `Section`, `CollapsedSection`, `PropertyRender*`, `FormTable`. Theme needed no further unification inside family A (the tokens were already one set after Phase 1); idoc and odoc keep their own copy until D5 is revisited.

### Phase 1 status (2026-10-22, pilot on `vpi-adm-rept`)

Entries added (light, bundled into the apps): `./theme` (tokens, mixins, popover width, `StyleProvider`), `./mdms` (models, controllers, actor helper, `configureMdms({ baseUrl })`), `./platform-kit`, `./signalr`. Source of truth was rept's copy (identical to appr except a comment, the hub URL and a newer, null-safe `secretaries.controller`). In rept the local copies were deleted and 82 files now import the entries; rept's bundle is unchanged (906.5 kB against 906.4 kB before) and the module was checked inside the shell (list, companies, hub negotiation, mdms calls).

Rules the pilot established for every consuming app:
- Configure once at app start (in the same effect as `axiosBuilder.configure`): `configureMdms({ baseUrl })` and `configureDocumentHub({ hubUrl })`. Modules that import `@ptht365/shared-ui/signalr` must not create the connector at import time (the URL is not known yet; the entry creates it lazily).
- `rsbuild.config.ts`: `resolve.dedupe: ["axios", "@microsoft/signalr", "jwt-decode"]`, otherwise shared-ui's own `node_modules` copy is bundled next to the app's (rept's `lib-axios` doubled from 35 kB to 70 kB until this was added), and share `@ptht365/shared-ui/platform` (`import: false` in production, like the other host-provided packages).
- `tsconfig.json`: map `styled-components` to the app's `node_modules` in `paths`; shared-ui has a different patch version and TypeScript otherwise reports the mixins' `RuleSet` as incompatible.
- `@microsoft/signalr` is now a peer dependency of shared-ui.
- After rebuilding shared-ui (`clean: true` wipes `dist/`), restart the running app dev servers: they keep a stale "Module not found" state.

Known issue carried over unchanged: `filesController.uploadChunk` sends `Authorization: Bearer ` with an empty token in every app (since 2026-08); shared-ui's legacy copy sends the real token. Behaviour was preserved on purpose; decide with the backend owner whether the endpoint should receive the real token.

Phase 1 progress (2026-10-22): rept (`75c7edb`), trip (`5cb7a61`) and appr (`d0570b5` perf and loader work, then `653aa15` migration) are migrated, each on branch `refactor/shared-ui-phase1` of its own repo. Bundles are unchanged (rept 906.5 kB, trip 943.8 kB against 943.9 kB, appr 929.4 kB against 929.3 kB after the perf commit). Trip's variants were folded into the entries (module-admin methods of `userRolesController`, `MOD_ROLE`, `IPosition.personnelLevelId`, `colors.tableHeaderBg`); its departments and projects controllers were identical to rept's. idoc and odoc (D5) are not migrated; their extra methods (`getAllDepartments`, `getActiveProjects`, `checkMod`, members) are not in the entries yet. The shell-based check showed the UI, the company list and every mdms call working for all three apps; appr's and trip's own backends were not running locally (404), so their document lists and hub could not be exercised.

Procedure used for apps with uncommitted work (reusable): back up `git diff HEAD` and the untracked files; create a clean `git worktree` of HEAD on the branch; run the migration script there, then `tsc`, the production build and a size comparison, and commit; remove the worktree; move the real checkout onto the branch with `git symbolic-ref` + `git reset` (mixed) and run the same script on the working copy, so that what stays uncommitted is only the developer's own change.

### Phase 0 status (2026-10-22, branch `chore/shared-ui-foundations`)

Done: `scripts/check-duplication.mjs` (+ `npm run check:duplication`), `docs/source-of-truth.md` (generated), table-driven `check-entry-isolation` (light/strict/heavy policy, planned entries reported until built), tests for `createSharedResource` and `utils` (16 cases, mutation-checked), `CLAUDE.md` updated with the entry checklist. Not done on purpose: no app was changed and the frozen entries were not touched. Next: Phase 1 pilot in `vpi-adm-rept`.

## 5. Constraints and risks

- **Delivery to production (module federation).** In production the apps build with `import: false` for shared packages, so any entry that is not in the shell's `shared` list is bundled into each app (no host change, duplicated bytes, version skew possible) while an entry that is listed there needs the shell to be rebuilt first (single copy, but releases are coupled). Today the shell shares only `shared-ui` and `shared-ui/platform`; `module-contract` and `shared-users` are bundled or injected separately. Decision D1.
- **Local linking.** Apps use `"@ptht365/shared-ui": "file:../../libs/shared-ui"`, which resolves to `dist/`. Every shared change needs `npm run build` (or `build:watch`) before apps see it, and the five apps are separate git repos, so a shared change and its adoption are separate commits. Decision D2: keep `file:` or publish versions.
- **Import style.** shared-ui uses relative imports; the apps use `@presentation/...`, `@application/...`, `@platform/...` aliases. Moved code must not use app aliases (apps pass in what it needs through props, context or config).
- **Bundle weight.** Do not add heavy code to the main barrel (see section 3). Keep CKEditor and PDF code behind lazy imports.
- **Behavioural drift hidden in "similar" files.** Differences such as `Transfer` allowing `VIEWED` status (rept) or "chỉ đạo" wording are business rules. Each must be turned into config before merging, never dropped. Review every diff of a "near" file, do not take one copy blindly.
- **Pre-existing uncommitted work** in appr and others: check `git status` per repo before touching; migrate on a branch per app.
- **No test net.** shared-ui has no tests and the apps have almost none on the frontend. Phase 0 adds smoke tests; each phase must also be verified in the browser against the dev stack (shell on 54000 plus the app).

## 6. Decisions needed from the product / tech owner

- **D1 (decided 2026-10-22).** The heavy, stable entries (`./editor`, `./file-viewer`, `./document-kit`) are shared through the shell's `shared` list; the light ones (`./ui`, `./theme`, `./mdms`) are bundled into each app. Consequence: the shell must register the three shared entries (and be released) before any app that imports them is deployed to production.
- **D2 (decided 2026-10-22).** Keep the `file:../../libs/shared-ui` link while phases 0-5 run (shared change and app adoption move together). Once the kit is stable, tag a release (`v1.4.0`) and re-evaluate publishing. Consequence: every app's development guide must say "build shared-ui first (`npm run build` or `build:watch`)".
- **D3 (decided 2026-10-22).** `vpi-adm-appr-final` is the canonical appr (clean import of `main@e48b832`, without the dead files that `vpi-adm-appr` still carries). Its uncommitted work (performance and loader changes of 2026-10-22, plus pre-existing edits) is committed on its own branch before any migration touches it.
- **D4 (decided 2026-10-22).** One shared token set in `./theme` with an extension point (`createTheme({ primary })`, default `#C05621`). No app overrides anything today.
- **D5 (decided 2026-10-22).** idoc and odoc receive only the light entries (`./ui`, `./theme`, `./mdms`) and the editor entry for now; moving them onto `./document-kit` is re-decided after the kit is stable in appr, rept and trip. Phase 6 is therefore optional.

## 7. Not in scope

Backends, the shell (`vpi-sys-soff`), the other mini-apps in `mini-apps/` (more `vpi-*`, `cgm-*`, `eme-*` apps probably repeat the same pattern; the tooling in section 9 can be pointed at them), and any change of business behaviour.

## 8. First steps once approved

1. Phase 0 on a `chore/shared-ui-foundations` branch of shared-ui.
2. Phase 1 pilot in `vpi-adm-rept` on its own branch; compare `dist` size and check the module in the shell before and after.
3. Review the pilot, then continue with trip, appr, idoc, odoc.

## 9. Reproducing the analysis

The analysis used throw-away scripts (hash by path, `difflib` ratio per same-path file, `diff | grep -c` for the spot checks). If the plan is approved they should be turned into `scripts/check-duplication.mjs` in this repo (Phase 0) so the figures can be refreshed.


## idoc / odoc update (2026-10-22)

Phases 1-3 were applied to `vpi-adm-idoc` and `vpi-adm-odoc` (theme, mdms, platform-kit, signalr, ui, utils, editor, file-viewer), all on `main`.
Differences kept on purpose: idoc keeps its own status chip palette (processing amber, approved green; the shared one is the reverse),
and `departmentsController` in the kit gained `getAllDepartments` and an optional `companyId` for them.

Phases 4-5 (document-kit list and detail) are **not** applied: their list and detail screens carry concepts the kit has no place for yet
(clerk/staff view mode with `ClerkRoleSync` and `RoleModeGate`, role-gated scope tabs, awaiting counts, category/issuer/recipient filters,
category and issuer in the global state, different create/edit forms). They need a kit extension design first.


### Comment rule of the discussion (all five apps)

One rule, `getCommentMode(config, document)`: a **cancelled** document is locked, an **ended** one takes private comments only,
every other status is open. `config.detail.statuses` lists `cancelled` and `finished` per app; an app whose documents have no
status passes `commentMode` instead. Statuses agreed with the product owner:

| App | cancelled (locked) | finished (private only) | open |
|---|---|---|---|
| rept | CANCELED | APPROVED, REJECTED | DRAFT, PROCESSING, VIEWED |
| trip | CANCELED | REPORT_APPROVED, REJECTED | DRAFT, PROCESSING, PLAN_APPROVED, REPORT_SUBMITTED |
| appr | CANCELED | APPROVED, REJECTED | DRAFT, PROCESSING |
| idoc | DELETED | APPROVED, ARCHIVED | PROCESSING |
| odoc | - (no status) | - | private comments only (`commentMode: () => "private"`) |

The rept and trip backends enforce it in `Document.AddCommentActivity(..., isPrivate)` (400 `InvalidDocumentStatus` otherwise), like appr
and idoc. Deploy those backends before the frontends. odoc's backend does not enforce private-only yet (frontend only).

### idoc / odoc: the right-hand panel (discussion, history) from the kit

`@ptht365/shared-ui/document-kit` can be used for the detail sections alone: wrap the app in `<DocumentSectionsProvider config>`
(api.getById, `statuses`, history wording) instead of `<DocumentKitProvider>`.
Wording ("Chua cap nhat duoc noi dung moi cua <documentName>", the locked notice) comes from `configureUi({ documentName })`.
Comment send errors are reported by status (400 ended, 404 no access, other: the backend message) and the box is cleared only on success.
idoc and odoc use the kit's DocumentContext, DiscussionSection and HistorySection; their own attachments/reference-links sections,
actions and InfoSection stay local.
