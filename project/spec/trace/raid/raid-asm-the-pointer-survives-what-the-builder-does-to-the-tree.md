---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-asm-the-pointer-survives-what-the-builder-does-to-the-tree
type: "[[raid]]"
kind: assumption
statement: The record telling a driven project which copy to follow back is still there when somebody opens that project, whatever they have done to the tree in between.
owner: the owner
trigger: the first time a driven project is opened by somebody other than the person who created it, or on a machine other than the one that created it
status: open
probed: "2026-08-18"
probe: "scheduled, AND ONE OF THE FOUR CANDIDATE ANSWERS IS ALREADY DISPROVED BY INSPECTION. The full probe is three runs — produce a project and confirm the system comes up, move it and retry, clone it as a colleague would and retry — and it needs the producing act, which does not exist. M6 carries it. WHAT IS SETTLED WITHOUT A RUN: v1's answer puts the pointer in a MACHINE-LOCAL data home keyed by a hash of the workspace path, so it survives neither a move nor a clone by construction rather than by accident. That eliminates one of the four candidates `bring-forth-a-project` names, before M4 scores anything, and it narrows the space toward a pointer living inside the produced tree — which is also the one the path jail is friendliest to."
breaks_how_badly: crippling
how_likely: expected
impact: "The system cannot come up in the project at all, and the failure looks like the product being broken rather than like a missing pointer. The second of the two capabilities stops working for exactly the people the affordance was built for - somebody who pressed a button and read nothing."
source_refs:
  - req-the-system-runs-in-a-tree-that-is-not-its-own
  - fn-run-a-governed-walk.bring-forth-a-project
  - uc-drive-a-foreign-product ext 2y
---

## Where the doubt comes from

v1 PUT THE POINTER OUTSIDE THE TREE. Its `engine-home.txt` lives in a
per-workspace data home under LOCALAPPDATA or XDG_DATA_HOME, keyed by a hash of
the workspace path. Read this session at product/engine-go/i18_red3.go, ref
main.

THAT MEANS A CLONE OF THE DRIVEN PROJECT ARRIVES WITH NOTHING. The data home is
machine-local by construction, so a colleague cloning the project gets the work
and no way to find the method that governs it.

AND IT IS NOT AN EDGE CASE. The whole point of a driven project is that it is
somebody's real product, which is committed, cloned and shared. `expected` is
the honest likelihood rather than a cautious one.

## Three ways it breaks, and they are different failures

- THE PROJECT MOVES. Its path changes, and a pointer keyed by path stops
  resolving.
- THE PROJECT IS CLONED. A machine-local pointer does not travel.
- THE COPY MOVES OR IS RENAMED. The pointer still resolves and points at
  nothing.

THE THIRD IS THE WORST because it fails with a stale answer rather than an
absent one, which is the shape [[raid-dec-serve-the-overlay-and-report-the-drift]]
already rules against in a different place.

## Probe

IT IS CHEAP AND IT IS THREE RUNS, and none of them needs this product.

1. Produce a project by the candidate mechanism. Confirm the system comes up
   in it.
2. Move the project to a different path, and try again.
3. Clone the project to a second location as a colleague would, and try again.
   Then rename the copy that created it, and try a fourth time.

WHAT ANSWERS IT: the system either comes up, or REFUSES SAYING WHAT IT LOOKED
FOR AND DID NOT FIND. Both are passes. Coming up wrongly, or failing without
naming the missing pointer, is the failure.

AND THE PROBE HAS A DESIGN CONSEQUENCE RATHER THAN JUST A VERDICT. If a
machine-local pointer fails two of the three, the candidate space narrows to
pointers that live inside the produced tree - which is one of the four
`bring-forth-a-project` already names, and the one this product's path jail is
friendliest to.

## Why it is an assumption rather than a decision

WHERE THE POINTER LIVES IS M4's TO DECIDE, and this entry does not decide it.
What is assumed is that WHATEVER IS CHOSEN survives ordinary handling of the
tree. A design could be picked for other reasons and fail this quietly.
