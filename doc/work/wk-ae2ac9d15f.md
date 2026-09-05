---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a stage carries strangers
# where the token stands. The process owns these values.
status: open
---

## detail

Nothing stops an agent staging a file its token never wrote, and that is how a commit comes to carry work nobody can attribute and, twice now, an import whose package the same commit does not carry.

The engine has no commit path to the working branch. snapshot.go stages into a temporary index for refs/se/steps, claim.go builds its own index, and the archive never touches the branch on purpose. Every commit on v4 is made by an agent running git by hand, so the place a stage can be judged is the gate that already sees every command an agent runs.

The engine knows what a token wrote: se apply records each write in the undo journal under the token's id, and the engine snapshots the tree at every take-up and put-down.

Measured on this branch, from dd2fed69 to HEAD: 174 commits, 67 of which import a package under src/engine/internal that the same commit does not carry. By package, logbook 63, yaml 5, version 4. Each is a stage that took one half of another hand's change.

The smallest case: with a token in hand, stage a file no verb of that token touched.

## done when

- staging a path no verb of the token in hand wrote is refused, and the refusal names the path, decided by: with a token taken up, git add on a file that token never wrote is refused and prints that file's path
- staging a path the token wrote goes through, decided by: git add on a file se apply wrote under that same token exits 0
- the refusal names a move the gate admits, decided by: node util/checks/a-refusal-names-a-legal-move.mjs from the root exits 0

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

