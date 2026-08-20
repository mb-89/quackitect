---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: tsp-a-vehicle-is-made-and-then-drives-something-else
type: "[[test-spec]]"
statement: One command produces a complete vehicle on a machine holding nothing else, and that vehicle then comes up in a project tree carrying none of its method and is able to work there.
method: demonstration
demonstrates:
  - sty-press-create-vehicle-and-land-in-it
  - sty-drive-somebody-elses-product
verifies:
  - req-one-command-produces-a-complete-copy
  - req-the-system-runs-in-a-tree-that-is-not-its-own
files:
  - none — a demonstration is observed rather than instrumented, and the Procedure below is the whole definition. What the procedure produces is a vehicle and a driven tree, neither of which is a test file.
---

## Scope

THE TWO CAPABILITIES THE OWNER ASKED FOR, END TO END, in one sitting. A vehicle
is made from the engine, and then that vehicle drives a project that is not its
own.

THEY ARE ONE SPEC BECAUSE THE SECOND CANNOT BE SHOWN WITHOUT THE FIRST. A driven
tree needs a vehicle to drive it, and a vehicle nobody drives anything with
proves half the claim.

WHAT IS DELIBERATELY OUT. Every containment rule, which is
[[tsp-a-produced-tree-is-bounded-and-named]]'s and is a test rather than a
demonstration. Taking an update, which is [[tsp-overlay-seam]]'s.

## Approach

THE DESIGN METHOD IS SCENARIO-BASED, and [[meth-test-design]] names the shape:
a soap-opera test that tells one extreme story end to end. The extreme here is
that nothing of the engine is present beside the vehicle, and nothing of the
vehicle is present inside the driven tree.

THE LEVEL IS ACCEPTANCE. Both rows are about what a person can do, not about
what a function returns, and neither has a response measure a program can read.

DEPTH IS ONE PASS AND NO MORE. Both requirements are graded on what breaks
without them rather than on how often they fail, and a demonstration answers
whether the thing works at all. Repetition buys nothing here; the containment
rules that need repetition are tested elsewhere.

## Procedure

SIX STEPS, and each names what is WATCHED as the pass.

- ONE. On a machine with the engine present, run the single act that produces a
  vehicle, giving it a name. OBSERVED: the act completes, and it refuses rather
  than half-producing if the destination is occupied or the name is absent.
- TWO. Look at what was produced. OBSERVED: a complete tree under the given
  name, in a repository of its own holding one commit and no remote, with an
  empty place ready for the vehicle's own content, no record of the engine's
  own iterations, and one file naming the identity it came from.
  THE ENGINE'S HISTORY IS NOT THERE, and an earlier draft of this step said it
  was. That draft was written against a clone;
  [[raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link]] replaced it
  with a copy, so no commit of the engine's comes along.
- THREE. Look at the ENGINE afterwards. OBSERVED: nothing about the vehicle was
  written anywhere in it. No registry, no callback, no file naming what was
  made.
- FOUR. Move the vehicle to a machine with nothing of the engine beside it, and
  bring it up. OBSERVED: it comes up on its own shipped method, greets, and
  offers walkable doors, with zero files edited by hand.
- FIVE. Point that vehicle at a project tree that carries none of its method,
  and open it. OBSERVED: the system resolves its method through the record the
  producing act wrote, and comes up able to work.
- SIX. Open a tree with NO such record. OBSERVED: it says this is not a driven
  project and names the record it looked for, rather than guessing or falling
  back to itself.

STEP SIX IS THE ONE THAT USUALLY GETS SKIPPED and it is the one the requirement
was written for. A system that comes up cheerfully in any folder has not met
this row; it has only failed to notice.

## What this demonstration cannot settle

WHETHER THE PRODUCED VEHICLE IS SAFE TO HAND SOMEBODY. That is the direction of
writes, and it is asserted by tests rather than watched.

AND WHETHER THE RECORD SURVIVES A MOVE OR A CLONE of either tree. The record
names an identity rather than a path precisely so it does, and proving it wants
a second demonstration on a second machine.
