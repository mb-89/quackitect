# M1 — Frame the problem & vision (i0008_trust_hardening)

Evidence for the M1 gate. The delta, the vision, the success criteria, the risks.

## Vision & scope  → i8-m1-vision-scope-stated
**For** an engineer whose ledger must stand as evidence, **who** needs certainty that a recorded pass means what it claims, **the** i0008 iteration **is** a trust-hardening release of the engine **that** (1) refuses malformed or unknown node input loudly instead of silently shrinking the suspect cone, (2) stamps the bless actor honestly by channel — console = human, harness = agent, `--by` overrides, (3) hashes design regions once, whitespace-collapsed, so reformatting never reopens and content edits always do, (4) proves its own trust kernel with baked deterministic corpora inside `quack selftest`, (5) moves session logs to a stable user-scoped directory outside the repo, and (6) enforces EARS-shaped, weasel-free statements on NEW requirements at systematic rigor — forward-only, **unlike** a ledger that trusts agent discipline and silently records whatever it is fed.

**Scope (the red-teamed directive, six items + housekeeping):** strict node parser with a complete key allowlist; per-channel actor defaults; design-region hash normalization; kernel tests into selftest; logs out of the repo (migration incl. foreign personal data); EARS forward-only enforcing lint + compose-reference block. Housekeeping folded in: delete `quack.exe~`, fix the README `docs/report.png` reference, verify `.gitattributes` holds. **Pulled in at the M1 gate (markus, 2026-07-02, from backlog — both ready-when conditions fired):** (7) CLI-help hardening — help flags side-effect-free on every subcommand, dash-prefixed ids rejected (`req-cli-help`) *[correction, M5 spike: already realized in i0003 — same req id existed with a green `selftest:help`; the i8 duplicate was removed, the stale backlog note re-archived; see M5-spike-findings.md]*; (8) milestone-monotonic lint — mis-wired checklists flagged mechanically (`req-monotonic-lint`). **Deferred (not dead):** evidence-into-merkle/bless-provenance; notes-graduate-into-ledger. **Rejected (do not resurrect):** unforgeable bless. **Later release:** the decision model (backlog).

## Problem agreed  → i8-m1-problem-agreed  *(killer)*
Trust is the product — and today the engine can be made to lie by accident, on six concrete counts:
1. **A typo silently narrows the audit.** `ParseNode` ignores read errors and unknown keys; `depends-on` for `depends_on` drops the edge and the suspect cone quietly shrinks — the exact failure the tool exists to prevent (external review, agreed).
2. **The adjudicator stamp is one forgotten env-var away from false.** `QUACK_ACTOR` discipline is manual; omission stamps an agent bless as `human`, over-claiming human oversight and blinding the self-cert metric.
3. **Reformatting noise erodes bless meaning.** A gofmt pass reopens designs whose content did not change, training the human to rubber-stamp SUSPECT.
4. **The trust kernel is untested at its core.** Hash folds, suspect-cone exactness, the gate state machine, and the attest `prev_hash` chain have no kernel-level verification — unverified, the chain is decorative.
5. **The repo carries ~123 MB of session logs including foreign personal data** (trader/sebot session+memory files) — bloat, privacy exposure, and noise in a published dogfood repo.
6. **Requirement prose is unenforced.** Nothing stops an unverifiable, weasel-worded statement from becoming a blessed requirement.

Each is a way the ledger's record diverges from reality. For a tool whose one claim is "auditable record you can trust", the delta is real and **worth solving**.

## Success is measurable  → i8-m1-success-measurable
Ch1 acceptance criteria for i0008:
- A node file with malformed frontmatter or an unknown key makes the engine **exit nonzero naming file and key**; every existing repo node parses clean (day-one no-brick, verified live).
- A non-interactive bless records **`actor=agent` by default**; `--by human` overrides; the console path records `human`; `QUACK_ACTOR` is retired.
- A whitespace-only reformat of a `design:` region **changes no hash**; a comment edit inside the region **reopens the design**.
- `quack selftest` carries kernel batteries (**vectors, cone-exactness, gate walk, parser strictness, attest chain**) from baked corpora, no unseeded randomness, all green from the shipped binary.
- `.quack/logs/` is **empty and migrated** to the stable user dir (`%LOCALAPPDATA%\quackitect\logs\<project-slug>`, XDG elsewhere), config-overridable; no engine log lands in the repo again.
- `quack lint` **flags a new non-EARS/weasel requirement** at systematic rigor, honors and counts `ears: exempt` (reason required), and **flags zero pre-existing blessed statements**.
- Housekeeping: `quack.exe~` gone; README image reference resolves or is dropped; `.gitattributes` policy holds.
- Every subcommand answers `-h`/`--help`/`-?` with usage, **exit 0, zero side effects**; `quack start --help` activates nothing; a dash-prefixed id is rejected. *[correction, M5: criterion already met by i0003's `req-cli-help` + `selftest:help`, verified green 2026-07-02 — no i8 work item]*
- `quack lint` **flags a milestone subtask wired past the prior milestone's gate** on a fixture; the live repo passes.

## Top risks logged (RAID)  → i8-m1-top-risks-logged
- **R1 (Risk, high) — incomplete key allowlist bricks the repo on day one.** Mitigation: build the allowlist from the full parser surface incl. i7 additions (`roles`, `milestone`, `validates`, `parent`, `verify: coverage:tests-red`, `ears`), then **spike-verify at M5: strict-parse the entire live repo, zero false rejections** before the gate.
- **R2 (Risk, med) — channel detection mis-stamps the actor.** TTY detection on Windows terminals (conhost, Windows Terminal, MSYS pipes) is quirky; a wrong default silently falsifies the record in the direction we chose to be harmless (under-claiming human). Alternatives + spike at M3/M5.
- **R3 (Risk, med) — EARS lint flags blessed history.** The new/blessed discrimination must be mechanical, or forward-only quietly becomes retrofit. Design decision at M3/M4; test explicitly asserts zero flags on pre-existing blessed statements.
- **R4 (Risk, low) — log migration touches foreign personal data.** Move-don't-delete, verify counts+sizes after, target dir outside any git tree.
- **R5 (Assumption) — hash-normalization change reopens designs once.** Changing the region hash function makes existing design hashes recompute; expect a one-time SUSPECT ripple, handled inside this iteration's walk, not a mass re-bless of history.
- **D1 (Dependency)** — kernel parser-strictness tests depend on the strict parser landing first; sequenced in M6.

---

## Milestone review (increasing scrutiny)

**Round 1 — Verify (built it right).** Each subtask points at delivered evidence: the vision/scope section restates the red-teamed directive one-to-one (six items in, two deferrals, one rejection, one later-release — none silently dropped or added); every success criterion is mechanically observable (nonzero exit, actor stamp value, hash equality, selftest verdict, empty directory, lint flag count); the RAID list carries the directive's own red-team concerns as R1–R5 with mitigations placed at named milestones (M5 spike for R1/R2, M4 design for R3, M6 procedure for R4/R5). The six problem counts each trace to a triaged source note or an observed fact (the 123 MB is real, the exe~ exists, ParseNode's silence is in the code).

**Round 2 — Validate (built the right thing).** The frame serves the vision the directive fixed: every item closes a path by which the record can diverge from reality — parse (input), actor (adjudication), hash (change detection), kernel tests (the machinery itself), logs (what the repo publishes), EARS (statement quality). Nothing in scope is out of frame; the deferred/rejected items are exactly the ones markus deferred/rejected. Process note for the adjudicator, from migration: two backlog notes have arguably-fired ready-when conditions — the milestone-monotonic compose lint and the CLI-help hardening (both touch surfaces i8 opens). Held OUT per the locked directive; markus may pull either in at this gate or leave them for a later start.

**Round 3 — Red-team (argue the opposite).** Case against: "six small polish items, not one systematic iteration — walk them lean." Rejected: four of six touch the trust kernel (parser, hashing, attest verification, actor record) where a regression is worse than the defect being fixed, and the directive was itself already red-teamed once (EARS retrofit and unforgeable-bless were killed there); full rigor with an M5 no-brick spike is the cheap insurance. Kill-criteria stated: R1 — if the strict parser cannot pass the whole live repo with zero false rejections at M5, the parser item does not proceed to build as designed; R3 — if new-vs-blessed cannot be discriminated mechanically, EARS enforcement must not ship enforcing. R5 stays falsifiable at M6 (one-time ripple only).

**Gate addendum (scope amendment).** At the gate, markus pulled both surfaced backlog candidates IN (his explicit instruction, 2026-07-02): CLI-help hardening and the milestone-monotonic lint. Trace extended (`uc-monotonic-walk`, `req-cli-help`, `req-monotonic-lint`, two tests), success criteria extended, both backlog notes archived as baked. The bless below attests the amended frame.

**Verdict: PASS.** Frame is honest, measurable, risk-aware, and scope-faithful (as amended at the gate). Proceed to the human bless of `i8-m1-problem-agreed` (killer) and `i8-m1-gate`.
