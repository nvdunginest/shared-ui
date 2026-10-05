# Tests of `@ptht365/shared-ui`

Runner: `vitest` (jsdom). `npm test` runs `tests/**/*.test.{ts,tsx}`; `npm run check` runs type-check, tests, build, `check-exports`, `check-entry-isolation`.

Dev-only versions (not part of the published package): `vitest ^5.0.3`, `jsdom ^30`, `@types/node ^22`.
These are deliberately the same versions the shell repo (`vpi-sys-soff`) uses for its own tests: the shell has no test
runner in its `package.json` and its tests are run with any vitest + jsdom installed elsewhere, for example this one:

```bash
# in the shell repo
/path/to/libs/shared-ui/node_modules/.bin/vitest run --root . --config tests/vitest.config.mts
```

With older jsdom (26.x, cssstyle 4.6) two shell tests (`deploy.test.tsx`, `feedbackScope.test.tsx`) fail because `min()` is
serialised differently. Do not downgrade jsdom here without re-running the shell suite (expected 98 files / 1943 tests).

jsdom notes for the CSS assertions in `tests/module-contract`: styled-components writes through the CSSOM, so the tests read
`document.styleSheets` (see `helpers.tsx#cssFor`); jsdom has no selector specificity, so tests that read a computed
`font-size` use `reset="none"`; jsdom 30 normalises values (`inset:0` -> `0px`, `calc(100cqw - 16px)` -> `calc(-16px + 100cqw)`)
and drops `!important` rules from the CSSOM, so those assertions accept both forms.

`scripts/mutation-check.py` applies ~30 hand-written mutants to `src/module-contract` and `src/dev-shell` and expects the suite to turn red for each (one known-equivalent mutant is listed in the script).
