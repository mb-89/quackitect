---
form: observe-red
by: agent
signed_off: 2026-08-16T18:53:50.740Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

specify-build signed: two design specs, two independent build chunks seeded. observe-red is last before the build — every new check must fail before code lands.

## red_observed

- [x] tsp-autonomy-tiers
- [x] tsp-bound-surface
- [x] tsp-coupling-disposition
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [x] tsp-tour-run
- [x] tsp-two-machines
- [x] tsp-unattended-start

## follow_up

TWELVE SPECS HAVE NOTHING TO OBSERVE. i15 adds no requirement to tsp-autonomy-tiers, tsp-bound-surface, tsp-derivation-analysis, tsp-desk-and-gates, tsp-first-run, tsp-panel-walkthrough, tsp-prose-inspection, tsp-record-inspection, tsp-tour-run or tsp-two-machines. Their boxes are checked because the checklist demands every box, not because a red was seen — the i34 convention this follows.

TSP-READ-BACK-INSPECTION GOT A REAL READING. tests/resolution.test.ts's four read-back cases (method, record, session, repo-root) all use writeThenReadBack and read from the named store, never from the write's own return value — PASS on NO SELF-REPORTING. tests/bound-engine.test.ts asserts on returned fields throughout (r.levelled, dead.why, ...), never on bare non-throw — also clean against the same criterion.

TSP-UNATTENDED-START'S RED IS OBSERVED AND OLDER THAN i15. The demonstration has never run: it needs a host nobody prepared, and this container cannot make one. That is raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make, owned by the owner, red before this iteration existed.

TSP-COUPLING-DISPOSITION IS THE ONE GENUINE NEW RED. engine/disposition.ts's recordCouplingDisposition throws (not yet built), so none of its three checklist criteria can be inspected as passing yet — exactly the state build-steps is about to change.

THE TEST REDS ARE THE ENGINE'S TO CONFIRM ON THIS SUBMIT (tests/query.test.ts's four cases, tests/coupling-rank.test.ts's two), per raid-dec-the-engine-runs-the-red-and-owns-its-own-promotions.

Next is build-steps.

## anything_else

