---
minted_in: i37-training-iterations-a-disposable-iterati
id: req-a-ceiling-that-cannot-prove-ancestry-refuses
type: "[[requirement]]"
statement: "Where the lane cannot establish that a requested commit is an ancestor of the bound run's rewind point, it shall refuse rather than serve."
kind: quality
verify_method: test
fitness_candidate: false
breaks_if_removed: "A ceiling that goes quiet looks exactly like a ceiling that passed, so the failure is silent and the report is confidently wrong."
breaks_how_badly: fatal
refines:
  - uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future
source_refs:
  - uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future ext 4a
  - raid-risk-the-git-ceiling-fails-open-and-a-run-reads-the-answers
  - SE-C-143, which fails closed on the same reasoning
priority: must
---

## Scenario

- source: any lane verb reaching history while a run is bound
- stimulus: an ancestry check that errors, times out, or returns nothing
- artifact: the ceiling check
- environment: a bound benchmark run
- response: the request is refused and the refusal names the ceiling and the rewind commit
- response measure: requests served on an inconclusive ancestry check = 0

## The precedent

SE-C-143 already fails closed for the same reason: where the identity file
exists but cannot be read, the guard cannot prove the target is safe and
refuses. Its own words are that a guard going quiet looks exactly like a guard
passing.
