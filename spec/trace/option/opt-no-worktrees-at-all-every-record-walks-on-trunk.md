---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: opt-no-worktrees-at-all-every-record-walks-on-trunk
type: "[[option]]"
statement: No product gets a worktree. Every record walks on trunk, one at a time per machine, and the whole folder lifecycle stops existing rather than being fixed.
cluster: the-record-life
found_by: without
source: "trimming the-record-life: what if the worktree does not exist, and who does its job"
---

## Mechanism

THE MACHINE HAS ONE TREE. A record is entered by claiming it and checking
trunk out at the right point; leaving it is checking out something else.
Parallelism moves from one machine holding several trees to several machines
holding one each.

- Seeding pushes a branch. Unchanged.
- Entering claims and switches the single tree. No folder is created.
- Closing merges and releases the claim. No folder is removed.
- Which iterations exist is answered from git, exactly as the other options
  have it.

## Who takes over the job

ANOTHER CLUSTER, and it is the claim. What a worktree provides is the
guarantee that two pieces of work do not collide. The claim ledger already
provides that guarantee across machines, so on a single machine the answer is
that the machine works one record at a time.

## What it sheds

THE ENTIRE CLASS THIS ITERATION EXISTS TO FIX. No stale folder, no folder that
means nothing after a crash, no sweep, no close-time removal, no
materialise-on-entry, and no second definition of what open means.

IT ALSO SHEDS THE i27 EXCEPTION. That ruling already says this product is
self-hosting and gets no worktree, and its records walk on trunk. This option
is that ruling generalised from one product to all of them, which removes an
exception rather than adding a mechanism.

## What it costs

ONE MACHINE, ONE RECORD AT A TIME. Today a machine can hold several worktrees
and switch between them. This trades that for buying another machine, which is
exactly what i28's own goal argues is now cheap.

AND A SWITCH IS NOT FREE. Checking trunk out at another point costs whatever
the tree costs to write, where opening another folder cost nothing. On a large
tree that is a real wait, and it lands on the person rather than in the
background.

WORK IN PROGRESS HAS NOWHERE TO SIT. A record left mid-walk must be committed
to its branch before the machine can touch anything else, which turns
"leave it for a minute" into a commit.

## Why it belongs on the chart rather than in a footnote

IT IS THE NULL OPTION FOR THIS ITERATION'S CENTRAL MECHANISM, and the null
option is regularly the best one on the chart. Every other option here refines
how folders are created and removed. This one asks whether the folder was ever
the right idea.

THE EVIDENCE THAT IT IS NOT ABSURD is that this product already runs this way,
by i27's ruling, and has done since 2026-08-14.
