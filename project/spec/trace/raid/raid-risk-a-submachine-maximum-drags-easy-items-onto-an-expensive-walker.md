---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker
type: "[[raid]]"
kind: risk
statement: "A submachine takes the maximum complexity over its items and walks every one of them on a walker sized for the hardest, so a single hard item multiplies its own cost by the number of easy items beside it."
owner: the owner
trigger: "the first submachine walked under a rated matrix, and any submachine whose items span more than one rung"
status: open
impact: "The overspend scales with the width of the fan rather than with the work. A ten-chunk build whose hardest chunk is C4 and whose other nine are C1 costs ten C4 walks, and nothing in the record says the nine were overpaid."
breaks_how_badly: corrosive
how_likely: expected
probe: "NOT YET MEASURABLE, and that is the honest state of it — no submachine has been walked under a rated matrix because no matrix is rated. THE ARITHMETIC IS NOT IN DOUBT: the rule is the maximum over items and one walker walks all of them, so the multiplier is the item count whenever the items differ. WHAT IS UNKNOWN is how often they differ and by how much, and the per-item values this iteration produces are exactly the data that answers it. Re-read this entry once the ratings land, with the item spread per submachine beside it."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so
weighs_against: none
---

## Why the rule is still right

ONE WALKER PER SUBMACHINE IS A CORRECTNESS CHOICE. Splitting a fan across
walkers of different strengths means the weak one meets the hard item, and the
failure is silent because a weak answer to a hard question looks like an
answer.

THE MAXIMUM IS THE ONLY SAFE REDUCTION. Anything lower is a bet that the
hardest item will not be reached.

SO THIS ENTRY IS NOT AN ARGUMENT AGAINST THE RULE. It is the cost of the rule,
written down where somebody will read it again.

## What makes it worse than ordinary over-provisioning

THE DRIFT RISK BESIDE THIS ONE IS ABOUT ONE STATE COSTING TOO MUCH. This one
multiplies whatever that state costs by the width of the fan, so the two
compound: a rung that drifted one notch high on a hard item drags the whole
submachine with it.

AND IT IS INVISIBLE FROM THE OUTSIDE. The walk reports one walker and one
submachine. Nothing in the record says nine of ten items could have been walked
by something cheaper.

## What would make it not happen

- THE PER-ITEM VALUES ARE SURFACED, not just consumed. If the submachine's
  report says what the spread was, the expensive fans name themselves and the
  question becomes answerable.
- OR THE SUBMACHINE IS SPLIT where the spread is wide, so the hard item is its
  own fan and the easy ones are another. That is a drawing change and it is
  not M0's or M1's to make.
