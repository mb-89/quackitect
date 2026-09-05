---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: head tests half landed
# where the token stands. The process owns these values.
status: open
---

## detail

The engine's source builds from a clean copy of the branch head again, and its test package does not.

MEASURED on a clean copy of the head with wk-0f91286ac1's repair in it. `go vet ./...` in src/engine answers `cancelends_test.go:27:20: cannot use ctx (variable of interface type context.Context) as Roots value in argument to realGit`. A test run answers `claimsfile_test.go:67:49: undefined: claimsFile` and `claimsfile_test.go:89:10: undefined: nextClaimsFile`.

Both test files are committed. Neither of the things they name is: realGit on the branch takes a Roots first, and no committed file declares claimsFile or nextClaimsFile. They were written against a claims layer that takes a context and keeps one claims file, and that layer is in nobody's commit.

THE DAMAGE. Every test over the engine still answers FAIL at the build on a clean checkout, so the suite is dark for anyone who tests the way a reviewer is told to.

Either the layer those tests read lands, or the two files come off the branch until it does.

## done when

- a clean copy of the head runs a named engine test rather than failing at the build, decided by: git archive HEAD into an empty folder, then go test -C src/engine -run TestARationaleIsNamedNotRepeated ./ exits 0
- go vet -C src/engine ./... over that same copy exits 0

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

