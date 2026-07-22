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

## B1 — store + index

**Pass condition met:** index rebuilds from files alone; hashes stable across
rebuilds (18/18 tests).

**Micro-decisions (defaults taken, flip any):**

- Frontmatter is a strict YAML **subset** (`engine/yamlite.ts`): scalars,
  lists, one-level maps, two-space indent. The engine refuses anything
  outside it instead of guessing — invalid states unrepresentable, and no
  YAML dependency (supply-chain discipline). Obsidian renders it fine.
- Node hash = SHA-256 over the **canonical serialization** (envelope keys in
  fixed order, LF, trailing-newline normalized), not raw disk bytes. CRLF
  churn and key reordering don't move hashes; content changes do.
  Attribution-by-exclusion still works — detection re-canonicalizes on read.
- File layout: `ledger/<module>/<localId>.md`, id = `<module>.<localId>`,
  checked against the path at load. Kind lives in frontmatter, not the path
  (renames of kind don't move files; refactor stays id-stable).
- Edge vocabulary hard-refuses unknown kinds at parse (`serves` is refused —
  it is a projection, not an edge). Endpoint-pair legality is a lint layer,
  not parse-fatal, until the node-kind set settles at B3.
- The three ⚑ naming defaults from p4-edge-vocabulary rev 2 are taken as
  defaulted: `exemplifies`, `fulfills`, off-spine kinds lint-exempt.
- FTS5 confirmed in Node's built-in sqlite (3.53) — the warm index has zero
  dependencies. Index db lives under `.se/` (gitignored, derived).
