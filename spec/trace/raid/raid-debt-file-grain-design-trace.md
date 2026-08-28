---
minted_in: i1
id: raid-debt-file-grain-design-trace
type: "[[raid]]"
kind: debt
statement: The design-to-code sweep runs at file grain, so dead code inside a claimed file stays invisible to it.
owner: the driving agent
trigger: when the file-grain sweep stops finding anything new, or when a region-marker mechanism lands
status: open
looked: 2026-08-26
impact: A dead function inside a live file never surfaces as an unclaimed finding, and only a reachability probe or a reader catches it.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - note-0c5b06e4d056
  - tsp — trace-design's own guidance names the grain and its cost
last_looked: 2026-08-23
look_verdict: rescheduled
place: i7-the-trace-sharpens-finer-grain-than-file
---

Quality traded for speed, consciously: v1 went finer with `// design:`
region markers and swept declarations outside every region. The file
grain shipped first because it makes the whole seam mechanical today.
The payback is the region mechanism, owed when the coarse sweep goes
quiet.

Sweep 2026-08-13, at i3's onboarding retro: RESCHEDULED, trigger
re-affirmed and now named. i7 is the seeded iteration that repays it -
"the trace sharpens: finer grain than files, and the dead-code sweep
widens past the engine". The version plan records v1's answer in full:
elements are design regions, files are themes, and every v1 Go file
opened with `// design: <region-id>  implements: <req-ids>`. The debt
is repaid when i7 runs, and not before.

## Swept 2026-08-15, at i12's retro: RESCHEDULED to i7

i7's goal already names this subject in its own words: "The trace sharpens:
finer grain than files, and the dead-code sweep widens past the engine."
Same debt, same words, already planned.

The trigger stands unchanged. What moves is only that the destination is now
recorded, so the next sweep does not have to rediscover it.

## Swept 2026-08-18, at i16's onboard-retro: RE-ACCEPTED

i7 IS STILL SEEDED AND UNWALKED, so the destination recorded at the last two
sweeps is unchanged and unreached.

The trigger stands unchanged.

## Sweep 2026-08-19, at i5's retro

RESCHEDULED, trigger re-affirmed. The coarse sweep has NOT gone quiet: i5's trace-design pass found a live finding at file grain this iteration. i7 remains the seeded iteration that repays it.

## Swept 2026-08-19, at i9's onboard-retro: RE-ACCEPTED

UNMOVED. The destination recorded at the last two sweeps, i7, still reads
`status: seeded`.

WHAT MAKES IT ACCEPTABLE IS UNCHANGED: the coarse sweep is still finding
things, so this entry's own repayment condition is not met.

TRIGGER RE-AFFIRMED. Neither half has fired.

## Swept 2026-08-20, at the standalone retro after i37 shipped

RE-AFFIRMED AS STANDING, trigger unchanged. i37 did not touch what this entry
is about, so nothing here moved.

THE LOOK IS THE POINT. A debt nobody re-reads is a lie in the ledger, and this
line is the evidence that somebody read it on this date.

## Swept 2026-08-26, at i54's closing retro: RE-ACCEPTED

NOT TOUCHED THIS WINDOW. No grain change ran.

RE-ACCEPTED consciously, trigger unchanged.


SWEPT 2026-08-28, at i63's closing retro: RE-ACCEPTED, AND ITS TRIGGER CANNOT
BE OBSERVED.

Half the trigger is deliverable — a region-marker mechanism landing is a
nameable moment. The other half, "when the file-grain sweep stops finding
anything new", names a never-event: nothing counts what the sweep finds per
run, so nothing could ever report that it stopped.

IT IS ONE OF SIXTEEN OPEN ENTRIES IN THAT CLASS, and the class is this retro's
finding rather than this entry's.
