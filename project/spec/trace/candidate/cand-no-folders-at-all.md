---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: cand-no-folders-at-all
type: "[[candidate]]"
name: "No folders at all"
statement: "no product gets a worktree; every record walks on trunk, one at a time per machine, and the folder lifecycle stops existing rather than being fixed"
picks:
  - "[[opt-no-worktrees-at-all-every-record-walks-on-trunk]]"
  - "[[opt-the-branch-is-the-record]]"
  - "[[opt-the-claim-rides-the-iterations-own-branch]]"
---

## Why this one

THE NULL OPTION, and the method says it is regularly the best on the chart and
has the lowest proposal rate of any option there is. Two independent finders
reached it — trimming asked what if the cluster does not exist, and SCAMPER's
Eliminate reached it separately.

ITS STRONGEST EVIDENCE IS THAT WE ALREADY RUN THIS WAY. i27 ruled on
2026-08-14 that this product is self-hosting and gets no worktree, its records
walking on trunk. The candidate generalises a standing exception rather than
inventing a mechanism, which REMOVES a special case.

## How it works

THE MACHINE HAS ONE TREE.

- Seeding pushes `it/<id>`. Unchanged.
- Entering claims the iteration on its own branch and checks trunk out at that
  point. No folder is created because there is no second folder.
- Leaving is checking out something else, after committing.
- Closing merges and ends the claim.
- Parallelism moves from one machine holding several trees to several machines
  holding one each, which is exactly what this iteration's goal argues is now
  cheap.

THE SEAMS ARE FEW, and that is the candidate's whole argument.

- ENTRY TO GIT: a checkout, not a worktree add. No new mechanism at all.
- CLAIM TO BRANCH: one ref answers what exists and who holds it.
- MACHINE TO MACHINE: unchanged. The claim ledger already prevents collision
  across machines, and this candidate simply stops trying to prevent it within
  one.

## What it costs

ONE MACHINE, ONE RECORD AT A TIME. Today a machine can hold several worktrees
and switch cheaply. This trades that for buying another machine.

WORK IN PROGRESS HAS NOWHERE TO SIT. A record left mid-walk must be committed
to its branch before the machine touches anything else, so "leave it for a
minute" becomes a commit.

A SWITCH COSTS WHAT THE TREE COSTS TO WRITE. The probe measured 1326 files and
593 ms to materialise a worktree; a checkout of comparable size is the same
order, and it lands on the person rather than in the background.

IT DOES NOT ANSWER THE CRASHED WALK EITHER — but it does not need to. There is
no folder to be stale. What remains held is the claim, which is the same
problem every candidate has and which only the lease answers.

## What it leans on

- git answers the open question cheaply without a worktree
  ([[raid-asm-git-answers-open-without-a-worktree]], probed 2026-08-15)
- one record at a time per machine is acceptable, which is a workflow judgment
  the owner has already made once for this product and not for others
- a person is willing to commit before switching, which is a habit rather than
  a mechanism and nothing enforces it
