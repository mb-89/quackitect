---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-split-a-submachine-where-the-spread-is-wide
type: "[[option]]"
cluster: the-sizing
question: what unit gets a driver named
statement: "where the difficulties inside a submachine span more than one rung, the submachine is split so each part is walked by a worker sized to its own hardest item, and the split is decided from the recorded spread rather than by hand"
found_by: contradiction
source: "TRIZ principle 1, segmentation, the classical answer where a whole must satisfy its most demanding part; reached from the reliability-against-loss-of-time contradiction in the vendored matrix"
---

## Mechanism

THE MAXIMUM IS SAFE AND THE GROUP IS WHAT MAKES IT EXPENSIVE. Ten items whose
hardest is C4 cost ten C4 walks only because they are one group. Split the group
and the arithmetic changes without the safety rule changing at all.

WHY IT BREAKS THE CONTRADICTION RATHER THAN TRADING IT: no item is ever walked
by a worker below its own rung, so correctness is untouched. What moves is the
BOUNDARY the maximum is taken over, which nothing about the safety argument
depends on.

THE SPLIT IS DECIDED FROM THE SPREAD, which is the thing the requirement already
demands be kept and reported. That is what makes this reachable rather than
theoretical — the data it needs is data the design was already going to record.

WHAT IT COSTS AND WHY IT IS AN OPTION RATHER THAN THE PLAN: a submachine is part
of the drawing, and splitting one edits `depends_on`, which moves a step's shape
and reopens standing claims. This iteration has a register entry about exactly
that cascade. THE COST IS REAL AND IT IS PAID ONCE PER SPLIT, against a saving
paid on every future walk.

IT ALSO HAS A CHEAP HALF THAT COSTS NOTHING: report the spread and let a person
decide where to split, rather than splitting automatically. That form needs no
drawing change at all.
