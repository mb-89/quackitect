---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: req-a-method-change-reaches-every-tree
type: "[[requirement]]"
statement: When method is changed from anywhere, the engine shall land that change in trunk and in every open worktree in one act, so no walk has to leave its record to make it.
kind: functional
verify_method: test
breaks_if_removed: An engineer cannot change the machine while walking it, so iterations cannot be used to develop the system that runs them.
breaks_how_badly: fatal
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - sty-improve-the-machine-mid-walk
  - "owner ruling 2026-08-06: a method change lands in trunk and every open worktree at once"
  - "owner ruling 2026-08-13: we change the machine in walks, so we need to change method in walks"
  - "measured 2026-08-13: one method edit cost five calls, four of which did no work"
priority: must
---

## Detail

THIS PRODUCT DEVELOPS ITSELF. An iteration here exists to change the
machine, and the change is made while walking the machine it changes.

So the blocking is not an inconvenience inside the process. It
forecloses the process's main use, which is why this row is a must and
not a should.

MEASURED: eight step-outs in one session on 2026-08-13, three of them
inside a single verification. One edit cost five calls and four of them
did no work.

## What this does NOT say

It does not say the guard against a method write from a bound record
disappears. That guard exists because a method write once fanned a
record's stale copy over trunk and deleted two lane verbs.

THE GUARD RETIRES ONLY WHEN THIS ROW IS MET, never before. Removing it
without the mechanism removes the cost and the protection together.

## The direction that matters

TRUNK IS THE SOURCE AND NEVER THE DESTINATION for a stale copy. The fan
must not let an old tree push its version outward, which is exactly the
2026-08-07 failure.

## Behaviour

A SEQUENCE EARNED ITS PLACE HERE and is owed at design: one write, one
fan, N trees, and a partial fan is worse than none - an unsynced tree is
old and self-consistent, a half-synced one does not compile. The
ordering and the failure handling are the whole risk.
