---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-dec-git-is-the-list-of-iterations
type: "[[raid]]"
kind: decision
statement: What iterations exist is read from git branches, never from folders on disk, so a machine sees work it has never downloaded.
owner: the owner
trigger: superseded only, or the first list read that misses an iteration a person can see in the remote
status: decided
breaks_how_badly: fatal
how_likely: conceivable
source_refs:
  - req-work-starts-without-a-reachable-remote
  - opt-collect-the-list-before-the-look
  - raid-asm-git-answers-open-without-a-worktree
  - raid-no-iterations-are-visible-without-a-reachable-remote
---

## What was decided

THE LIST COMES FROM BRANCHES. A machine that has never touched an iteration still sees it, because the branch is what says it exists.

ENTERING IS WHAT DOWNLOADS THE DATA. Seeing an iteration costs a branch read. Working on it costs the tree.

WHAT IT REPLACES: `existsSync` on a folder, which could only ever report what this machine happened to have already.

## Why

A SECOND MACHINE COULD NOT SEE THE FIRST MACHINE'S WORK. That is the whole failure. An iteration seeded elsewhere was invisible until somebody copied a folder across, which is not a mechanism.

THE OWNER PUT IT PLAINLY on 2026-08-15. A seeded iteration another machine put on git should be selectable without downloading its tree. Entering it is what fetches the data.

## What it costs, measured rather than guessed

THE PROBE RAN ON 2026-08-15, over 33 branches.

- `existsSync` per iteration: 12.6 ms.
- One batched `cat-file`: 58.7 ms.
- `git show` per iteration: 1004 ms.

SO IT HOLDS ON ONE CONDITION: the reader BATCHES. Asking git once per iteration is eighty times slower than asking once for all of them, and it breaks the one-second rule on its own.

A SECOND CONDITION: the reader takes the record from trunk, not from the branch tip. A branch tip carries that iteration's own edits, so reading the list from tips makes every row report a different moment.

## What is NOT decided here

WHETHER THE LIST IS PREFETCHED OR READ ON DEMAND. The owner raised streaming the detail in the background after a first cheap peek, and that is an implementation question this decision does not settle.

## The offline case, settled elsewhere and restated

WORK STARTS WITHOUT A REACHABLE REMOTE. The claim fails gracefully and warns. Desync is accepted rather than prevented.

## Rejected options

- `existsSync` ON A FOLDER, which is what stood before at engine/iterations.ts.
  - It reports only what this machine already downloaded.
  - So a second machine's work is invisible.
- `git show` PER ITERATION. Rejected on measurement rather than taste: 1004 ms over 33 branches, against 58.7 ms for one batched call.
- READING EACH ITERATION'S RECORD FROM ITS OWN BRANCH TIP. Rejected because a tip carries that iteration's own edits, so every row in the list would report a different moment.
- REQUIRING A REACHABLE REMOTE BEFORE THE LIST IS SHOWN.
  - Rejected because work must start offline.
  - The claim fails gracefully and warns instead.

## Consequences

- THE READER MUST BATCH. One git call answers for every iteration, and asking per iteration breaks the one-second rule on its own.
- THE LIST READS THE RECORD FROM TRUNK, never from branch tips.
- A MACHINE SEES WORK IT HAS NEVER DOWNLOADED. Entering is what fetches the tree.
- AN ARCHIVED ITERATION NEEDS NO FOLDER ANYWHERE. The archive reads from git like everything else.
- AN OFFLINE MACHINE SHOWS A STALE LIST and says so. It does not refuse to show one.
- A CLAIMED ITERATION APPEARS GREYED WITH ITS HOLDER, rather than being hidden from the list.
