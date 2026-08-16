---
minted_in: i1
id: tsp-close-and-land
type: "[[test-spec]]"
statement: A close refuses loose ends and serves its findings, verified by test over the close path.
method: "test"
verifies:
  - "req-close-refuses-loose-ends"
  - "req-close-serves-its-findings"
  - "req-close-leaves-trunk-clean"
  - "req-land-demands-fresh-green"
  - "req-reject-names-the-redo"
  - "req-trees-never-mix"
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

## What i34 removed from this spec

THE STATEMENT CARRIED TWO CLAIMS, AND ONLY ONE OF THEM WENT. Landing "as one
merge or none" is gone with the record branches. "The two trees never mixing"
is not, and telling them apart took a round trip.

req-land-is-one-piece IS RETIRED. There is no landing act left to be atomic —
work is written on trunk from the start.

req-trees-never-mix STANDS AND IS STILL VERIFIED HERE. i34 retired it in error
for half a day, then restored it. Its two trees are the VEHICLE OVERLAY and the
ENGINE, never a record's branch and trunk, and i34 touched neither.

THE APPROACH SECTION ABOVE HAD SAID SO ALL ALONG, which is how the error was
caught the second time. It names "the no-writes-across-trees law of the overlay
seam" as one of the four claims this spec defines. Dropping the row from
`verifies:` left that sentence describing a claim the frontmatter no longer
made — a spec disagreeing with itself, in two places a reader never compares.

THERE IS NO LANDING ACT LEFT TO BE ATOMIC. Work is written on trunk from the
first keystroke, so it is landed continuously rather than in one merge.

WHAT SURVIVES IS THE CLOSE, and it is the half that was always about judgment
rather than plumbing: a close refuses loose ends, and it serves its findings.
