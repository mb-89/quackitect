---
minted_in: i27
id: fn-run-a-governed-walk.resolve-a-path
type: "[[function]]"
cluster: the-walk
statement: decide which tree a call's path names, and say so
satisfies:
  - req-every-record-path-resolves-in-one-tree
  - req-version-control-resolves-like-every-call
  - req-a-write-lands-where-it-is-meant
  - req-a-read-comes-from-where-it-is-meant
  - req-trees-never-mix
  - req-a-resolution-is-proven-by-read-back
  - req-nothing-a-copy-does-reaches-its-source
  - req-where-each-artifact-lands-when-driving
  - req-the-system-runs-in-a-tree-that-is-not-its-own
  - req-the-machine-state-sits-in-the-folder-that-is-open
  - req-only-a-file-with-its-own-door-is-withheld
inputs:
  - flow-dispatched-call
  - flow-worktree
  - flow-driven-tree
outputs:
  - flow-resolved-target
controls:
  - which record is bound
  - the path's own kind - method, record content, session state, repository root
  - which trees are legal targets at all - the one the system runs from, and the one it was pointed at
source_refs:
  - uc-take-a-step
  - uc-change-the-method-mid-walk
  - raid-risk-a-write-lands-in-the-wrong-tree-silently
---

## Rationale

Every call carrying a path has to answer one question before it can do
anything: which tree. Today that question is answered in several places,
by several rules, and none of them is written down.

SO THE FUNCTION EXISTS TO GIVE THE QUESTION ONE HOME. A decision made in
one place can be stated; a decision made in four cannot even be found.

## Why it is separate from the functions that act

Holding the method fans a file to many trees. Keeping the record writes a
record's own content to one. Both need to know WHICH tree, and neither
should decide it - or the two decide differently, which is exactly the
observed failure.

## Solution-neutral, checked

Could two honestly different designs both do this? Yes, and at least
three can. Bind the lane's root to the record, so the answer is always the
bound tree. Judge each path against the record, so a wrong one refuses.
Or resolve as today and NAME the result, so an ambiguous path stops being
silent.

THIS FUNCTION DOES NOT CHOOSE. It says the decision must be made and
stated, which is what leaves M4 a real space to enumerate.

## What i16 added, and why it belongs here rather than anywhere else

TWO ROWS ARRIVED AT THIS FUNCTION and both are the same question this function
already asks - which tree - with a new answer available.

`req-nothing-a-copy-does-reaches-its-source` says an operation may resolve into
the tree the system runs from or the tree it was pointed at, and NOWHERE ELSE.
That is not a check on what a write carries, which is `guard-a-write`'s
subject. It is a check on where the path lands, which is this one's.

`req-where-each-artifact-lands-when-driving` says which KIND of artifact
resolves to which tree: work to the driven product, method to the system's own
tree with the copy's overlay above it. The function's own controls already name
"the path's own kind", so this widens an existing control rather than adding a
notion.

AND THE SPAWN FACET IS NOT HERE. Producing a tree that contains no outward link
is `bring-forth-a-copy`'s, because that function makes the tree and this one
runs on every call afterwards.

## And one more row arrived with the affordance

`req-the-system-runs-in-a-tree-that-is-not-its-own` is this function's for the
same reason as the other two: it is a question about WHICH TREE, asked at the
moment the system starts somewhere it has never been.

WHAT IT ADDS THAT THE OTHERS DO NOT: the answer is not in the tree being asked
about. A driven project carries none of the system's method, so resolving there
means following a pointer recorded when the tree was made. That is a third
source of truth for this function to consult, beside the bound record and the
path's own kind.

AND THE POINTER ITSELF IS NOT THIS FUNCTION'S TO WRITE.
`bring-forth-a-project` records it at the moment it produces the tree. This
function only follows it.

## AND SAY SO is half the function

Naming the resolved tree is not reporting - it is the part that makes a
wrong answer findable. A resolution nobody can see is one nobody can
check, and a read taken in the wrong tree produces a confident conclusion
with nothing to contradict it.

## And i9 answered a question this function had been asking without a source

`req-the-machine-state-sits-in-the-folder-that-is-open` belongs here for the
same reason as the three rows before it: it is a question about WHICH TREE.

WHAT IT ADDS IS THE REFERENT. This function's controls already name the path's
own kind, and two of those kinds - session state and repository root - were
defined against a root nothing identified. A rule about what lives inside a
root can be satisfied by any root at all, including one the person never sees.

AND IT ADDS AN INVARIANT THIS FUNCTION HAD NEVER BEEN GIVEN. The answer must
not change when a branch is checked out. That is testable, it was never tested,
and it is the one property that makes the resolution trustworthy while a record
is bound.

THE CONTAINMENT HALF IS NOT THIS ROW'S AND NOT THIS FUNCTION'S NEW WORK.
`req-product-is-a-folder` has demanded it since i1.

## And the exclusion row, placed here with its limit stated

`req-only-a-file-with-its-own-door-is-withheld` says a direct read is withheld
only where a structured verb already serves that file, and served otherwise.

IT IS A QUESTION ABOUT WHAT A PATH NAMES, which is this function's subject. A
withheld file is one whose path names something the lane serves another way,
and the refusal has to name that way. This function's second half - AND SAY SO
- is exactly the part that makes such a refusal useful rather than blank.

THE LIMIT IS WORTH STATING RATHER THAN GLOSSING. This function is about which
TREE, and the row is about which FILE. They meet because both are answered
before anything is read, and they are not the same granularity.

IF THE DESIGN MILESTONE FINDS A BETTER HOME the move is cheap. What must not
happen is the row hanging off nothing, because a goal with no requirement and a
requirement with no function are the same failure at two levels.
