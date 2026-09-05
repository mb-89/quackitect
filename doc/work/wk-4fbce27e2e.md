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
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3d9503c9532c8863e33a3c5510fc83dbebb4c720
---

## detail

se lint is red on five findings and not one of them is a hold. holdersIn in src/engine/lint.go reports these lines, each a sentence about how something works:

wk-130f64f596: "the class is held rather than the instance". wk-9b4f341835: "two tokens held by other actors and one held by the caller". wk-b344fb4fb4: "A cloud box is held until its notes are in git", a commit title it quotes. wk-cad3534a4e: "Name src/engine/displayrefusal_test.go as where it is held".

Three come through the branch that flags "is held" with no by after it, on the rule that a token said to be held claims a hold without naming anybody. The fourth comes through namesSomebody answering true for "other".

The rule was narrowed once for exactly this. Its own comment says seven findings stood, none of them a hold, and that a lint answering mostly noise is one a reader learns to run past. It is at five of five now, and the battery is red on it.

## proposed action

Narrow it again. Add each line to the clean map in holderinprose_test.go, which is where the last narrowing recorded what stood.

## done when

- se lint answers clean on this tree
- TestATokensProseNamesNoHolder still fails if a note says a token is held by a named actor

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one branch of one rule, and four lines added to a map | — |
| [ ] | every done-when line is decidable, and names the command where one decides it | the first line names se lint, and se lint answers from a stale engine on this box. See the section above | — |
| [x] | the basics it stands on exist, or are minted first | holdersIn, claimsAHold and the clean map were already in the tree | — |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | doc/guidance/work-token.md, in the prompt | — |
| [x] | one test was written first and seen red for the reason expected | the four lines went into the clean map of TestATokensProseNamesNoHolder first | — |
| [x] | the same test was seen green after the change, and named | se test over TestATokensProseNamesNoHolder answered ok | — |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | pushed as 85c88434 on origin/v4 | — |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | the stale engine it revealed belongs to wk-711bbd91ec, which is open and unclaimed | — |

## what stands in the way of measuring it

se lint does not run in the process that is asked. It forwards to the engine over the work root. That engine on this box started at 16:07 on a binary .bin/se replaced at 16:43, and its /proc exe reads (deleted). So the battery's lint step answers from code the tree no longer holds. It reported the same five findings after the narrowing as before it.

The narrowing is measured by TestATokensProseNamesNoHolder instead. Each of the four lines is in its clean map and the test is green. What cannot be shown here is the lint step going green, and it will the first time that engine is replaced.

A stop was refused on this box. Killing an engine twenty agents are calling is not a thing to do unasked. wk-711bbd91ec, checks read stale engines, is the token this belongs to.

