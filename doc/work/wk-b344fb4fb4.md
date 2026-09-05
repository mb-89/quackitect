---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: commit carried another token
# where the token stands. The process owns these values.
status: open
---

## detail

A finding on wk-b75b6ebff3, notes become tracked tokens.

Commit 129d26f4, "A cloud box is held until its notes are in git", closes with "wk-b75b6ebff3, the owners ask, done". Its own change is four paths: src/engine/notesgohome.go, src/engine/notesgohome_test.go, the hook.go hunk, util/cage/cloud-runner.md. It carries eleven more, which are wk-754581f5e8, pulls are not liveness, another hand's work in the shared tree: src/engine/gone.go (new, 180 lines), gonebysilence_test.go (new), arrival.go, goneputsdown.go, investigate.go, investigate_test.go, windowisperactor_test.go (deleted), stays_test.go, takeback_test.go and doc/work/wk-754581f5e8.md.

    git log --oneline -- src/engine/gone.go
    129d26f4 A cloud box is held until its notes are in git

THE DAMAGE. That is the only commit gone.go has. The liveness rewrite has no commit of its own, so a reader tracing why the pull count stopped deciding gone lands on a message about notes, and a revert of the notes guard takes the liveness rewrite with it. `git log -p --grep=<id>` is how a reviewer is told to read a change, and here it hands back another token's diff mixed in with this one.

THE CHECK. Staging by name rather than by everything is the rule already; nothing enforces it. A pre-push or a commit check that refuses a commit naming one token id while touching a doc/work/*.md of a different open token catches the class cheaply.

## done when

- a check refuses a commit whose message names one token id and whose paths include doc/work/<another open id>.md
- the check is seen red against 129d26f4 and green against 43bb60dc
- the check runs where the other commit checks run, and where it lives is named

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

