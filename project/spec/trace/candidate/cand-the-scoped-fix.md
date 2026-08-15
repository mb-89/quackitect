---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: cand-the-scoped-fix
type: "[[candidate]]"
name: "The scoped fix"
statement: "git answers what exists, the folder lives from entry to close, and everything else stays where it is"
picks:
  - "[[opt-the-branch-is-the-record]]"
  - "[[opt-seeds-ride-their-stub-branch]]"
  - "[[opt-worktree-per-record]]"
---

## Why this one

It is the design this iteration arrived with, drawn as a line so the others
are measured against something rather than assumed better than it. It changes
one reader and two lifecycle moments and touches nothing else.

## How it works

THE READER MOVES AND NOTHING ELSE DOES. `itList` stops asking the disk whether
a worktree exists and reads each iteration's status from its own branch,
batched in one `git cat-file` pass over `refs/heads/it/*`. Seeding stops
creating a folder. Entering creates one from the branch. Closing commits or
refuses, then removes it. A one-time sweep clears the folders earlier closes
left.

THE SEAMS, which is where a composed candidate earns its description.

- READER TO CLAIM LEDGER: unchanged. The claims branch still answers who holds
  what, fetched separately, so the list and the holders remain two reads that
  can be different ages.
- ENTRY TO FILESYSTEM: one new call at one moment. Materialising costs a
  measured 593 ms for 1326 files, which is inside the budget for an act
  somebody deliberately triggers.
- CLOSE TO GIT: the close gains a commit-or-refuse step before removal, which
  is the only place this candidate can destroy work and the only place it
  guards.

## What it costs

THE CRASHED WALK IS NOT ANSWERED. A machine that dies mid-iteration leaves a
folder no close will ever remove, and nothing expires the claim, so the
iteration stays held by a machine that no longer exists. On an ephemeral cloud
host that ending is the expected one, which is exactly this candidate's blind
spot.

THE SWEEP IS A MIGRATION THAT MUST BE REPEATED. Because closes can still be
missed, the folders can still accumulate, so the sweep is not one-time in
practice.

TWO READS STAY TWO READS. Existence and holder are fetched separately and can
disagree about how fresh they are.

1326 FILES PER ENTRY. The whole product is written to materialise a record
that needs a few dozen files.

## What it leans on

- git answers the open question cheaply without a worktree
  ([[raid-asm-git-answers-open-without-a-worktree]], probed 2026-08-15: 58.7 ms
  batched over 33 branches, against 12.6 ms for the disk test)
- a close that removes the folder does not destroy uncommitted work, which
  holds only because the close commits first
  ([[raid-a-close-that-removes-the-folder-destroys-uncommitted-work]], graded
  fatal and expected)
- every walk ends through the close
  ([[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]]) — and this is
  the assumption the candidate cannot support, since it has no other mechanism
  when the walk does not
