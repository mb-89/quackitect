---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-a-copy-is-a-clone-that-keeps-its-history
type: "[[raid]]"
kind: decision
statement: A copy is an ordinary clone that keeps the source's commits and never consults them at run time, rather than a fresh repository sharing no commit with what it came from.
owner: the driving agent
status: superseded
breaks_how_badly: crippling
how_likely: expected
impact: "A copy sharing no commit with its source has no merge base, so no update can ever reach it by any mechanism that compares. That is the incumbent's shape and it is why the incumbent cannot reach step 6 of the use case at all."
source_refs:
  - req-one-command-produces-a-complete-copy
  - req-method-reuse-is-vendoring
  - opt-a-clone-that-keeps-its-history
  - uc-vendor-and-overlay
  - vp-vendoring
---

## The choice

CLONE, THEN REMOVE WHAT IS NOISE. The copy carries the source's commits. This
project's own expedition and iteration records are deleted, and the name is
written once into the one file that holds it.

THE HISTORY IS NEVER CONSULTED AT RUN TIME. Nothing in the running system reads
it, which is what makes the copy standalone.

## The owner requirement this had to satisfy, and the reading that settles it

THE COPY MUST RUN ON ANOTHER MACHINE WITHOUT NEEDING THIS REPOSITORY'S HISTORY.
That was recorded on 2026-07-30 and it reads at first like a demand to drop the
history.

IT IS NOT. It says without NEEDING. A history the copy never consults satisfies
that as fully as no history at all, and only one of the two leaves a channel
open. Dropping it is one way to satisfy the requirement; keeping it unused is
another, and the second costs nothing the first saves.

## Rejected options

A FRESH SINGLE-COMMIT REPOSITORY. REJECTED, and it is what ships today. It
satisfies the same owner requirement and closes every future update path in the
same act. Its own use case names the consequence and calls it legal: "They never
take an update. The copy keeps working, unchanged, indefinitely. This is the
fork case and it is legal; what it costs is everything the source learned
since."

ITS TWO GUARDS ARE WORTH KEEPING WHATEVER PRODUCES THE COPY, and both were found
the hard way. Refuse unless folder, name and abbreviation are all given, because
a forgotten argument ships it to somebody else. And exclude the repository
marker as a FILE as well as a directory, because a worktree checkout carries it
as a file and the export once re-used the live repository.

A MIRROR BESIDE AN OVERLAY, with upstream content in a folder nobody hand-edits.
REJECTED at this cell: it answers how a copy's CHANGES are represented rather
than how the copy is produced, and it composes with a clone rather than
replacing it.

## Consequences

THE CLONE IS LARGER AND SLOWER TO FETCH. That is a cost and it is not a step
outside the published entry.

A MERGE BASE EXISTS, which is what every later mechanism needs. Whether it is
USED is the separate decision recorded at
[[raid-dec-an-update-arrives-as-a-program]], and the answer there is that
upstream's work arrives as a transformation rather than as something to merge.

AND THE SOURCE KEEPS NO RECORD OF THE COPY. The direction is one way by
construction: the copy knows where it came from and nothing upstream knows the
copy exists.

## Superseded 2026-08-18 by the owner

SUPERSEDED BY [[raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link]]. A
vehicle is a plain copy with its own fresh repository and one commit, and it
records where it came from in a file rather than in a git remote.

THE OWNER'S WORDS: "I want this to be a copy... You can still git init it and
make an initial commit. That's okay. But it shouldn't point back to the
original." And the precedent they gave: "v1 just made a copy, and that worked."

## Why the reason for this decision stopped holding

THIS ENTRY'S ONLY ARGUMENT WAS A MERGE BASE. Keeping the engine's commits gave
a later update a common ancestor to merge against, and that was worth carrying
somebody else's history for.

THE OWNER RULED THE UPDATE MECHANISM IS NOT WHAT THE PRODUCT IS FOR, on the same
day: "I don't think it needs to be mechanical... This is not the most important
feature to me." note-beac84587cd9 carries that exchange.

SO THE BENEFIT WENT AND THE COST STAYED. A vehicle carrying the engine's whole
history shows a reader every commit of a project that was never its own.

## What the supersession costs, said plainly

NO GIT MERGE CAN EVER RUN between an engine and a vehicle. There is no common
ancestor, so the three-way merge has nothing to stand on.

THAT INVALIDATES THE SCOPE OF A MEASUREMENT TAKEN HOURS EARLIER.
[[exp-a-structural-rename-across-a-vehicle]] measured a plain git merge carrying
a vehicle's restructuring across an upstream rename at MERGE_EXIT=0. The number
is not retracted. It describes a clone, which is the shape this entry chose and
the owner has now ruled out.

AND IT KILLS A CANDIDATE OUTRIGHT. [[cand-nothing-but-a-channel]] exists to keep
a fetchable connection to the engine. The ruling forbids exactly that, so it is
dead rather than merely behind.
