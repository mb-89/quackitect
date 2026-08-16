---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: cand-the-lifecycle-is-the-claim
type: "[[candidate]]"
name: "The lifecycle is the claim"
statement: "the claim owns the folder's lifetime, expires as a lease, and rides the iteration's own branch, so a dead holder needs nobody to notice"
picks:
  - "[[opt-the-branch-is-the-record]]"
  - "[[opt-the-folder-cannot-exist-without-a-live-claim]]"
  - "[[opt-a-claim-is-a-lease-not-a-lock]]"
  - "[[opt-the-claim-rides-the-iterations-own-branch]]"
  - "[[opt-worktree-holds-only-the-record]]"
---

## Why this one

NO FINDER PROPOSED IT. Three options arrived from three different lenses — a
heuristic, an analogy and a forced transformation — and none of the three
could see the other two. Put in one column they compose into a single
position, and the composition is the chart's own contribution.

## How it works

THE CLAIM IS THE ONLY MECHANISM. There is no call that makes a worktree and no
call that removes one.

- Entering writes a claim, carrying a duration, onto the iteration's own
  branch. Writing it is what materialises the tree — the record's own folder
  only, not the whole product.
- The walking machine renews the claim while it works, well inside the
  duration so a couple of missed renewals are survivable.
- A claim nobody renews expires. The tree goes with it, because the tree's
  existence was never an independent fact.
- Closing ends the claim, which ends the tree, and merges the branch.

THE SEAMS, and this candidate has more of them than any other because it
composes four options.

- CLAIM TO FILESYSTEM: the load-bearing seam. A claim is a small text file
  today and here it owns a directory, which is a much larger job for an
  artifact designed as a marker.
- CLAIM TO BRANCH: one ref answers both what exists and who holds it, so the
  list and the holders can no longer be different ages. One batched read
  serves both.
- LEASE TO CLOCK: expiry compares times across machines, and the literature
  this came from is emphatic that clocks jump.
- LEASE TO GIT: fencing did not need to transfer. A paused holder waking up
  and pushing is refused by git's non-fast-forward rule, so the stale writer
  is rejected by a mechanism we already have.

## What it costs

IT REOPENS AN OWNER RULING. An abandoned claim is released by a person's
judgment today, never by a timeout, and that was decided deliberately. This
candidate cannot be taken without revisiting it.

IT FIGHTS THE OFFLINE RULING. Work starts offline and the claim warns rather
than blocking — but a machine that cannot reach the remote cannot renew, so
its lease runs out and another machine may take the iteration. The desync the
owner accepted knowingly becomes automatic rather than rare.

A CLOCK BECOMES LOAD-BEARING, which nothing in this system currently is.

THE RECORD'S BRANCH CARRIES CLAIM CHURN FOREVER. A permanent record and a
transient claim have different lifetimes and one ref now holds both.

## What it leans on

- git answers the open question cheaply without a worktree
  ([[raid-asm-git-answers-open-without-a-worktree]], probed 2026-08-15)
- a lease's expiry is a safe way to reclaim, which the source domain supports
  and this project has never run
- clocks across machines are close enough for a duration comparison, which is
  the assumption the source literature warns hardest about
- the offline desync is acceptable when it happens automatically rather than
  rarely — an owner judgment this candidate needs and does not have
