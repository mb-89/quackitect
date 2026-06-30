# M5 — Prove the riskiest unknowns (i0004_vendoring_out)

## Riskiest validated  → i4-m5-riskiest-validated  *(killer)*
**R2 — empty-content machinery at max rigor — VALIDATED.** Spiked in a real vendored vehicle (duckpond):
- With an empty trace, `lint` reports `coverage: clean (no holes)` — every coverage rule (req-traced, req-has-test, designs-realized, tests-pass) is vacuously green on zero content.
- A derived coverage subtask (`class: executed, verify: coverage:req-traced`) on an empty trace resolves to **DONE** automatically.
- A review milestone gate stays **OPEN/blessable** — passable with a machinery-test rationale.
So the machinery test (M7) is sound: an empty workspace at systematic rigor walks all milestones — derived gates auto-pass, review gates blessed as machinery exercises. Spike discarded.

**R1 — state-path centralization — feasible (M3 feasibility).** Touch points are `findRoot()` + the package state vars; centralizing them behind a resolved workspace root + a `--base/-C` override is localized and keeps the default (cwd walk-up) identical.

## Design buildable  → i4-m5-design-buildable
The base selector decomposes into small build steps (seeded under i4-m6-build): quack build, workspace-base, grandfather-design relink, no-trace-gate invariant, tests-pass unify, report verdict-link, report nesting, machinery selftest.

## Spike recorded  → i4-m5-spike-recorded
Recorded here; throwaway artifacts discarded (duckpond v1_machinery removed).
