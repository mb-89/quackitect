---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a criterion already green
# where the token stands. The process owns these values.
status: open
---

## detail

A finding on wk-40abb881a7. Its fourth done-when line is: firstLine, mustJSON and fs are no longer one namespace problem: se find --regex "func (firstLine|mustJSON)" answers one package each. Run at the token's first began, 28abf9f4, the search answers src/engine/hook.go:1420, src/engine/lsp_test.go:177 and src/viewer/model_test.go:417. Run at head it answers the same three lines, byte for byte. The expr move touched no file among them, so the criterion was green before the work started and will stay green through every remaining move. A criterion that cannot go red proves nothing about the split it is written against, and this one is the only line on the token that names the collision the detail opens with.

## proposed action

Either drop the line from wk-40abb881a7 and put it on the token that actually splits hook.go and lsp_test.go, or rewrite it so it can fail: name the package each definition has to end up in, so the search answers a path under src/engine/internal rather than src/engine. Whichever is chosen, run the search once before the work to record the red.

## done when

- the fourth done-when line of wk-40abb881a7 either names a package under src/engine/internal or is gone: se find --regex "firstLine|mustJSON" --path doc/work/wk-40abb881a7.md
- if the line is kept, it was seen red before the work: the red is written in the step 2 evidence with the command that produced it

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

