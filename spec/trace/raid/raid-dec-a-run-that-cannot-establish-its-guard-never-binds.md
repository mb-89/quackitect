---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-a-run-that-cannot-establish-its-guard-never-binds
type: "[[raid]]"
kind: decision
statement: The ancestry test is exercised before a run binds. A run that cannot run its own guard refuses to start rather than starting and refusing per request.
owner: the owner
trigger: the first run that refuses to bind for a reason nobody expected, or any change to how the guard is exercised
status: decided
impact: A run that starts and then refuses everything produces a report full of refusals that reads as a machine failure. A run that never starts produces one refusal naming one cause, at the earliest point the cause is knowable.
breaks_how_badly: crippling
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
  - "i37 evaluate-set: the refusing run scores 5 on req-fallen-condition-named against the thin run's 2"
  - "heuristic: the default should be the safe thing"
  - raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask
---

## What it settles

Where the safe default sits. At the binding, not at the request.

## What it does not remove

The ceiling can still error between bind and stop. That is bounded per run by
the forbidden request, which proves the guard was watching at the moment the
numbers were taken.

## Rejected options

- REFUSE PER REQUEST ONLY. Rejected: a run that starts and then refuses everything produces a report full of refusals that reads as a machine failure rather than as one cause.
- WARN AND CONTINUE. Rejected outright: a guard going quiet looks exactly like a guard passing, and this is the failure the whole iteration exists to catch.
- TEST THE GUARD IN THE SUITE ONLY. Rejected: a test written months earlier says nothing about whether the guard was watching when these numbers were taken.

## Consequences

- Binding is an act that can fail, and its failure is one typed refusal naming one cause.
- Every run carries one deliberately forbidden request. A run whose forbidden request SUCCEEDED is discarded rather than reported.
- A report without its guard-proof field is not a result.
