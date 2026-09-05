---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: parked files await halves
# where the token stands. The process owns these values.
status: open
---

## detail

Eleven files under src/engine are parked with a leading underscore, so the Go toolchain passes over them and the package builds. Each one names something the tree does not define. All eleven are untracked, so git carries none of them.

_cancelends_test.go, _enginewait_test.go, _handover_test.go, _engineload_test.go, _claimsfile_test.go, _gitfedcancel_test.go and _results_test.go each call a function or a field with a context that the tree's own copy does not take. That threading is wk-697f9876cf, which was put down open with its work no longer in the tree.

_enginefresh.go and _enginefresh_test.go call theToolchain.buildEngine, which the toolchain struct in testmap.go does not have. That work is wk-4f8e7e7ebe.

_checkengine_test.go reads two answers from runChosen, which answers one. _sweepasks_test.go hands a Front to frontmatter.Write, which wants a frontmatter.Front.

wk-918812a5e6 parked them to unblock every worker, and parking is a stopgap. Each file is either revived with the half it needs or deleted, and whoever owns that half decides which.

## done when

- no file under src/engine begins with an underscore, decided by: ls src/engine finds none
- the package still builds with none of them parked, decided by: go vet -C src/engine ./... exits 0

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

