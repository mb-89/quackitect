---
minted_in: i1
id: el-record-store
type: "[[element]]"
statement: Holds the records — what exists is read from the folders on trunk, in one batched call.
kind: existing
realization: make
group: the-record-life
implements:
  - fn-run-a-governed-walk.hold-the-work
  - fn-run-a-governed-walk.land-the-work
  - fn-run-a-governed-walk.close-a-record
  - fn-run-a-governed-walk.keep-the-archive
satisfies:
source_refs:
  - cand-thin-worktree
  - raid-dec-thin-tree
  - raid-dec-git-is-the-list-of-iterations
---

## What it does

The record life's substrate is ONE TREE. What records exist is answered by the
folders standing on trunk, so a clone that has trunk has every record.

Closing refuses loose ends and leaves the folder where it is. The archive lists
every closed record as it closed, read-only, from those same folders.

THIS SECTION SAID THE OPPOSITE UNTIL i6's SWEEP. It read "the substrate is git
branches" and "needs no folder anywhere", while the section below it recorded
i34 removing exactly that. One file, two answers, and the newer one was right.

## How the list is read

THE LIST READS FROM TRUNK and it reads in ONE batched call. Asking git once per
iteration measured 1004 ms over 33 branches against 58.7 ms batched
([[raid-dec-git-is-the-list-of-iterations]]). That measurement is why the read
is batched; since i34 it reads directories rather than refs, and the reason for
batching is unchanged.

## What moved away from it, and then came back

THE WORKTREE WAS TAKEN OFF THIS ELEMENT ON 2026-08-15, on the reasoning that a
tree hangs off a live claim and so belonged to the claim ledger.

THAT REASONING IS GONE WITH THE LEDGER (owner ruling 2026-08-16). i34 retires
the machine-locking specification whole and removes worktrees with it, so
there is no tree to hang off anything and no second element to own one.

WHAT THIS ELEMENT OWNS NOW is the record's folder on trunk, from the seed that
mints it to the close that leaves it standing.

Boundary: the interfaces the element matrix mints for its flows.

Realization: git supplies isolation and history; the store logic is ours.
