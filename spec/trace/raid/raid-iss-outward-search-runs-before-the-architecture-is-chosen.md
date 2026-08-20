---
minted_in: i27
id: raid-iss-outward-search-runs-before-the-architecture-is-chosen
type: "[[raid]]"
kind: issue
statement: The outward prior-art search runs once at M4, before the architecture is chosen, so any shape decided at M5 or M6 reaches the build with no search of its own.
owner: the owner
trigger: the next record whose architecture names an element the enumerate-space search never asked about
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: A design chosen after the search is built without ever being compared to how anybody else solved it. The gap is invisible, because the record can point at a real prior-art state that really ran.
---

## What was observed

i27's `find_prior_art` ran at M4 and ran WELL. Its own record says the field's
name for its problem is CONFINEMENT, and that finding the word was half the
search. It reached ambient authority, the confused deputy, `openat2`'s
`RESOLVE_BENEATH`, FreeBSD's `O_RESOLVE_BENEATH`, Capsicum and cap-std — every
one a primary source.

THAT SEARCH WAS ABOUT THE SEAM: which tree does a path name.

The CORE-AND-SATELLITE split was not a question at M4. It was chosen at
`gate-candidates` and `gate-architecture`, and its chunks were written at
`specify-build`. By then the prior-art state was signed and behind the walk.

So three of this record's twelve chunks were built for a shape that never got
an outward search, and nobody noticed until the implementation gate asked for a
comparison and got a blank.

## Why the record looks compliant

THIS IS THE PART THAT MAKES IT CORROSIVE. The record has a real, signed,
high-quality prior-art state. A reviewer checking whether the search happened
finds that it did.

The question nobody asks is whether it covered the shape that was actually
built.

## What was found once somebody looked

Searching at the gate, after the fact, took three queries and produced three
usable comparisons: overlayfs for the delta, the LSP multi-server pattern and
tsserver for the process split, git worktree for the shared-versus-per-tree
question. None of it was hard to find. It simply had no state that asked for
it.

## The shape of the fix, not the fix

- A second, cheaper outward search after the architecture is declared, scoped
  to the elements the architecture actually names.
- Or `evaluate-architecture` grows a prior-art question of its own, so the
  comparison is owed where the shape is chosen rather than where the problem
  was framed.

WHICH ONE IS THE OWNER'S CALL. Both cost a state's worth of work, and the
second keeps the number of states the same.
