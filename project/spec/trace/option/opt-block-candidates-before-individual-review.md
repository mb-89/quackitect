---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-block-candidates-before-individual-review
type: "[[option]]"
statement: group near-duplicate candidates into blocks before disposition, so a person judges one block instead of every member individually
cluster: cluster-the-disposition
found_by: contradiction
source: "TRIZ separation IN LEVEL, dissolving “rank widely to avoid missing a real coupling” vs “keep the list short enough for a person to review” — generalises “blocking” from Fellegi & Sunter-descended record linkage practice (en.wikipedia.org/wiki/Record_linkage, § Blocking)"
---

## Mechanism

STEP 1, THE CONTRADICTION IN ONE LINE. Widening rank-candidate-couplings to
avoid missing a real coupling makes record-a-coupling-disposition's queue
too long for a person to work through.

STEP 2, STANDARD PARAMETERS. Improving is 26, Quantity of substance (more
candidates surfaced, better recall). Degrading is 25, Loss of Time (a
person's review time grows with the count).

STEP 3, THE SEPARATIONS. IN LEVEL: the demand for completeness applies at
the PART level (no real coupling missed), while the demand for a short
queue applies at the WHOLE level (what a person looks at). Splitting the
levels dissolves the fight: rank-candidate-couplings stays wide and misses
nothing, but near-duplicate or clearly-related candidates are pre-grouped
into one block before record-a-coupling-disposition ever shows them, so the
person disposes of one block rather than each member.

Cost: a blocking key or similarity threshold that itself needs tuning, and
a wrong block boundary can hide a real coupling inside a block disposed of
as a whole.
