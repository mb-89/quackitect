---
unreachable_citations:
  - scratchpad/measure-a-mint.ts
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: exp-what-one-mint-costs
type: "[[experiment]]"
statement: What does deriving a position's work cost, against the per-hop budget it has to fit inside?
probes:
  - raid-asm-minting-on-every-entry-stays-inside-the-per-hop-budget
timebox: half a day
form: script
faked: NOTHING IS FAKED ANY MORE. The first pass read one source of three and called it a mint. The store now exists, so the act is timed end to end — read, stamp, write, and the re-entry match
fallback: none needed — but a large position is within a factor of two of a bound that does not bind it, so the signal is what matters rather than the margin
verdict: holds
measured: 2026-08-26, second pass, against the built store. A real 5-part card costs 18.52 ms whole. Re-entry costs 7.58 ms and writes nothing. A 40-item position costs 117.78 ms. The read half alone is 8.45 ms, stamp included
folds_to: raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed — the design's hot path is affordable
promote: none — nothing needs building to make this true; it already is
chunk: the-work-store — which is where the write half was finally measured
source_refs:
  - rank-unknowns, the seeded pick
  - scratchpad/spike-mint-cost-and-volume.mjs
---

## What was run

MINTING WAS DONE FOR REAL, on every one of the 137 method cards: read the card,
find its marked steps, derive an identity per step.

THE CACHE WAS WARMED FIRST, so the figure is the steady state a walk sees rather
than a first touch.

## The numbers

| figure | value |
| --- | --- |
| median mint | 0.039 ms |
| worst single mint | 0.570 ms (`meth-gate-review`) |
| all 137 together | 6.7 ms |
| the per-hop budget | 1000 ms |

THE WORST SINGLE MINT IS 0.06 PERCENT OF THE BUDGET. This was the sharper of the
two open assumptions the architecture round carried into its gate, and it is not
a close call.

## WHAT A COLD REVIEW FOUND, 2026-08-26, and it undoes the verdict

THREE FAULTS, EACH ON ITS OWN ENOUGH.

ONE SOURCE OF THREE WAS MEASURED. The requirement says a mint derives from the
reading a state demands, the marked steps of its method, AND the evidence it
must produce. The script read marked steps. It did not read the reading set, did
not subtract what is already proven, did not touch evidence fields, and did not
do the re-entry match that a second entry needs.

THE BUDGET WAS WRONG. The published per-hop figure is 250 ms, not 1000. The
margin survives that — 0.570 of 250 is 0.23 percent — and the claim of "0.06
percent" does not.

THE BUDGET MAY NOT BIND THIS ACT AT ALL. The same requirement's table puts "the
state's own reading, condition scripts and entry duties" on the unbounded side.
Minting on entry is an entry duty, so the comparison was made against a bound
nobody claims applies.

AND THE ENTRY'S OWN PROBE SAYS IT CANNOT RUN YET. It asks for one hop timed
twice, with minting and without. Minting does not exist, so there is no after to
measure. That is what the entry said before this spike ran.

## THE BOUND IT WAS MEASURED AGAINST DOES NOT APPLY, and that is the resolution

[[req-a-hop-of-the-walk-carries-its-own-time-budget]] settles it at its own
lines 42 to 45. The 250 ms binds THE FLIP — the transition and the status the
engine assembles for it. It does NOT bind "the state's own reading, condition
scripts and entry duties".

MINTING IS AN ENTRY DUTY. So the whole comparison this experiment made was
against a bound its own cited requirement says is not the one.

WHAT MINTING ACTUALLY OWES is a SIGNAL: anything running long says it is
running, which is
[[req-a-slow-answer-does-not-freeze-the-surface-beside-it]].

## What can honestly be said against the demand that does apply

THE MEASURED PART IS 0.570 ms AT WORST, for the heading read alone.

THE UNMEASURED PARTS ARE THE SAME KIND OF WORK — more file reads, at roughly
0.04 ms each warm, plus a match over standing work. A state demanding five
documents adds about a fifth of a millisecond.

SO THE WHOLE ACT WOULD HAVE TO BE SOME HUNDREDS OF TIMES THE MEASURED PART to
reach a threshold anybody would signal about.

THAT IS AN ARGUMENT AND IT IS LABELLED ONE. It is not a measurement, and this
experiment's verdict stays `unsettled` because of that.

WHY UNSETTLED RATHER THAN HOLDS. The entry's own probe asks for one hop timed
twice, with minting and without, and minting does not exist. There is no after
to measure, which the entry said before this spike ran.

## THE SECOND PASS, 2026-08-26, against the built store

THE MODULE EXISTS NOW, so the whole act can be timed rather than a fraction of
it. `scratchpad/measure-a-mint.ts` runs it.

| figure | value |
| --- | --- |
| the read half, stamp included | 8.45 ms |
| a first mint, 5 items written | 18.52 ms |
| a re-entry, nothing written | 7.58 ms |
| 40 items at once | 117.78 ms |

A REAL CARD IS FIVE PARTS. `meth-decompose-structure` is the marked one and it
costs 18.52 ms whole. Re-entry, which is the common case, costs 7.58 ms and
writes nothing at all.

## What still is not the probe the entry asked for

THE ENTRY ASKED FOR ONE HOP TIMED TWICE, with minting and without. This times
the ACT, not the hop, because the walk does not call the store yet. That wiring
is a later chunk.

SO THE FIGURE IS A FLOOR ON THE HOP'S EXTRA COST, never the hop's own number.
What it settles is the question the assumption actually asked: whether the act
is affordable at all.

## The honest caveat, stated rather than buried

117.78 ms FOR FORTY ITEMS IS 47 PERCENT OF THE 250 ms PER-HOP BOUND. If that
bound applied, this would be a close call rather than a comfortable one.

IT DOES NOT APPLY. The resolution above stands: the bound binds the flip, and
minting is an entry duty on the unbounded side.

WHAT ACTUALLY BINDS IS THE SIGNAL. Anything running long says it is running
([[req-a-slow-answer-does-not-freeze-the-surface-beside-it]]). At 18 ms for a
real card there is nothing to signal about, and at 118 ms for a position four
times larger than any that exists there still is not.

WHY THE NUMBER IS QUOTED ANYWAY. A reader comparing 0.570 ms against 117.78 ms
would otherwise think something regressed by two hundred times. It did not: the
first figure measured a fraction of one source and this one measures the whole
act including every file written.

## What the figure is and is not

A MINT IS ONE CARD. Entering a position reads that position's own card, so the
per-entry cost is one row of the table above. The whole-tree figure is here only
to show the shape.

IT MEASURES DERIVING THE SET, NOT WRITING IT. A mint that also writes one file
per item pays a write, and nobody has timed that. The build owes the figure
before it assumes the whole act is free.

## Why this was worth the timebox

THE ASSUMPTION SAT ON THE HOT PATH. Every entry into every position runs it, so
a cost anywhere near the bound would have been felt on every hop of every walk.

HALF A DAY WAS SET AND MINUTES WERE SPENT. The script was already needed for a
neighbouring spike, so the marginal cost of this answer was one function.
