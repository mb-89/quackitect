---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: one agent two rows
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3c1ade0e2f5c31905dd88794abd2133593b6f86d
  - 7fb3766ecd8bf44cdab4005452a7fbff60ad0d94
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - ee30d90909cea33e662943716a49f09866fe2079
  - 572620b487495836e841815e2406804e3e0d80df
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "Pass. The comparison was the fault and the change fixes the comparison. A row carries every name its agent pulls with, and the reconciliation asks about all of them, so one process draws one row. One field, one line and one test, which is the whole of it. One finding, wk-e8c3b77ca7: the third criterion says the panel and the count agree, and staffing still counts over AgentsPresent while the panel reads Present, so they agree only where nothing is appended."
---

## detail

The panel draws the main session twice: orchestrator-mb and main, both holding wk-e51c579664. One process, two rows.

THE LINK IS WRITTEN AND THE RECONCILIATION IGNORES IT. actors.json carries main to orchestrator-mb, and the register holds one session row named main. AgentsPresent in src/engine/doing.go:251 draws that row under the last alias, orchestrator-mb. The token is held under main. WhatIsHappening then walks the actors at work and compares p.Actor to d.Actor. That is one drawn name against one holding name. They differ, so it appends a second row for main.

The comparison is the fault, not the link. A row answers to every name in its alias list, and the loop asks about one. Anything counting rows counts a hand that is not there.

## proposed action

Let a row carry the names it answers to. AgentsPresent already knows them, so it writes them on the Doing it returns. WhatIsHappening then asks whether the working actor is any of a present row's names. It asks that rather than only the one it drew. A row that already covers the actor absorbs it, and no second row is appended.

## done when

- one session named main, pulling as orchestrator-mb and holding a token under main, draws one row. A table test in src/engine asserts the length of Present is 1
- that one row says it is working and names the token: the same test asserts the row's Holding carries the token id
- the panel and the count agree: the same test asserts WorkersHere plus ReviewersHere equals the length of Present

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | proposed action names the shape: Doing gains the names a row answers to, and the reconciliation asks about all of them. A reader can disagree by drawing the row under the holding name instead. | proposed action |
| [x] | every done-when line is decidable, and names the command where one decides it | All three are decided by one table test in src/engine, run by se test on this token. | done when |
| [x] | the change is small enough to review whole, or it is split first | One field, one loop in WhatIsHappening, and one test file. | — |
| [x] | the basics it stands on exist, or are minted first | TheNamesItPullsWith and the register both answer already. The link is written, and only the comparison is wrong. | .se/actors.json |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | The check was written first and watched red. It drew two rows, orchestrator-mb and main, over one token. | the red run |
| [x] | the change follows the approach on the token, or the token says why it departed | It follows it. Doing gains Names, AgentsPresent fills it, and the reconciliation asks answersTo. | doing.go:86 |
| [x] | se test --on this token answered ok, and what it ran is named | ok. TestOneProcessDrawsOneRow, TestAnAgentFromAnEarlierRunIsNotPresent, TestTheMainAgentCountsAsAWorker. | 21.4s |
| [x] | the note says what changed and why, for a reader who was not here | A row now carries every name its agent pulls with. WhatIsHappening asks whether a present row already covers the working actor, rather than matching the one drawn name. | doing.go:116 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The count over-buys hands, which is a race and not this. wk-d496502952 carries it. | wk-d496502952 |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | Read whole, applied in two passes. Three candidates, one kept. |  |
| [x] | every hunk of git diff began..ended was read, and any not read is named | Both of this token's hunks read: doing.go and oneprocessonerow_test.go. Not read: lint.go, store.go, extension.ts and three test files, other tokens' work in the same window. |  |
| [x] | every criterion's command was run again, and what it said is named | All three are decided by one test. TestOneProcessDrawsOneRow ok. Battery owed under wk-e51c579664. |  |
| [x] | every hunk improves the product, or a finding names the one that does not | The fix is right and small. A row answers to every name its agent pulled with, so one process draws one row. One finding: staffing.go:58 counts over AgentsPresent while the panel reads Present, so the third criterion holds only where nothing is appended. |  |
| [x] | every finding is a trivial token naming this one, and their ids are here | wk-e8c3b77ca7. |  |

