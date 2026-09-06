---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: count and panel disagree
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: surface
---

## detail

From the verdict on wk-bd6c665ee8. That token's third criterion says the panel and the count agree, and after the change they agree only in the case its test builds.

A row now carries every name it answers to, and only one of the two readers of a row was taught to ask. src/engine/doing.go:139 builds Present as AgentsPresent plus every actor at work that no present row answersTo. src/engine/staffing.go:58 counts over AgentsPresent instead, so len(Present) is greater than WorkersHere plus ReviewersHere exactly when the append loop fires, which is the case that loop exists for: an actor holding a token that the harness never announced. The test in oneprocessonerow_test.go registers its actor, so the loop appends nothing and the equality holds for the wrong reason.

The same gap again at src/engine/staffing.go:73. It reads roles keyed by a.Actor, which AgentsPresent sets to the last pulling name. An agent that arrived under one name and pulled under another matches neither RoleWorker nor RoleReviewer and counts as no hand at all, while the panel draws it. The Names list the change added is what would answer both, and staffing does not read it.

This is not wk-d496502952, which is about spawns asked for and not yet arrived. This is the number and the table reading two different lists of the same run.

Fix: count over the same rows the panel draws, and let staffing ask a row's Names the way answersTo does.

## done when

- the number and the table are one answer over one list: a table test in src/engine holds a token under an actor the harness never announced and asserts WorkersHere plus ReviewersHere equals the length of Present: go test -C src/engine -run TestOneProcessDrawsOneRow
- an agent that arrived under one name and pulled under another counts as one hand: the same test asserts it is counted a worker rather than neither: go test -C src/engine -run TestOneProcessDrawsOneRow

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

