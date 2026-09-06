---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: engine collisions still unanswered
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-linden
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - d8d4b0495a4403083540f631411209ff752f80d5
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 42a0c990a9d1806170713402f33ab93dcc5f7391
# how it ended. Only an ended token carries one.
disposition: done
# what it became. They have to exist.
successors:
  - "[[wk-794523a1b5]]"
---

## detail

From the verdict on wk-40abb881a7, engine splits at seams.

That token exists to end collisions in the one flat src/engine namespace: firstLine, mustJSON and fs against the io/fs import, three build failures. Its fourth done-when line reads: firstLine, mustJSON and fs are no longer one namespace problem, decided by se find --regex "func (firstLine|mustJSON)" answers one package each.

That line cannot go red. Go already refuses two definitions of one name in one package, so every name in the tree answers one per package whatever anybody does. Run today it answers firstLine at src/engine/hook.go:1418 and util/setup/main.go:212, mustJSON at src/engine/lsp_test.go:177 and src/viewer/model_test.go:417: the same answer as before the split, with both engine definitions still in the flat package. fs against io/fs is untouched.

So the token closed green on a line that guards nothing. The eleven groups did move, and twelve packages under src/engine/internal hold 16 files and 2058 lines, but the flat package is 85 non-test files and 27508 lines against the 80 and 23193 the detail measured.

Wanted is a line that can fail: the flat package's size, written down where the next split has a baseline to beat.

## proposed action

Add a check under util/checks that counts the non-test .go files and lines directly in src/engine, excluding internal, and fails when either rises above the number recorded when the check is written. Then a token meaning to shrink the namespace has a line that can go red, and one that grows it says so out loud.

## done when

- a check names the flat src/engine file and line count and fails when it rises, decided by: the check answers ok, and answers not ok when its recorded number is lowered by one
- the check is in the battery, decided by: sh util/checks/battery.sh names it
- the recorded number is what the tree holds today, decided by: the check's number equals the count of non-test .go files directly in src/engine

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | Three files: the check, one name in the battery's list, and the note for the finding. | 3 files |
| [x] | every done-when line is decidable, and names the command where one decides it | Line one is the check run twice, once with its number lowered by one. Line two is the battery, which names it in the report. Line three is the count read off src/engine with ls and wc. | 3 lines |
| [x] | the basics it stands on exist, or are minted first | The battery, the check folder and checks-live-in-the-method are all in the tree, so nothing had to be minted first. | the battery |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token read. Rule 12 is why the number was lowered first, and rule 11 left the unlisted checks to their own token. | work-token |
| [x] | one test was written first and seen red for the reason expected | With 88 recorded against 89 files it answered FAIL and exit 1. | 1 FAIL |
| [x] | the same test was seen green after the change, and named | With the tree's own numbers it answers 0 failed, exit 0. The battery reports it ok, among 22 failures this change did not make. | 0 failed |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Not this clone. It landed as 93ad4c16, and 1c41e85b records the count after two commits in src/engine. | 1c41e85b |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Its own token, wk-794523a1b5: two checks sit in util/checks that the battery names nowhere. | wk-794523a1b5 |

