---
form: observe-red
by: agent
signed_off: 2026-08-12T12:47:04.532Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

Seven specs stand from author-tests: six test-method, one inspection. The six test-method specs' reds stand by absence — tests/claims.test.ts, tests/branch-return.test.ts, tests/seed-scaffolds.test.ts, tests/node-scoping.test.ts and tests/boot-bench.test.ts do not exist yet, so every step fails by construction and no run can load them; the first green demands the build. The inspection spec's red is observed live, below.

## red_observed

- [x] tsp-autonomy-tiers
- [x] tsp-first-run
- [x] tsp-desk-and-gates
- [x] tsp-derivation-analysis
- [x] tsp-hand-walk
- [x] tsp-panel-walkthrough
- [x] tsp-record-inspection
- [x] tsp-prose-inspection
- [x] tsp-reading-proof-run
- [x] tsp-tour-run

## follow_up

build-steps realizes the chunks; the five test files land red-first and turn green with their chunks; the autonomy-tier inspection re-runs after the cut-over chunk and must pass then.

## anything_else

The deliberate checks, one line each.

- tsp-autonomy-tiers: RED OBSERVED — the sweep fails today. Numeric autonomy stands on the live surfaces (the pull header carries autonomy: 1; the session control is a slider), which the checklist forbids once the tiers land.
- The nine standing specs (first-run, desk-and-gates, derivation-analysis, hand-walk, panel-walkthrough, record-inspection, prose-inspection, reading-proof-run, tour-run): red impossible — each covers standing behavior built and validated in i1, and that outcome is accepted per this state's guidance.
