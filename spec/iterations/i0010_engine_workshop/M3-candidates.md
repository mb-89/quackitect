# M3 — Candidate architectures (i0010_engine_workshop)

## Alternatives elaborated  → i10-m3-alternatives-elaborated

Seven open axes. Each card: context, options with one-line pro/con, and the leaning. Scoring happens at M4 (Pugh, strongest-rival datum).

**A1 — Verdict cache shape** *(req-verify-cache)*
- Context: verdicts are machine-local caches, never truth. Truth stays in spec/ (i9 principle).
- (a) **Single JSON map** in the data home, rewritten atomically per battery. Pro: one read, trivially consistent, self-pruning. Con: whole-file rewrite per battery.
- (b) **Append-only JSONL log**, last-wins per test. Pro: cheap appends, natural history. Con: grows unbounded, needs compaction.
- (c) Verdicts in `spec/ledger/`. REJECTED at birth: caches do not belong in committed truth.
- Leaning: (a) — verdict sets are small (dozens), atomic rewrite is simpler than compaction.

**A2 — Build identity for the cache key** *(req-verify-cache)*
- Context: a rebuilt engine must invalidate every verdict.
- (a) **Binary self-hash** at startup. Pro: cannot lie, survives forgotten bumps. Con: hashing the exe each run (~ms).
- (b) **Version constant** in source. Pro: free. Con: a forgotten bump serves stale verdicts — the exact failure class this iteration kills elsewhere (mtime ratchet).
- Leaning: (a).

**A3 — Call-log shape** *(req-call-log)*
- (a) **calls.jsonl** append-only in the logs home, redacted fields, size-capped. Pro: owner-directed shape, disposable like logs. Con: cap needs rotation logic.
- (b) Per-day files. Pro: rotation for free. Con: aggregation reads many files.
- (c) SQLite. REJECTED: zero-dep engine.
- Leaning: (a), per the owner's instrumentation note.

**A4 — Ratchet stamp** *(req-ratchet-semantic)*
- Context: mtime is a temporal proxy for a semantic rule ("newer engine"). Fresh clones break it.
- (a) **Generated version-stamp file** written by `quack build` into the vendored source; launcher compares semantically. Pro: explicit, diffable. Con: one more generated file to keep honest.
- (b) **Source identity hash + recorded version**: ratchet only when the vendored source differs AND its recorded version is greater. Pro: belt and braces. Con: two mechanisms to test.
- (c) Keep mtimes. GRAVEYARD: the observed backward-rebuild bug.
- Leaning: (a), with (b)'s version-greater guard folded in if the spike shows hash-only ambiguity.

**A5 — Stamp vocabulary** *(req-user-wording; owner ruling: user replaces human)*
- Context: the recorded actor stamp feeds the self-cert metric (agent-blessed killers ÷ killers). Prose is free; the schema is not.
- (a) **Sweep prose + CLI display; stamps stay `actor=human`/`--by human`** as a frozen allowlist. Pro: zero ledger churn. Con: the frozen word contradicts the ruling at the record layer.
- (b) **Full rename to `actor=user`/`--by user`** with a ledger migration and a read-compat shim for old records. Pro: one vocabulary everywhere. Con: schema churn, migration risk, i8 design regions reopen.
- (c) Channel terms (`console`/`harness`). Pro: names the mechanism, dodges person-words. Con: overrides the explicit "user" ruling — kept only as the strongest rival for the Pugh datum.
- Leaning: genuinely open — this is the M4 decision with the metric as a criterion.

**A6 — Notes list surface** *(req-notes-list)*
- (a) **`quack notes [--all]`** — a small read-only command. Pro: discoverable noun, room for later sub-ops. Con: second entry point beside `note`.
- (b) `quack note --list`. Pro: one entry point. Con: a verb command growing read modes.
- Leaning: (a), per the capture note.

**A7 — Why-explanation source** *(req-why-derived)*
- (a) **Compute on demand**: `why` re-derives the coverage delta live (rule + the counted inputs). Pro: no new state, always current. Con: pays the evaluation cost on ask.
- (b) Record flip reasons at evaluation time; `why` reads the record. Pro: instant answer. Con: new state to invalidate — a second cache to keep honest.
- Leaning: (a); with A1's verdict cache the evaluation is cheap by then.

## Criteria weighted  → i10-m3-criteria-weighted

Derived from the requirements and the standing constraints, vital-few:

| # | Criterion | From | Weight |
|---|---|---|---|
| C1 | Zero-dep, one static binary | engine constraint | 5 |
| C2 | Truth in spec, caches deletable | i9 principle, req-verify-cache | 5 |
| C3 | Cannot serve stale state (self-invalidating) | req-verify-cache, req-ratchet-semantic | 5 |
| C4 | Responsiveness (1s feedback) | req-status-fast, responsiveness guide | 4 |
| C5 | Schema & metric continuity | self-cert metric, ledger stability | 4 |
| C6 | Smallest honest diff | maintenance iteration | 3 |

## Feasibility checked  → i10-m3-feasibility-checked

- A1(a)/(b): both trivial in stdlib Go — os.WriteFile atomic-rename / append. Feasible.
- A2(a): sha256 of the running exe via os.Executable — milliseconds. Feasible.
- A3(a): append + size check ≈ 40 lines. Feasible.
- A4(a)/(b): build already writes generated files (golden root); a stamp file is the same move. Feasible.
- A5(a): grep-sweep + allowlist selftest — mechanical. A5(b): migration touches attest.json records — feasible but the riskiest item on the board.
- A6(a): read-only directory listing — trivial.
- A7(a): the coverage evaluator already computes the inputs; naming them is exposure, not new math. Feasible.

## Milestone review  → i10-m3-gate

**Round 1 — verify.** Seven axes, each with ≥2 genuinely viable options and a one-line pro/con; two option-classes rejected at birth with reasons (spec-resident cache, SQLite). Criteria table derives from named requirements. Feasibility notes point at concrete mechanisms (stdlib calls, existing build hooks).

**Round 2 — validate.** Axis coverage against the requirement set: A1/A2→verify-cache, A3→call-log, A4→ratchet-semantic, A5→user-wording, A6→notes-list, A7→why-derived. req-verify-feedback, req-status-fast, req-mint-*, req-scaffold-modern, and req-pager-merge carry no open architecture axis — their shape is fixed by their statements or an owner ruling; elaborating fake alternatives for them would be ceremony. The mid-walk findings (parity placement, tests-red scope) are captured as notes for the next compose, not smuggled into this axis set.

**Round 3 — red-team.** Strongest opposing case per leaning probed: A2's version-constant is cheaper but reproduces today's mtime failure class — the self-hash leaning survives. A5 is deliberately left undecided; forcing it here would pre-empt the Pugh run the datum discipline demands. A7(b)'s instant answer tempts, but a second cache to keep honest contradicts C3. No axis has a hidden third option that dominates.

**Verdict: PASS** — proceed to bless. No reopened checks.
