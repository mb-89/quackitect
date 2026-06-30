# M6 — Build plan (i0004_vendoring_out)

Build decomposed into resumable steps under `i4-m6-build` (dependency order):

1. **quack-build** — `quack build` = compile + re-baseline golden atomically. ✅ DONE (selftest:build).
2. **grandfather-designs** — relink shipped code markers to the new i4 req ids (closes 4 design-holes).
3. **workspace-base** — `--base/-C` selector + centralize state-path resolution; default cwd walk-up unchanged. (the headline; riskiest)
4. **no-trace-gate** — invariant + selftest:no-trace-gate.
5. **tests-pass-eval** — unify tests-pass with the gateState evaluator + selftest:tests-pass-eval.
6. **report-verdict** — DONE → verdict/evidence link + selftest:report-verdict.
7. **report-nesting** — 3rd-level build/test nesting + selftest:report-nesting.
8. **machinery** — selftest:workspace/:brand/:claude-vendor wired; e2e machinery test.

Global verification (`tests-pass`) stays red until steps 2–8 land their selftests — that is why i3's
M6–M8 gates show SUSPECT mid-build (V&V is global; the whole suite re-checks).
