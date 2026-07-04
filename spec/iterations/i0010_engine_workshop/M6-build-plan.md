# M6 — Build plan (i0010_engine_workshop)

## Build planned  → i10-m6-build-planned

Twelve steps, seeded as children of `i10-m6-build`, chained in dependency order. Each step is one durable unit: one design concern, one verification hook, worth resuming on its own.

1. **bs-verdict-cache** — the cache core (map, self-hash identity, evaluator consult). Everything else in the perf family stands on it.
2. **bs-verify-feedback** — the stderr announcement rides the cache's miss path.
3. **bs-status-fast** — the timed selftest closes the perf family.
4. **bs-why-derived** — why names the rule + delta (cheap once the cache exists).
5. **bs-notes-list** — read-only notes command.
6. **bs-call-log** — dispatch logging + the retro aggregate-then-delete step in review.md.
7. **bs-mint-fixes** — sink dedupe, --rationale.
8. **bs-ratchet-stamp** — build writes the committed stamp; launcher compares forward-only.
9. **bs-scaffold-modern** — emitters to the current world; needs the stamp (step 8) to emit it.
10. **bs-pager-merge** — combined pager + engage.md wording.
11. **bs-user-wording** — the sweep runs LAST-but-one so it covers all new strings too.
12. **bs-cleanup** — docs match the surface; full build + selftest green.

Sequence rationale: the cache family first (1–3, the riskiest plumbing, spike-proven), pure additions next (4–7), the vehicle pair (8–9, stamp before emitter), the two method-touching steps (10–11, wording sweep after all strings exist), cleanup last.

Before any implementation: the 12 new tests get observed RED (`quack observe-red` each — their selftests are unregistered, so each runs and fails honestly at its current hash).

## Suite observed RED  → i10-m6-tests-red-observed

All 12 tests red-observed 2026-07-04 before any implementation. Mid-walk finding, owner-adjudicated: `observe-red` recorded without running (honor system) and `tests-red` was unscoped — both fixed as same-iteration defect fixes; one fabricated event was surgically removed from the ledger with owner authorization (see the defect note in the inbox).

## Build  → i10-m6-build

All 12 steps realized, each blessed after its selftest went green and the battery stayed clean:

1. **verdict cache** — [i10_build.go](../../../product/engine-go/i10_build.go), consulted from the tests-pass battery and gateState; spike-proven key discipline.
2. **verify feedback** — announce-once on miss, per-test >1s naming, silent when cached. Seen live every rebuild.
3. **status fast** — timed selftest with a recursion guard; measured live: **0.21s** (from ~7s).
4. **why derived** — rule + delta named; probed live on `i9-m6-tests-red-observed` (names the two restated tests).
5. **notes list** — `quack notes [--all]`; listed the live inbox correctly.
6. **call log** — redacted JSONL per dispatch through the `quackExit` funnel; retro aggregates then deletes ([review.md](../../../product/quackitect/method/prompts/review.md) step 6).
7. **mint fixes** — `sugarAddresses` dedupe + `--rationale`.
8. **ratchet stamp** — committed build-time stamp, forward-only; `engine-stamp.txt` now rides the vendored source.
9. **scaffold modern** — `tools/vendor/` world, `spec/project.toml` marker, pointer-chain entries, global-bin launcher; driveFromInside roundtrip green; legacy stub lane kept and green.
10. **pager merge** — combined hand-off when the last killer subtask and its gate ripen together; engage.md ADJUDICATE names it.
11. **user wording** — full sweep; allowlist = exactly the frozen recorded tokens; the two CLI display strings asserted dead.
12. **cleanup** — AGENTS.md list, usage text, dependencies.md match the surface.

Rider (owner-directed at the M6 gate): the report wears a fully-done iteration's count green (`.frac.ok`).

## Detailed design complete  → i10-m6-detailed-design-complete

Derived (`coverage:designs-realized`) computes green: every one of the 12 requirements carries an inline design region with realized code. `quack lint`: coverage clean, no holes.

## Internal quality ok  → i10-m6-internal-quality-ok

- Zero-dep held: stdlib only, no new modules.
- Every new mechanism has a selftest seam (path overrides, feedback writer, memo isolation) instead of global side effects in tests.
- Voice on new output: notes list and pager wording follow the list rules; call-log lines are machine records.
- One process-hygiene lesson caught and fixed in-walk: selftest teardown must restore ALL shared state (the callArgs leak).

## Verification green  → i10-m6-verification-green

Derived (`coverage:tests-pass`) computes green: all 12 new selftests pass, the full battery (82 checks) has no FAIL, across every iteration in scope.

## Implementation risks acceptable  → i10-m6-impl-risks-acceptable

- **Cache staleness**: closed by construction (input hash + binary self-hash) and by spike + selftest.
- **Backward ratchet**: closed; the committed stamp survives clones. Residual: wall-clock ordering — accepted at M5 with the chain-stamp rejection recorded.
- **Ledger honesty**: observe-red now refuses a passing test; the fabrication class is structurally closed.
- **Known open debt (visible red, by design)**: i9's `tests-red-observed` stays red on the two restated tests until the shipped-test-edit rule (geronticide list).

## Milestone review  → i10-m6-gate

**Round 1 — verify.** Every planned step has realized code with a design region, a registered selftest that was observed RED before the build and passes now. The derived checks (designs-realized, tests-pass, tests-red) compute green for i10. Lint: coverage clean, EARS clean.

**Round 2 — validate.** The build delivers exactly the M1 scope: all ten Ch1 criteria are now mechanically checkable and pass where measurable today (status 0.21s ≤ 1s; why names rules; notes visible; log redacted; mint clean; scaffold modern; ratchet forward-only; pager merges; wording swept). Two criteria (merged pager in a live walk, retro log deletion) get their end-to-end demonstration at M7.

**Round 3 — red-team.** Strongest objections: (a) the verdict cache could mask a flaky test — answered: verdicts re-run per build, and flakiness is a test defect the RED discipline surfaces; (b) the wording sweep could have broken attest word-indexing — checked: rule bodies carry no swept words except rule 3/5, and the challenge derives from live text, so renewals stay consistent; (c) two same-iteration defect fixes (observe-red, tests-red scope) rode in without composed requirements — recorded honestly here and in the defect note; the geronticide/next compose owns their trace nodes if the adjudicator wants them backfilled.

**Verdict: PASS** — proceed to bless. No reopened checks.
