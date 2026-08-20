---
minted_in: i37-training-iterations-a-disposable-iterati
id: req-the-benchmark-history-is-unreadable-while-a-run-is-bound
type: "[[requirement]]"
statement: "While a benchmark run is bound, every lane verb shall return zero results from the benchmark reports folder, and outside a bound run it shall return them normally."
kind: quality
verify_method: test
fitness_candidate: true
breaks_if_removed: "The agent reads the previous run's numbers and works toward them, so the instrument measures its own last reading."
breaks_how_badly: corrosive
refines:
  - uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future
source_refs:
  - uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future ext 6a
  - raid-iss-the-reading-verb-consults-no-exclusion-list-at-all
  - wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-
weighs_with: none
weighs_against: none
priority: must
---

## Scenario

- source: the agent walking a bound benchmark run
- stimulus: any read, search, glob or list touching the reports folder
- artifact: the lane's path-visibility rule
- environment: a bound run, and separately a normal walk
- response: concealed for the length of the binding, served everywhere else
- response measure: report bytes reaching a bound run = 0; report reads refused outside a bound run = 0

## Why one rule and not one per verb

MEASURED 2026-08-19. Three lists decide what a lane verb may see today.
`paths.ts` `EXCLUDED_DIRS` is consulted by list and glob only. `search.ts`
carries its own two entries. `se_file_read` consults nothing — a lane read of
`.se/reading.md` returned the file and its hash.

A concealment written once per verb will disagree with itself the same way,
and a concealment that leaks through one verb conceals nothing.
