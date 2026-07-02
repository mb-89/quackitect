# M6 — Build & verify (i0007_tdd_implementation)

## Build planned  → i7-m6-build-planned  *(killer)*
Decomposed into 7 small, resumable steps, children of `i7-m6-build`, in dependency order — **fixes first, then TDD**. Each is worth resuming on its own and carries one coherent concern + its design markers.

1. **bs-evidence-honesty** (#8, prerequisite) — root-cause the `selftestWorkspace` `ENGINE==''` vacuous-true guard + the `runExecuted` hash-cache so a live-red selftest cannot show DONE. `tests-red` rests on honest evidence, so this lands first. → req-evidence-honesty
2. **bs-verdict-link** (#9) — working verdict link on every DONE check; strengthen `selftestReportVerdict`. → req-verdict-link (i0004)
3. **bs-nesting** (#6) — build-parent / testing-parent nesting (3rd level); strengthen `selftestReportNesting`. → req-build-test-nesting
4. **bs-tests-red** — `red-observed` event + `attestLoad` loader + `coverage.go` `case "tests-red"` + an `observe-red` writer op (per the M5 spike). → req-tdd-sequence
5. **bs-shared-fragment** — `method/rigor/_shared/implementation.md` + rewire lean L4 / systematic M6 to import it. → req-shared-impl-fragment
6. **bs-role-seam** — `method/roles/` (README + inline default bindings) + doc-tests guidance + compose/engage wiring + iteration `roles:` block. → req-role-seam, req-doc-tests
7. **bs-research-ref** (#2) — research-as-pluggable reference (Claude Code: deep-research; else inline), never vendored. → req-research-pluggable

Rollup `i7-m6-build` depends on the last step; then `designs-realized` (coverage), `internal-quality-ok`, `verification-green` (coverage:tests-pass), `impl-risks-acceptable`.

## Build results  → i7-m6-build · i7-m6-detailed-design-complete · i7-m6-verification-green
All 7 steps realized, in order. **9 design markers** added/extended:
- `go-evidence-honesty` (coverage.go) → req-evidence-honesty · `go-verdict-link` (report.go) → req-verdict-link
- `go-trace-nesting` (report.go, extended) → +req-build-test-nesting · `go-tests-red` (ops.go) → req-tdd-sequence
- `method-shared-implementation` → req-shared-impl-fragment · `method-role-seam` → req-role-seam
- `method-doc-tests` → req-doc-tests · `method-research-ref` → req-research-pluggable
- new engine surface: `observe-red` op, `red-observed` attestation, `coverage:tests-red` rule
- new/strengthened selftests: `evidence-honesty`, `tests-red`, `report-verdict` (asserts `d.verdict` fallback), `report-nesting` (real nesting test)

`quack lint` → **coverage clean (no holes)**; `coverage:designs-realized` and `coverage:tests-pass` both **DONE** (all tests green across every iteration); `quack selftest` → **0 FAIL**.

## Internal quality ok  → i7-m6-internal-quality-ok
Minimal engine footprint (one new coverage rule + a reused attestation action, no new subsystem — as the M5 spike promised). Hermetic selftests (no real-ledger pollution). Two requirements were honestly **narrowed during build** on evidence: `req-evidence-honesty` (the #8 "selftest masking" premise didn't reproduce → retargeted to the hash-keyed cache + no-vacuous-pass invariant) and `req-build-test-nesting` (the "testing parent" clause superseded by the trace/task separation).

## Implementation risks acceptable  → i7-m6-impl-risks-acceptable
The one real risk (deterministic RED observation) was spiked at M5 and built exactly as designed. The descoped cross-harness cluster (contract-render, commit gate) is parked in the backlog. No open risks block validation.
