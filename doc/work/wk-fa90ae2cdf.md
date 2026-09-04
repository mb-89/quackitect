---
kind: [[work-token]]
process: [[standard]]
guidance: [[work-token]]
title: commits stage by name
status: open
---

## detail

The rule to stage by path exists and was broken three times in one session: a commit that staged everything took a refusal a background sweep had cut out, and the message named a different subject. The guard sees every tool call of the turn with its path or command, so it can know which paths this turn wrote. Consumes wk-b13ade88e2.

## approach

The guard keeps the set of paths this turn wrote, in a file, since a hook is a fresh process. A git commit or git add that would stage a path outside that set, and git add -A or git add . in any form, is refused naming the paths outside the set. The escape is a typed flag on the command the refusal names, recorded when used. The set resets at the turn's end, which the Stop and UserPromptSubmit hooks already mark.

## done when

- a commit staging a path this turn did not write is refused naming it: go test -C src/engine -run TestACommitStagesOnlyWhatTheTurnWrote
- git add -A and git add . are refused whatever the turn wrote: go test -C src/engine -run TestStagingEverythingIsRefused
- the typed escape is allowed once and recorded: go test -C src/engine -run TestTheStagingEscapeIsRecorded

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

