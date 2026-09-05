---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: end a long session
# where the token stands. The process owns these values.
status: open
# tokens that have to close before this can start
depends_on:
  - "[[wk-6d74c93848]]"
---

## detail

A long session thins as it runs, and nothing ends it. On the session measured in the parent note the thinking fell from 168 to 107 words a block across its halfway record. The wrong share of tool results rose from 1.3 to 2.7 per cent. The erring repeated on a second session, 0.5 to 2.3 per cent, z 2.72. The agent goes on pulling either way.

The trigger cannot be the compaction. Over the fifty thinking blocks either side of the compaction the median went 76 to 60. Over the fifty either side of an arbitrary halfway cut it went 183 to 71, a larger fall. The thinning is a slope across the whole session, so a guard that fired on a compaction would fire late and at the wrong thing. What is left is a budget spent since the session began.

Whether the engine should end a session at all is the open question, and it is the owner's to answer. Ending one costs the work in flight. The effect here rests on 31 wrong results in one session and 13 in the other. This token carries the decision and, if it is yes, the mechanism.

It stands on wk-6d74c93848: the budget is spent in something the engine counts, and today the engine counts nothing.

## proposed action

Put the question to the owner with the numbers from the parent note. If the answer is yes, have the engine watch a budget spent since the session began. The engine then writes a handover and refuses the next pull once the budget is spent.

## approach

Not written yet, and it cannot be until the owner answers. The first thing this token asks is whether the engine should end a session at all. The shape of the change hangs on that answer. A no closes the token and there is nothing to build. A yes puts the budget in util/parameters.json and the refusal in the pull. The approach is written on the token once the answer is on it, and the approach line in the ask step stays unticked until then.

## done when

- The owner's answer is on this token in a sentence, yes or no. A no closes the token there, with that answer as the reason.
- If yes: the budget is a named value in util/parameters.json, not a number in code, and se_status reports it alongside the limits already there.
- If yes: when the budget is spent the engine refuses the next se_pull. The refusal says which budget was spent and what was spent against it. A session under the budget pulls normally, so the refusal is not always on.
- If yes: the refusal is not the compaction. A session that compacts twice while under budget still pulls, and a session over budget is refused whether or not it compacted.
- If yes: before the refusal the engine writes a handover naming the token in hand and the tokens still open. The handover exists on disk before the refusal is returned.

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

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once, the token closes on it, and every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

