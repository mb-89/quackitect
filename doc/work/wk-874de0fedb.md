---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: git carries every check
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-dutilleux
claimed_at: "2026-09-05T16:06:14Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 98241a0f1b9e369b2576ce7181e9efb1935330fb
---

## detail

Nothing asks whether git carries the checks util/checks/battery.sh names, so a check that exists on one box and in no commit reads as green there and red everywhere else.

checks-live-in-the-method.mjs reads the names out of battery.sh and asks the disk about each one with existsSync. A file written but never committed answers yes on the box that wrote it. Over a clean archive of the same commit it answers no, and the battery prints two failures off the one gap: the for-loop's own `it is not there, so it did not run`, and this check's `<name> is in util/checks`.

That is what wk-0b4e0db513 was about. It reproduces at dd2fed69, which put a-refusal-names-a-legal-move into the list while the file stayed out of git:

    a-refusal-names-a-legal-move FAIL it is not there, so it did not run
    checks-live-in-the-method FAIL   0s    FAIL a-refusal-names-a-legal-move is in util/checks

It stopped reproducing at fc27d9b1, a commit titled `wk-885646032c began`, which carried the file in with work of another token. So the tree is green today by accident, and the next check written and not committed does the same thing again.

THE WRINKLE THE TAKER MEETS. The battery runs over a clean archive with no .git, and there git can answer nothing. A check that asks git has to say so and pass where there is no repository to ask, rather than failing every archive run.

## done when

- over a tree git can answer for, a check names every check battery.sh lists that git does not carry, decided by: in a clone where util/checks/<name>.mjs is present, untracked and named in battery.sh, the check exits non-zero and prints that name
- over a tree with no repository the same check exits zero, decided by: git archive HEAD unpacked into a folder holding no .git, the check run from that folder exits 0
- the check still exits zero over the tree as it stands, decided by: node util/checks/checks-live-in-the-method.mjs . from the root, exit 0

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one half added to one check, about thirty lines, and nothing else changed | read whole |
| [x] | every done-when line is decidable, and names the command where one decides it | all three name a root to run the check over: a clone carrying a listed check git does not hold, an archive with no repository, and a clean checkout | node the check, once per root |
| [x] | the basics it stands on exist, or are minted first | battery.sh names its checks in the one for-loop this file already reads, and git ls-files answers what git carries. Both were already here | git ls-files over util/checks answers 46 |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token, in the prompt | — |
| [x] | one test was written first and seen red for the reason expected | a clone with planted-and-uncommitted listed in battery.sh and left out of git: FAIL, it is in util/checks on this box and in no commit. Older halves green | exit 1 |
| [x] | the same test was seen green after the change, and named | checks-live-in-the-method. Over a clean checkout of HEAD plus this change, 0 failed. Over an archive with no repository, and one unpacked inside another checkout, the skip line | exit 0, three roots |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | checks-live-in-the-method.mjs gains the git half and two imports | git diff |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | the shared tree is red on another hand's untracked the-branch-head-builds.mjs, which the older half names. Theirs to land | left alone |

