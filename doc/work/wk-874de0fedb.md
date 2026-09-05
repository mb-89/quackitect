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

