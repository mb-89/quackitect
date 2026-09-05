---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: ctx test cannot fail
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-varese
claimed_at: "2026-09-05T15:46:12Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - e93e04c953146abe96c2d933174aa4968340dc8d
---

## detail

A finding on wk-4fb16fa632, "indexer takes a context". TestTheIndexerStopsWithItsContext in src/engine/indexwatchctx_test.go is the command that token's first criterion names, and it decides neither half of it.

The context path: the test calls cancel() then stop(), and stop() is `func(){ shutdown(); <-stopped }`, which runs the shutdown unconditionally. Both assertions that follow, the socket file gone and the dial refused, hold on stop() alone. Delete the `case <-ctx.Done(): shutdown()` goroutine from indexwatch.go and the test still passes. Its comment, "starts none of its own", is wrong: whichever of the two wins the sync.Once is a race.

The handles: the closing comment says t.TempDir's cleanup is the assertion. On Linux, where the battery runs, RemoveAll unlinks a file whatever holds it open, so that cleanup passes with both sqlite handles open and asserts nothing. StartIndexer's header comment promises the same thing, and nothing joins the shutdown goroutine, so there is no happens-before to promise.

Fix: after cancel(), poll for the socket file to go against a deadline, and assert the handles directly, e.g. a query on the read-only handle answering "sql: database is closed". Call stop() after that, or not at all.

## done when

- TestTheIndexerStopsWithItsContext fails when the case <-ctx.Done(): shutdown() goroutine is removed from src/engine/indexwatch.go, decided by: removing it, running go test -C src/engine -run 'TheIndexerStopsWithItsContext' ./... and seeing FAIL, then putting it back and seeing ok
- the test asserts the index handles are closed by something other than t.TempDir cleanup, decided by: reading the test for an assertion naming the closed handle
- the comments in indexwatchctx_test.go and on StartIndexer say what the code does, decided by: no sentence claiming stop starts no shutdown of its own, and none promising the shutdown has finished before a test's cleanup runs

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | three criteria over one test and two comments | not split |
| [x] | every done-when line is decidable, and names the command where one decides it | line 1 by `go test -C /tmp/varese-probe/src/engine -run TheIndexerStopsWithItsContext -count=1 .` on a copy outside the tree, with the wiring taken out and put back. Lines 2 and 3 by reading indexwatchctx_test.go and the StartIndexer header | run twice |
| [x] | the basics it stands on exist, or are minted first | startIndexer already answers the handles a test asks, and context.AfterFunc is the wiring the criterion is about | nothing minted |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read. Rule 12: a check that will not go red is the finding | — |
| [x] | one test was written first and seen red for the reason expected | none written. The check already stands, so it was driven red on a copy of the tree with `context.AfterFunc(ctx, shutdown)` deleted | FAIL in 5.02s |
| [x] | the same test was seen green after the change, and named | TestTheIndexerStopsWithItsContext ok on that copy with the line back | ok in 3.865s |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | no source change. At began the socket is watched on the cancel alone, the handles are asked for "sql: database is closed", and the comments claim neither thing the detail quotes | empty diff |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | none. The finding names a ctx.Done goroutine, and the wiring is context.AfterFunc | — |

