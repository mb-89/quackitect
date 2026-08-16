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
  - req-a-resolution-is-proven-by-read-back
inputs:
  - flow-dispatched-call
  - flow-worktree
outputs:
  - flow-resolved-target
controls:
  - which record is bound
  - the path's own kind - method, record content, session state, repository root
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

## AND SAY SO is half the function

Naming the resolved tree is not reporting - it is the part that makes a
wrong answer findable. A resolution nobody can see is one nobody can
check, and a read taken in the wrong tree produces a confident conclusion
with nothing to contradict it.
