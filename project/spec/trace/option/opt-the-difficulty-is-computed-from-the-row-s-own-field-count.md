---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-difficulty-is-computed-from-the-row-s-own-field-count
type: "[[option]]"
cluster: the-sizing
question: how a step's difficulty is arrived at
statement: "a state's difficulty at a change size is computed from what the rigor matrix already makes it do at that size — the fields it asks for and the method it names — instead of being declared alongside them"
found_by: transform
source: "SCAMPER Combine applied to cluster-the-sizing — merge the new declaration into the row that already exists"
---

## Mechanism

THE ROW ALREADY SAYS HOW HARD IT IS, in the only currency that matters. A cell
carries the rigor, the method and the fields owed at that change size, and the
omit lists mean a minor cell asks for strictly fewer of them than a major one.
Measured at write-requirements: minor asks one field, major asks four, and the
minor list is a subset of the major list.

SO THE NUMBER IS A FUNCTION, NOT A FACT. Difficulty at a size is read off the
cell — field count, whether the method is a judgement method or a stamp, whether
the cell is omitted at all. Nobody types a difficulty anywhere.

THIS IS THE ONE OPTION THAT CANNOT DRIFT. raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so
describes a declared number creeping up over iterations with no one noticing,
because a declaration is cheap to raise and nothing contradicts it. A derived
number has nothing to raise. Raising the difficulty means adding fields, which
is a visible change to what the state does.

IT IS NOT SCORING AT DISPATCH. opt-score-the-work-at-dispatch-instead-of-declaring-it
looks at the actual work in front of the walker at run time and is therefore
non-deterministic and unauditable before the fact. This computes at compile time
from a static row, gives the same answer every time, and can be printed for all
fifty-three rows before anything runs.

WHAT IT COSTS: the formula is a design decision nobody has made, and a bad
formula is worse than a declaration because it is wrong everywhere at once.
It also cannot express a state that is short but genuinely hard — one field, deep
judgement — which is exactly the case opt-difficulty-splits-into-judgement-and-reading
is about.
