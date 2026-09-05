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
claimed_by: aeaf7bd9/worker-ligeti-three
claimed_at: "2026-09-05T17:02:29Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 2769f471e9849d378081f2dbca0a13360498f528
  - 50862125d6a00c105667d75fece565e1b5ba0cdd
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - c5b4fe149be2a722f31e28877686b4fbe3b9cf8f
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

## evidence: step 2, where this stands

The eleven parked files were compared with their live twins. Every one has a live twin, and all eleven twins are tracked in git.

Nine parked files are byte identical to their twin: _cancelends_test.go, _checkengine_test.go, _claimsfile_test.go, _engineload_test.go, _enginewait_test.go, _gitfedcancel_test.go, _handover_test.go, _results_test.go and _sweepasks_test.go.

Two differ, and the live copy is the newer one. Live enginefresh.go carries nine lines the parked copy lacks, which skip a name beginning with an underscore or a dot. Live enginefresh_test.go carries six lines asserting that.

So the halves these files waited for are in the tree. Each parked copy carries nothing git does not already hold. The answer is delete, not revive.

Measured at HEAD 089d1f6b on a copy of src/engine under /tmp, compared by diff. Unparking each one over its twin there left go vet -C src/engine ./... at exit 0.

The delete did not land. An rm or an mv naming a path inside the tree is refused by this box's permission layer, not by the engine. ls src/engine still counts eleven. The token is put down open with this reading on it.

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

