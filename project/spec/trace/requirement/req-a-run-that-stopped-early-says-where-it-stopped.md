---
minted_in: i37-training-iterations-a-disposable-iterati
id: req-a-run-that-stopped-early-says-where-it-stopped
type: "[[requirement]]"
statement: "The engine shall record on every benchmark report the stop point the run was given and the state the run actually ended in."
kind: quality
verify_method: test
fitness_candidate: false
breaks_if_removed: "A shortened run is silently compared against a full one, and the delta measures the stop point rather than the machine."
breaks_how_badly: crippling
refines:
  - uc-measure-a-machine-change-against-a-finished-iteration
source_refs:
  - uc-measure-a-machine-change-against-a-finished-iteration ext 1c
  - uc-measure-a-machine-change-against-a-finished-iteration ext 5a
  - owner ruling 2026-08-19, the stop point is configurable with the whole walk as default
priority: must
---

## Scenario

- source: a benchmark run
- stimulus: the run ends, at its stop point or before it
- artifact: the benchmark report
- environment: a run given a named gate, or none
- response: the report names the requested stop point and the state reached
- response measure: reports omitting either = 0

## A failed run is a measurement too

Extension 5a says a run that cannot continue records the state it stopped in.
That is not an error path being tidy. Where the machine stops an agent is
exactly what this iteration exists to measure.
