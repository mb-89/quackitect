---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: req-entry-levels-the-record-tree
type: "[[requirement]]"
statement: When a record is entered, the engine shall bring its tree level with the method source and commit what it brought, before any work starts in it.
kind: functional
verify_method: test
breaks_if_removed: A walk begins in a tree that does not compile, and every check run inside it judges a mixture nobody assembled on purpose.
breaks_how_badly: crippling
refines:
  - uc-open-an-iteration
source_refs:
  - "measured 2026-08-13: 24 of 28 trees stood 16 method files behind trunk, uncommitted"
  - "engine/paths.ts: a partial sync is worse than none"
  - raid-risk-a-write-lands-in-the-wrong-tree-silently
priority: must
---

## Detail

TWO FAULTS MEET HERE and neither is fixable without the other.

THE MIRROR WAS PARTIAL. A method file is copied when it is WRITTEN, so
anything edited while a tree was not open stays behind. Measured: every
worktree sixteen files behind, one of them holding a new session module
against an older form module, which does not compile.

THE MIRROR WAS UNCOMMITTED. Only the bound tree was ever swept up, and
only at a reload, so every other tree accumulated it. That made the
pre-commit hook judge a hundred files unrelated to the commit, let any
unscoped commit sweep the mirror onto a record's branch, and left a peer
cloning the branch with none of it.

LEVELLING WITHOUT COMMITTING leaves the hook judging unstaged work.
COMMITTING WITHOUT LEVELLING commits something that does not build.
Both, in that order, or neither.

## Why entry rather than the write

One commit per fanned-out file per tree would make a 170-file sweep
across twenty trees 3400 commits. Entry happens once per record, and is
exactly when the tree starts mattering to somebody.

## Behaviour

No model wanted. It is a precondition on one act, not a lifecycle.
