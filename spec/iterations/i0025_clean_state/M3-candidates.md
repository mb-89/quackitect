# M3 — Candidate architectures (i0025_clean_state)

## alternatives elaborated -> i25-m3-2-alternatives-elaborated

A debt drain has one genuinely architectural choice: WHERE the fail-at-end battery reports.

- `cand-fail-at-end-collect`: the battery collects failures into one end report inside the existing runner loop. Small, local, no new machinery.
- `cand-fail-at-end-journal`: the battery journals each verdict to a file as it runs; the report reads the journal. Survives crashes mid-battery, costs a new artifact and its lifecycle.

Every other step is a single-shape fix with no viable rival; their behavioral options were lettered on the M1 risk cards.

## criteria weighted -> i25-m3-criteria-weighted-derived

- simplicity, no new artifacts: 0.4
- crash survivability of partial results: 0.25
- report fidelity (every failure, once): 0.35

## feasibility rough-checked -> i25-m3-feasibility-rough-checked

Both candidates are afternoon-sized inside RunSelftestCLI and the verify path. The verdict cache ALREADY journals per-test results, which weakens the journal candidate's one advantage: partial results already survive via the cache.

## Review Verdict -> i25-m3-gate

Verify: both candidates elaborated with honest trade-offs. Validate: the axis is the only real one in scope. Red-team: the journal candidate's advantage is pre-empted by the existing verdict cache - stated above, not hidden. Verdict: pass.
