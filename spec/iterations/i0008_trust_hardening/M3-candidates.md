# M3 — Candidate architectures (i0008_trust_hardening)

Evidence for the M3 gate. Alternatives per load-bearing choice, weighted criteria, feasibility against the real code.

## ≥2 alternatives elaborated  → i8-m3-alternatives-elaborated  *(killer)*

**C1 — Strict-parser rollout point** (`req-strict-frontmatter`, `req-ref-integrity`)
- **(a) Strict at every graph load.** Any command that consumes the graph refuses on the first malformed repo state, reporting ALL findings batched (file + key + direction), nonzero exit.
- **(b) Strict on write-paths only.** `bless`/`start`/`observe-red` refuse; `status`/`why` render with an error banner; `lint` exits nonzero.
- **(c) Lint-only strictness.** Load stays lenient; only `lint` flags.
- Lean: **(a)** — a status rendered from a misparsed graph IS the silently-shrunk cone; any answer from a malformed graph is a lie. Mitigation of the brick risk lives in the recognition rule (below) and the M5 no-brick spike, not in weakening the refusal.
- **Node-recognition rule (new sub-choice, surfaced by feasibility):** strictness needs a definition of "node file" first. Candidates: file starts with `---` as its first line (evidence docs like `M1-frame.md` start with `#` and only contain `---` hrules mid-document — excluded naturally); plus an explicit exclusion for `iteration.md` (breadcrumb keys `iteration`/`status`/`rigor`) or allowlisting its keys as a distinct file class. Lean: first-line `---` = node candidate, `iteration.md` parsed as its own strict class.

**C2 — Actor channel detection** (`req-actor-channels`)
- **(a) Char-device stat, stdlib-only.** `os.Stdin.Stat()` (+stdout) `Mode()&os.ModeCharDevice` → console=human; pipe/redirect (every harness) → agent. Known quirk: MSYS/mintty interactive terminals present pipes → misread as agent, which errs in the harmless direction (under-claims human oversight, the design's stated philosophy).
- **(b) Environment heuristics.** `CI`, `TERM`, harness markers — spoofable, nondeterministic across harnesses, rejected on fidelity.
- **(c) No detection.** Always default agent; console humans must type `--by human` every time — most honest, worst console UX.
- Lean: **(a)** with `--by` override (validating the quirk at M5 on real Windows terminals); (c) is the acceptable fallback if the spike falsifies (a).

**C3 — EARS new-vs-blessed discrimination** (`req-ears-lint`) — carries R3
- **(a) Attest-derived grandfathering.** Reconstruct "was blessed before the EARS epoch" from gate folds — requirements are trace (never themselves blessed), so this is indirect lineage reconstruction through downstream gates: complex, hard to audit.
- **(b) Baked baseline corpus.** At feature-land, record `stmtHash` of every existing requirement into a committed baseline file; lint checks only requirements whose current `stmtHash` is NOT in the baseline. "New" and "genuinely edited" (= went SUSPECT for a real statement-level reason) both fall out of one deterministic set-membership test; blessed history can never be flagged.
- **(c) Iteration-order scope.** `iterOf(path) >= i0008` = checked (machinery exists in coverage.go) — simplest, but an edited OLD statement is never checked, missing the directive's "SUSPECT for real reasons" arm.
- Lean: **(b)** — one auditable file, exact forward-only semantics, `ears: exempt` + required reason on top, exemptions counted.

**C4 — Log-dir resolution** (`req-logs-out-of-repo`)
- Fact base: `.quack/logs` = 122 MB of harness session-transcript folders (research data for retro mining, incl. foreign trader/sebot projects — personal data), already gitignored; the ENGINE writes no logs today. The deliverable = the engine owns the canonical resolution (and any future engine logging uses it), plus the one-time migration.
- **(a) `os.UserCacheDir()`.** Wrong semantics — cache is droppable; these are durable research data.
- **(b) Manual resolution per directive.** Windows `%LOCALAPPDATA%\quackitect\logs\<slug>`; elsewhere `$XDG_DATA_HOME` (default `~/.local/share`)`/quackitect/logs/<slug>`; `config.toml` override wins. Stdlib env reads only.
- **(c) `os.UserConfigDir()`.** Roaming AppData on Windows — wrong for bulky logs.
- Slug: workspace dir name + `h12(abs-path)[:6]` (collision-proof, human-readable) vs. full path-mangling (Claude-Code style, long). Lean: **(b)** + name-plus-hash slug.

**C5 — Kernel corpus baking** (`req-kernel-selftest`)
- **(a) In-code Go literals** for golden vectors + the three fixture DAGs — versioned with the code, parity with existing selftest style.
- **(b) `go:embed` corpus files** — nicer to edit, but spreads the kernel's truth across files for no functional gain.
- **(c) Fixed-seed generation** — needed only for the property battery; hand-rolled xorshift64* (5 lines, ours) over `math/rand`, whose stream stability across Go versions we don't control.
- Lean: **(a)** for vectors/DAGs + **(c)** for property DAGs; no embed.

**C6 — Region-hash normalization variant** (`req-design-hash-norm`)
- **(a) Reuse `norm()` verbatim** (DRY; but it lowercases — a case-only rename in code would NOT reopen the design).
- **(b) Whitespace-collapse-only** (`TrimSpace` + collapse, case preserved): a case rename IS a content change in code; matches the directive's operative words "whitespace-collapse only".
- Lean: **(b)** — decided with sensitivity check at M4.

## Criteria weighted  → i8-m3-criteria-weighted
Derived from the requirement set and the directive's red-team history:
1. **Record fidelity — the ledger cannot lie by accident** (weight 5): C1a>C1b>C1c; C2a≈C2c>C2b; C3b>C3a>C3c.
2. **Determinism / cross-machine reproducibility** (4): kills C2b, C5-`math/rand`; favors C3b's set test.
3. **Day-one non-brickage on the live repo** (4): demands C1's recognition rule + M5 spike; favors C3b (blessed history structurally unflaggable).
4. **Zero-dependency single binary** (3): C2a stdlib-stat over any terminal lib; C4b env-reads over new deps.
5. **Churn containment / forward-only** (3): C3b, C6b (one-time recompute ripple accepted as R5).
6. **Simplicity / maintainability** (2): C4b, C5a; tolerated complexity in C1a's batched error collection because criterion 1 outweighs.

## Feasibility rough-checked  → i8-m3-feasibility-checked
Against the real code, per candidate:
- **C1:** `parse.go:50` `ParseNode` swallows the read error (`txt, _ :=`) and the switch default silently drops unknown keys — both single-site fixes; error aggregation needs `ParseNode` to return `(Node, []error)` and `loadNodes` to batch. **Discovered hazards, feeding the M5 spike:** evidence docs (`M1-frame.md` etc.) contain `---` hrules that `strings.Split(txt,"---")` would misread as frontmatter under strictness → the first-line-`---` recognition rule is load-bearing; `iteration.md` carries breadcrumb keys (`iteration`, `status`, `rigor`) needing their own class. Allowlist inventory from the live switch: `id,type,statement,class,verify,killer,milestone,parent,depends_on,refines,implements,verifies,addresses,validates` + new `ears` (+ `roles` if/where iteration.md is strict-classed).
- **C2:** `ops.go:37` `env("QUACK_ACTOR","human")` is the single stamp site; swap to channel-default + `--by` flag threading through `cli.go`'s arg handling — which `req-cli-help`'s shared arg preamble touches anyway (one seam, two requirements).
- **C3:** `stmtHash` (`engine.go:100`) already exists; baseline = map of req-id→stmtHash written once in M6, checked in `cmdLint` (`cli.go:277`), which already exits nonzero on duplicate ids — the pattern to extend.
- **C4:** engine writes no logs; add a resolver-level `logsDir()` (resolver.go owns workspace paths), surface it, and migrate the 122 MB with a verified move (count+size before/after), foreign folders included.
- **C5:** selftest.go is a flat battery of `func selftestX() bool` — kernel tests slot in as peers; existing fixtures already build temp workspaces, so DAG fixtures have precedent.
- **C6:** `engine.go:118` folds `h12(n.RegionBody)` raw — the churn bug confirmed at its exact site; either variant is a one-line change plus the R5 one-time ripple.
- **Pulled items:** `req-cli-help` → shared preamble at `cli.go`'s command dispatch (the `start --help` incident site) *[correction, M5: the preamble already exists — cli.go:61/84, landed with i0003's identical `req-cli-help`; item dissolved]*; `req-monotonic-lint` → lint walk over tasks' `depends_on` reachability to the prior gate — graph machinery exists.

---

## Milestone review (increasing scrutiny)

**Round 1 — Verify.** Every load-bearing choice named at M1/M2 (channel detection, EARS discrimination, log-dir, corpus baking) has ≥2 genuinely distinct alternatives, plus two the feasibility pass surfaced (rollout point C1, norm variant C6). Each candidate was checked against named code sites, not guessed — the two real hazards found (evidence-doc `---` hrules, `iteration.md` breadcrumb keys) prove the pass touched reality.

**Round 2 — Validate.** The alternatives serve the frame's intent (record fidelity first): every "lean" choice is the one that makes lying harder, and every UX/complexity cost is paid in that currency. Nothing exceeds scope: no new commands beyond the directive's surface, deferred items stayed out.

**Round 3 — Red-team.** Strongest counter-cases: (i) C1a "strict everywhere" could lock a user out of `status` mid-compose — accepted deliberately: a wrong `status` is worse than no `status`, and `note` (no graph load) stays available; kill-criterion unchanged (zero false rejections on the live repo at M5 or C1 redesigns). (ii) C2a's mintty quirk means some real humans get stamped agent — accepted as the designed-harmless direction, `--by human` is the documented escape; falsifiable at M5 on real terminals. (iii) C3b's baseline file could be hand-edited to smuggle statements past the lint — it is committed, diffable, and auditable in review; attest-grade protection of the baseline belongs to the deferred evidence-into-merkle work, not here.

**Verdict: PASS.** Alternatives are real, criteria trace to requirements, feasibility is grounded in named code sites. Proceed to the human bless of `i8-m3-alternatives-elaborated` (killer) and `i8-m3-gate`.
