---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-iss-the-archive-ruling-reverses-a-blessed-must-requirement
type: "[[raid]]"
kind: issue
statement: A standing must requirement says a closed record's folder stays on trunk. The owner's archive ruling says the opposite. One of the two has to be withdrawn, and only the owner can withdraw the requirement.
owner: the owner
trigger: the design milestone reaching the storage choice, or any attempt to build the fold
status: open
impact: The volume ceiling this iteration now rests on cannot be built while the requirement stands. Building it anyway would break a blessed must, which purges the iteration that broke it.
breaks_how_badly: crippling
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - req-a-closed-records-folder-stays-on-trunk
  - raid-dec-the-volume-is-bounded-by-one-open-iteration
  - "owner ruling 2026-08-26: an archived iteration is deleted from disc and read through git"
  - "measured 2026-08-26: no git rm, no cat-file and no mergeAndRetire anywhere in deliverable/engine"
  - "measured 2026-08-26: git grep over HEAD objects 114 ms against 161 ms over the worktree, at 20,000 files"
  - "i34 goal line: worktrees and record branches are gone — the archive ruling there was permissive"
  - "counted 2026-08-26: 56 paths naming an iteration folder from outside, across 49 files, 12 source and 37 prose"
---

## The two statements, side by side

THE REQUIREMENT, minted in i34, priority must, breaks_how_badly crippling:

> When a record closes, the engine shall leave that record's folder on trunk
> and shall not remove it from the working tree.

THE OWNER'S RULING, 2026-08-26: an archived iteration is deleted from disc, and
somebody reading one reads it through version control.

These cannot both hold.

## What i34 actually removed

THE MECHANISM THE RULING WANTS USED TO EXIST AND WAS DELETED ON PURPOSE.

The requirement's own detail names what went:

- `git rm -r -q --ignore-unmatch <dirRel>` inside `mergeAndRetire`.
- `git show <branch>:<rel>` for reading a closed record back.
- The batched `git cat-file --batch` that made that read affordable.

CONFIRMED AT THE CODE 2026-08-26. A search of `deliverable/engine` for
`mergeAndRetire`, `git rm` and `cat-file` returns nothing. All three are gone.

## Why i34 removed it

THE REASON IS ON THE REQUIREMENT AND IT IS NOT A SMALL ONE. Reading a closed
record out of version control was the retrieval path i34 existed to delete.

I34 ALSO WROTE DOWN THE COST IT WAS ACCEPTING: closed records stay in the
working tree forever, so the tree grows with every iteration.

MEASURED TODAY, 2026-08-26: 68 folders, 1,312 files, 9.7 MB. That is the cost
i34 accepted, two years of iterations later.

## What has changed since

I34 PRICED THE TREE AT ITS EVIDENCE FILES ALONE. Work tokens were not a thing
yet.

UNDER WORK TOKENS THE SAME TREE CARRIES 320 TO 402 MORE FILES PER ITERATION.
The cost i34 accepted is roughly twenty times larger than the one it measured.

THAT IS THE ARGUMENT FOR REOPENING, and two later findings strengthen it.

I34'S GOAL WAS THE WORKTREE SYSTEM, NOT THE ARCHIVE. Its goal line reads "One
tree: iterations and archives live on disk on trunk, worktrees and record
branches are gone". The owner's ruling in that record is permissive rather
than demanding: "We CAN keep the archive on disk too."

THE ONE STATED REASON FOR KEEPING IT THERE WAS SEARCHABILITY. i34 wrote it
down: "Closed records stay searchable, because they stay on disk. That was the
reason for keeping the archive there."

THAT REASON IS NOW FALSIFIED. Measured 2026-08-26 at 20,000 files: `git grep`
over HEAD objects took 114 ms against 161 ms over the worktree. Reading the
archive out of git is not slower, it is faster. The lane's own `se_file_search`
already takes a `ref` and dispatches to git grep, so the capability exists
today and needs no building.

## What has to happen

THE OWNER REOPENS THE REQUIREMENT, or this iteration's volume ceiling does not
get built.

NOBODY ELSE CAN. A blessed must requirement is not the walker's to withdraw.
