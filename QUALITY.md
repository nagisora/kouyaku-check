# Quality

Maintained by [ever-better](https://github.com/isamu/ever-better). Numbers are rendered from
`.ever-better/state.json`; edits outside the notes block are overwritten on the next run.

- Phase: **drain**
- Frozen: 2026-09-09T01:10:05.550Z
- Open violations: **49**
- Rules improved since the ceiling: **0**
- Everything is at or below its ceiling.

## Worklist

Top to bottom. An unattended run works this list and nothing else.

- [x] **P0 diagnose** — taken 2026-09-09T01:10:27.426Z
- [ ] **P1 bootstrap** — 1 gap(s) still open
- [x] **P2 freeze** — frozen 2026-09-09T01:10:05.550Z
- [ ] **P3 drain** — 49 violations across 7 rules
  - [ ] `@typescript-eslint/no-unsafe-call` — 1 left
  - [ ] `@typescript-eslint/restrict-plus-operands` — 1 left
  - [ ] `@typescript-eslint/triple-slash-reference` — 1 left
  - [ ] `max-lines-per-function` — 1 left
  - [ ] `@typescript-eslint/no-unsafe-argument` — 3 left
- [ ] **P4 tighten** — add the next rule tier, then freeze and drain again
- [ ] **P5 duplication and dead code** — report-only scans; extraction is judgment, not a threshold

## Ratchet

Ceiling is the count at the last freeze. It may fall and must never rise.

| Rule | Ceiling | Now | Change | Status |
| --- | ---: | ---: | ---: | --- |
| `@typescript-eslint/no-unsafe-member-access` | 21 | 21 | 0 | draining |
| `@typescript-eslint/restrict-template-expressions` | 21 | 21 | 0 | draining |
| `@typescript-eslint/no-unsafe-argument` | 3 | 3 | 0 | draining |
| `@typescript-eslint/no-unsafe-call` | 1 | 1 | 0 | draining |
| `@typescript-eslint/restrict-plus-operands` | 1 | 1 | 0 | draining |
| `@typescript-eslint/triple-slash-reference` | 1 | 1 | 0 | draining |
| `max-lines-per-function` | 1 | 1 | 0 | draining |

## Other counters

| Counter | Ceiling | Now |
| --- | ---: | ---: |
| eslint:warnings | 4 | 4 |

## Outstanding

### bootstrap

- [ ] **.astro files are not linted** — The generated config covers .ts and .js only for this framework, so those files pass by being skipped. Add the framework's ESLint plugin before freezing, or the baseline records a number that ignores half the repo.

### tighten

- [ ] **Only 83% of sources are TypeScript** — The type-aware rules cover the typed part only, so the remaining .js files are the blind spot the counts will not show.
- [ ] **2 strictness flags `strict` does not include are off** — Measured with `tsc --showConfig`, after every extends: exactOptionalPropertyTypes, noPropertyAccessFromIndexSignature. Type errors have no suppression mechanism, so enable them one at a time and measure the cost first.

## Work log

| Date | Commit | Kind | Rule | What |
| --- | --- | --- | --- | --- |
| 2026-09-09 | 0d55217d | drained | @typescript-eslint/consistent-type-assertions | replaced 4 assertions with isLabel/isSourceType guards |
| 2026-09-09 | caf47b35 | drained | @typescript-eslint/no-base-to-string | formatDietSession: string|number only; objects no longer become [object Object] |
| 2026-09-09 | 014b592c | drained | sonarjs/no-alphabetical-sort | 2 .sort() calls now localeCompare via compareFileNames |
| 2026-09-09 | f9dd9397 | drained | @typescript-eslint/consistent-type-definitions | 6 type aliases -> interface in src/lib/types.ts; runtime unchanged |
| 2026-09-09 | dcd555fa | note |  | ever-better 0.5.0 bootstrap: prettier + eslint 10 + vitest + knip + gitleaks CI. typecheck is astro check because tsc cannot read .astro. id-length exceptions for 一致/ズレ/不明. No eslint-plugin-astro (upstream gap). |

## Notes

<!-- ever-better:notes:start -->
_Anything written between these markers survives a re-render._
<!-- ever-better:notes:end -->
