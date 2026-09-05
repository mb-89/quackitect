---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: cover misses internal packages
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-ash
claimed_by: 547b9365/worker-ash
claimed_at: "2026-09-05T14:58:42Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - c2dca5d635b91c35f9c7fe27729125fbf21f45aa
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 1576ac3fc3cb4c06cfba84e3720769e372dccaf2
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

coverBinary in src/engine/testmap.go decides whether to rebuild a package's test binary from a hash of the .go files directly in that folder. It skips every entry that is a directory, so nothing under src/engine/internal is in the hash.

src/engine imports those packages. A change to one of them leaves the hash unchanged, the stale binary is kept, and se test answers on code that is no longer in the tree.

Measured here. src/engine/internal/expr/expr.go was edited at 14:50:21 and .se/tests/src_engine.cover stayed at 14:50:20. Two se test runs after the edit answered TestWhatAFilterCanSay red for a defect the edit had already fixed, and a battery compiling from source at 14:50:44 did not report that test at all.

A false red costs a turn. A false green is worse: the same staleness reports a test as passing against code the tree no longer holds, and nothing says so. This gets more likely with every group src/engine moves under internal.

## proposed action

Hash the package's own .go files and the .go files under src/engine/internal as well, so a change to one of them rebuilds the binary. Walking internal whole is the cheap version and is enough.

## done when

- a change to a .go file under src/engine/internal rebuilds the cover binary for src/engine, decided by: se test --propose 'TestACoverBinaryIsRebuiltWhenAnInternalPackageChanges' answers ok
- a file that is not Go under src/engine/internal does not force a rebuild: the same test

## evidence: change

src/engine/testmap.go: coverBinary folds the Go files under the package's internal folder into the hash it decides a rebuild by, through hashGoUnder, which walks however deep and hashes each file under the path it is reached at. A folder that is not there adds nothing, and what is not Go is left out the way the folder's own scan already leaves it out.

## evidence: green

With the change the same test answers ok in that copy, and ok in the tree through se test --on this token --propose TestACoverBinaryIsRebuiltWhenAnInternalPackageChanges once the tree compiled again, in 0.9s. go vet over src/engine is clean.

## evidence: red

TestACoverBinaryIsRebuiltWhenAnInternalPackageChanges, new in src/engine/coverinternal_test.go, builds a small module with a package that imports one under its own internal, calls coverBinary, and sets the binary's time back before each question. Against HEAD's coverBinary it failed on the middle row: a package under internal changed and the binary was kept. The first row, nothing changed and nothing rebuilt, and the third, a file that is not Go under internal, were green. The tree itself would not compile at the time, another worker being mid-move on log.go, so that run was in a copy of HEAD outside the tree, the way wk-7783c03017 did.

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One call in coverBinary, one walk it calls, one test. Walking internal whole is the cheap version the token asks for. | testmap.go |
| [x] | every done-when line is decidable, and names the command where one decides it | Both by se test --on this token --propose TestACoverBinaryIsRebuiltWhenAnInternalPackageChanges, which is one test carrying both: the Go file that must force a build, and the file that is not Go and must not. | se test |
| [x] | the basics it stands on exist, or are minted first | coverBinary, its meta key and openTheIndex all exist, and the toolchain builds a package in a temp tree already. Nothing minted. | testmap.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read. Red first. The tree would not compile mid-move, so the red ran against HEAD in a copy outside it. | work-token |
| [x] | one test was written first and seen red for the reason expected | TestACoverBinaryIsRebuiltWhenAnInternalPackageChanges failed on its middle row: a package under internal changed and the binary was kept. | the red run |
| [x] | the same test was seen green after the change, and named | Green in the copy, and green in the tree through se test once it compiled. go vet clean. | se test, 0.9s |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Two files: the call and hashGoUnder in testmap.go, the test in coverinternal_test.go. | git diff |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Nothing else was revealed. | — |

## evidence: the marker

The test first wrote a word over the binary to read a rebuild off it, and go test -c refuses an output that is not an object file. It sets the binary's time back instead, so the question is answered by whether a build put a new file there.

