---
minted_in: i12-performance-hold-the-one-second-rule-on-
id: raid-asm-method-write-reaches-every-tree
type: "[[raid]]"
kind: assumption
statement: A shared method write reaches every tree, so a method fix made inside a bound record also stands on trunk.
owner: the driving agent
trigger: a shared method file differs between trunk and a record's worktree
status: open
probe: "unprobed - the merge at this record's close is the check, and until then the engine's own worktree case is the only witness."
impact: i27 emitted the meth-consistency-sweep fix to this record's promotions. If the write stayed in the worktree alone, the promotion is not landed and the same emit repeats in the next record.
breaks_how_badly: abrasive
how_likely: conceivable
source_refs:
  - i27-the-lane-binds-to-the-record-a-bound-wal
  - i12-performance-hold-the-one-second-rule-on-
---

## Why it is open

The retired clause SE-C-134 was replaced by a resolution rather than
dropped. `project/guidance/refusals.md` states it plainly: shared method
resolves to the machine root whatever tree is bound. Shared covers
guidance, machines, the engine, the tests and the prompt layer.

The engine carries a test for the behaviour. `tests/worktree.test.ts`
names a case "a method write fans out to every tree; a record write
stays in its own".

## What was actually seen

A method card under `project/deliverable/machines/methods/` was patched
from inside this bound record on 2026-08-15.

`se_git status` in the bound worktree then reported that file modified.
That is consistent with a fan-out, and it is equally consistent with a
write that landed only in the worktree.

The two cannot be told apart from here. The lane's git runs in the bound
worktree, so it cannot report on trunk's working tree, and the lane's
file tools resolve `project/...` into the worktree as well.

## Why it is recorded rather than chased

The engine's own case asserts the behaviour and nothing observed
contradicts it. Recording the assumption costs one node. Chasing it from
inside a bound record costs an escape, which is the exact cost i27 was
built to remove.

The merge at close is the honest probe, and it is free.

## Probe

Let this record's close merge its branch to trunk.

A fan-out that worked leaves nothing to merge on the method card, because
trunk already carries the same bytes.

A write that stayed in the worktree arrives at the merge as a change, and
the card's history then shows the fix landing at the close rather than on
the day it was made.

Either way the answer is free, and it needs no escape from the bound
record to read it.
