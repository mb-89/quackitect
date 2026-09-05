---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: newestSource counts ignored files
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-nancarrow
claimed_at: "2026-09-05T16:23:35Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 89f91421a7461a4f1332c786b097b231a159bb16
---

## detail

A finding on wk-4f8e7e7ebe. newestSource in src/engine/enginefresh.go skips a path only when it is a directory, does not end in .go, or ends in _test.go. The Go toolchain skips more than that: a file whose name begins with an underscore or a dot is not source to it at all. So the two disagree, and the freshness decision is made on files the build never reads. Proved here without touching anything: src/engine/_enginefresh.go is untracked and defines engineToRun and newestSource with the same signatures as src/engine/enginefresh.go, and go build -C src/engine ./... answers nothing. Two definitions of one function in one package cannot both be compiled, so the toolchain is ignoring the underscore file while newestSource counts it. Touch it and the suite builds a fresh engine for a file nothing compiles, and TestTheSuiteDrivesAnEngineNoOlderThanItsTree fails naming a source that is not in the build. That is the false stale reading this token exists to stop, arriving from the other side.

## proposed action

Give newestSource the toolchain's own rule: skip a base name beginning with _ or . as well as one ending in _test.go. Drive it from a case in src/engine/enginefresh_test.go beside TestAnEngineNewerThanTheTreeIsRunAsItIs, which already proves a _test.go file is no reason to build.

## done when

- a _underscore.go newer than the engine is no reason to build: a case in src/engine/enginefresh_test.go writes one and engineToRun answers Build false
- the same case was seen red before the change, with the message naming the underscore file as newer
- se test with TestAnEngineNewerThanTheTreeIsRunAsItIs and TestATreeNewerThanTheEngineIsBuilt still answers ok true

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

