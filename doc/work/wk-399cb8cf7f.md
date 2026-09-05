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

