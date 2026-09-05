---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a guessed parser
# where the token stands. The process owns these values.
status: closed
author: worker-kest
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 4eac77ecb80e395735f4e69e6fde8bb3338037d7
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - f60cf06da4cdd1ca3238534089762a82281b45c0
# how it ended. Only an ended token carries one.
disposition: dropped
# why it was dropped
reason: "The change this token asks for is already in the tree, so there is nothing left to do and no red to watch. theQuotings in hook.go walks the command once and keeps double-quoted spans live for the substitution scan, which is exactly the split the detail asks for, and substitution_test.go already carries every negative case in both quoting forms plus a bash oracle that asks the shell. The detail is also stale in its second half: it says hook.go skips WriteNeedsAToken for an exempt command, and that exception is gone. hook.go now says there is no exception for the engine's own commands any more. WriteNeedsAToken refuses every Bash call whatever it holds and whatever it says. So the criterion \"se pull with double-quoted $() gets WriteNeedsAToken\" is true of every command, including the harmless one. No change to the quoting walk can decide it or make it go red. I left src/engine/enginexception_test.go in the tree. It pins the old stripper as a local copy. It asserts it is blind to a live substitution where theQuotings sees it. It asserts the write gate refuses the dangerous and harmless commands alike. So a re-added exception or a regression to the old reading fails a check. Both tests ran ok before an unrelated break: retro_test.go hands Retro a map where it now takes []Transcript, so the package will not build at the moment, which is foreign to this change. wk-15c3f409dc carries this token's detail word for word and still stands open. It wants the same drop."
---

## detail

runsTheEngine in src/engine/hook.go exempts a Bash command whose first word is the engine and whose text, after withoutQuotedSpans, carries no separator and no $(. withoutQuotedSpans strips single-quoted and double-quoted spans alike, but Bash expands $( ) and backticks inside double quotes. So `se pull --actor x "$(...)"` is exempt and hook.go:585 skips WriteNeedsAToken for it. Fix: split withoutQuotedSpans by quoting form, stripping only single-quoted spans and leaving double-quoted spans live for the substitution check. Write every negative case in the guard's suite a second time in each quoting form, and the cases that must stay allowed too. Not wk-45d8a60d82, where the list was wrong: here the list is right and the scanner never sees the text.

## done when

- Guard strips only single-quoted spans. Double-quoted stay live.
- Test: se pull with double-quoted $() gets WriteNeedsAToken, red then green.
- Negative cases in both quoting forms.

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one new test file, no shipped source changed | enginexception_test.go |
| [ ] | every done-when line is decidable, and names the command where one decides it | no: line 2 names WriteNeedsAToken, which refuses every Bash call whatever it says, so no parser change decides it | gate.go |
| [x] | the basics it stands on exist, or are minted first | theQuotings and WriteNeedsAToken both exist | hook.go, gate.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | rule 12: a check that will not go red is the finding | work-token.md |
| [ ] | one test was written first and seen red for the reason expected | no: already fixed in the tree, no red available. The old stripper is pinned in the test and asserted blind | enginexception_test.go |
| [x] | the same test was seen green after the change, and named | TestTheWalkKeepsDoubleQuotedSubstitutionsLive, TestTheWriteGateKeepsNoEngineException | se_test |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began 4eac77ec, one file added | enginexception_test.go |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | no: wk-15c3f409dc repeats this detail, still open | wk-15c3f409dc |

