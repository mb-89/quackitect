---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-a-run-that-cannot-establish-its-guard-never-binds
type: "[[raid]]"
kind: decision
statement: "The ancestry test is exercised before a run binds. A run that cannot run its own guard refuses to start rather than starting and refusing per request."
owner: the owner
trigger: "the first run that refuses to bind for a reason nobody expected, or any change to how the guard is exercised"
status: decided
impact: "A run that starts and then refuses everything produces a report full of refusals that reads as a machine failure. A run that never starts produces one refusal naming one cause, at the earliest point the cause is knowable."
breaks_how_badly: crippling
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - "i37 evaluate-set: the refusing run scores 5 on req-fallen-condition-named against the thin run's 2"
  - "heuristic: the default should be the safe thing"
  - "raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask"
---

## What it settles

Where the safe default sits. At the binding, not at the request.

## What it does not remove

The ceiling can still error between bind and stop. That is bounded per run by
the forbidden request, which proves the guard was watching at the moment the
numbers were taken.
