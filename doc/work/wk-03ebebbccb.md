---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: client finds no method
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-nono
claimed_at: "2026-09-05T14:31:17Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 6e9ba294bcf5834639d4663f6a83e6b45687d922
---

## detail

A plain `go test` over src/engine fails TestAVerbRunsInsideTheEngineAndTheClientPrintsIt, and with the reporting wk-76463660e3 put on it the test now says why:

    the client failed: exit status 1
        it said: engine: no method root here. This program looked up from where it is for a folder carrying src/processes and found none, so every path under the method would be a guess. Name it: --method <folder>

The client the test drives is the suite's shared engine. TestMain in src/engine/enginebin_test.go builds it into os.MkdirTemp when SE_ENGINE names nothing, and a client looks up from where it is for a folder carrying src/processes. From a folder under the OS temp root there is none, so every verb the test drives is refused before it reaches the socket, whatever the engine over the work root is doing.

The battery sets SE_ENGINE to a binary inside the tree, so the suite is green there and only a run by hand meets this. The test drives the client the way a person does and passes it a work root; the method root is the one root it leaves to the lookup, and the lookup answers from the binary rather than from the tree the test made.

The smallest case: build the engine into a folder outside the tree and run that one test.

## done when

- TestAVerbRunsInsideTheEngineAndTheClientPrintsIt passes with the engine built outside the tree, decided by: build the engine into a folder under the OS temp root, name it in SE_ENGINE, and run `go test -run '^TestAVerbRunsInsideTheEngineAndTheClientPrintsIt$' -count=1 ./src/engine` with CGO_ENABLED=1 and GOFLAGS=-tags=sqlite_fts5, which exits zero
- the same test still passes with the engine built inside the tree, decided by the same command with SE_ENGINE naming .bin/se, which exits zero

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | Two blocks: the method lookup falls back to the folder the caller named, and the client stops asking for a method it does not use. | |
| [x] | every done-when line is decidable, and names the command where one decides it | Both by the command the token names, run twice: once with SE_ENGINE naming an engine built under the OS temp root, once with it naming one built in a tree's own .bin. | |
| [x] | the basics it stands on exist, or are minted first | Both stand: methodRootFrom already walks up for the marker, and the socket the client dials is found under the work root, so the relay never wanted a method. Nothing was minted. | |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Rule 12, red first, watched with the engine outside the tree, which is the case the token names. | |
| [x] | one test was written first and seen red for the reason expected | Red with the engine built under the OS temp root. The client said the same by hand: no method root here, run from a folder carrying none. | |
| [x] | the same test was seen green after the change, and named | TestAVerbRunsInsideTheEngineAndTheClientPrintsIt, ok with the engine outside the tree and ok again with one in a tree's own .bin. | |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began 6e9ba294bcf5834639d4663f6a83e6b45687d922, ended on submission. | |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | In the change: the refusal was moved rather than deleted, to where it is still true, beside the no-engine door. Nothing it says was lost and nothing went dead. | |

