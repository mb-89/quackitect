---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: el-vehicle-producer
type: "[[element]]"
statement: Produces a vehicle — a complete independent descendant of the engine under a new name, as a plain copy with its own fresh repository, which records where it came from and can reach it by no mechanism at all.
kind: new
realization: make
group: the-bootstrap
implements:
  - fn-run-a-governed-walk.bring-forth-a-vehicle
source_refs:
  - raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link
  - opt-the-bound-travels-with-the-act
  - raid-dec-a-producing-act-is-bounded-by-the-tree-it-produces
  - vp-the-engine
  - cand-the-program-route
---

## The word is VEHICLE, and the function structure now says so

OWNER RULING 2026-08-18: "It's not a copy. It's a vehicle. And we are the
engine."

THE FUNCTION AND THE FLOW WERE RENAMED ON THAT RULING, in the same visit that
fixed a larger hole beside them. `bring-forth-a-copy` became
`bring-forth-a-vehicle` and `flow-copy` became `flow-vehicle`, with every citer
patched rather than left dangling.

THE REQUIREMENT IDS STILL CARRY THE OLD WORD and are deliberately left alone.
`req-one-command-produces-a-complete-copy` and
`req-nothing-a-copy-does-reaches-its-source` are M3's, older than this
iteration, and renaming them reaches further than this state may.
note-761dbf2a236c carries the remaining sweep.

## What it does — four steps and nothing else

OWNER RULING 2026-08-18, the second one: "I want this to be a copy... You can
still git init it and make an initial commit. That's okay. But it shouldn't
point back to the original."

- COPY THE TREE. Not a clone. The engine's folder is copied to a new place
  under a new name, and no commit of the engine's comes with it.
- LEAVE THE ENGINE'S OWN RECORDS AT HOME. All of `spec`, recreated
  empty in the copy. A vehicle opening its own archive should find its own
  history there, or none.
  THIS SAID "TWO FOLDERS" AND THAT UNDERSTATED IT, corrected 2026-08-18 while
  building the act. The engine's spec is its expeditions, its iterations AND
  its trace, and the trace describes the engine's own design just as much as
  the other two describe its work. The shipped export already drops the whole
  folder, and it has been doing so in the field.
- WRITE THE NAME ONCE, into the one file that holds it.
- WRITE THE UPSTREAM FILE, and make one commit in a fresh repository.

## The upstream file, and why it is a file

`deliverable/vendor/` ALREADY RECORDS PROVENANCE THIS WAY. Every vendored thing
there carries a README naming its source, its version, when it was pulled and
how to update it. The upstream file is that shape with the direction reversed:
the product is the vendored thing, and the file says what it was vendored FROM.

IT NAMES AN IDENTITY AND A VERSION, NEVER AN ADDRESS. That is the difference
between a record and a remote, and it is the whole reason the file is safe.

A GIT REMOTE IS A TWO-WAY THING. It is somewhere you fetch from and, with one
wrong flag, push to. A file naming an identity is read by whatever wants it and
can reach nothing by itself.

SO THE ISOLATION HOLDS BY CONSTRUCTION rather than by discipline. There is no
address in the vehicle that resolves to the engine.

## What it costs, said plainly

NO GIT MERGE CAN EVER RUN between an engine and a vehicle, because they share no
commit. Every update mechanism must work from the vehicle's files as they stand.

THAT IS A REAL LOSS AND IT WAS TAKEN KNOWINGLY.
[[raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link]] carries the
reasoning, and the owner's own position is that an engine update is a deliberate
act rather than an automatic one: "You decide to make that update... If you have
to merge with the merge tool, that's okay."

## It refuses rather than half-producing

A DESTINATION THAT IS NOT EMPTY, or a missing name or abbreviation, stops the act
before anything is written.

BOTH GUARDS WERE FOUND BY FAILURE in the shipped export and are carried forward
deliberately. A forgotten argument ships a vehicle to somebody else, and the
repository marker has to be excluded as a FILE as well as a directory, because a
worktree checkout carries it as a file and the export once re-used the live
repository.

THE SECOND GUARD IS NOW BELT AND BRACES rather than load-bearing. A copy makes
its own repository from scratch, so there is no live repository to re-use. The
guard stays because the failure it prevents is silent and the check is one line.

## What crosses its boundary

IN: `flow-repository` and `flow-intent`, both crossing the system edge.

OUT: `flow-vehicle`, which crosses OUT and is consumed by nothing, deliberately.
A consumer inside the engine would be a path from the vehicle back to the engine,
which [[req-nothing-a-copy-does-reaches-its-source]] forbids and which is graded
fatal.

SO THIS ELEMENT SITS AT NO INTERFACE, and that absence IS the guarantee rather
than a hole. It is the same shape [[el-arrival]] has and for the same reason.

## The bound is a property of the act

THE WRITE BOUND TRAVELS WITH THE PRODUCING ACT rather than sitting at a fixed
root, so this element is confined to the tree it is producing while it produces
it. That is checked at the one resolution seam every verb goes through, not by
guards written into this element.

THAT IS WHAT LETS IT BE A LANE ACT AT ALL, which is what the owner's
create-vehicle surface needs. The shipped export is a script the jail never
sees, and its guards are hand-written checks nothing else inherits.

## How it is reached

`se_produce_vehicle`, a lane verb. That is what makes it loggable, refusable
before it half-produces, and bounded by the tree it is producing — none of which
a script outside the lane can be.

## The realization concept

MAKE, AND SMALLER THAN THE CLONE VERSION WAS. A directory copy, a delete of two
folders, two files written, `git init` and one commit.

WHAT IS GENUINELY NEW is that the act runs inside the lane with its bound
travelling, and that the existing script's guards become jail behaviour rather
than script behaviour.

AND ONE THING GOT SIMPLER RATHER THAN HARDER. A clone had to be filtered — the
history came along and the remote had to be considered. A copy starts empty and
nothing has to be stripped.
