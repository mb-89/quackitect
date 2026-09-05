---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: helper budget misses reads
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-sibelius
claimed_at: "2026-09-05T17:20:59Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 96a4dc5991137a671cd99ad5124c12ed976f2587
---

## detail

Found working wk-669bbef4c3, over-budget relent keeps work.

aHelperReturningTooMuch in src/engine/guards.go asks BytesReadBy(r, in.AgentID), the harness id. The read is recorded elsewhere. notePostTool in src/engine/hook.go calls NoteReadPage with actor, and actor is TheActorOf(roots, in.SessionID, in.AgentID), which resolves the harness id through the alias record to the name the helper pulls with.

So for any helper that has pulled, the two halves key on different names. The reads pile up under worker-something and the budget asks about general-purpose-1, gets nothing, and falls back to the floor. A helper that read a megabyte is held to the floor rather than to a tenth of what it read, which is the whole of what the ratio was for.

Measured while writing the relent test: a helper registered with NoteTheNameItPullsWith read a file through PostToolUse, and BytesReadBy answered zero for its harness id and the file's size for its pulled-with name.

A helper that never pulled is unaffected, which is why the existing budget test passes: it uses a bare id with no alias.

## proposed action

Ask BytesReadBy for the same name notePostTool records under. TheActorOf is already in hand at the call site in hook.go, so either pass the actor into aHelperReturningTooMuch or have it resolve the id the same way. One reading, one name.

## done when

- a helper that pulled under a name, read a file, and answers over a tenth of it is refused, driven by a Go test in src/engine
- the existing floor case still holds: a helper that read nothing is held to the floor
- go test ./src/engine answers no new failure

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | Two files carry code. guards.go gains one summing helper and swaps one reading. hook.go swaps the same reading in the refusal record. | `git diff origin/v4 -- src/engine/guards.go src/engine/hook.go` |
| [x] | every done-when line is decidable, and names the command where one decides it | The first two lines are the two rows of the new test. The third is the package, run on both sides of the change. | `go test . -run TestAHelperBudgetCountsWhatItReadUnderEveryName` and `go test . -count=1` |
| [x] | the basics it stands on exist, or are minted first | everyNameOf, TheActorOf and BytesReadBy are all in origin/v4 already. Nothing was minted. | `git show origin/v4:src/engine/gate.go` |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read whole. Rule 12 drove red first. Rule 11 drove the backslash scan back. | doc/guidance/work-token.md |
| [x] | one test was written first and seen red for the reason expected | At origin/v4 with only the test added it failed. A digest of 12000 bytes was blocked, from a helper that read 239995. A tenth is 23999. | `go test . -run TestAHelperBudgetCountsWhatItReadUnderEveryName` |
| [x] | the same test was seen green after the change, and named | That test answered ok true. The package answers seven failures, the same seven origin/v4 answers. | `go test . -count=1` |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | bytesReadByAnyNameOf sums BytesReadBy over every name filing the helper. | `git diff origin/v4 -- src/engine` |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | 487d110a also dropped theQuotings' escaped flag. TestAnEscapedQuoteDoesNotEndTheSpan failed there. 87819dcb restores it. | `git diff origin/v4 -- src/engine/hook.go` |

