---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: raid-risk-the-deletion-takes-work-the-rescue-step-missed
type: "[[raid]]"
kind: risk
statement: The deletion of 27 worktrees and 33 branches takes work the rescue step did not find, and nothing can bring it back.
owner: the engine maintainer
trigger: immediately before the deletion step runs, and again if the rescue step's file count differs from 14
status: open
impact: Permanent loss of iteration goals and visions written since 2026-07-26. Twelve records carry uncommitted edits between 1 and 182 lines, and two decision logs were never committed at all.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i34-one-tree-iterations-and-archives-live-on
  - note-b042c413e0e3
  - note-5a434b119c3b
weighs_with: none
weighs_against: none
---

## Why it is plausible rather than conceivable

THE MEASUREMENT WAS TAKEN ONCE, on 2026-08-16, and the tree moves. 1,868
uncommitted paths were hash-compared against trunk: 1,854 identical, 14 not.
The 14 are named with their line counts. But that count was true at one moment,
and every later session can add to it.

THE NOISE IS THE DANGER. Every stub worktree reports 19 to 81 dirty files, and
almost all of them are trunk's own content committed there by a reload. A real
edit sits in that noise looking exactly like the phantom around it. Nobody can
look at a worktree and tell whether it holds work — which is precisely the
check the deletion depends on.

IT HAS ALREADY NEARLY HAPPENED. note-8dd2d748e96e records work nearly lost
between the pool and a record, and i27's close refused because untracked files
stood where a merge wanted to land.

## Mitigation, and it is the iteration's own step order

- THE RESCUE RUNS FIRST and nothing destructive precedes it.
- THE COMPARISON IS RE-RUN at the moment of deletion, not trusted from this
  morning. If the count is not 14, the deletion stops and the difference is
  read.
- THE BRANCHES OUTLIVE THE WORKTREES by one step: worktrees go first, branches
  after, so a missed file is still recoverable from its branch until the last
  step.
- main AND v2 ARE NAMED AS SURVIVORS in the deletion step, because they appear
  in the same unmerged list as the iteration branches.
