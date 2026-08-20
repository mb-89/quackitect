---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: cand-the-seed-made-total
name: "The seed, made total"
statement: "Keep the declared difficulty, the milestone maximum and a mapping we hold, and close the two holes: check the mapping covers its domain when the column compiles, and record the driver named beside the driver that answered."
type: "[[candidate]]"
picks:
  - "[[opt-the-difficulty-is-declared-by-hand-on-the-cell]]"
  - "[[opt-the-complexity-rides-the-cell-the-compiled-state-already-carries]]"
  - "[[opt-the-roster-and-the-mapping-are-two-records-on-two-clocks]]"
  - "[[opt-a-declared-class-with-a-named-fallback-pool]]"
  - "[[opt-the-mapping-is-checked-for-totality-when-the-machine-compiles]]"
  - "[[opt-the-record-carries-both-the-named-driver-and-the-one-that-answered]]"
  - "[[opt-publish-the-driver-only-when-it-changes]]"
  - "[[opt-audit-a-sample-rather-than-reconcile-everything]]"
---

## What it leans on

THREE THINGS HAVE TO BE TRUE FOR THIS LINE TO PAY.

- A weaker hand does worse work on a harder step. Unmeasured. Probe 3 tried and
  could not: the only paired walks in the corpus are forms and their own repairs.
  Every candidate leans on this and this one has no way to find out.
- A declared number stays honest without a mechanism holding it there. The
  scheduler literature says otherwise across twenty-three thousand clusters, and
  raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so is the
  standing form of the objection.
- The milestone maximum's waste is smaller than the cost of finer granularity.
  Probe 1 measured the spread it hides — at major, ten rows ask no evidence field
  and one asks six — and nobody has measured the cost side at all.

AND IT LEANS ON TWO ASSUMPTIONS IT DID NOT CHOOSE.
raid-asm-one-model-list-serves-every-host-the-engine-supports and
raid-asm-the-model-ladder-is-a-total-order both stand under any line that holds
a roster, which is this one and the derived ladder.

## Why this one

EVERY REQUIREMENT THIS RECORD WROTE ASSUMES THIS SHAPE. It is the design the
register was built against, so it starts with the fewest standing claims to
reopen, and it is the baseline the other three have to beat rather than a
proposal competing from scratch.

IT TAKES THE TWO CHEAPEST REPAIRS THE FINDERS FOUND AND NOTHING ELSE. The
complexity rides the matrix cell, on a path probe 4 found already compiled;
totality is checked when the column compiles, so the unmatched case is a
refusal to pin rather than a surprise at state forty. Both are small edits to
code that runs today.

IT LEAVES TWO AXES AT THE INCUMBENT, DELIBERATELY. The difficulty is declared
rather than derived, and the unit is the milestone. Those are the two the
other candidates attack, and holding them here is what makes the comparison
mean anything.

## How it works

obtain-a-step-s-difficulty reads a value off the compiled state, put there by
compileColumn from a third cell key beside `applies` and `<column>_note`.
reduce-a-milestone-to-one-difficulty takes the maximum, as the seed says.
resolve-a-difficulty-to-a-driver reads two records — a mapping of difficulties
to rungs that moves when we change policy, and a roster of models filling each
rung that moves when a vendor ships — with a named pool per rung.
publish-the-driver-outward emits only when the answer differs from the standing
one.

## The seams, which is what this compose state is for

THE CELL AND THE COMPILE. The third cell key rides a path that already carries
the cell's prose, so the seam is a field addition rather than a new call. What is
NOT free: the compiled machine is pinned, so a difficulty edited mid-record does
not reach an open walk until the column recompiles.
raid-iss-the-live-read-rule-forbids-more-than-its-own-reason-needs is exactly
this seam, and gate-design has to rule on it before this candidate is buildable
as described.

THE TOTALITY CHECK AND THE TWO-RECORD MAPPING MEET AT THE JOIN. Splitting the
ladder from the roster creates a way to be incomplete that one file did not have:
a rung the mapping names and the roster does not fill. The totality check is what
closes it, and the two options are therefore not independent — taking the split
without the check is strictly worse than taking neither.

THE PUBLICATION AND THE RECORD ARE TWO WRITES OF ONE FACT. Publishing on change
means a receiver arriving late has no standing answer, so the block must answer
the current value on first ask as well as on change. The call record carries both
drivers on every call regardless. Those are different cadences for the same
value, and a later reader comparing the stream against the log will find them
disagreeing at every boundary unless the log is treated as the authority.

WHAT HOLDS IT HONEST. The compile refuses a mapping with a hole. Every call
record carries the driver named beside the driver that answered. An acceptable
over-driving rate is stated in advance, and a sample is audited against it.

## What it costs

THE HAND-WRITTEN POPULATION IS 154 CELLS, MEASURED. Probe 1 counted the rows
active per column: 19 at patch, 29 at minor, 53 at major, 53 at product. Every
one needs a difficulty typed into it, and every one is a thing that can be typed
wrongly or left to rot. That is the feasibility number this candidate lives or
dies by, and it is the largest of the four.

THE ENGINE CHANGE IS SMALL AND THE CORPUS CHANGE IS NOT. cellsOf at
rigor-matrix.ts:417 gains a third key; compileColumn at :609 carries it onto the
StateDecl; the totality check is one pass over the same rows at pin time. Call it
three edits. The 154 cells are the work.

THE DECLARED NUMBER CAN DRIFT AND THIS CANDIDATE HAS NO ANSWER TO THAT.
raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so stands
against it in full. The audit measures the gap after the fact; nothing stops a
declaration being raised, and probe 3 measured that exact ratchet running in this
record's own evidence — seventeen forms repaired, seventeen grew, none shrank.

AND THE MILESTONE MAXIMUM WASTES BY CONSTRUCTION. Probe 1 measured the spread it
hides: at major, ten rows ask no evidence field at all and one asks six, and a
maximum puts them on the same hand.
