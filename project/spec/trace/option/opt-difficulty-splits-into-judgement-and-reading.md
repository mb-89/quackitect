---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-difficulty-splits-into-judgement-and-reading
type: "[[option]]"
cluster: the-sizing
question: where the difficulty number comes from
statement: "difficulty is two numbers rather than one — how hard the judgement is and how much has to be read to make it — because a step can be extreme in either without being hard in the other"
found_by: transform
source: "SIT Division applied to cluster-the-sizing — split the difficulty and rearrange what depends on each part"
---

## Mechanism

ONE SCALAR CONFLATES TWO INDEPENDENT THINGS, and the corpus has both extremes.
A finder state reads one method card and asks for deep original judgement: high
judgement, low reading. A partition state reads forty-nine function nodes and
their flows to render a table: high reading, mechanical judgement. Collapsing
both to `major` says they need the same hand, and there is no reason to believe
that.

SPLIT THE NUMBER AND THE MAPPING FOLLOWS. Reading maps to how much context the
hand must hold; judgement maps to how strong it must reason. A cheap model with
room can do the partition. An expensive model with a small window cannot, and is
wasted on it anyway.

THE REDUCTION CHANGES SHAPE TOO. reduce-a-milestone-to-one-difficulty currently
takes a maximum over one axis. Over two it takes a maximum per axis, which is not
the same as the maximum of the pair — a milestone containing one heavy-reading
step and one heavy-judgement step needs both, and one scalar would have called it
uniformly hard and been right for the wrong reason.

IT IS THE COUNTER-CASE TO THE FIELD-COUNT DERIVATION.
opt-the-difficulty-is-computed-from-the-row-s-own-field-count reads difficulty
off how much the row asks for, which is a reading measure wearing a judgement
label. Under a split, that derivation is a good formula for one axis and silent
about the other — so the two options compose rather than compete.

WHAT IT COSTS: every row declares or derives twice as much, the mapping becomes
two-dimensional, and a two-dimensional mapping onto a one-dimensional ladder
needs a rule for the corner where the axes disagree. raid-asm-the-model-ladder-is-a-total-order
was already shaky; this makes the disagreement explicit rather than creating it.
