---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: hook server ignores context
# where the token stands. The process owns these values.
status: open
---

## detail

A finding from the verdict on wk-697f9876cf.

serveHooks in src/engine/hookserve.go:117 takes ctx as its first parameter. Nothing stops it with that context. Line 155 is the call to srv.Serve(ln), and the doc comment at line 111 still says it answers events until the listener closes. The ctx is only handed down to answerHook.

main.go:684 starts it on the engine's context. The listener is closed by the release func in main, not by the cancel. So a caller that ends the context alone leaves the hook server accepting.

This is the confusion the new comment on serveModel says it removed, left standing on the other socket server of the engine. serveModel now closes its own listener through context.AfterFunc and defers the stop. The same three lines fit here.

## proposed action

Give serveHooks the same context.AfterFunc close serveModel got, fix its comment, and add a cancel-and-wait test beside serverstops_test.go.

## done when

- serveHooks closes its listener when its context is cancelled, the way serveModel does
- the doc comment on serveHooks says the context is what stops it
- a Go test cancels the context of serveHooks and waits for the goroutine to return

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

