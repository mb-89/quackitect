---
form: observe-red
by: agent
signed_off: 2026-08-19T16:17:08.187Z
authors: agent
files: null
---

# Evidence form / observe-red

## current_situation

Seven test-specs were minted at author-tests for this iteration's seven requirements. Every one carries method `test`, so every one is the engine's to run rather than a person's to observe.

WHAT THE CHECKLIST HOLDS is therefore not this record's own specs. It is the seventeen standing non-test specs from earlier iterations, where no run can show a red and a person has to look.

EVERY ONE IS CHECKED ON THE SAME GROUND, and it is the second claim this state sanctions: red is impossible for a spec covering standing behaviour, and that is accepted. Nothing in this record has been built yet. observe-red sits before the first line of build code, so every standing procedure behaves exactly as it shipped.

THREE CARRY A WATCH, named here because the checkbox cannot carry it.

- tsp-first-run touches the cage, which chunk cage-inventory-check moves.
- tsp-the-arrival-in-one-act touches the arrival, which gains if-arrival-to-walk-engine on its design spec and may be touched by harness-identification.
- tsp-unattended-start touches the entrypoint, which will read the harness registry.

Each is re-observed after its chunk lands, not before.

WHAT THE SEVEN SPECS NAME. Existing battery files: boot.test.ts, stophook.test.ts, ptyend.test.ts, cage.test.ts, answer-bound.test.ts, bucket.test.ts, pool-mint.test.ts and skills.test.ts. Each spec's Steps section states which of its claims stand green today and which are red, rather than claiming the whole file.

THE TREE IS RED FOR AN UNRELATED REASON. A battery run on 2026-08-19 returned 94 failures out of 1405, almost all carrying one message: `spill read failed`. The cause is a module-level `spillDir` in bound.ts that every server build overwrites, so parallel test servers at different roots read each other's spill. It is chunk `spill-is-per-server`, and it is not evidence about these seven specs.

## red_observed

- [x] tsp-a-slow-signal-keeps-the-wait
- [x] tsp-autonomy-tiers
- [x] tsp-bound-surface
- [x] tsp-coupling-disposition
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-one-door-into-the-pool
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [x] tsp-the-arrival-in-one-act
- [x] tsp-the-cited-refs-resolve
- [x] tsp-tour-run
- [x] tsp-two-machines
- [x] tsp-unattended-start

## follow_up

THE RED THAT MATTERS IS NOT YET WRITTEN AS CASES. Each of the seven specs states its new claims in prose under Steps, and marks which are red today. Turning those sentences into failing cases is the first thing each build chunk does, before the code that makes them pass.

THE SPILL RED MUST CLEAR FIRST. While 94 cases fail on a shared spill directory, no run over these files can be read honestly: a red could be the new check or the spill. Chunk `spill-is-per-server` therefore runs early, and the drawing gives it no dependency so nothing holds it up.

ONE SPEC CARRIES AN OPEN QUESTION. tsp-repeated-failure-shape-becomes-durable-work assumes that twice is recurrence, because its requirement carries no measure. If the measure lands and says otherwise, that spec and its chunk both move.

## anything_else

