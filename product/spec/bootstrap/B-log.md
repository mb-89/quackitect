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

## B2 — read/write pair

**Pass condition met:** a mid-air collision dies at the write with a
one-turn-recoverable rejection (SE-C-010; the remedy IS the corrected call;
the human edit is never clobbered; replay of a stale hash refused). 27/27.

**MCP transport — DECIDED (the B2 gate, decision-timing principle):**
**hand-rolled** stdio JSON-RPC over @modelcontextprotocol/sdk.
Implementation data: (a) needed subset is thin — initialize, tools/list,
tools/call, ping, line-delimited JSON; (b) engine is zero-runtime-deps and
the SDK adds zod + transitive churn against the npm-discipline ruling;
(c) the toll and refusal-first dispatch need custom middleware regardless;
(d) contract tests speak real bytes to a spawned server, which carries the
protocol-drift risk. Degenerate-matrix decision; route into the ledger
post-B3. Rejections travel as isError tool RESULTS (model-readable clause +
executable remedy), never as JSON-RPC protocol errors.

**Implementation finding (design correction):** the Anthropic API rejects
dots in tool names (`^[a-zA-Z0-9_-]{1,64}$`), so §5's dotted names cannot be
wire names. Wire = `se_get_node`; the dotted form rides title/description.

**Other B2 decisions:**

- Sections are the only body-addressing scheme (`replace_section`);
  no line/string editing anywhere, per §5.
- `set_field` refuses edge fields (SE-C-011) — add_edge/remove_edge are the
  only trace-link writers. `set_field` on `id` refused (SE-C-014, rename is
  refactor's job later).
- Clause ids so far: SE-C-001 self-repo, SE-C-002 history rewrite,
  SE-C-010 CAS mismatch, SE-C-011 edge-via-set_field, SE-C-012 unknown node,
  SE-C-013 create-exists, SE-C-014 id immutable, SE-C-015 section missing,
  SE-C-016 unknown edge kind, SE-C-017 remove missing edge, SE-C-090
  se.help unarmed. Clause nodes mint at B3+.
- `se.help` is on the surface from day one but refuses until armed at B5 —
  the surface never ships without the demand-capture lane declared.

## B3 — the mint (`se.set.migrate v1-import`)

**Pass conditions met:** re-run yields an empty diff (verified on the live
ledger, 0 files); **126/126 accounted** (124 explicitly verdicted by P3 + 2
never named by P3, flagged as questions — see delta below).

**Result: 226 nodes minted.** decisions 62 keep + 18 keep-am (amendments
applied as a `v2 amendment` section + `v2_amendment` field) · 12 re-derive
question nodes · 11 anti-keep graveyard (incl. the two owner-ruled
supersedes: chat-grant, call-log) · methods 8 · references 35 (26 baseline
+ 9 post-P3, marked) · raid 19 (17 keep + 2 post-P3, marked; 5 P3 drops
honored) · glossary 39 · fundamentals 1 · rules 1 · UC-1..10 from the
design doc + **UC-11** (owner ruling) + **se.req-runme-dep-free** (owner
ruling: uc-run-dep-free → requirement) + **se.adr-mcp-transport-v2** (the
B2 decision, `adjudicated_by: agent`, channel bootstrap-session —
transparent per the delegated-adjudication ruling; owner reviews at run
end).

**P3 delta — needs owner adjudication (7 question nodes, `se.q-p3delta-*`):**
5 decisions landed in v1 after the P3 cut (adr-i27-views, adr-ifu-kind,
adr-onion-extend, adr-pugh-fields, adr-slide-figref) and 2 existed at the
cut but were never named by a P3 verdict (adr-module-views — proposed drop
like its views siblings; adr-vale-autopull — proposed re-derive under the
TS toolchain). Nothing was silently imported or silently dropped.

**Edges:** 3 imported (both endpoints in v2), 1005 skipped honestly —
v1's edges mostly target iteration-level req-*/check-* ids that stay on
v1's branches per the events-stay-on-branch doctrine. `refers` dropped by
rule; v1's `interface` lane had no jsonl. Zero parse failures across all
v1 files.

**Trace dir ruled (was: uninspected):** v1 `trace/` is v1's self-model
(8 fn-* stubs, 6 nbr-*, 4 need-*). Needs fold into value_props by ruling;
v2 grows its own spine at self-host. NOT migrated. Fill ruling — flip if
wanted.

**Term-lint first run:** `bootstrap/term-worklist.md` — 139 candidate
abbreviations without glossary entries (45 known terms). Noisy by design;
it is a worklist, not a gate.

## B4 — machine + loop

**Pass condition met:** a scripted walk closes a dummy iteration with no
human and no agent (34/34). Also tested: Failed-opens-fallbacks with a
guarded retry (`verify_attempts < 3`), escape recording the exhausted
guard, field-targeted evidence validation (SE-C-030, remedy preserves
filled fields), one-open-iteration-per-worktree (SE-C-031).

**Decisions:**

- Machine state lives at `state/<iteration>.json` (committed — machine
  state rides the branch); evidence at `evidence/<iteration>/NN-state.json`
  (committed — events stay on the branch); raw call log at `.se/calls.jsonl`
  (machine-local, gitignored, log-everything). G2 pinning: submit's
  `run_ref` copies the run record into the evidence file.
- Guards are a deliberately tiny language (`counter op int`) — extended
  state stays counters + guards, no expression engine.
- The systematic machine (bootstrap cut) is engine data
  (`engine/machines/systematic.ts`): declare_goal → do_work → verify
  (engine-filled, `npm test --silent`) → close_iteration (gate) → closed.
  Minting policies as ledger nodes is i1 work.
- The bootstrap gate closes by submit; the real TTY gate arms at B5 —
  mechanical states fill, never bless, and the gate stays adjudicated.
- Tool surface now takes a repo ROOT (`--root`), not just a ledger path:
  ledger/, state/, evidence/, .se/ hang off it.

## B5 — guard rails

**Pass condition met:** a console bless (spawned `bin/se-gate.ts`, real
stdin/stdout) lands with `channel: tty` + the offer hash + adjudicator on
`state/grants.jsonl` (40/40).

**What changed / decisions:**

- **Gate semantics from B5 on:** submit at a gate state creates an OFFER
  (hash bound to iteration+state+evidence), never a close. Bless arrives
  through a channel the agent doesn't control: `bin/se-gate.ts` (console).
  Offer TTL 15 min wall clock; expiry/interrupt = dismissal by absence, no
  write. Stale hash → SE-C-042; no live offer → SE-C-041; machine moved →
  SE-C-043; second offer while one lives → SE-C-044.
- **The toll** is dispatch middleware on the MCP server (`addGuard`).
  Armed on first submit; refusal SE-C-040 carries the SAME call with the
  update schema inline (`remedy.args.update`); the paid call proceeds and
  the update lands in the call log (`se.toll.update`). No success-path
  narration. Window default 10 min, injectable.
- **se.help armed:** keyword search over tool descriptions + the machine's
  guidance slices; hits are affordances, miss returns the honest
  "no such tool — do it yourself" refusal; every call logged with intent
  and a `miss` flag (the live demand signal). SE-C-090 retired.
- **se.wait:** mechanical conditions only (file exists/changes, offer
  state), 250 ms poll, cap 300 s — anything longer is a park and SE-C-050
  says so with the park guidance in the remedy. No checks on any read path.
- MCP dispatch is now async (await handlers) — needed for se.wait.
- The bless lane is deliberately NOT an MCP tool: agents park or wait on
  the offer; humans bless via console. Delegated adjudication (agent
  bless) stays possible through the same Gate API with its channel
  recorded — the policy knob, transparent by construction.

## B6 — self-host exit

**i1 of v2's own development ran under v2** (`bootstrap/i1-walk.mjs` is the
recorded driver; `state/i1.json` + `evidence/i1/` are the committed record).

- **Goal:** every MCP tool call lands raw in the call log through the
  single dispatch path (successes AND rejections, with outcome tags).
  Load-bearing for: the log-everything ruling and v1's measured loss (the
  retro-deleted raw call log made P5 counts lower bounds forever).
- **Walk:** declare_goal → do_work (typecheck run `run-04926d236045`
  pinned) → verify engine-filled (`npm test`, `run-80119a7c6cce`, ok) →
  gate offer `0711aba7f0b4…` → blessed, channel `chat-session`,
  `adjudicated_by: agent:claude-bootstrap-session`. **Owner audit point:**
  this bless used the delegated-adjudication knob; flip it by dismissing
  and re-blessing via `node bin/se-gate.ts` if the run-end review says so.

**Exit test (absolute):**

- *Zero ad-hoc scripts:* no script was written to work around a missing SE
  tool during i1; the one gap probe (`se.help` for a deploy-shaped query)
  returned the honest refusal and is in the call log as demand.
- *Rejections recover in one turn:* every rejection path carries the
  corrected call as `remedy` and is tested that way (CAS collision, missing
  evidence fields, stale gate hash, toll).
- *Feels fast:* every loop step returned in milliseconds except verify
  (~3 s, the real test suite). No step needed a re-read or a re-derivation.
- *Baseline series:* i1's call log rides `.se/calls.jsonl` (machine-local
  by design); the runs that back evidence are pinned into `evidence/i1/`
  and committed. The series starts here.

**Bootstrap session: B0–B6 complete.** v2 hosts its own iterations from
here; v1 stays runnable on `main` until UC-4 passes.

## Post-B6 owner rulings (2026-07-22, same day)

- **se.rule-owner-pushes (minted through the apply lane):** the agent
  never pushes to origin — pushing is an owner act. Engine refusal
  SE-C-003 (`assertNotPush`); session agents follow the same rule.
  Commits stay the agent lane. The B0–B6 pushes predate the ruling and
  are grandfathered, not precedent. **Consequence: from this ruling on,
  local branches run ahead until the owner pushes.**
- **benjamin remote exists and is PUBLIC** (owner-created; design said
  private). Fine while the repo carries machinery only. Before any kb
  CONTENT lands: flip to private or land the pre-push tier hook (Track
  B3) first — an item's tier must never be loosened by its transport.
- **Surface noise:** split ruling proposed — trim tool descriptions to
  one line now (guidance belongs in next/help, not the tool list; §5
  prompt-cache caveat), defer visibility machinery to the i2 surface
  growth trigger with `se.structure` ("~5 visible per level") as the
  tripwire. Awaiting owner word on the trim.
- **se.structure applied to disk (owner ruling: the noise rule covers the
  repo, not just surfaces).** Root reshaped to the v1 form:
  - `spec/` — the thinking: ledger, iterations (state + evidence +
    grants), bootstrap log
  - `product/` — what ships: engine, bin, modules, tests, brand
  - `.se/` — machinery, machine-local (call log, toll, live offer;
    the offer moved here — losing it IS dismissal, safe by design)
  - Root files: README, RUNME ×2, package.json (+lock, npm-forced)
  - All engine paths derive from `product/engine/layout.ts` — one file
    to touch on any future move. A guard test fails when the root
    exceeds 7 visible entries. RUNME green on the new layout; 43/43.
- **Voice carried over:** v1 `product/brand/voice.md` copied verbatim to
  v2 (now `product/deliverable/brand/voice.md`).
- **Memory retracted (owner ruling):** agent memory must carry no v2
  knowledge — v2 tells a fresh agent what to do by itself. All project
  memories deleted; the index says so. The rules live here instead.
- **Workspace isolation (owner ruling; ledger node
  `se.adr-workspace-isolation`):** root = README, RUNME ×2, workspace/,
  product/ (5 visible; guard test caps at 6). workspace/ = agent
  territory (AGENTS.md, .mcp.json link, deny rules). product/spec/ =
  ledger + iterations, MCP-only. product/deliverable/ = engine + npm,
  reached through the new **se.deliverable** lane (list / read / patch /
  write, CAS-guarded, path-escape refused SE-C-060..064; "deliverable"
  not "code" — realization kinds beyond code may follow). **se.git**
  added: allowlisted subcommands, push refused. Machine-local state
  moved to `~/.se/<project>/` (SE_STATE_DIR overrides; the call log must
  survive, so profile not temp). RUNME reworked: it STARTS an agent in
  the workspace; verification lives in `npm run verify` (CI unchanged).
  Named residual: subprocess porosity, accepted per §14; belts are deny
  rules + AGENTS.md (rule extends to subagents) + logged dispatch.
