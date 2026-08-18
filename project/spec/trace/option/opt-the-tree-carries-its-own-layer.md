---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-tree-carries-its-own-layer
type: "[[option]]"
statement: a tree that carries the method inside itself is its own home, and only a tree carrying nothing has to look elsewhere
cluster: the-walk
question: how a tree carrying no method finds the copy that drives it
found_by: prior-art
source: v1's hasEngineLayer and resolveEngineRoot step 2, product/engine-go/engine.go at ref main
---

## Mechanism

BEFORE LOOKING ANYWHERE ELSE, THE PROGRAM ASKS WHETHER THE TREE IN FRONT OF IT
ALREADY HAS WHAT IT NEEDS. If the method layer is present, that tree is the
home and no pointer is consulted at all.

v1 CHECKS TWO KNOWN LOCATIONS for a `method` directory and takes the first
that answers. A copy that vendored the method satisfies this, and so does the
source repository working on itself. Its design note calls both cases
"live-first".

WHAT IT BUYS. The commonest case needs no mechanism whatsoever. A copy running
on its own work never asks where anything is, so every failure mode of every
pointer scheme simply does not arise for it.

WHAT IT COSTS HERE. It answers nothing for the case this iteration exists to
serve. A driven project carries none of the method by definition, so this
check always fails there and the work falls to whatever comes next.

SO IT IS NOT A COMPETING OPTION SO MUCH AS A FIRST STEP that removes most of
the traffic. It belongs in the chart because a candidate that omits it pays a
pointer lookup on every call for a tree that never needed one.

AND ITS FAILURE MODE IS THE INTERESTING PART. Presence of a directory is a
weak claim. A tree containing a folder of the right name and shape becomes a
home, whether or not anybody meant it to. v1 discovered this and wrote a test
that plants exactly that shape and asserts it does not steal the pointer.
