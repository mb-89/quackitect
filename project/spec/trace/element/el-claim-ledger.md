---
minted_in: i2-parallel-iterations-across-machines-seed
id: el-claim-ledger
type: "[[element]]"
statement: "Marks whose piece is whose: one claim per iteration, held until a person releases it."
kind: existing
realization: make
group: the-record-life
implements:
  - fn-run-a-governed-walk.share-the-pool
satisfies:
  - req-a-held-iteration-names-its-holder
source_refs:
  - cand-claims-branch
  - raid-dec-claim-rides-the-claims-branch
  - raid-dec-a-claim-ends-only-when-a-person-releases-it
  - raid-dec-the-worktree-hangs-off-the-claim
---

## What it does

The winner's claim mechanism as one element. Claiming writes
claims/<iteration>.md (minted machine id, UTC time) on the claims branch
and pushes in the same act; the remote's push acceptance is the lock, and
a rejected push is a lost race handled by re-fetch and re-pick. Offline,
the claim records locally and announces when the remote returns.

## How a claim ends

A PERSON ENDS IT, AND NOTHING ELSE DOES (owner ruling 2026-08-15). Release is
a force commit recording who and why. There is no timer, and age is never
evidence that a claim is abandoned.

AN IDLE MACHINE KEEPS ITS ITERATION. Five hours of silence changes nothing
about who holds it.

THE LEDGER OWNS THE WORKTREE'S LIFETIME. A folder exists because a claim is
live here, and it goes when the claim is released
([[raid-dec-the-worktree-hangs-off-the-claim]]).

## What crosses its boundary

The interfaces the element matrix mints for its flows. The record store opens
a record only over a standing claim.

## Realization concept

Git supplies the branch, the push semantics and the history. The claim verb
and the reconcile are ours.

## It opens itself

The ledger OPENS ITSELF (2026-08-13). A product whose claims branch does
not exist yet gets it minted by the first claim, so no product needs an
opening act somebody has to remember.
