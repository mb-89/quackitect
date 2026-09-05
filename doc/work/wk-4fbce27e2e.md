---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: lint reads prose held
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-hawthorn
claimed_at: "2026-09-05T16:19:15Z"
---

## detail

se lint is red on five findings and not one of them is a hold. holdersIn in src/engine/lint.go reports these lines, each a sentence about how something works:

wk-130f64f596: "the class is held rather than the instance". wk-9b4f341835: "two tokens held by other actors and one held by the caller". wk-b344fb4fb4: "A cloud box is held until its notes are in git", a commit title it quotes. wk-cad3534a4e: "Name src/engine/displayrefusal_test.go as where it is held".

Three come through the branch that flags "is held" with no by after it, on the rule that a token said to be held claims a hold without naming anybody. The fourth comes through namesSomebody answering true for "other".

The rule was narrowed once for exactly this. Its own comment says seven findings stood, none of them a hold, and that a lint answering mostly noise is one a reader learns to run past. It is at five of five now, and the battery is red on it.</detail>
<parameter name="proposed_action">Narrow it again and add each line to the clean map in holderinprose_test.go, which is where the last narrowing recorded what stood.

## done when

- se lint answers clean on this tree
- TestATokensProseNamesNoHolder still fails if a note says a token is held by a named actor

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

