---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: command guard reads bash
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
---

## detail

The command guard walks a shell command twice with two ideas of quoting, and its rows were written by the hand that wrote the simulation. An apostrophe inside a double-quoted argument opens a span the second pass believes in and bash does not. So a substitution after it is exempt from the write gate. Bash has a backslash state and no row carries a backslash. Three commands with escaped quotes drove past the exception. Consumes wk-d7f53103f0 and wk-df597db237.

## approach

One walk of the command in a quoting state machine taken from bash's manual, with the states named as the manual names them. Both questions, separators and substitutions, are read off that one walk. The test rows derive from the manual, one pair per state. A generator drives the guard's alphabet through bash itself with a did-a-file-appear oracle. The guard must refuse exactly what reached the filesystem and nothing else.

## done when

- one walk answers both questions and the two-pass code is gone: go test -C src/engine -run TestOneWalkAnswersEveryQuestion
- every state in bash's manual has a row, the backslash state included: go test -C src/engine -run TestTheRowsFollowTheManual
- the generator against real bash refuses exactly what reached the filesystem: go test -C src/engine -run TestTheGuardAgreesWithBash

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the approach is on the token before any work, as an interface or a shape a reader can disagree with |  |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the change is small enough to review whole, or it is split first | — |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | the change follows the approach on the token, or the token says why it departed |  |  |
| [ ] | se test --on this token answered ok, and what it ran is named |  |  |
| [ ] | the note says what changed and why, for a reader who was not here |  |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | reviewing was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

