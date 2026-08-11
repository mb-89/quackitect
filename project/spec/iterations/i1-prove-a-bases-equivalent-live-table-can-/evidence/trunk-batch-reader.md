---
form: trunk-batch-reader
by: agent
signed_off: 2026-08-11T10:11:17.748Z
authors: agent
files:
---

# Evidence form / trunk-batch-reader

## current_situation

The one seeded chunk carries the promoted spike output. The batch-reader shape was landed with the experiment's fold-back; this walk records it as the chunk's realization.

## built

Already built — the promotion's shape stands in the tree: project/deliverable/engine/expmachine.ts reads every missing trunk record through ONE long-lived `git cat-file --batch` call, exactly the shape exp-trunk-read-cost measured (a spawn per read ruled out). No new code was owed by this chunk; it enters as the pre-verified promotion.

## follow_up

build-steps closes; trace-design sweeps the design trace next.

## anything_else

