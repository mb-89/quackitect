---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: raid-risk-the-unreachable-marker-becomes-the-cheap-answer
type: "[[raid]]"
kind: risk
statement: "Marking a reference unreachable becomes the default answer instead of repairing it, so the sweep goes green while the ledger stays as unfollowable as before."
owner: the maintainer of the corpus
trigger: the first count of markers against repairs, at this iteration's validation gate
status: open
impact: "A green lint over a marked corpus reads as hygiene achieved. The reader who follows a reference still finds nothing, and the marker makes the failure look deliberate."
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - i44-the-corpus-resolves-duplicate-headings-a
weighs_with: none
weighs_against: none
---

## Where it comes from

THIS IS THE ITERATION'S OWN NAMED GOAL CONFLICT, carried out of draft-vision.
Completeness pulls against the machine staying usable.

THE RULING WAS: resolution wins where the primary is reachable, and a marker
wins where it is not. That ruling is only as good as the judgment of what
counts as reachable, and the cheap judgment is always "not reachable".

## Why it is graded corrosive

IT DOES NOT BREAK ANYTHING AT ONCE. It removes the pressure that would have
fixed the references, and every later reader inherits a ledger that says its
own gaps are intentional.

## What is being done about it

COUNT BOTH SIDES AT THE VALIDATION GATE. Repairs and markers are reported as
two numbers, not one verdict.

THE PLAN ALREADY NAMES A SPLIT to check against: about 35 marked as primary
not reachable, 11 repaired by fixing the prefix. A run that lands far more
markers than that has taken the cheap answer.

## What would close it

The two counts at the validation gate, within reach of the plan's split. A
wide gap re-opens the ruling instead of closing this.
