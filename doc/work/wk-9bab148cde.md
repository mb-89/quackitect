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
status: open
claimed_by: 547b9365/reviewer-quince
claimed_at: "2026-09-05T15:47:10Z"
---

## detail

From the verdict on wk-40abb881a7, engine splits at seams.

That token exists to end collisions in the one flat src/engine namespace: firstLine, mustJSON and fs against the io/fs import, three build failures. Its fourth done-when line reads: firstLine, mustJSON and fs are no longer one namespace problem, decided by se find --regex "func (firstLine|mustJSON)" answers one package each.

That line cannot go red. Go already refuses two definitions of one name in one package, so every name in the tree answers one per package whatever anybody does. Run today it answers firstLine at src/engine/hook.go:1418 and util/setup/main.go:212, mustJSON at src/engine/lsp_test.go:177 and src/viewer/model_test.go:417: the same answer as before the split, with both engine definitions still in the flat package. fs against io/fs is untouched.

So the token closed green on a line that guards nothing. The eleven groups did move, and twelve packages under src/engine/internal hold 16 files and 2058 lines, but the flat package is 85 non-test files and 27508 lines against the 80 and 23193 the detail measured.

Wanted is a line that can fail: the flat package's size, written down where the next split has a baseline to beat.</detail>
<parameter name="proposed_action">Add a check under util/checks that counts the non-test .go files and lines directly in src/engine, excluding internal, and fails when either rises above the number recorded when the check is written. Then a token meaning to shrink the namespace has a line that can go red, and one that grows it says so out loud.

## done when

- a check names the flat src/engine file and line count and fails when it rises, decided by: the check answers ok, and answers not ok when its recorded number is lowered by one
- the check is in the battery, decided by: sh util/checks/battery.sh names it
- the recorded number is what the tree holds today, decided by: the check's number equals the count of non-test .go files directly in src/engine

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

