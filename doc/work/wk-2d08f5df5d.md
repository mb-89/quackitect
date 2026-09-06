---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: standing red blocks submissions
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
claimed_by: 7e7f0da1/main
claimed_at: "2026-09-06T17:31:56Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 61119f6e76f8ee62a4e256d4ecf3109b7a6d7943
---

## detail

A check that fails on notes a token never touched refuses that token's submission. So one hand's defective note holds up every hand's work.

MEASURED in September 2026. util/checks/open-tokens-carry-their-sections fails on twelve older tokens, each open under the standard process with no approach section. It reads all of doc/work by design, so every token whose delta touches doc/work chooses it, and every such run answers ok false.

WHAT IT COST HERE. Three submissions were refused with "the last run did not pass, and open-tokens-carry-their-sections was the first to fail". None of the twelve notes was in any of those deltas. Two of those tokens are still open for that reason alone.

WHERE IT IS DECIDED. TestsRefuseTheClose in src/engine/testedgate.go:94 reads one field, the run's OK. RecordTheRun sets that from Tested.OK, which is false where any chosen test failed, whatever it failed on.

WHAT THE ENGINE ALREADY HOLDS. Tested carries Delta, and every failing entry carries the tail of what it printed. A check names the files it fails on, so the two can be compared.

## proposed action

RecordTheRun decides whether a failure is this token's before it writes OK.

A failing entry of kind check, whose printed tail names paths and none of them is in the delta, is the project's red rather than this token's. It is recorded, and it does not set OK false.

Everything else keeps refusing. A Go test is never excused, because its output names no changed path in the ordinary case and a red there is the change's. A check that names no path at all is not excused either.

The refusal that still fires gains nothing. What changes is which failures reach it.

## done when

- a check failing only on paths outside the delta leaves the recorded run ok, proved by a Go test in src/engine driving RecordTheRun and LastRunOn
- the same check failing on a path inside the delta leaves the run not ok, in the same test
- a failing Go test is never excused, whatever it printed, in the same test
- wk-70384c47cd and wk-46bbf21644 both submit and close on this box

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
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

