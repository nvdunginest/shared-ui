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
| `./platform` (extend) | AppContext, controllers (`app`, `files`, `users`, `userRoles`), models, helpers, `axiosBuilder` | light |
| `./mdms` (new) | dtaMdms models + controllers, `GlobalLoader` logic as a hook/provider factory | light |
| `./theme` (new) | `colors/radii/shadows/spacing` tokens, `StyleProvider`, `mixins`, `popoverWidth`, text utils (`removeVietnameseTones`, `getShortName`...) | light |
| `./ui` (new) | `TitleBar`, `ExpandingTabBar`, `CollapsedPanelStrip`, `FooterIconNav`, `UserInfo`, `SelectUser(Chip)`, `avatarColor`, `Forbidden`, `AclCheck`, `Section`, `CollapsedSection`, `PropertyRender*`, `GlobalCompanySelector`, branded loading (`BrandedLoading`, replaces the dark `ModuleLoadingOverlay` as default), `DebugFrameLabel` | medium, no CKEditor |
| `./editor` (new) | CKEditor stack: `CustomView`, `MinimalEditor`, `ReferenceLinks*`, `FileAttachmentPlugin`, `pasteAutoLink`, `safeLinkOpening`, css | heavy, lazy |
| `./file-viewer` (new) | `FileViewer`, `PdfViewer`, `OfficeViewer` | heavy, lazy |
| `./document-kit` (new) | the workflow engine: `createDocumentHub(config)` (SignalR), list shell (`ListHost`, `OutlookShell`, `DocumentListPanel/Mobile/Screen`, `DocumentTable`, filters, `ItemView`), detail shell (`Main`, `Extra`, discussion, attachments, history, action bar and the common actions), common contexts | heavy, lazy |
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
- Entry policy: `scripts/check-entry-isolation.mjs` is driven by an explicit table (light entries `./ui`, `./theme`, `./mdms` must not import CKEditor, PDF viewer or axios; heavy entries may). Planned entries are listed there now and are checked as soon as they are built.
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
