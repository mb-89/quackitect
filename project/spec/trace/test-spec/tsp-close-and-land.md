---
minted_in: i1
id: tsp-close-and-land
type: "[[test-spec]]"
statement: A close refuses loose ends, serves its findings, and lands as one merge or none, with the two trees never mixing, verified by test over the close and land paths.
method: "test"
verifies:
  - "req-close-refuses-loose-ends"
  - "req-close-serves-its-findings"
  - "req-close-leaves-trunk-clean"
  - "req-land-is-one-piece"
  - "req-land-demands-fresh-green"
  - "req-reject-names-the-redo"
  - "req-diverged-trees-reported-never-merged"
files:
  - "tests/editsafety.test.ts"
  - "tests/gitlane.test.ts"
  - "tests/worktree.test.ts"
---

## Scope

The way work leaves a record: the close's refusals, the atomic merge,
the stray-committing law, and the seam between the record's tree and
trunk. The lifecycle before the close is [[tsp-record-lifecycle]].

## Approach

Integration level against real git fixtures: conflicts forced on
purpose, unconfirmed reports refused, strays committed and named.
Fault-based around the merge (conflict, dirty trunk, diverged source).
Four claims are DEFINED here ahead of their cases and land as named
cases in editsafety.test.ts and gitlane.test.ts with the builds that
close them: the land gate's fresh full battery, the reject naming each
round to redo, the diverged-compiled-source report at reload, and the
no-writes-across-trees law of the overlay seam.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: the close is atomic: a conflicting merge
aborts and refuses typed, the root stands clean; closing on an
unconfirmed report is refused, and the override is recorded; the close
COMMITS the trunk's strays rather than refusing, and says which.
