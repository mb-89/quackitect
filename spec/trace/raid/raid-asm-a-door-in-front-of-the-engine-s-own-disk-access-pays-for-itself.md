---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself
type: "[[raid]]"
kind: assumption
statement: Routing the engine's own disk access through one door buys more than it costs, so the 117 direct write sites in engine core are a defect rather than a shape somebody chose.
owner: the owner
trigger: the first design state that has to say which of the 398 measured disk sites should go through a door, and the first time a rewrite of one of the seven heaviest modules is proposed
status: open
impact: The whole widened scope of this record rests on it. If the direct sites are mostly fine as they are, the record spends a major-sized effort building a door in front of code that never needed one, and the count that motivated it turns out to have measured the size of the question rather than the size of the defect.
breaks_how_badly: crippling
how_likely: plausible
probe: "NOT PROBED. The counting is done and the judging is not. The record says so in its own words at spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/record.md: what is not measured is whether any given site SHOULD go through a door. THE CHEAP PROBE: take the seven modules carrying 64 of the 117 core writes, read what each write actually does, and sort them into sites a door would improve and sites it would only lengthen. That is one reading pass over seven files, and it settles the sizing before anything is built."
probed: none
source_refs:
  - i54-everything-exported-has-a-door-a-sweep-o
  - wt-a-guard-checks-that-entry-points-can-be-got-at-and-it-walks-
weighs_with: none
weighs_against: none
---

## Probe

NOT PROBED YET. The probe is written here because it was identified here, and
running it is the record's first real act.

THE COUNTING IS DONE AND THE JUDGING IS NOT. The record says so in its own
words: what is not measured is whether any given site SHOULD go through a door.

THE PROBE, and it costs one reading pass over seven files. session.ts,
iterations.ts, run.ts, sessionclaims.ts, benchmark.ts, produce.ts and
sessionforms.ts carry 64 of the 117 core writes between them.

SORT EACH WRITE INTO TWO PILES.

- Writes a door would improve. Repeated path building, atomic replacement, hash
  checking, the same error handling in seven places.
- Writes a door would only lengthen. A single append to a log the module owns,
  a temporary file it reads straight back, a path already jailed by paths.ts.

WHAT THE RESULT MEANS. A majority in the second pile falsifies this and
re-sizes the record down to the sweep that was seeded. Anything else confirms
it.

WHO RUNS IT: the walker of the milestone that opens the design work.

## Why it is written down rather than assumed

THE OWNER CALLED IT AN IDEA, not an order. Their words allow any of the three
doors to be dismissed where it does not make sense, with the reason recorded.

That is an invitation to test the principle, and a test needs the claim stated
first. Left unstated, the record would treat the principle as settled and the
dismissal path would never be walked.

## What is measured and what is not

MEASURED, on 2026-08-26, over 180 source files: 93 of them reach disk or the
network directly, at 398 disk sites and 52 network sites. Engine core alone
carries 117 writes across 50 files, and seven modules carry 64 of those.

NOT MEASURED: whether a door improves any single one of them. A count of
call sites is a count of call sites.

## What would falsify it

THE SEVEN HEAVY MODULES ARE THE PLACE TO LOOK. session.ts, iterations.ts,
run.ts, sessionclaims.ts, benchmark.ts, produce.ts and sessionforms.ts.

FALSIFIED IF most of their writes turn out to be the kind a door cannot
improve. A single append to a log the module owns, a temporary file it
immediately reads back, a write whose path is already jailed by paths.ts.

CONFIRMED IF the writes repeat a shape a door would hold once. Path building,
atomic replacement, hash checking, error handling, the same three lines in
seven places.

## The related seam that already works

PATHS.TS IS THE COUNTER-EXAMPLE IN OUR FAVOUR. The path jail has 20 importers
and is well adhered, which shows an internal seam can hold here.

IT IS ALSO NARROWER THAN A DISK DOOR. A path jail answers one question about a
string; a disk door owns the whole act. The precedent supports the shape and
does not establish the cost.
