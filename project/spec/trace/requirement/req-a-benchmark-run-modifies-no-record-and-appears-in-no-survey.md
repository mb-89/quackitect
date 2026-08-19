---
minted_in: i37-training-iterations-a-disposable-iterati
id: req-a-benchmark-run-modifies-no-record-and-appears-in-no-survey
type: "[[requirement]]"
statement: "While a benchmark run is bound, the engine shall change zero bytes of the iteration it re-walks, mint zero records, and add zero entries to the survey's counts."
kind: constraint
verify_method: inspection
fitness_candidate: false
breaks_if_removed: "A measuring instrument that alters what it measures corrupts the archive it depends on, and the pool stops being a record of what the project did."
breaks_how_badly: fatal
refines:
  - uc-measure-a-machine-change-against-a-finished-iteration
source_refs:
  - uc-measure-a-machine-change-against-a-finished-iteration guarantee
  - raid-dec-an-archived-iteration-is-the-benchmark-and-nothing-is-authored
  - owner ruling 2026-08-19, nothing about the run is committed except the report
priority: must
---

## Scenario

- source: a benchmark run at any stage
- stimulus: the run seeds, walks, ends or fails
- artifact: the re-walked iteration's folder, the iterations container and the survey
- environment: a throwaway tree, discarded when the run ends
- response: the record is untouched, no record is minted, the survey is unchanged
- response measure: bytes changed in the re-walked record = 0; iteration ids consumed = 0; survey count delta = 0

## Verified by inspection rather than by test

The demand is the ABSENCE of a write, and a test can show one path leaving the
record alone but never that nothing anywhere touches it. i34's
`req-every-record-path-resolves-in-one-tree` was graded the same way for the
same reason.
