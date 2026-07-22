# Bootstrap session log (B0–B6)

Started 2026-07-22. Plan: se-v2-design.md §17 (B0–B6 table, ruled 2026-07-22).
Micro-decisions recorded here route into the ledger at/after B3.

## B0 — scaffold

**Layout decisions (defaults taken, flip any):**

- v2 orphan branch checked out as a **linked worktree** at `../quackitect-v2`,
  not in the main checkout — keeps v1's tree on disk, which the B3 mint
  (`se.set.migrate v1-import`) reads directly.
- Workspace link = npm `file:` dependency (`"kb": "file:../benjamin"`), the
  npm equivalent of go.work. npm workspaces proper can't span sibling repos.
- Benjamin's package is named `kb` — `import { manifest } from "kb"` reads as
  the module id. Never published; private.
- Test runner: `node --test` over native-TS (Node type stripping,
  `erasableSyntaxOnly`). Zero runtime deps; `typescript` (pinned 5.8.3) is the
  only dev dep, typecheck-only. npm supply-chain discipline per the TS ruling.
- Typed-rejection shape (clause/expected/got/executable-remedy/source) seeded
  at B0 in `engine/errors.ts` because the self-repo refusal needs it; B2
  builds on it. First clauses: SE-C-001 (self-repo refusal), SE-C-002
  (rebase/force-push refusal).

**Deviations / handover items:**

- `mb-89/benjamin` remote NOT created: no gh CLI on this machine and the
  GitHub MCP connector returns 403 on repo creation (effectively read-only,
  matching §4's sharpened finding). Benjamin is initialized locally.
  **Owner action: create private repo `mb-89/benjamin`, then
  `git remote add origin … && git push -u origin main`.**
- quackitect CI can't check out the private sibling without a
  `BENJAMIN_TOKEN` secret; the workflow degrades honestly (guards + engine
  tests still run).
