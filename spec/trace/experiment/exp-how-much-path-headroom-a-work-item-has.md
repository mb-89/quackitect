---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: exp-how-much-path-headroom-a-work-item-has
type: "[[experiment]]"
statement: How close does the longest work item path come to the platform limit, and how much room is left?
probes:
  - raid-asm-a-work-token-s-file-path-fits-every-platform
timebox: one hour
form: calculation
faked: none — the longest record folder and the longest marked heading were both taken from the real tree
fallback: none needed — the answer is arithmetic on real names
verdict: holds
measured: 2026-08-26 — longest record folder 44 characters, longest item path 163 relative and 203 absolute on this machine, against the 260 classic Windows limit, leaving 57
folds_to: raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
promote: none as a blocker. The headroom figure is what the build inherits, and a cap on the record folder name is the cheapest way to keep it
chunk: none — nothing must be built, and the margin is a thing to watch rather than fix
source_refs:
  - rank-unknowns, the seeded pick
  - scratchpad/spike-paths-and-counts.mjs
---

## What was built to measure against

THE WORST PATH THE DESIGN CAN PRODUCE, assembled from real parts: the longest
record folder standing on trunk, the heaviest method card, and that card's
longest marked heading as the file name.

| figure | value |
| --- | --- |
| longest record folder | 44 characters |
| longest item path, relative | 163 |
| absolute on this machine | 203 |
| the classic Windows limit | 260 |
| headroom | 57 |

## It holds, and the margin is the answer

FIFTY-SEVEN CHARACTERS IS ABOUT THIRTEEN OF EXTRA FOLDER DEPTH. That is the
whole of what a person has before a name stops fitting.

WHAT EATS IT: a checkout nested deeper than this one, or a longer user name in
the home path.

THE RECORD FOLDER IS ALREADY CAPPED, and the first pass said it was not. A cold
review found the cap: `deliverable/engine/records.ts` line 74 ends the slug with
`.slice(0, 40)`, and `iterations.ts` line 164 builds the id as the prefix plus
that slug. That is why the longest folder is exactly 44 characters and not an
accident.

SO ONE OF THE THREE THINGS NAMED AS EATING THE MARGIN CANNOT HAPPEN. The margin
is firmer than the first pass claimed, and the claim about the system was false.

## Why the limit chosen is 260 rather than the long-path one

LONG PATHS NEED OPTING IN, per machine. The honest figure to measure against is
the one that works everywhere, because a design that needs a machine setting is
a design that fails on a machine nobody configured.

## Why an hour was the right box

IT FAILS SILENTLY. A path too long does not report a design flaw; it reports a
file that will not open, on one person's machine, long after the choice was
made.

THE PROBE IS A COUNT, so an hour was generous and minutes were spent. Cheap to
answer and expensive to discover is the combination that earns a spike whatever
its exposure looks like.

## What would remove the worry, if it ever needs removing

NAME AN ITEM FILE BY SOMETHING SHORTER THAN ITS HEADING, keeping the heading
inside the file. Capping the record folder was the other suggestion and it is
already done.

NEITHER IS NEEDED TODAY. The margin holds and the figure is recorded so a later
change can be measured against it rather than argued about.

ONE THING THIS DID NOT MEASURE. The layout it assumed — a `work` folder under
the record, then the card, then the heading — is not specified anywhere. And
under the new marking rule an item may be named from a numbered-list line, which
runs longer than any heading. Both would eat the margin and neither was tried.
