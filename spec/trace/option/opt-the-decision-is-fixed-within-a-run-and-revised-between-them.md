---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-decision-is-fixed-within-a-run-and-revised-between-them
type: "[[option]]"
cluster: the-sizing
question: when the decision may change
statement: "the mapping is frozen for the whole of a record's walk and revised only between walks, so a finished record replays exactly while the table still learns from what the finished records showed"
found_by: contradiction
source: "TRIZ principle 13, the other way round, from the reliability-against-adaptability cell of the contradiction matrix vendored at deliverable/vendor/triz/triz-matrix.json — instead of making the decision adapt, make the thing being adapted sit still while the walk runs"
---

## Mechanism

SEPARATION IN TIME, WHICH IS WHAT BREAKS THE CONTRADICTION RATHER THAN TRADING
IT. Determinism and fitness are only opposed if they must hold at the same
timescale. Pin the mapping at the start of a record and it is fixed for every
decision that record makes; revise it afterwards and the next record gets a
better one.

WHAT A RECORD WOULD CARRY: the mapping it was walked under, pinned the way a
change-size column is pinned. Two runs of the same record under the same pin
produce the same drivers, so a replay is exact.

WHAT MAKES IT MORE THAN A PIN: the revision between runs is where an error
signal could finally attach. Nothing today can say a rung was wrong; a table
that is allowed to move between records is a table something could move.

THE COST IS A NEW PINNED THING, and this iteration already knows what pinned
things cost — a pin that moves reopens claims. IT MUST NOT ENTER THE DEMAND
LEDGER, for exactly the reason the complexity value must not, and that
constraint is already written as a requirement.

WHY IT IS NOT THE ROUTER OPTION IN DISGUISE. A router adapts within the run and
cannot be replayed. This adapts between runs and every run replays.
