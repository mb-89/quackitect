---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: shared tree reads stale
# where the token stands. The process owns these values.
status: open
---

## detail

The working tree several agents share falls behind the branch and nothing brings it forward, so every agent reads stale source and some of them redo work that is already landed. Measured here at 20:40. The tree stood 134 commits behind origin/v4 with two of its own unpushed. Each agent commits from the shared tree and pushes through a detached worktree, so pushes land while the shared checkout never advances. THE COST, MEASURED. I took wk-89847112fe, read tests.go in the shared tree, found no fallback for a snapshot this box never had, wrote theSnapshotHere with its test, and only found on the push that another agent had landed theSnapshotToDiff, the same function, earlier. One token's work duplicated because the tree I read was behind. A fast-forward is refused: untracked files collide, one of them carrying a live claim written minutes before, and the tree diverges as soon as another agent commits. So bringing it forward needs a door that keeps live claims and in-flight files, not a merge somebody runs by hand.

## done when

- an agent reading the shared tree can tell it is behind: a pull answers how far behind origin the working tree stands
- the number is measured rather than assumed, decided by a test over that answer with a tree set two commits behind

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

