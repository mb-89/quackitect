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
