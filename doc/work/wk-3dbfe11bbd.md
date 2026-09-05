---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: four stores compare directly
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-varese
claimed_at: "2026-09-05T15:18:04Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - d8b91431f5c1405b80f4b173ef1557352261b0f4
  - 7f2406a47581a40ed868d1f39aebdd087b0b5bdc
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - fc09eedf45bcdb1f0acbe86622773af415e4d0ce
---

## detail

Four session-scoped stores compare against currentSession themselves rather than through ofThisSession, so the window wk-38c4d9e04c closed for the rung, the hold and the ask is still open for them.

The judgement now lives in ofThisSession, src/engine/unbound.go: a log that names no session decides nothing, and the stored value stands. A rotation opens a fresh current that holds nothing until the next record lands, and through that window the log names nobody.

These four never reach it. Each writes the session itself and reads it back with a bare comparison:

- src/engine/guards.go:202, loadStops: `s.Session != currentSession(r)` empties the refusal counts
- src/engine/owed.go:140, the owed file: `f.Session != currentSession(r)` answers Owed{}
- src/engine/owed.go:277, the grace: `g.Session != currentSession(r)` starts the count again
- src/engine/holdstore.go:46, the hold register: the same shape

So through a rotation the refusal counts, the answers owed, the grace and the register all read as a session that has ended, and nothing said so. It is one rule taught to one half of a mirrored pair: the three controls learned it and these four did not.

The smallest case: write one of these, empty log/current the way a rotation does, and read it back.

## done when

- each of the four reads back what it wrote while the log names no session, decided by a Go test in src/engine that writes each store, empties .se/log/session.jsonl, and reads each back unchanged
- each still reads as absent in a session that has ended, decided by the same test naming a later session in the log and reading each back at its resting value
- the four compare through the one function rather than against currentSession, decided by: no bare comparison of a stored Session against currentSession is left in guards.go, owed.go or holdstore.go

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | four one-line reads in three files, plus one test file | not split |
| [x] | every done-when line is decidable, and names the command where one decides it | lines 1 and 2 by `./RUNME.sh test --propose TestARotationDoesNotEmptyTheFourStores` and `--propose TestTheFourStoresEndWithTheirSession`. Line 3 by `se find --regex currentSession --path 'src/engine/{guards,owed,holdstore}.go'`, which answers no hits | run from the root |
| [x] | the basics it stands on exist, or are minted first | ofThisSession and Named already exist and are what the three controls use. The helpers theSessionNowIs and theRotationWindow are reused from controlslastonesession_test.go | nothing minted |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read. Rule 13 drives the one rule through all four, tabled in theFourSessionStores | — |
| [x] | one test was written first and seen red for the reason expected | TestARotationDoesNotEmptyTheFourStores red on all four: counts "0", owed "", grace "0", register "" where "1", "what is happening", "1", "worker-a" were written | FAIL, 4 lines |
| [x] | the same test was seen green after the change, and named | that test ok after it. TestTheFourStoresEndWithTheirSession ok either side. 83 reach-selected tests, none failed | test-20260905-153104.908.json |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | the four reads now ask ofThisSession. foursessionstores_test.go added, holdstore_test.go has its session named | one commit |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | TestAHoldFromAnEndedSessionIsNotBelieved read a tree whose log named nobody and went red. Its session is named here. stop.go:178 StandingClaim has the same shape, next to the ask | wk-5477e00b39 |

