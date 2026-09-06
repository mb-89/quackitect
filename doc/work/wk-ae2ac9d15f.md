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
status: closed
# who did the work step, so the verdict is never theirs
author: worker-hokusai
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - d9c900428e8708ca40c89c7faedac0aa422828a6
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - b60171ca95e4516b8f02de64f8394e1ab6f159d2
# how it ended. Only an ended token carries one.
disposition: done
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

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A commit stops carrying work nobody can attribute, because the gate now reads the record. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | Origin stops building. Sixty-seven of the last hundred and seventy-four commits import a package they do not carry. |  |
| [x] | the ask is small enough to review whole, or it is split first | One function, two call sites, one test. Five files, two hundred and nineteen added lines. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | All three decided. Two by the new Go test, one by the check it names. |  |
| [x] | the basics it stands on exist, or are minted first | WhatThisTokenWrote and gitVerbAt both exist at the tip. Neither was minted here. |  |

## evidence: step 2. do

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read as the pull sent it. It drove one test first, reddened on an assertion. |  |
| [x] | one test was written first and seen red for the reason expected | TestAStageOfAStrangersPathIsRefused reddened against a stub, on its assertion, never on a build failure. |  |
| [x] | the same test was seen green after the change, and named | The same test answers PASS. The package keeps the same eleven standing reds. |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | The began hash is not on this box. The change is commit 7caf3fbf on origin v4. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | A token of its own, wk-3fd684ca8a, landed as ac31d48d. It is a stage with no path. |  |

